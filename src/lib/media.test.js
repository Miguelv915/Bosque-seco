import { describe, expect, it } from 'vitest';
import { pickCover } from './media';

const item = (id, sort_order, is_cover = false) => ({ id, sort_order, is_cover });

describe('pickCover', () => {
  it('devuelve null sin imágenes', () => {
    expect(pickCover([])).toBeNull();
    expect(pickCover()).toBeNull();
  });

  it('prefiere la imagen marcada como portada', () => {
    const media = [item('a', 0), item('b', 5, true), item('c', 1)];
    expect(pickCover(media).id).toBe('b');
  });

  it('sin portada, usa la de menor orden', () => {
    const media = [item('a', 3), item('b', 1), item('c', 2)];
    expect(pickCover(media).id).toBe('b');
  });

  it('no modifica el arreglo recibido', () => {
    const media = [item('a', 3), item('b', 1)];
    pickCover(media);
    expect(media.map((m) => m.id)).toEqual(['a', 'b']);
  });
});
