import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Download } from 'lucide-react'

export function Gallery() {
  const navigate = useNavigate()
  const { code } = useParams({ from: '/$code/gallery' })

  // TODO step 5: fetch event + published outfits for this event from Supabase
  const eventName = 'Paris Weekend'
  const theme = 'Parisian Chic'
  const participants = [
    { name: 'Maya', avatar: 'M' },
    { name: 'Jordan', avatar: 'J' },
    { name: 'Alex', avatar: 'A' },
  ]

  const exportGroupPhoto = () => {
    // TODO step 6: composite published outfit exports into a single PNG (grid + names + event name) and download
    alert('Exporting group photo...')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]">
      {/* Header */}
      <div className="px-6 py-8 border-b border-foreground/15">
        <button
          onClick={() => navigate({ to: '/$code', params: { code } })}
          className="flex items-center gap-2 text-foreground hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="uppercase tracking-widest text-xs" style={{ fontFamily: 'var(--font-body)' }}>
            Back
          </span>
        </button>
        <div className="text-center space-y-2">
          <h1
            className="tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 300,
              lineHeight: 1.2,
            }}
          >
            {eventName}
          </h1>
          <p
            className="uppercase tracking-widest text-xs text-secondary"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Theme: {theme}
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {participants.map((participant) => (
            <div key={participant.name} className="flex flex-col items-center space-y-4">
              {/* Mannequin Card — will become <img src={outfit.export_url} /> once wired */}
              <div className="w-full aspect-[3/4] border border-foreground/15 bg-foreground/5 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 300"
                  className="w-3/4 h-3/4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="100" cy="40" r="25" fill="#1C1208" opacity="0.1" />
                  <circle cx="100" cy="40" r="20" fill="#F4F1E2" />
                  <circle cx="100" cy="40" r="20" stroke="#1C1208" strokeWidth="1" opacity="0.2" />
                  <rect x="90" y="60" width="20" height="12" fill="#1C1208" opacity="0.1" />
                  <path
                    d="M 70 72 L 70 150 L 80 165 L 80 210 L 75 255 L 75 285 L 85 285 L 85 255 L 90 210 L 90 165 L 100 150 L 110 165 L 110 210 L 115 255 L 115 285 L 125 285 L 125 255 L 120 210 L 120 165 L 130 150 L 130 72 Z"
                    fill="#1C1208"
                    opacity="0.1"
                  />
                  <rect x="50" y="77" width="20" height="60" rx="10" fill="#1C1208" opacity="0.1" />
                  <rect x="130" y="77" width="20" height="60" rx="10" fill="#1C1208" opacity="0.1" />
                </svg>
              </div>

              <p
                className="uppercase tracking-widest text-xs"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {participant.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="px-6 py-4 border-t border-foreground/15">
        <div className="max-w-md mx-auto">
          <button
            onClick={exportGroupPhoto}
            className="w-full bg-accent text-accent-foreground py-4 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 border-2 border-secondary"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <Download className="w-4 h-4" />
            Export group photo
          </button>
        </div>
      </div>
    </div>
  )
}
