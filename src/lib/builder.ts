import type Konva from 'konva'
import { supabase } from './supabase'
import { uploadOutfitPiece, uploadOutfitExport } from './storage'
import { EventNotFoundError } from './events'
import { STAGE_WIDTH, STAGE_HEIGHT } from './layout'
import type {
  CanvasState,
  ClosetItem,
  Event,
  Outfit,
  SlotKey,
} from './types'

export type ClosetBySlot = Record<SlotKey, ClosetItem[]>

const emptyCloset = (): ClosetBySlot => ({
  face: [], top: [], bottom: [], shoes: [], accessory: [],
})

export type BuilderData = {
  event: Event
  outfit: Outfit | null
  closet: ClosetBySlot
}

export async function loadBuilderData(
  code: string,
  participantId: string,
): Promise<BuilderData> {
  const normalized = code.trim().toLowerCase()

  const { data: event, error: eErr } = await supabase
    .from('events')
    .select('*')
    .eq('code', normalized)
    .maybeSingle<Event>()
  if (eErr) throw eErr
  if (!event) throw new EventNotFoundError(normalized)

  const [{ data: outfit, error: oErr }, { data: items, error: cErr }] = await Promise.all([
    supabase
      .from('outfits')
      .select('*')
      .eq('participant_id', participantId)
      .eq('event_id', event.id)
      .maybeSingle<Outfit>(),
    supabase
      .from('closet_items')
      .select('*')
      .eq('participant_id', participantId)
      .eq('event_id', event.id)
      .order('slot_key', { ascending: true })
      .order('display_order', { ascending: true }),
  ])
  if (oErr) throw oErr
  if (cErr) throw cErr

  const closet = emptyCloset()
  for (const row of (items ?? []) as ClosetItem[]) {
    closet[row.slot_key].push(row)
  }

  return { event, outfit: outfit ?? null, closet }
}

/**
 * Lazy-load @imgly/background-removal on first call. Cached on the module
 * thereafter, so re-uploads don't pay the import cost again.
 */
let bgRemovalLoader: Promise<typeof import('@imgly/background-removal')> | null = null
export function loadBackgroundRemoval() {
  if (!bgRemovalLoader) bgRemovalLoader = import('@imgly/background-removal')
  return bgRemovalLoader
}

export type UploadPhase = 'removing' | 'uploading' | 'saving'
export type UploadProgress = { phase: UploadPhase; ratio?: number }

export async function uploadClosetItem(input: {
  eventId: string
  participantId: string
  slotKey: SlotKey
  file: File
  displayOrder: number
  onProgress?: (p: UploadProgress) => void
}): Promise<ClosetItem> {
  const { eventId, participantId, slotKey, file, displayOrder, onProgress } = input

  // 1. background removal
  onProgress?.({ phase: 'removing', ratio: 0 })
  const { removeBackground } = await loadBackgroundRemoval()
  const cleanedBlob = await removeBackground(file, {
    progress: (_key, current, total) => {
      if (total > 0) onProgress?.({ phase: 'removing', ratio: current / total })
    },
  })

  // 2. upload to storage
  onProgress?.({ phase: 'uploading' })
  const url = await uploadOutfitPiece(eventId, participantId, cleanedBlob)

  // 3. insert row
  onProgress?.({ phase: 'saving' })
  const { data, error } = await supabase
    .from('closet_items')
    .insert({
      participant_id: participantId,
      event_id: eventId,
      slot_key: slotKey,
      image_url: url,
      display_order: displayOrder,
    })
    .select()
    .single<ClosetItem>()

  if (error || !data) throw error ?? new Error('Failed to save closet item')
  return data
}

export async function deleteClosetItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('closet_items').delete().eq('id', itemId)
  if (error) throw error
  // Note: the storage object is left behind. Small leak; cleanup job is out of scope for MVP.
}

/** Upsert canvas_state to outfits. Sets is_published=false (does NOT clear export_url). */
export async function saveDraft(input: {
  eventId: string
  participantId: string
  canvasState: CanvasState
}): Promise<void> {
  const { error } = await supabase
    .from('outfits')
    .upsert(
      {
        event_id: input.eventId,
        participant_id: input.participantId,
        canvas_state: input.canvasState,
        is_published: false,
      },
      { onConflict: 'participant_id,event_id' },
    )
  if (error) throw error
}

/**
 * Publish: render the Konva stage, upload the PNG, upsert outfit row with
 * canvas_state + export_url + is_published=true + published_at.
 */
export async function publish(input: {
  eventId: string
  participantId: string
  canvasState: CanvasState
  stage: Konva.Stage
  stageScale: number
}): Promise<string> {
  const blob = await exportStageToBlob(input.stage, input.stageScale)
  const exportUrl = await uploadOutfitExport(input.eventId, input.participantId, blob)
  const { error } = await supabase
    .from('outfits')
    .upsert(
      {
        event_id: input.eventId,
        participant_id: input.participantId,
        canvas_state: input.canvasState,
        export_url: exportUrl,
        is_published: true,
        published_at: new Date().toISOString(),
      },
      { onConflict: 'participant_id,event_id' },
    )
  if (error) throw error
  return exportUrl
}

/** Render stage to PNG blob at native (logical) resolution at 2x for retina. */
export async function exportStageToBlob(
  stage: Konva.Stage,
  visualScale: number,
): Promise<Blob> {
  // Stage is rendered at STAGE_WIDTH*visualScale; we want a native-res output.
  // pixelRatio compensates so output is STAGE_WIDTH*2 wide regardless of visualScale.
  const dataUrl = stage.toDataURL({
    mimeType: 'image/png',
    pixelRatio: 2 / visualScale,
    x: 0,
    y: 0,
    width: STAGE_WIDTH * visualScale,
    height: STAGE_HEIGHT * visualScale,
  })
  const res = await fetch(dataUrl)
  return res.blob()
}
