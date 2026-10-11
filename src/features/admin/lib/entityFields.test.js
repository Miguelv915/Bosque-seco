import { describe, expect, it } from 'vitest';
import {
  activityFields,
  paymentFields,
  PROVIDER_KINDS,
  providerFields,
  rewardFields,
  routeFields,
  spaceFields,
  subspaceFields,
} from './entityFields';

const t = (key) => key;
const names = (fields) => fields.map((field) => field.name);
const byName = (fields, name) => fields.find((field) => field.name === name);

describe('definición de formularios', () => {
  const all = [
    ...spaceFields,
    ...subspaceFields([]),
    ...providerFields([], t),
    ...activityFields([], []),
    ...paymentFields(t),
    ...routeFields([]),
    ...rewardFields,
  ];

  it('el líder escribe solo en español: ningún campo *_en', () => {
    expect(names(all).filter((name) => name.endsWith('_en'))).toEqual([]);
  });

  it('un espacio exige nombre, departamentos y la ficha "Antes de ir"', () => {
    const required = spaceFields.filter((f) => f.required).map((f) => f.name);
    expect(required).toEqual(
      expect.arrayContaining(['name', 'departments', 'location_es', 'signal_es', 'access_es']),
    );
  });

  it('los selectores usan los datos recibidos', () => {
    const spaces = [{ id: 's1', name: 'PNCA' }];
    const field = subspaceFields(spaces).find((f) => f.name === 'space_id');
    expect(field.options).toEqual([{ value: 's1', label: 'PNCA' }]);
  });
});

describe('prestadores', () => {
  const fields = providerFields([], t);
  const phone = byName(fields, 'whatsapp');

  it('incluye el transporte entre los tipos', () => {
    expect(PROVIDER_KINDS).toEqual(['guide', 'food', 'lodging', 'transport']);
    expect(byName(fields, 'kind').options.map((o) => o.value)).toEqual(PROVIDER_KINDS);
  });

  it('el WhatsApp es obligatorio, se valida y se normaliza', () => {
    expect(phone.required).toBe(true);
    expect(phone.validate('987654321')).toBeNull();
    expect(phone.validate('12345')).toBe('admin.errors.phone');
    expect(phone.transform('+51 987 654-321')).toBe('+51987654321');
  });
});

describe('productos canjeables', () => {
  const points = byName(rewardFields, 'points_required');
  const discount = byName(rewardFields, 'discount_percent');

  it('los puntos son mayores que 0', () => {
    expect(points.min).toBe(1);
  });

  it('el descuento va de 1 a 100', () => {
    expect([discount.min, discount.max]).toEqual([1, 100]);
  });
});
