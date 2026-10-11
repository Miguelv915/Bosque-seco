// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import ChatWidget from './ChatWidget';

beforeAll(async () => {
  await i18n.changeLanguage('es');
});

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const mount = () =>
  render(
    <MemoryRouter>
      <ChatWidget />
    </MemoryRouter>,
  );

const openChat = () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir el asistente de ayuda' }));
};

const type = (text) => {
  fireEvent.change(screen.getByLabelText('Escribe tu pregunta'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
};

const waitForReply = () => act(() => vi.advanceTimersByTime(600));

describe('ChatWidget', () => {
  it('empieza cerrado y se abre con la bienvenida', () => {
    mount();
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir el asistente de ayuda' }));

    expect(screen.getByRole('dialog', { name: 'Asistente EcoRumbo' })).toBeTruthy();
    expect(screen.getByText(/Soy el asistente de EcoRumbo/)).toBeTruthy();
  });

  it('responde «Hola» con el saludo', () => {
    openChat();
    type('Hola');

    expect(screen.getByText('Hola')).toBeTruthy();
    waitForReply();
    expect(screen.getByText('¡Hola! ¿En qué podemos ayudarte?')).toBeTruthy();
  });

  it('responde una pregunta frecuente con un enlace de apoyo', () => {
    openChat();
    type('¿Cuándo es la mejor época?');
    waitForReply();

    expect(screen.getByText(/Hay dos temporadas/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver temporadas' })).toBeTruthy();
  });

  it('responde con una sugerencia sin escribir', () => {
    openChat();
    fireEvent.click(screen.getByRole('button', { name: '¿Qué llevar?' }));
    waitForReply();

    expect(screen.getByText(/Lleva agua suficiente/)).toBeTruthy();
  });

  it('ofrece contactar a un guía cuando no entiende', () => {
    openChat();
    type('qwerty zxcv');
    waitForReply();

    expect(screen.getByText(/No tengo una respuesta para eso/)).toBeTruthy();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('no envía mensajes vacíos', () => {
    openChat();
    const send = screen.getByRole('button', { name: 'Enviar' });
    expect(send.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('Escribe tu pregunta'), { target: { value: '   ' } });
    expect(send.disabled).toBe(true);
  });

  it('se cierra con Escape y devuelve el foco al botón', () => {
    openChat();
    expect(document.activeElement).toBe(screen.getByLabelText('Escribe tu pregunta'));

    fireEvent.keyDown(screen.getByLabelText('Escribe tu pregunta'), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Abrir el asistente de ayuda' }),
    );
  });

  it('responde en inglés cuando la web está en inglés', async () => {
    await i18n.changeLanguage('en');
    try {
      mount();
      fireEvent.click(screen.getByRole('button', { name: 'Open the help assistant' }));
      fireEvent.change(screen.getByLabelText('Type your question'), { target: { value: 'hello' } });
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
      waitForReply();

      expect(screen.getByText('Hello! How can we help you?')).toBeTruthy();
    } finally {
      await i18n.changeLanguage('es');
    }
  });
});
