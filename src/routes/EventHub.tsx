import { useState } from 'react'
import { useNavigate, useParams, useLoaderData } from '@tanstack/react-router'
import { Copy, Check } from 'lucide-react'

export function EventHub() {
  const navigate = useNavigate()
  const { code } = useParams({ from: '/$code' })
  const { event, participants } = useLoaderData({ from: '/$code' })
  const [copied, setCopied] = useState(false)

  const copyInviteUrl = async () => {
    const url = `${window.location.origin}/${event.code}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can fail (insecure context, permissions). Fallback: do nothing visible.
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]">
      <div className="max-w-md mx-auto w-full space-y-12">
        <div className="text-center space-y-6">
          <h1
            className="tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 300,
              lineHeight: 1.2,
            }}
          >
            {event.name}
          </h1>

          {event.theme && (
            <p
              className="uppercase tracking-widest text-xs text-secondary"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Theme: {event.theme}
            </p>
          )}

          <button
            onClick={copyInviteUrl}
            className="inline-flex items-center gap-2 px-6 py-2 bg-foreground/5 border-2 border-secondary hover:border-accent transition-colors font-mono"
            title="Copy invite link"
          >
            <span>{event.code}</span>
            {copied ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <Copy className="w-4 h-4 text-secondary" />
            )}
          </button>
        </div>

        <div className="space-y-4">
          <p
            className="text-center uppercase tracking-widest text-xs text-secondary"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Participants ({participants.length})
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {participants.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center border-2 border-secondary">
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
                    {p.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                  {p.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8">
          <button
            onClick={() => navigate({ to: '/$code/builder', params: { code } })}
            className="w-full bg-accent text-accent-foreground py-6 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 border-2 border-secondary"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Build my fit
          </button>

          <button
            onClick={() => navigate({ to: '/$code/gallery', params: { code } })}
            className="w-full border-2 border-foreground text-foreground py-6 uppercase tracking-widest text-sm transition-opacity hover:opacity-70"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            See the group
          </button>
        </div>
      </div>
    </div>
  )
}
