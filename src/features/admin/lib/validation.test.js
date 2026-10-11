import { describe, expect, it } from 'vitest';
import {
  finalizePointCode,
  isValidPhone,
  isValidPointCode,
  normalizePhone,
  normalizePointCode,
  parseLatitude,
  parseLongitude,
  parsePath,
} from './validation';

describe('código de punto', () => {
  it('normaliza a minúsculas, sin tildes ni espacios', () => {
    expect(normalizePointCode('Mirador del Faical')).toBe('mirador-del-faical');
    expect(normalizePointCode('Quebrada Ñandú')).toBe('quebrada-nandu');
    expect(normalizePointCode('Poza #1!')).toBe('poza-1');
  });

  it('conserva el espacio entre palabras mientras se escribe', () => {
    // "mirador " -> "mirador-" para que al seguir escribiendo no se pegue la palabra
    expect(normalizePointCode('mirador ')).toBe('mirador-');
    expect(normalizePointCode('mirador-alto')).toBe('mirador-alto');
  });

  it('al guardar recorta separadores sobrantes', () => {
    expect(finalizePointCode('  Mirador alto  ')).toBe('mirador-alto');
    expect(finalizePointCode('pozas_')).toBe('pozas');
  });

  it('acepta códigos válidos', () => {
    for (const code of ['mirador', 'pozas', 'punto_2', 'zona-3']) {
      expect(isValidPointCode(code)).toBe(true);
    }
  });

  it('rechaza códigos que no empiezan con letra o tienen caracteres no permitidos', () => {
    for (const code of ['', '1mirador', '-pozas', 'Mirador', 'con espacio', 'tilde-á']) {
      expect(isValidPointCode(code)).toBe(false);
    }
  });
});

describe('teléfono', () => {
  it('quita espacios, guiones y paréntesis', () => {
    expect(normalizePhone('+51 (987) 654-321')).toBe('+51987654321');
  });

  it('acepta celular peruano de 9 dígitos que empieza con 9', () => {
    expect(isValidPhone('987654321')).toBe(true);
    expect(isValidPhone('987 654 321')).toBe(true);
  });

  it('acepta números internacionales con +', () => {
    expect(isValidPhone('+51987654321')).toBe(true);
    expect(isValidPhone('+14155552671')).toBe(true);
  });

  it('rechaza números inválidos', () => {
    for (const value of ['', '12345', '887654321', '98765432', '9876543210', '51987654321', null]) {
      expect(isValidPhone(value)).toBe(false);
    }
  });
});

describe('coordenadas', () => {
  it('valida rangos y acepta coma decimal', () => {
    expect(parseLatitude('-3,8355')).toBe(-3.8355);
    expect(parseLongitude('-80.2402')).toBe(-80.2402);
    expect(parseLatitude('91')).toBeNull();
    expect(parseLongitude('-181')).toBeNull();
    expect(parseLatitude('abc')).toBeNull();
    expect(parseLatitude('')).toBeNull();
  });

  it('convierte el trazado línea por línea', () => {
    expect(parsePath('-3.83, -80.24\n\n-3.84, -80.23 ')).toEqual({
      path: [
        [-3.83, -80.24],
        [-3.84, -80.23],
      ],
    });
  });

  it('un trazado vacío es válido y no genera puntos', () => {
    expect(parsePath('')).toEqual({ path: [] });
  });

  it('indica la línea con el primer error', () => {
    expect(parsePath('-3.83, -80.24\nabc, 1')).toEqual({ error: 2 });
    expect(parsePath('-3.83')).toEqual({ error: 1 });
    expect(parsePath('-3.83, -80.24, 5')).toEqual({ error: 1 });
  });
});
