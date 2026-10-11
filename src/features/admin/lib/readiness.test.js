import { describe, expect, it } from 'vitest';
import { computeReadiness } from './readiness';

const point = (extra = {}) => ({ lat: -3.8, lon: -80.2, photo_path: 'a/p.jpg', ...extra });

const completeTree = () => ({
  summary_es: 'Resumen',
  spaces: [{ location_es: 'Piura', signal_es: 'Solo en el pueblo', access_es: '1 h' }],
  payment_methods: [{ kind: 'cash' }],
  providers: [
    { kind: 'guide', is_active: true, whatsapp: '987654321' },
    { kind: 'food', is_active: true, whatsapp: '+51987654322' },
  ],
  routes: [{ route_points: [point()] }],
  rewards: [{ name_es: 'Polo' }],
});

const withRoutes = { includeRoutes: true };
const itemById = (result, id) => result.items.find((item) => item.id === id);

describe('computeReadiness', () => {
  it('una asociación vacía no cumple ningún requisito obligatorio', () => {
    const result = computeReadiness({});
    expect(result.requiredDone).toBe(0);
    expect(result.complete).toBe(false);
  });

  it('con todos los datos está completa', () => {
    const result = computeReadiness(completeTree());
    expect(result.complete).toBe(true);
    expect(result.requiredDone).toBe(result.requiredTotal);
  });

  it('exige señal y acceso en cada espacio', () => {
    const tree = completeTree();
    tree.spaces.push({ location_es: 'Tumbes', signal_es: '', access_es: '' });
    expect(itemById(computeReadiness(tree), 'beforeYouGo').ok).toBe(false);
  });

  it('exige al menos un guía activo', () => {
    const tree = completeTree();
    tree.providers = [{ kind: 'food', is_active: true, whatsapp: '987654321' }];
    expect(itemById(computeReadiness(tree), 'guides').ok).toBe(false);
  });

  it('un servicio con WhatsApp inválido bloquea el requisito de teléfonos', () => {
    const tree = completeTree();
    tree.providers[1].whatsapp = '12345';
    expect(itemById(computeReadiness(tree), 'phones').ok).toBe(false);
  });

  it('los prestadores inactivos no cuentan', () => {
    const tree = completeTree();
    tree.providers.push({ kind: 'guide', is_active: false, whatsapp: 'xx' });
    expect(itemById(computeReadiness(tree), 'phones').ok).toBe(true);
  });

  it('sin rutas activadas no pide puntos ni productos', () => {
    const result = computeReadiness({});
    const ids = result.items.map((item) => item.id);
    expect(ids).not.toContain('route');
    expect(ids).not.toContain('rewards');
    expect(result.requiredTotal).toBe(6);
  });

  it('con rutas activadas exige al menos un punto', () => {
    const empty = computeReadiness({}, withRoutes);
    expect(empty.requiredTotal).toBe(7);
    expect(itemById(computeReadiness(completeTree(), withRoutes), 'route').ok).toBe(true);
  });

  it('GPS y foto son recomendados, no bloquean', () => {
    const tree = completeTree();
    tree.routes = [{ route_points: [point({ lat: null, lon: null, photo_path: null })] }];
    const result = computeReadiness(tree, withRoutes);
    expect(itemById(result, 'pointsGps')).toMatchObject({ ok: false, required: false });
    expect(itemById(result, 'pointsPhoto')).toMatchObject({ ok: false, required: false });
    expect(result.complete).toBe(true);
  });

  it('cada requisito indica la sección donde se corrige', () => {
    const result = computeReadiness({});
    expect(result.items.every((item) => typeof item.section === 'string')).toBe(true);
  });
});
