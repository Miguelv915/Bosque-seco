// Definición de los campos de cada formulario del líder.
// Las claves de texto viven en i18n bajo `admin.fields.*` y `admin.hints.*`.
// Los líderes escriben solo en español; las columnas *_en quedan para una
// traducción posterior y el portal cae al español cuando están vacías.
import { isValidPhone, normalizePhone } from './validation';

const f = (name, labelKey, extra = {}) => ({ name, labelKey: `admin.fields.${labelKey}`, ...extra });

const byName = (items) => items.map((item) => ({ value: item.id, label: item.name }));

const validatePhone = (value) => (isValidPhone(value) ? null : 'admin.errors.phone');

// Ubicación elegida en el mapa: `lat` y `lon` se envían como campos del registro.
const locationField = f('location', 'location', {
  type: 'location',
  validate: ({ lat, lon }) => (lat === null || lon === null ? 'admin.errors.geoRange' : null),
});

export const PROVIDER_KINDS = ['guide', 'food', 'lodging', 'transport'];

// Espacio: ficha "Antes de ir" de la app móvil.
export const spaceFields = [
  f('name', 'name', { required: true }),
  f('acronym', 'acronym'),
  f('departments', 'departments', { type: 'csv', required: true }),
  f('province', 'province'),
  f('kind', 'kind'),
  f('location_es', 'locationEs', { required: true, hint: 'admin.hints.location' }),
  f('signal_es', 'signal', { required: true, hint: 'admin.hints.signal' }),
  f('access_es', 'access', { required: true, hint: 'admin.hints.access' }),
  locationField,
  f('description_es', 'descriptionEs', { type: 'textarea' }),
];

export const subspaceFields = (spaces) => [
  f('space_id', 'space', { type: 'select', required: true, options: byName(spaces) }),
  f('name', 'name', { required: true }),
  f('description_es', 'descriptionEs', { type: 'textarea' }),
  f('attractions_es', 'attractionsEs', { type: 'lines' }),
  locationField,
];

export const providerFields = (subspaces, t) => [
  f('name', 'name', { required: true }),
  f('kind', 'kind', {
    type: 'select',
    required: true,
    options: PROVIDER_KINDS.map((kind) => ({ value: kind, label: t(`admin.kind.${kind}`) })),
  }),
  f('specialty_es', 'specialtyEs'),
  f('whatsapp', 'whatsapp', {
    type: 'tel',
    required: true,
    hint: 'admin.hints.phone',
    validate: validatePhone,
    transform: normalizePhone,
  }),
  f('rate_text_es', 'rate', { hint: 'admin.hints.rate' }),
  f('subspace_ids', 'assignedSubspaces', { type: 'checkboxes', options: byName(subspaces) }),
];

export const activityFields = (subspaces, providers) => [
  f('name_es', 'nameEs', { required: true }),
  f('subspace_id', 'subspace', { type: 'select', emptyOption: true, options: byName(subspaces) }),
  f('provider_id', 'provider', { type: 'select', emptyOption: true, options: byName(providers) }),
  f('price', 'price', { type: 'number', min: 0 }),
  f('price_unit_es', 'priceUnitEs'),
  f('duration_minutes', 'duration', { type: 'number', min: 0 }),
  f('max_capacity', 'capacity', { type: 'number', min: 1 }),
  f('description_es', 'descriptionEs', { type: 'textarea' }),
];

export const paymentFields = (t) => [
  f('kind', 'kind', {
    type: 'select',
    required: true,
    options: ['cash', 'yape'].map((kind) => ({ value: kind, label: t(`admin.payment.${kind}`) })),
  }),
  f('note_es', 'noteEs', { hint: 'admin.hints.paymentNote' }),
];

export const routeFields = (spaces) => [
  f('name_es', 'nameEs', { required: true }),
  f('space_id', 'space', { type: 'select', emptyOption: true, options: byName(spaces) }),
  f('description_es', 'descriptionEs', { type: 'textarea' }),
];

export const rewardFields = [
  f('name_es', 'nameEs', { required: true, hint: 'admin.hints.reward' }),
  f('points_required', 'points', { type: 'number', required: true, min: 1, step: 1 }),
  f('discount_percent', 'discount', { type: 'number', required: true, min: 1, max: 100, step: 1 }),
];
