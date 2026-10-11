/** Enlace wa.me a partir de un número (acepta +, espacios y guiones). */
export function whatsappLink(number) {
  const digits = String(number ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}
