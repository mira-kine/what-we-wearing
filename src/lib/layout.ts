import type { SlotKey } from './types'

export const STAGE_WIDTH = 400
export const STAGE_HEIGHT = 640

export type SlotPosition = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Fixed positions for MVP. Each item is drawn into this box on the mannequin.
 * Per-item draggable positions will come later (would move into canvas_state).
 */
export const SLOT_LAYOUT: Record<SlotKey, SlotPosition> = {
  face:      { x: 150, y: 30,  width: 100, height: 100 },
  top:       { x: 120, y: 140, width: 160, height: 210 },
  bottom:    { x: 140, y: 320, width: 120, height: 200 },
  shoes:     { x: 140, y: 540, width: 120, height: 80  },
  accessory: { x: 160, y: 120, width: 80,  height: 80  },
}

/** Bottom-to-top render order. Items earlier in the array render below later ones. */
export const SLOT_RENDER_ORDER: SlotKey[] = ['shoes', 'bottom', 'top', 'face', 'accessory']

/** Placeholder mannequin. Replace with finished asset later. */
const MANNEQUIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 640">
  <circle cx="200" cy="80" r="50" fill="#1C1208" opacity="0.1"/>
  <circle cx="200" cy="80" r="42" fill="#F4F1E2"/>
  <circle cx="200" cy="80" r="42" stroke="#1C1208" stroke-width="2" opacity="0.2" fill="none"/>
  <rect x="180" y="130" width="40" height="25" fill="#1C1208" opacity="0.1"/>
  <path d="M 140 155 L 140 320 L 160 350 L 160 445 L 152 540 L 152 600 L 172 600 L 172 540 L 180 445 L 180 350 L 200 320 L 220 350 L 220 445 L 228 540 L 228 600 L 248 600 L 248 540 L 240 445 L 240 350 L 260 320 L 260 155 Z" fill="#1C1208" opacity="0.1"/>
  <rect x="100" y="165" width="40" height="130" rx="20" fill="#1C1208" opacity="0.1"/>
  <rect x="260" y="165" width="40" height="130" rx="20" fill="#1C1208" opacity="0.1"/>
</svg>`

export const MANNEQUIN_DATA_URL =
  'data:image/svg+xml;utf8,' + encodeURIComponent(MANNEQUIN_SVG)

// TODO: when fitting-room background asset arrives, export it here and render below the mannequin.
// export const FITTING_ROOM_BG_URL = '/assets/fitting-room.jpg'
