// Definición de los campos de cada formulario del líder.
// Las claves de texto viven en i18n bajo `admin.fields.*`.
// Los líderes escriben solo en español; las columnas *_en quedan para la
// traducción automática y el portal cae al español cuando están vacías.

const f = (name, labelKey, extra = {}) => ({ name, labelKey: `admin.fields.${labelKey}`, ...extra });

const byName = (items) => items.map((item) => ({ value: item.id, label: item.name }));

export const spaceFields = [
  f('name', 'name', { required: true }),
  f('acronym', 'acronym'),
  f('departments', 'departments', { type: 'csv', required: true }),
  f('province', 'province'),
  f('kind', 'kind'),
  f('location_es', 'locationEs'),
  f('description_es', 'descriptionEs', { type: 'textarea' }),
];

export const subspaceFields = (spaces) => [
  f('space_id', 'space', { type: 'select', required: true, options: byName(spaces) }),
  f('name', 'name', { required: true }),
  f('description_es', 'descriptionEs', { type: 'textarea' }),
  f('attractions_es', 'attractionsEs', { type: 'lines' }),
];

export const providerFields = (subspaces, t) => [
  f('name', 'name', { required: true }),
  f('kind', 'kind', {
    type: 'select',
    required: true,
    options: ['guide', 'food', 'lodging'].map((kind) => ({
      value: kind,
      label: t(`admin.kind.${kind}`),
    })),
  }),
  f('specialty_es', 'specialtyEs'),
  f('whatsapp', 'whatsapp'),
  f('subspace_ids', 'assignedSubspaces', { type: 'checkboxes', options: byName(subspaces) }),
];

export const activityFields = (subspaces, providers) => [
  f('name_es', 'nameEs', { required: true }),
  f('subspace_id', 'subspace', { type: 'select', emptyOption: true, options: byName(subspaces) }),
  f('provider_id', 'provider', { type: 'select', emptyOption: true, options: byName(providers) }),
  f('price', 'price', { type: 'number' }),
  f('price_unit_es', 'priceUnitEs'),
  f('duration_minutes', 'duration', { type: 'number' }),
  f('max_capacity', 'capacity', { type: 'number' }),
  f('description_es', 'descriptionEs', { type: 'textarea' }),
];

export const paymentFields = (t) => [
  f('kind', 'kind', {
    type: 'select',
    required: true,
    options: ['cash', 'yape'].map((kind) => ({ value: kind, label: t(`admin.payment.${kind}`) })),
  }),
  f('note_es', 'noteEs'),
];

/** El WhatsApp solo se publica para guías: se descarta en otros tipos. */
export function normalizeProvider(payload) {
  if (payload.kind !== 'guide') {
    const { whatsapp, ...rest } = payload;
    void whatsapp;
    return rest;
  }
  return payload;
}
