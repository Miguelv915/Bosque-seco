// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import ReadinessSummary from './ReadinessSummary';
import RoutePointForm from './RoutePointForm';

// El formulario no debe tocar la red: los servicios se simulan.
vi.mock('../../../services/changeRequests.service', () => ({
  createRequest: vi.fn(),
  isPointCodeTaken: vi.fn().mockResolvedValue(false),
  uploadAssociationImage: vi.fn(),
}));

beforeAll(async () => {
  await i18n.changeLanguage('es');
});

afterEach(cleanup);

describe('ReadinessSummary', () => {
  it('muestra el avance y lleva a la sección que falta', () => {
    const onGoTo = vi.fn();
    render(<ReadinessSummary tree={{}} onGoTo={onGoTo} />);

    expect(screen.getByText('0 de 6 requisitos listos')).toBeTruthy();

    const fixButtons = screen.getAllByRole('button', { name: 'Completar' });
    fireEvent.click(fixButtons[0]);
    expect(onGoTo).toHaveBeenCalledWith('association');
  });

  it('indica cuándo todo lo obligatorio está listo', () => {
    const tree = {
      summary_es: 'Resumen',
      spaces: [{ location_es: 'Piura', signal_es: 'Pueblo', access_es: '1 h' }],
      payment_methods: [{ kind: 'cash' }],
      providers: [{ kind: 'guide', is_active: true, whatsapp: '987654321' }],
      routes: [{ route_points: [{ lat: 1, lon: 1, photo_path: 'a/b.jpg' }] }],
      rewards: [],
    };
    render(<ReadinessSummary tree={tree} onGoTo={() => {}} />);
    expect(screen.getByText(/Todo lo obligatorio está listo/)).toBeTruthy();
  });
});

describe('RoutePointForm', () => {
  it('pide crear una ruta antes de agregar puntos', () => {
    render(<RoutePointForm associationId="a1" routes={[]} onSent={() => {}} />);
    expect(screen.getByText(/Primero crea una ruta/)).toBeTruthy();
  });

  it('normaliza el código mientras se escribe', () => {
    render(
      <RoutePointForm
        associationId="a1"
        routes={[{ id: 'r1', name_es: 'Sendero' }]}
        onSent={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText('mirador');
    fireEvent.change(input, { target: { value: 'Mirador Ñandú ' } });
    expect(input.value).toBe('mirador-nandu-');
  });

  it('muestra un error si el código no es válido al enviar', async () => {
    render(
      <RoutePointForm
        associationId="a1"
        routes={[{ id: 'r1', name_es: 'Sendero' }]}
        onSent={() => {}}
      />,
    );

    // Un código que empieza con número no es válido.
    fireEvent.change(screen.getByPlaceholderText('mirador'), { target: { value: '1punto' } });
    fireEvent.change(document.querySelector('input[name="name_es"]'), {
      target: { value: 'Punto' },
    });
    fireEvent.change(document.querySelector('textarea[name="description_es"]'), {
      target: { value: 'Descripción' },
    });
    fireEvent.submit(document.querySelector('form'));

    expect(await screen.findByText(/empezando con una letra/)).toBeTruthy();
  });
});
