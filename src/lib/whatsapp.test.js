import { describe, expect, it } from 'vitest';
import { whatsappLink } from './whatsapp';

describe('whatsappLink', () => {
  it('deja solo los dígitos del número', () => {
    expect(whatsappLink('+51 900-000-001')).toBe('https://wa.me/51900000001');
  });

  it('devuelve null si no hay número utilizable', () => {
    expect(whatsappLink(null)).toBeNull();
    expect(whatsappLink('')).toBeNull();
    expect(whatsappLink('sin número')).toBeNull();
  });
});
