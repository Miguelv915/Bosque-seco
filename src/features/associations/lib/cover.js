/**
 * Portada de la tarjeta: la foto subida por la asociación (`uploadedUrl`) o,
 * si no hay, la de respaldo cuyo `match` coincide con el nombre. Sin ninguna, null.
 */
export function coverFor(name, uploadedUrl, fallbacks) {
  if (uploadedUrl) return { src: uploadedUrl, credit: null };
  const fallback = fallbacks.find(({ match }) => match.test(name ?? ''));
  return fallback ? { src: fallback.src, credit: fallback.credit ?? null } : null;
}
