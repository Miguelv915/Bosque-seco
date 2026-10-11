import { describe, expect, it } from 'vitest';
import { esText } from './esText';

describe('esText', () => {
  it('lee la columna en español del campo', () => {
    expect(esText({ summary_es: 'Hola', summary_en: 'Hello' }, 'summary')).toBe('Hola');
  });

  it('ignora la columna en inglés aunque exista', () => {
    expect(esText({ summary_en: 'Hello' }, 'summary')).toBe('');
  });

  it('es seguro con filas nulas o campos ausentes', () => {
    expect(esText(null, 'summary')).toBe('');
    expect(esText({}, 'summary')).toBe('');
  });
});
