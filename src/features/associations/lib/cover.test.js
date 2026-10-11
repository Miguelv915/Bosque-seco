import { describe, expect, it } from 'vitest';
import { coverFor } from './cover';

const FALLBACKS = [
  { match: /amotape/i, src: 'amotape.jpg', credit: 'Autor · CC BY 2.0' },
  { match: /lancones/i, src: 'lancones.jpg' },
];

describe('coverFor', () => {
  it('prefiere la foto que subió la asociación', () => {
    expect(coverFor('Amotape Sostenible', 'subida.jpg', FALLBACKS)).toEqual({ src: 'subida.jpg', credit: null });
  });

  it('usa la portada de respaldo según el lugar del nombre', () => {
    expect(coverFor('Asociación Amotape Sostenible', null, FALLBACKS)).toEqual({
      src: 'amotape.jpg',
      credit: 'Autor · CC BY 2.0',
    });
    expect(coverFor('Bosques de Lancones', undefined, FALLBACKS)).toEqual({ src: 'lancones.jpg', credit: null });
  });

  it('devuelve null si no hay foto ni respaldo', () => {
    expect(coverFor('Otra asociación', null, FALLBACKS)).toBeNull();
    expect(coverFor(undefined, null, FALLBACKS)).toBeNull();
  });
});
