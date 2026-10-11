// Reglas de DATOS-PORTAL-WEB.md. La base de datos las repite como restricciones;
// aquí se validan antes de enviar para dar mensajes claros.

const CODE_PATTERN = /^[a-z][a-z0-9_-]*$/;
const PERU_MOBILE = /^9\d{8}$/;
const INTERNATIONAL = /^\+[1-9]\d{7,14}$/;

/**
 * Normaliza el código mientras se escribe: minúsculas, sin tildes, y los
 * espacios pasan a guion. No recorta el final para no "comerse" el espacio
 * entre palabras; usar `finalizePointCode` al enviar.
 */
export function normalizePointCode(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/^[-_]+/, '');
}

/** Código listo para guardar: sin separadores sobrantes al final. */
export const finalizePointCode = (code) => normalizePointCode(code).replace(/[-_]+$/, '');

export const isValidPointCode = (code) => CODE_PATTERN.test(code ?? '');

/** Quita espacios, guiones y paréntesis de un teléfono. */
export function normalizePhone(input) {
  return String(input ?? '').replace(/[\s().-]/g, '');
}

/** Celular peruano de 9 dígitos que empieza con 9, o número internacional con +. */
export function isValidPhone(input) {
  const phone = normalizePhone(input);
  return PERU_MOBILE.test(phone) || INTERNATIONAL.test(phone);
}

/** Coordenada en rango; devuelve el número o null. */
export function parseCoordinate(text, { min, max }) {
  const value = Number(String(text ?? '').trim().replace(',', '.'));
  if (String(text ?? '').trim() === '' || Number.isNaN(value)) return null;
  return value >= min && value <= max ? value : null;
}

export const parseLatitude = (text) => parseCoordinate(text, { min: -90, max: 90 });
export const parseLongitude = (text) => parseCoordinate(text, { min: -180, max: 180 });

/**
 * Trazado del camino: una coordenada "lat, lon" por línea.
 * Devuelve `{ path }` (arreglo de pares) o `{ error: <número de línea> }`.
 */
export function parsePath(text) {
  const lines = String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const path = [];
  for (let i = 0; i < lines.length; i += 1) {
    const [lat, lon, ...extra] = lines[i].split(/[;,\s]+/).filter(Boolean);
    const latitude = parseLatitude(lat);
    const longitude = parseLongitude(lon);
    if (extra.length || latitude === null || longitude === null) return { error: i + 1 };
    path.push([latitude, longitude]);
  }
  return { path };
}
