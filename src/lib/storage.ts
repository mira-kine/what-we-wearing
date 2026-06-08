import { supabase } from './supabase'

export async function uploadOutfitPiece(
  eventId: string,
  participantId: string,
  blob: Blob
): Promise<string> {
  const path = `${eventId}/${participantId}/${crypto.randomUUID()}.png`

  const { error } = await supabase.storage
    .from('outfit-pieces')
    .upload(path, blob, { contentType: 'image/png' })

  if (error) throw error

  return supabase.storage.from('outfit-pieces').getPublicUrl(path).data.publicUrl
}

export async function uploadOutfitExport(
  eventId: string,
  participantId: string,
  blob: Blob
): Promise<string> {
  const path = `${eventId}/${participantId}/export.png`

  const { error } = await supabase.storage
    .from('outfit-exports')
    .upload(path, blob, { contentType: 'image/png', upsert: true })

  if (error) throw error

  return supabase.storage.from('outfit-exports').getPublicUrl(path).data.publicUrl
}
