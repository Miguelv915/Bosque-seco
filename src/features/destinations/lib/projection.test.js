import { describe, expect, it } from 'vitest';
import { project } from './projection';

describe('project', () => {
  it('sitúa la esquina noroeste en 0 % / 0 %', () => {
    expect(project({ lat: -3.8, lon: -81.2 })).toEqual({ x: '0.0%', y: '0.0%' });
  });

  it('sitúa la esquina sureste en 100 % / 100 %', () => {
    expect(project({ lat: -5.0, lon: -80.3 })).toEqual({ x: '100.0%', y: '100.0%' });
  });

  it('sitúa el centro de la ventana en 50 % / 50 %', () => {
    expect(project({ lat: -4.4, lon: -80.75 })).toEqual({ x: '50.0%', y: '50.0%' });
  });
});
