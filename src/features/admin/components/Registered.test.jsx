// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CardGrid, DataTable, ItemCard, Registered } from './Registered';

afterEach(cleanup);

describe('Registered', () => {
  it('muestra el texto vacío cuando no hay elementos', () => {
    render(
      <Registered title="Rutas" count={0} empty="Aún no hay rutas.">
        <p>no debería verse</p>
      </Registered>,
    );
    expect(screen.getByText('Aún no hay rutas.')).toBeTruthy();
    expect(screen.queryByText('no debería verse')).toBeNull();
  });

  it('muestra el contador y las tarjetas con sus etiquetas', () => {
    render(
      <Registered title="Espacios" count={1} empty="vacío">
        <CardGrid>
          <ItemCard title="El Ángolo" tags={[{ label: 'Solo en el pueblo', tone: 'ok' }]} />
        </CardGrid>
      </Registered>,
    );
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('El Ángolo')).toBeTruthy();
    expect(screen.getByText('Solo en el pueblo')).toBeTruthy();
  });
});

describe('DataTable', () => {
  it('dibuja una fila por elemento con las columnas indicadas', () => {
    render(
      <DataTable
        rowKey={(row) => row.id}
        columns={[
          { key: 'name', label: 'Nombre', render: (row) => row.name },
          { key: 'kind', label: 'Tipo', render: (row) => row.kind },
        ]}
        rows={[
          { id: 1, name: 'Ana', kind: 'Guía' },
          { id: 2, name: 'Luis', kind: 'Comida' },
        ]}
      />,
    );
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('columnheader', { name: 'Tipo' })).toBeTruthy();
    expect(screen.getByText('Luis')).toBeTruthy();
  });
});
