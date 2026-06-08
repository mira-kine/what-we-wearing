import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Plus } from 'lucide-react'

// TODO step 4: replace this stub with the real closet mechanic:
//   - lazy-import @imgly/background-removal on first upload
//   - save bg-removed PNGs to closet_items + storage
//   - swipe through closet per slot, mannequin updates live
//   - Konva stage with SLOT_LAYOUT positions + fitting-room background
//   - save draft / publish (canvas → blob → uploadOutfitExport)

type SlotType = 'face' | 'top' | 'bottom' | 'shoes' | 'accessory'

interface Slot {
  id: SlotType
  label: string
  image: string | null
}

export function Builder() {
  const navigate = useNavigate()
  const { code } = useParams({ from: '/$code/builder' })
  const [slots, setSlots] = useState<Slot[]>([
    { id: 'face', label: 'Face', image: null },
    { id: 'top', label: 'Top', image: null },
    { id: 'bottom', label: 'Bottom', image: null },
    { id: 'shoes', label: 'Shoes', image: null },
    { id: 'accessory', label: 'Accessory', image: null },
  ])

  const handleImageUpload = (slotId: SlotType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSlots((prev) =>
          prev.map((slot) =>
            slot.id === slotId ? { ...slot, image: event.target?.result as string } : slot,
          ),
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    alert('Fit saved!')
  }

  const handlePublish = () => {
    alert('Published to group!')
    navigate({ to: '/$code/gallery', params: { code } })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/15">
        <button
          onClick={() => navigate({ to: '/$code', params: { code } })}
          className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2
          className="uppercase tracking-widest text-xs"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Paris Weekend
        </h2>
        <div className="w-5" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mannequin — placeholder SVG; will be replaced with Konva stage + bg + slot overlays */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative w-64 h-96">
            <svg
              viewBox="0 0 200 400"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="40" r="30" fill="#1C1208" opacity="0.1" />
              <circle cx="100" cy="40" r="25" fill="#F4F1E2" />
              <circle cx="100" cy="40" r="25" stroke="#1C1208" strokeWidth="1" opacity="0.2" />
              <rect x="90" y="65" width="20" height="15" fill="#1C1208" opacity="0.1" />
              <path
                d="M 70 80 L 70 200 L 80 220 L 80 280 L 75 340 L 75 380 L 85 380 L 85 340 L 90 280 L 90 220 L 100 200 L 110 220 L 110 280 L 115 340 L 115 380 L 125 380 L 125 340 L 120 280 L 120 220 L 130 200 L 130 80 Z"
                fill="#1C1208"
                opacity="0.1"
              />
              <rect x="50" y="85" width="20" height="80" rx="10" fill="#1C1208" opacity="0.1" />
              <rect x="130" y="85" width="20" height="80" rx="10" fill="#1C1208" opacity="0.1" />
              {slots.find((s) => s.id === 'face')?.image && (
                <image
                  href={slots.find((s) => s.id === 'face')?.image || ''}
                  x="75"
                  y="15"
                  width="50"
                  height="50"
                  clipPath="circle(25px at 25px 25px)"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Slot Panel */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-foreground/15 p-6 space-y-4">
          <p
            className="uppercase tracking-widest text-xs text-secondary mb-6"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Clothing slots
          </p>
          {slots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-4 pb-4 border-b border-foreground/10">
              <label
                htmlFor={`upload-${slot.id}`}
                className="w-16 h-16 flex items-center justify-center border border-foreground/15 cursor-pointer hover:border-accent transition-colors overflow-hidden bg-foreground/5"
              >
                {slot.image ? (
                  <img src={slot.image} alt={slot.label} className="w-full h-full object-cover" />
                ) : (
                  <Plus className="w-5 h-5 text-secondary" />
                )}
                <input
                  id={`upload-${slot.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(slot.id, e)}
                />
              </label>
              <div>
                <p
                  className="uppercase tracking-widest text-xs"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {slot.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex gap-4 px-6 py-4 border-t border-foreground/15">
        <button
          onClick={handleSave}
          className="flex-1 border-2 border-foreground text-foreground py-4 uppercase tracking-widest text-sm transition-opacity hover:opacity-70"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Save
        </button>
        <button
          onClick={handlePublish}
          className="flex-1 bg-accent text-accent-foreground py-4 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 border-2 border-secondary"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Publish to group
        </button>
      </div>
    </div>
  )
}
