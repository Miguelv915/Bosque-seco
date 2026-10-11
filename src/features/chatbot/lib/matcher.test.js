import { describe, expect, it } from 'vitest';
import { INTENTS } from '../data/intents';
import { matchIntent, normalize } from './matcher';

const ask = (message) => matchIntent(message, INTENTS);

describe('normalize', () => {
  it('quita tildes, signos y mayúsculas', () => {
    expect(normalize('  ¿Cómo LLEGO al Ángolo?! ')).toBe('como llego al angolo');
    expect(normalize('año')).toBe('ano');
  });

  it('tolera valores vacíos', () => {
    expect(normalize(null)).toBe('');
    expect(normalize(undefined)).toBe('');
  });
});

describe('matchIntent', () => {
  it('responde «Hola» con el saludo', () => {
    expect(ask('Hola')).toBe('greeting');
    expect(ask('¡HOLA!')).toBe('greeting');
    expect(ask('buenas tardes')).toBe('greeting');
  });

  it('reconoce las preguntas frecuentes en español', () => {
    expect(ask('¿Cómo llego a El Angolo?')).toBe('access');
    expect(ask('¿Cuál es la mejor época para ir?')).toBe('season');
    expect(ask('¿Hay señal de celular?')).toBe('signal');
    expect(ask('¿Aceptan Yape?')).toBe('payments');
    expect(ask('¿Qué debo llevar?')).toBe('pack');
    expect(ask('¿Cuánto cuesta el guía?')).toBe('prices');
    expect(ask('Quiero hablar con un guía')).toBe('guides');
    expect(ask('¿Qué lugares puedo visitar?')).toBe('destinations');
    expect(ask('¿Dónde descargo la app?')).toBe('app');
  });

  it('reconoce las preguntas frecuentes en inglés', () => {
    expect(ask('Hello')).toBe('greeting');
    expect(ask('How do I get there?')).toBe('access');
    expect(ask('When is the best time to visit?')).toBe('season');
    expect(ask('What should I bring?')).toBe('pack');
    expect(ask('thank you')).toBe('thanks');
  });

  it('prefiere la pregunta al saludo que la acompaña', () => {
    expect(ask('Hola, buenas tardes, ¿cómo llegar?')).toBe('access');
  });

  it('no confunde palabras cortas con otras más largas', () => {
    expect(ask('historia')).toBeNull();
    expect(ask('autorizado')).toBeNull();
  });

  it('devuelve null si no entiende o el mensaje está vacío', () => {
    expect(ask('asdf qwer')).toBeNull();
    expect(ask('   ')).toBeNull();
    expect(ask('')).toBeNull();
  });

  it('despide y agradece', () => {
    expect(ask('Muchas gracias')).toBe('thanks');
    expect(ask('Adiós')).toBe('bye');
  });
});
