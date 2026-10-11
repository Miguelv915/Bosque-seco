import { describe, expect, it } from 'vitest';
import en from './locales/en.json';
import es from './locales/es.json';

/** Aplana un objeto anidado a rutas tipo `a.b.c`. */
function keysOf(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? keysOf(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('traducciones', () => {
  const spanish = new Set(keysOf(es));
  const english = new Set(keysOf(en));

  it('todo texto en español tiene su traducción al inglés', () => {
    const missing = [...spanish].filter((key) => !english.has(key));
    expect(missing).toEqual([]);
  });

  it('no hay claves en inglés sin su par en español', () => {
    const extra = [...english].filter((key) => !spanish.has(key));
    expect(extra).toEqual([]);
  });
});
