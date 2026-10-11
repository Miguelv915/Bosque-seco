import { describe, expect, it } from 'vitest';
import {
  countBy,
  spacesByDepartment,
  splitDuration,
  summarizeContent,
  summarizeRequests,
} from './analytics';

describe('countBy', () => {
  it('cuenta por clave e ignora los vacíos', () => {
    expect(countBy([{ k: 'a' }, { k: 'a' }, { k: 'b' }, { k: null }], (x) => x.k)).toEqual({
      a: 2,
      b: 1,
    });
  });
});

describe('summarizeContent', () => {
  it('cuenta espacios, subespacios, servicios y fotos', () => {
    const result = summarizeContent({
      spaces: [{ subspaces: [{}, {}] }, { subspaces: [] }],
      providers: [{ kind: 'guide' }, { kind: 'guide' }, { kind: 'food' }],
      activities: [{}],
      payment_methods: [{}, {}],
      media: [{ category: 'flora' }, { category: 'fauna' }, { category: 'flora' }],
    });
    expect(result).toMatchObject({
      spaces: 2,
      subspaces: 2,
      providers: 3,
      providersByKind: { guide: 2, food: 1 },
      activities: 1,
      paymentMethods: 2,
      photos: 3,
      photosByCategory: { flora: 2, fauna: 1 },
    });
  });

  it('una asociación vacía devuelve ceros', () => {
    expect(summarizeContent({})).toMatchObject({ spaces: 0, providers: 0, photos: 0 });
  });
});

describe('summarizeRequests', () => {
  const at = (iso) => iso;

  it('calcula estados, tasa de aprobación y tiempo medio', () => {
    const result = summarizeRequests([
      { status: 'approved', created_at: at('2026-10-10T10:00:00Z'), reviewed_at: at('2026-10-10T12:00:00Z') },
      { status: 'approved', created_at: at('2026-10-10T10:00:00Z'), reviewed_at: at('2026-10-10T14:00:00Z') },
      { status: 'rejected', created_at: at('2026-10-10T10:00:00Z'), reviewed_at: at('2026-10-10T13:00:00Z') },
      { status: 'pending', created_at: at('2026-10-11T10:00:00Z'), reviewed_at: null },
    ]);
    expect(result).toMatchObject({ total: 4, pending: 1, approved: 2, rejected: 1 });
    expect(result.approvalRate).toBeCloseTo(2 / 3);
    expect(result.avgResponseHours).toBeCloseTo(3);
  });

  it('sin solicitudes revisadas no inventa promedios', () => {
    const result = summarizeRequests([{ status: 'pending', created_at: '2026-10-10T10:00:00Z' }]);
    expect(result.approvalRate).toBeNull();
    expect(result.avgResponseHours).toBeNull();
  });
});

describe('spacesByDepartment', () => {
  it('suma un espacio en cada uno de sus departamentos', () => {
    expect(
      spacesByDepartment([
        { spaces: [{ departments: ['Tumbes', 'Piura'] }, { departments: ['Piura'] }] },
        { spaces: [] },
      ]),
    ).toEqual({ Tumbes: 1, Piura: 2 });
  });
});

describe('splitDuration', () => {
  it('elige minutos, horas o días', () => {
    expect(splitDuration(null)).toBeNull();
    expect(splitDuration(0.5)).toEqual({ unit: 'min', value: 30 });
    expect(splitDuration(3)).toEqual({ unit: 'h', value: 3 });
    expect(splitDuration(72)).toEqual({ unit: 'd', value: 3 });
  });
});
