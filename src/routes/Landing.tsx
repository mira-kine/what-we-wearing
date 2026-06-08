import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'

export function Landing() {
  const navigate = useNavigate()
  const [createForm, setCreateForm] = useState({
    eventName: '',
    theme: '',
    yourName: '',
  })
  const [joinForm, setJoinForm] = useState({
    inviteCode: '',
    yourName: '',
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO step 2: insert event + participant via Supabase, setSession, then navigate with real code
    const code = Math.random().toString(36).substring(7)
    navigate({ to: '/$code', params: { code } })
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO step 2: look up event by code, create participant, setSession
    navigate({ to: '/$code', params: { code: joinForm.inviteCode } })
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

        <Tabs defaultValue="create" className="w-full">
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
              <div className="space-y-2">
                <label
                  className="block uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Event name
                </label>
                <input
                  type="text"
                  value={createForm.eventName}
                  onChange={(e) => setCreateForm({ ...createForm, eventName: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-foreground/30 focus:border-accent focus:outline-none pb-2 transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Theme (optional)
                </label>
                <input
                  type="text"
                  value={createForm.theme}
                  onChange={(e) => setCreateForm({ ...createForm, theme: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-foreground/30 focus:border-accent focus:outline-none pb-2 transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Your name
                </label>
                <input
                  type="text"
                  value={createForm.yourName}
                  onChange={(e) => setCreateForm({ ...createForm, yourName: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-foreground/30 focus:border-accent focus:outline-none pb-2 transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-accent-foreground py-4 mt-8 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 border-2 border-secondary"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Create event
              </button>
            </form>
          </TabsContent>

          <TabsContent value="join">
            <form onSubmit={handleJoin} className="space-y-8">
              <div className="space-y-2">
                <label
                  className="block uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Invite code
                </label>
                <input
                  type="text"
                  value={joinForm.inviteCode}
                  onChange={(e) => setJoinForm({ ...joinForm, inviteCode: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-foreground/30 focus:border-accent focus:outline-none pb-2 transition-colors font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Your name
                </label>
                <input
                  type="text"
                  value={joinForm.yourName}
                  onChange={(e) => setJoinForm({ ...joinForm, yourName: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-foreground/30 focus:border-accent focus:outline-none pb-2 transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-accent-foreground py-4 mt-8 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 border-2 border-secondary"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Join event
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
