import { describe, expect, it } from 'vitest';
import { demoNetworkVisits, demoVisits } from './demoVisits';

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

  it('reparte las visitas entre los espacios sin perder ninguna', () => {
    const spaces = [
      { id: 's1', name: 'Reserva' },
      { id: 's2', name: 'Cerro' },
      { id: 's3', name: 'Laguna' },
    ];
    const { bySpace, visits } = demoVisits('a', { spaces, now: NOW });
    expect(bySpace).toHaveLength(3);
    expect(bySpace.reduce((sum, row) => sum + row.value, 0)).toBe(visits);
  });

  it('sin espacios no inventa detalle por espacio', () => {
    expect(demoVisits('a', { now: NOW }).bySpace).toEqual([]);
  });
});

describe('demoNetworkVisits', () => {
  const associations = [
    { id: 'a1', name: 'Uno', spaces: [{ id: 's1', name: 'Reserva' }] },
    { id: 'a2', name: 'Dos', spaces: [{ id: 's2', name: 'Cerro' }] },
  ];

  it('suma las visitas de cada asociación', () => {
    const network = demoNetworkVisits(associations, { now: NOW });
    const expected = associations.reduce(
      (sum, a) => sum + demoVisits(a.id, { spaces: a.spaces, now: NOW }).visits,
      0,
    );
    expect(network.visits).toBe(expected);
    expect(network.bySpace.reduce((sum, row) => sum + row.value, 0)).toBe(expected);
  });

  it('nombra cada espacio con su asociación y ordena de más a menos', () => {
    const { bySpace } = demoNetworkVisits(associations, { now: NOW });
    expect(bySpace[0].label).toMatch(/ · (Uno|Dos)$/);
    expect(bySpace[0].value).toBeGreaterThanOrEqual(bySpace[1].value);
  });

  it('no falla sin asociaciones', () => {
    expect(demoNetworkVisits([], { now: NOW }).visits).toBe(0);
  });
});
