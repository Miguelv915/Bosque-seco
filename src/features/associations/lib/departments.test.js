import { describe, expect, it } from 'vitest';
import {
  ALL_DEPARTMENTS,
  departmentsOf,
  filterByDepartment,
  listDepartments,
  spacesIn,
} from './departments';

const amotape = {
  name: 'ATEC Amotape',
  spaces: [
    { name: 'Parque Nacional Cerros de Amotape', departments: ['Tumbes', 'Piura'] },
    { name: 'Quebrada Fernández', departments: ['Piura'] },
  ],
};
const lancones = {
  name: 'Lancones',
  spaces: [{ name: 'Poza del Pato', departments: ['Piura'] }],
};
const sinEspacios = { name: 'Nueva', spaces: [] };

describe('departamentos', () => {
  it('une los departamentos de los espacios sin repetir', () => {
    expect(departmentsOf(amotape)).toEqual(['Tumbes', 'Piura']);
    expect(departmentsOf(sinEspacios)).toEqual([]);
  });

  it('lista todos los departamentos en orden alfabético', () => {
    expect(listDepartments([amotape, lancones, sinEspacios])).toEqual(['Piura', 'Tumbes']);
  });

  it('filtra las asociaciones por departamento', () => {
    const all = [amotape, lancones, sinEspacios];
    expect(filterByDepartment(all, 'Tumbes')).toEqual([amotape]);
    expect(filterByDepartment(all, 'Piura')).toEqual([amotape, lancones]);
    expect(filterByDepartment(all, ALL_DEPARTMENTS)).toEqual(all);
  });

  it('muestra solo los espacios del departamento elegido', () => {
    expect(spacesIn(amotape, 'Tumbes').map((s) => s.name)).toEqual([
      'Parque Nacional Cerros de Amotape',
    ]);
    expect(spacesIn(amotape, ALL_DEPARTMENTS)).toHaveLength(2);
  });
});
