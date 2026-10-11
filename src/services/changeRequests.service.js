import { features } from '../config/features';
import { compressImage } from '../lib/image';
import { supabase } from '../lib/supabaseClient';

const BUCKET = 'association-media';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Solicitudes de la asociación del líder (la RLS ya filtra por asociación). */
export async function listRequests(associationId) {
  const { data, error } = await supabase
    .from('change_requests')
    .select('*')
    .eq('association_id', associationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Estado y fechas de todas las solicitudes (solo admin), para el análisis. */
export async function listAllRequests() {
  const { data, error } = await supabase
    .from('change_requests')
    .select('association_id, status, created_at, reviewed_at');
  if (error) throw error;
  return data;
}

/** Solicitudes pendientes de todas las asociaciones (solo admin). */
export async function listPendingRequests() {
  const { data, error } = await supabase
    .from('change_requests')
    .select('*, associations(name)')
    .eq('status', 'pending')
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function createRequest({ associationId, entityType, entityId = null, action, payload }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('change_requests')
    .insert({
      association_id: associationId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      payload,
      created_by: user.id,
    })
    .select('id')
    .single();
  if (error) throw error;
  if (!features.approvals) await approveRequest(data.id);
}

export async function approveRequest(id) {
  const { error } = await supabase.rpc('approve_change_request', { p_request_id: id });
  if (error) throw error;
}

export async function rejectRequest(id, note) {
  const { error } = await supabase.rpc('reject_change_request', {
    p_request_id: id,
    p_note: note || null,
  });
  if (error) throw error;
}

/**
 * Sube una imagen a la carpeta de la asociación y devuelve su ruta en el bucket.
 * Se reduce en el navegador antes de subirla para que cargue rápido sin señal.
 */
export async function uploadAssociationImage(associationId, file) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }
  const prepared = await compressImage(file);
  const extension = prepared.name.split('.').pop().toLowerCase();
  const path = `${associationId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, prepared, {
    contentType: prepared.type,
  });
  if (error) throw error;
  return path;
}

/** ¿Ya existe un punto publicado con este código? (el código del QR es único). */
export async function isPointCodeTaken(code) {
  const { count, error } = await supabase
    .from('route_points')
    .select('id', { count: 'exact', head: true })
    .eq('code', code);
  if (error) throw error;
  return count > 0;
}
