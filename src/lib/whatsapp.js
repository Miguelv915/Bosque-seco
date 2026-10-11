/** Enlace wa.me a partir de un número (acepta +, espacios y guiones). */
export function whatsappLink(number) {
  const digits = String(number ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

// Un número con menos dígitos que esto no puede ser un teléfono completo.
const MIN_DIGITS = 8;

/**
 * Enlace de WhatsApp a partir de lo que se configure en el entorno: un enlace
 * completo (`https://wa.me/51987654321`) o solo el número. Un celular peruano de
 * 9 dígitos sin código de país recibe el 51. Devuelve '' si no hay nada usable.
 */
export function contactLink(value) {
  const text = String(value ?? '').trim();
  if (/^https?:\/\//i.test(text)) return text;

  const digits = text.replace(/\D/g, '');
  if (digits.length < MIN_DIGITS) return '';
  const full = digits.length === 9 && digits.startsWith('9') ? `51${digits}` : digits;
  return whatsappLink(full) ?? '';
}

/**
 * Agrega un mensaje prellenado (`?text=`) a un enlace de WhatsApp.
 * Devuelve null si no hay enlace, para que la vista ofrezca otra vía de contacto.
 */
export function withMessage(url, text) {
  if (!url) return null;
  if (!text) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}text=${encodeURIComponent(text)}`;
}
