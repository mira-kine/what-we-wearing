const KEY = 'outfit_sessions'

export type Session = {
  participantId: string
  username: string
  eventId: string
  eventCode: string
}

type SessionMap = Record<string, Session>

function getSessions(): SessionMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SessionMap) : {}
  } catch {
    return {}
  }
}

/** Return the session for a specific event code, or the most-recently saved session as fallback. */
export function getSession(eventCode?: string): Session | null {
  const map = getSessions()
  if (eventCode) return map[eventCode] ?? null
  // Fallback: return any session (last written). Used by routes that don't know the code yet.
  const values = Object.values(map)
  return values.length > 0 ? values[values.length - 1] : null
}

export function setSession(session: Session): void {
  const map = getSessions()
  map[session.eventCode] = session
  localStorage.setItem(KEY, JSON.stringify(map))
}

export function clearSession(eventCode?: string): void {
  if (!eventCode) {
    localStorage.removeItem(KEY)
    return
  }
  const map = getSessions()
  delete map[eventCode]
  localStorage.setItem(KEY, JSON.stringify(map))
}
