/**
 * Helper d'upload pour le bucket `groupement-assets` (logos, signatures).
 */
import { supabase } from '@/integrations/supabase/client';

export async function uploadGroupementAsset(file: File, groupementId: string, kind: 'logo' | 'signature'): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${groupementId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('groupement-assets').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('groupement-assets').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteGroupementAsset(url: string): Promise<void> {
  const m = url.match(/\/groupement-assets\/(.+)$/);
  if (!m) return;
  await supabase.storage.from('groupement-assets').remove([m[1]]);
}
