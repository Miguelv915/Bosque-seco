/** Imagen de portada: la marcada como `is_cover` o la primera por orden. */
export function pickCover(media = []) {
  const sorted = [...media].sort((a, b) => a.sort_order - b.sort_order);
  return sorted.find((m) => m.is_cover) || sorted[0] || null;
}
