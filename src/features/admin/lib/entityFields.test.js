import { describe, expect, it } from 'vitest';
import {
  activityFields,
  normalizeProvider,
  paymentFields,
  providerFields,
  spaceFields,
  subspaceFields,
} from './entityFields';

const t = (key) => key;
const names = (fields) => fields.map((field) => field.name);

describe('normalizeProvider', () => {
  it('conserva el WhatsApp de un guía', () => {
    const payload = { name: 'Felipe', kind: 'guide', whatsapp: '+51900000001' };
    expect(normalizeProvider(payload)).toEqual(payload);
  });

  it.each(['food', 'lodging'])('descarta el WhatsApp si el prestador es %s', (kind) => {
    expect(normalizeProvider({ name: 'X', kind, whatsapp: '+51900000001' })).toEqual({
      name: 'X',
      kind,
    });
  });
});

describe('definición de formularios', () => {
  const all = [
    ...spaceFields,
    ...subspaceFields([]),
    ...providerFields([], t),
    ...activityFields([], []),
    ...paymentFields(t),
  ];

  it('el líder escribe solo en español: ningún campo *_en', () => {
    expect(names(all).filter((name) => name.endsWith('_en'))).toEqual([]);
  });

  it('un espacio exige nombre y departamentos', () => {
    const required = spaceFields.filter((f) => f.required).map((f) => f.name);
    expect(required).toEqual(expect.arrayContaining(['name', 'departments']));
  });

  it('los selectores usan los datos recibidos', () => {
    const spaces = [{ id: 's1', name: 'PNCA' }];
    const field = subspaceFields(spaces).find((f) => f.name === 'space_id');
    expect(field.options).toEqual([{ value: 's1', label: 'PNCA' }]);
  });
});
