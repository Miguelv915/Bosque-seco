const DEFAULT_MAX_SIDE = 1280;
const DEFAULT_QUALITY = 0.7;

/**
 * Reduce una imagen en el navegador (lado mayor y calidad) para que pese pocos
 * cientos de KB y se vea sin buena señal. Si no puede, devuelve el original.
 */
export async function compressImage(file, { maxSide = DEFAULT_MAX_SIDE, quality = DEFAULT_QUALITY } = {}) {
  if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
