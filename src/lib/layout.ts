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
  <!-- Head -->
  <ellipse cx="200" cy="62" rx="34" ry="40" fill="#F4F1E2" stroke="#1C1208" stroke-width="1.5" opacity="0.85"/>
  <!-- Neck -->
  <rect x="188" y="98" width="24" height="22" rx="6" fill="#F4F1E2" stroke="#1C1208" stroke-width="1" opacity="0.7"/>
  <!-- Torso: narrower shoulders taper to waist, slight hip flare -->
  <path d="
    M 172 118
    Q 200 112 228 118
    L 246 134
    L 250 220
    Q 250 234 236 241
    L 236 260
    Q 252 272 255 288
    L 250 362
    Q 248 368 242 370
    L 158 370
    Q 152 368 150 362
    L 145 288
    Q 148 272 164 260
    L 164 241
    Q 150 234 150 220
    L 154 134 Z"
    fill="#FCF4E7" stroke="#2C2521" stroke-width="1.5" opacity="0.85"/>
  <!-- Left arm -->
  <path d="
    M 150 136
    Q 122 144 114 165
    L 104 322
    Q 103 341 112 349
    L 124 349
    Q 136 341 139 322
    L 146 170
    Z"
    fill="#FCF4E7" stroke="#2C2521" stroke-width="1.5" opacity="0.85"/>
  <!-- Right arm -->
  <path d="
    M 250 136
    Q 278 144 286 165
    L 296 322
    Q 297 341 288 349
    L 276 349
    Q 264 341 261 322
    L 254 170
    Z"
    fill="#FCF4E7" stroke="#2C2521" stroke-width="1.5" opacity="0.85"/>
  <!-- Left leg -->
  <path d="
    M 161 370
    Q 154 380 153 400
    L 147 600
    Q 147 622 161 630
    L 181 630
    Q 191 622 192 600
    L 198 400
    Q 196 380 189 370 Z"
    fill="#FCF4E7" stroke="#2C2521" stroke-width="1.5" opacity="0.85"/>
  <!-- Right leg -->
  <path d="
    M 239 370
    Q 246 380 247 400
    L 253 600
    Q 253 622 239 630
    L 219 630
    Q 209 622 208 600
    L 202 400
    Q 204 380 211 370 Z"
    fill="#FCF4E7" stroke="#2C2521" stroke-width="1.5" opacity="0.85"/>
</svg>`

export const MANNEQUIN_DATA_URL =
  'data:image/svg+xml;utf8,' + encodeURIComponent(MANNEQUIN_SVG)

// TODO: when fitting-room background asset arrives, export it here and render below the mannequin.
// export const FITTING_ROOM_BG_URL = '/assets/fitting-room.jpg'
