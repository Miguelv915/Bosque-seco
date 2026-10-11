import { describe, expect, it } from 'vitest';
import { pointQrText, QR_PREFIX } from './qr';

describe('QR de los carteles', () => {
  it('lleva el prefijo de la plataforma y el código del punto', () => {
    expect(pointQrText('mirador')).toBe(`${QR_PREFIX}mirador`);
    expect(pointQrText('mirador')).toBe('ecorumbo:punto:mirador');
  });
});
