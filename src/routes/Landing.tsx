import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { createEvent, joinEvent, EventNotFoundError } from '../lib/events'

type FormState = { loading: boolean; error: string | null }
const IDLE: FormState = { loading: false, error: null }

export function Landing() {
  const navigate = useNavigate()
  const { join: prefillCode } = useSearch({ from: '/' })
  const [createForm, setCreateForm] = useState({ eventName: '', theme: '', yourName: '' })
  const [joinForm, setJoinForm] = useState({ inviteCode: prefillCode ?? '', yourName: '' })
  const [createState, setCreateState] = useState<FormState>(IDLE)
  const [joinState, setJoinState] = useState<FormState>(IDLE)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateState({ loading: true, error: null })
    try {
      const session = await createEvent({
        name: createForm.eventName,
        theme: createForm.theme || null,
        username: createForm.yourName,
      })
      navigate({ to: '/$code', params: { code: session.eventCode } })
    } catch (err) {
      setCreateState({ loading: false, error: errorMessage(err) })
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoinState({ loading: true, error: null })
    try {
      const session = await joinEvent({
        code: joinForm.inviteCode,
        username: joinForm.yourName,
      })
      navigate({ to: '/$code', params: { code: session.eventCode } })
    } catch (err) {
      setJoinState({ loading: false, error: errorMessage(err) })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]">
      <div className="w-full max-w-md space-y-12">
        <h1
          className="text-center tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          what we wearing?
        </h1>

        <Tabs
          defaultValue={prefillCode ? 'join' : 'create'}
          className="w-full"
          onValueChange={() => {
            // reset errors when switching tabs
            setCreateState(IDLE)
            setJoinState(IDLE)
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-12 border-b border-foreground/15">
            <TabsTrigger
              value="create"
              className="pb-3 uppercase tracking-widest text-xs data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=inactive]:text-secondary"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Create event
            </TabsTrigger>
            <TabsTrigger
              value="join"
              className="pb-3 uppercase tracking-widest text-xs data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=inactive]:text-secondary"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Join event
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <form onSubmit={handleCreate} className="space-y-8">
              <Field
                label="Event name"
                value={createForm.eventName}
                onChange={(v) => setCreateForm({ ...createForm, eventName: v })}
                required
              />
              <Field
                label="Theme (optional)"
                value={createForm.theme}
                onChange={(v) => setCreateForm({ ...createForm, theme: v })}
              />
              <Field
                label="Your name"
                value={createForm.yourName}
                onChange={(v) => setCreateForm({ ...createForm, yourName: v })}
                required
              />

              {createState.error && <ErrorText>{createState.error}</ErrorText>}

              <button
                type="submit"
                disabled={createState.loading}
                className="w-full bg-accent text-accent-foreground py-4 mt-8 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 border-2 border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {createState.loading ? 'Creating…' : 'Create event'}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="join">
            <form onSubmit={handleJoin} className="space-y-8">
              <Field
                label="Invite code"
                value={joinForm.inviteCode}
                onChange={(v) => setJoinForm({ ...joinForm, inviteCode: v })}
                required
                mono
              />
              <Field
                label="Your name"
                value={joinForm.yourName}
                onChange={(v) => setJoinForm({ ...joinForm, yourName: v })}
                required
              />

              {joinState.error && <ErrorText>{joinState.error}</ErrorText>}

              <button
                type="submit"
                disabled={joinState.loading}
                className="w-full bg-accent text-accent-foreground py-4 mt-8 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 border-2 border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {joinState.loading ? 'Joining…' : 'Join event'}
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Field(props: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  mono?: boolean
}) {
  return (
    <div className="space-y-2">
      <label
        className="block uppercase tracking-widest text-xs"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {props.label}
      </label>
      <input
        type="text"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className={
          'w-full bg-transparent border-0 border-b border-foreground/30 focus:border-accent focus:outline-none pb-2 transition-colors' +
          (props.mono ? ' font-mono' : '')
        }
        style={props.mono ? undefined : { fontFamily: 'var(--font-body)' }}
        required={props.required}
      />
    </div>
  )
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-destructive text-xs uppercase tracking-widest"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </p>
  )
}

function errorMessage(err: unknown): string {
  if (err instanceof EventNotFoundError) return `No event found for "${err.code}"`
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}
