import { describe, expect, it } from 'vitest';
import { whatsappLink, withMessage } from './whatsapp';

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

describe('withMessage', () => {
  it('agrega el mensaje codificado', () => {
    expect(withMessage('https://wa.me/51900000001', 'Hola, ¿hay cupo?')).toBe(
      'https://wa.me/51900000001?text=Hola%2C%20%C2%BFhay%20cupo%3F',
    );
  });

  it('respeta parámetros que ya trae el enlace', () => {
    expect(withMessage('https://wa.me/51900000001?lang=es', 'Hola')).toBe(
      'https://wa.me/51900000001?lang=es&text=Hola',
    );
  });

  it('sin enlace devuelve null y sin texto deja el enlace igual', () => {
    expect(withMessage('', 'Hola')).toBeNull();
    expect(withMessage('https://wa.me/1', '')).toBe('https://wa.me/1');
  });
});
