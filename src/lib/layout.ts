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
  <!-- Torso: shoulders taper to waist, widen at hips -->
  <path d="
    M 148 120
    C 136 122 118 130 108 145
    L 106 270
    C 106 270 118 285 148 290
    L 148 310
    C 140 318 130 330 128 345
    L 132 430
    C 134 435 138 438 148 438
    L 148 120 Z
    M 252 120
    C 264 122 282 130 292 145
    L 294 270
    C 294 270 282 285 252 290
    L 252 310
    C 260 318 270 330 272 345
    L 268 430
    C 266 435 262 438 252 438
    L 252 120 Z
    M 148 120 L 252 120
    C 252 120 268 124 272 136
    C 276 148 272 160 252 168
    L 148 168
    C 128 160 124 148 128 136
    C 132 124 148 120 148 120 Z"
    fill="#1C1208" opacity="0" />
  <!-- Simpler torso shape -->
  <path d="
    M 152 118
    Q 200 112 248 118
    L 272 138
    L 278 260
    Q 278 278 258 288
    L 258 312
    Q 278 328 282 350
    L 276 438
    Q 274 444 268 446
    L 132 446
    Q 126 444 124 438
    L 118 350
    Q 122 328 142 312
    L 142 288
    Q 122 278 122 260
    L 128 138 Z"
    fill="#F4F1E2" stroke="#1C1208" stroke-width="1.5" opacity="0.85"/>
  <!-- Left arm -->
  <path d="
    M 126 140
    Q 96 148 88 170
    L 82 270
    Q 82 288 90 296
    L 100 296
    Q 112 288 116 270
    L 120 175
    Z"
    fill="#F4F1E2" stroke="#1C1208" stroke-width="1.5" opacity="0.85"/>
  <!-- Right arm -->
  <path d="
    M 274 140
    Q 304 148 312 170
    L 318 270
    Q 318 288 310 296
    L 300 296
    Q 288 288 284 270
    L 280 175
    Z"
    fill="#F4F1E2" stroke="#1C1208" stroke-width="1.5" opacity="0.85"/>
  <!-- Left leg -->
  <path d="
    M 134 446
    Q 128 452 126 464
    L 120 580
    Q 120 598 134 604
    L 158 604
    Q 168 598 170 580
    L 176 464
    Q 174 450 168 446 Z"
    fill="#F4F1E2" stroke="#1C1208" stroke-width="1.5" opacity="0.85"/>
  <!-- Right leg -->
  <path d="
    M 266 446
    Q 272 452 274 464
    L 280 580
    Q 280 598 266 604
    L 242 604
    Q 232 598 230 580
    L 224 464
    Q 226 450 232 446 Z"
    fill="#F4F1E2" stroke="#1C1208" stroke-width="1.5" opacity="0.85"/>
</svg>`

export const MANNEQUIN_DATA_URL =
  'data:image/svg+xml;utf8,' + encodeURIComponent(MANNEQUIN_SVG)

// TODO: when fitting-room background asset arrives, export it here and render below the mannequin.
// export const FITTING_ROOM_BG_URL = '/assets/fitting-room.jpg'
