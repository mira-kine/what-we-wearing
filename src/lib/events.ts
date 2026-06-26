import { supabase } from './supabase'
import { setSession, type Session } from './session'
import { generateEventCode } from './words'
import type { Event, Participant } from './types'

export class EventNotFoundError extends Error {
  constructor(public code: string) {
    super(`No event with code "${code}"`)
    this.name = 'EventNotFoundError'
  }
}

const MAX_CODE_RETRIES = 5
const UNIQUE_VIOLATION = '23505'

/**
 * Create an event + a participant for the creator. Retries on slug collision.
 */
export async function createEvent(input: {
  name: string
  theme: string | null
  username: string
}): Promise<Session> {
  const name = input.name.trim()
  const username = input.username.trim()
  const theme = input.theme?.trim() || null
  if (!name || !username) throw new Error('Event name and username are required')

  let event: Event | null = null
  let attempts = 0

  while (!event && attempts < MAX_CODE_RETRIES) {
    attempts++
    const code = generateEventCode()
    const { data, error } = await supabase
      .from('events')
      .insert({ name, code, theme })
      .select()
      .single<Event>()

    if (!error && data) {
      event = data
      break
    }
    if (error?.code !== UNIQUE_VIOLATION) throw error
    // else: collision, regenerate
  }

  if (!event) throw new Error('Could not generate a unique event code, please try again.')

  const participant = await insertParticipant(event.id, username)

  const session: Session = {
    participantId: participant.id,
    username: participant.username,
    eventId: event.id,
    eventCode: event.code,
  }
  setSession(session)
  return session
}

/**
 * Look up event by code, insert a participant, set session.
 */
export async function joinEvent(input: {
  code: string
  username: string
}): Promise<Session> {
  const code = input.code.trim().toLowerCase()
  const username = input.username.trim()
  if (!code || !username) throw new Error('Invite code and username are required')

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('code', code)
    .maybeSingle<Event>()

  if (error) throw error
  if (!event) throw new EventNotFoundError(code)

  const participant = await insertParticipant(event.id, username)

  const session: Session = {
    participantId: participant.id,
    username: participant.username,
    eventId: event.id,
    eventCode: event.code,
  }
  setSession(session)
  return session
}

/**
 * Fetch an event by code along with its participants (oldest first).
 */
export async function loadEventByCode(code: string): Promise<{
  event: Event
  participants: Participant[]
}> {
  const normalized = code.trim().toLowerCase()

  const { data: event, error: eErr } = await supabase
    .from('events')
    .select('*')
    .eq('code', normalized)
    .maybeSingle<Event>()

  if (eErr) throw eErr
  if (!event) throw new EventNotFoundError(normalized)

  const { data: participants, error: pErr } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true })

  if (pErr) throw pErr

  return { event, participants: (participants ?? []) as Participant[] }
}

async function insertParticipant(eventId: string, username: string): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .insert({ username, event_id: eventId })
    .select()
    .single<Participant>()

  if (error || !data) throw error ?? new Error('Failed to create participant')
  return data
}
