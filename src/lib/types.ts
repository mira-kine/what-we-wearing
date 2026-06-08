export type SlotKey = 'face' | 'top' | 'bottom' | 'shoes' | 'accessory'

export const SLOTS: { key: SlotKey; label: string }[] = [
  { key: 'face',      label: 'Face' },
  { key: 'top',       label: 'Top' },
  { key: 'bottom',    label: 'Bottom' },
  { key: 'shoes',     label: 'Shoes' },
  { key: 'accessory', label: 'Accessory' },
]

export type Event = {
  id: string
  name: string
  code: string
  theme: string | null
  created_at: string
}

export type Participant = {
  id: string
  username: string
  event_id: string
  created_at: string
}

export type ClosetItem = {
  id: string
  participant_id: string
  event_id: string
  slot_key: SlotKey
  image_url: string
  display_order: number
  created_at: string
}

/** Maps each filled slot to the selected closet item id. */
export type CanvasState = Partial<Record<SlotKey, string>>

export type Outfit = {
  id: string
  participant_id: string
  event_id: string
  canvas_state: CanvasState | null
  export_url: string | null
  is_published: boolean
  published_at: string | null
  updated_at: string
  created_at: string
}
