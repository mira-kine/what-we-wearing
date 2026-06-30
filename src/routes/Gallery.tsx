import { useNavigate, useParams, useSearch, useLoaderData } from '@tanstack/react-router'
import { ArrowLeft, Download } from 'lucide-react'
import { useState } from 'react'
import type { GalleryEntry } from '../lib/events'

const CARD_W = 400
const CARD_H = 560
const PADDING = 40
const NAME_H = 48
const HEADER_H = 80
const COLS_MAX = 3

export function Gallery() {
  const navigate = useNavigate()
  const { code } = useParams({ from: '/$code/gallery' })
  const { from } = useSearch({ from: '/$code/gallery' })
  const { event, entries } = useLoaderData({ from: '/$code/gallery' })
  const [exporting, setExporting] = useState(false)

  const exportGroupPhoto = async () => {
    if (entries.length === 0) return
    setExporting(true)
    try {
      await downloadGroupPhoto(event.name, event.theme, entries)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]">
      {/* Header */}
      <div className="px-6 py-8 border-b border-foreground/15">
        <button
          onClick={() =>
            from === 'builder'
              ? navigate({ to: '/$code/builder', params: { code } })
              : navigate({ to: '/$code', params: { code } })
          }
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
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 px-6 py-12">
        {entries.length === 0 ? (
          <p
            className="text-center text-secondary uppercase tracking-widest text-xs"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            No published fits yet
          </p>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {entries.map(({ participant, exportUrl }) => (
              <div key={participant.id} className="flex flex-col items-center space-y-4">
                <div className="w-full aspect-[3/4] border border-foreground/15 bg-foreground/5 overflow-hidden">
                  <img
                    src={exportUrl}
                    alt={`${participant.username}'s outfit`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p
                  className="uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {participant.username}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="px-6 py-4 border-t border-foreground/15">
        <div className="max-w-md mx-auto">
          <button
            onClick={exportGroupPhoto}
            disabled={exporting || entries.length === 0}
            className="w-full bg-accent text-accent-foreground py-4 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 border-2 border-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting…' : 'Export group photo'}
          </button>
        </div>
      </div>
    </div>
  )
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function downloadGroupPhoto(
  eventName: string,
  theme: string | null,
  entries: GalleryEntry[],
): Promise<void> {
  const cols = Math.min(entries.length, COLS_MAX)
  const rows = Math.ceil(entries.length / cols)

  const canvasW = cols * CARD_W + (cols + 1) * PADDING
  const canvasH = HEADER_H + rows * (CARD_H + NAME_H) + (rows + 1) * PADDING

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#F4F1E2'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Event name header
  ctx.fillStyle = '#1C1208'
  ctx.font = `300 ${HEADER_H * 0.45}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(eventName, canvasW / 2, HEADER_H / 2, canvasW - PADDING * 2)

  if (theme) {
    ctx.font = `11px 'Courier New', monospace`
    ctx.fillStyle = '#1C120866'
    ctx.fillText(
      `THEME: ${theme.toUpperCase()}`,
      canvasW / 2,
      HEADER_H * 0.82,
      canvasW - PADDING * 2,
    )
  }

  // Load all images in parallel
  const images = await Promise.all(
    entries.map(({ exportUrl }) =>
      loadImage(exportUrl).catch(() => null),
    ),
  )

  for (let i = 0; i < entries.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = PADDING + col * (CARD_W + PADDING)
    const y = HEADER_H + PADDING + row * (CARD_H + NAME_H + PADDING)

    // Card background
    ctx.fillStyle = '#ffffff18'
    ctx.strokeStyle = '#1C120820'
    ctx.lineWidth = 1
    ctx.fillRect(x, y, CARD_W, CARD_H)
    ctx.strokeRect(x, y, CARD_W, CARD_H)

    // Outfit image
    const img = images[i]
    if (img) {
      const scale = Math.min(CARD_W / img.naturalWidth, CARD_H / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx.drawImage(img, x + (CARD_W - dw) / 2, y + (CARD_H - dh) / 2, dw, dh)
    }

    // Name label
    ctx.fillStyle = '#1C1208'
    ctx.font = `11px 'Courier New', monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      entries[i].participant.username.toUpperCase(),
      x + CARD_W / 2,
      y + CARD_H + NAME_H / 2,
      CARD_W,
    )
  }

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${eventName.replace(/\s+/g, '-').toLowerCase()}-fits.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
