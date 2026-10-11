/** Enlace wa.me a partir de un número (acepta +, espacios y guiones). */
export function whatsappLink(number) {
  const digits = String(number ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
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
