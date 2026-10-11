import { describe, expect, it } from 'vitest';
import { collectPayload, filledFields } from './formData';

const formWith = (entries) => {
  const form = new FormData();
  for (const [key, value] of entries) form.append(key, value);
  return form;
};

describe('filledFields', () => {
  it('recorta espacios y omite campos vacíos', () => {
    const form = formWith([['a', '  hola '], ['b', '   '], ['c', 'x']]);
    expect(filledFields(form, ['a', 'b', 'c', 'd'])).toEqual({ a: 'hola', c: 'x' });
  });
});

describe('collectPayload', () => {
  const fields = [
    { name: 'name' },
    { name: 'price', type: 'number' },
    { name: 'departments', type: 'csv' },
    { name: 'attractions', type: 'lines' },
    { name: 'subspace_ids', type: 'checkboxes' },
    { name: 'note' },
  ];

  it('convierte cada tipo de campo y omite los vacíos', () => {
    const form = formWith([
      ['name', '  Rica Playa '],
      ['price', '45.5'],
      ['departments', 'Tumbes, Piura ,'],
      ['attractions', 'Mirador\n\n Sendero '],
      ['subspace_ids', 'id-1'],
      ['subspace_ids', 'id-2'],
      ['note', ''],
    ]);

    expect(collectPayload(form, fields)).toEqual({
      name: 'Rica Playa',
      price: 45.5,
      departments: ['Tumbes', 'Piura'],
      attractions: ['Mirador', 'Sendero'],
      subspace_ids: ['id-1', 'id-2'],
    });
  });

  it('conserva el cero como valor numérico válido', () => {
    expect(collectPayload(formWith([['price', '0']]), fields)).toEqual({ price: 0 });
  });

  it('no incluye checkboxes sin selección', () => {
    expect(collectPayload(formWith([]), fields)).toEqual({});
  });

  describe('ubicación', () => {
    const geo = [{ name: 'location', type: 'location' }];

    it('toma lat y lon como un solo valor', () => {
      const form = formWith([['lat', '-4.912345'], ['lon', ' -80.5 ']]);
      expect(collectPayload(form, geo)).toEqual({ location: { lat: -4.912345, lon: -80.5 } });
    });

    it('la omite si no se eligió punto', () => {
      expect(collectPayload(formWith([['lat', ''], ['lon', '']]), geo)).toEqual({});
    });

    it('marca como inválido lo que está fuera de rango o incompleto', () => {
      expect(collectPayload(formWith([['lat', '95'], ['lon', '-80']]), geo)).toEqual({
        location: { lat: null, lon: -80 },
      });
      expect(collectPayload(formWith([['lat', '-4.9'], ['lon', '']]), geo)).toEqual({
        location: { lat: -4.9, lon: null },
      });
    });
  });
});
