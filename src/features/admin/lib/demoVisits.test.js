import { describe, expect, it } from 'vitest';
import { demoVisits } from './demoVisits';

const NOW = new Date(2026, 9, 11);

describe('demoVisits', () => {
  it('es determinista para la misma semilla', () => {
    expect(demoVisits('a', { now: NOW })).toEqual(demoVisits('a', { now: NOW }));
  });

  it('cambia con otra semilla', () => {
    expect(demoVisits('a', { now: NOW })).not.toEqual(demoVisits('b', { now: NOW }));
  });

  it('devuelve seis meses terminando en el actual', () => {
    const { byMonth } = demoVisits('a', { now: NOW });
    expect(byMonth.map((m) => m.month)).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
    ]);
  });

  it('los rangos de edad suman los visitantes', () => {
    const { byAge, visitors } = demoVisits('a', { now: NOW });
    expect(byAge.reduce((sum, row) => sum + row.value, 0)).toBe(visitors);
  });

  it('las visitas suman las de cada mes', () => {
    const { byMonth, visits } = demoVisits('a', { now: NOW });
    expect(byMonth.reduce((sum, row) => sum + row.value, 0)).toBe(visits);
  });
});
