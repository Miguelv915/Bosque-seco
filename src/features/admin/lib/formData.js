import { parseLatitude, parseLongitude } from './validation';

/** Convierte un FormData en objeto descartando los campos vacíos. */
export function filledFields(formData, names) {
  const out = {};
  for (const name of names) {
    const value = String(formData.get(name) ?? '').trim();
    if (value) out[name] = value;
  }
  return out;
}

const splitClean = (text, separator) =>
  text
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);

/**
 * Construye el payload de una solicitud a partir de la definición de campos.
 * Tipos: text · textarea · select · number · csv (coma → arreglo) ·
 * lines (una por línea → arreglo) · checkboxes (varios valores → arreglo) ·
 * location (campos `lat` y `lon` → `{ lat, lon }`, con null si no es válido).
 * Los campos vacíos se omiten.
 */
export function collectPayload(formData, fields) {
  const payload = {};
  for (const { name, type = 'text' } of fields) {
    if (type === 'checkboxes') {
      const values = formData.getAll(name);
      if (values.length) payload[name] = values;
      continue;
    }
    if (type === 'location') {
      const lat = String(formData.get('lat') ?? '').trim();
      const lon = String(formData.get('lon') ?? '').trim();
      if (lat || lon) payload[name] = { lat: parseLatitude(lat), lon: parseLongitude(lon) };
      continue;
    }
    const raw = String(formData.get(name) ?? '').trim();
    if (!raw) continue;
    if (type === 'number') payload[name] = Number(raw);
    else if (type === 'csv') payload[name] = splitClean(raw, ',');
    else if (type === 'lines') payload[name] = splitClean(raw, '\n');
    else payload[name] = raw;
  }
  return payload;
}
