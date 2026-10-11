import { supabase } from '../lib/supabaseClient';

const BUCKET = 'association-media';

/** URL pública de un archivo del bucket de asociaciones. */
export function mediaUrl(path) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function raise(error) {
  if (error) throw error;
}

/** Asociaciones activas con sus espacios (departamentos e imágenes para la portada). */
export async function listAssociations() {
  const { data, error } = await supabase
    .from('associations')
    .select(
      'id, slug, name, acronym, summary_es, summary_en, ' +
        'spaces(id, name, departments, sort_order, media(storage_path, is_cover, sort_order))',
    )
    .eq('is_active', true)
    .order('name');
  raise(error);
  return data;
}

/** Ficha pública de una asociación: espacios, guías, oferta general y medios de pago. */
export async function getAssociationBySlug(slug) {
  const { data, error } = await supabase
    .from('associations')
    .select(
      '*, spaces(*), providers(*), activities(*, providers(name)), payment_methods(*)',
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  raise(error);
  return data;
}

/** Ficha pública de un espacio con sus subespacios y galería. */
export async function getSpaceById(id) {
  const { data, error } = await supabase
    .from('spaces')
    .select('*, associations(id, slug, name, acronym, endorsed_by), subspaces(*), media(*)')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();
  raise(error);
  return data;
}

/**
 * Ficha pública de un subespacio: actividades con tarifa, galería, guías
 * asignados y, del contexto de la asociación, medios de pago y todos sus guías.
 */
export async function getSubspaceById(id) {
  const { data: subspace, error } = await supabase
    .from('subspaces')
    .select(
      '*, spaces(id, name, departments), media(*), ' +
        'activities(*, providers(name, kind)), subspace_providers(providers(*))',
    )
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();
  raise(error);
  if (!subspace) return null;

  const { data: association, error: associationError } = await supabase
    .from('associations')
    .select('id, slug, name, acronym, endorsed_by, payment_methods(*), providers(*)')
    .eq('id', subspace.association_id)
    .single();
  raise(associationError);

  return { subspace, association };
}

/** Todo lo que gestiona una asociación (para el panel del líder). */
export async function getAssociationTree(associationId) {
  const { data, error } = await supabase
    .from('associations')
    .select(
      '*, spaces(*, subspaces(*)), providers(*), activities(*), payment_methods(*), ' +
        'routes(*, route_points(*)), rewards(*)',
    )
    .eq('id', associationId)
    .single();
  raise(error);
  return data;
}
