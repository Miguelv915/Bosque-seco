import { isValidPhone } from './validation';

const filled = (value) => typeof value === 'string' && value.trim() !== '';

/**
 * Qué falta para que la app móvil funcione con datos reales.
 * Recibe el árbol de la asociación (publicado) y devuelve la lista de
 * requisitos con su estado. Los cambios pendientes de aprobación no cuentan.
 */
export function computeReadiness(tree) {
  const spaces = tree.spaces ?? [];
  const providers = (tree.providers ?? []).filter((p) => p.is_active);
  const routes = tree.routes ?? [];
  const points = routes.flatMap((route) => route.route_points ?? []);

  const items = [
    { id: 'summary', required: true, section: 'association', ok: filled(tree.summary_es) },
    { id: 'space', required: true, section: 'spaces', ok: spaces.length > 0 },
    {
      id: 'beforeYouGo',
      required: true,
      section: 'spaces',
      ok:
        spaces.length > 0 &&
        spaces.every((s) => filled(s.location_es) && filled(s.signal_es) && filled(s.access_es)),
    },
    { id: 'payments', required: true, section: 'providers', ok: (tree.payment_methods ?? []).length > 0 },
    { id: 'guides', required: true, section: 'providers', ok: providers.some((p) => p.kind === 'guide') },
    {
      id: 'phones',
      required: true,
      section: 'providers',
      ok: providers.length > 0 && providers.every((p) => isValidPhone(p.whatsapp)),
    },
    { id: 'route', required: true, section: 'routes', ok: points.length > 0 },
    {
      id: 'pointsGps',
      required: false,
      section: 'routes',
      ok: points.length > 0 && points.every((p) => p.lat != null && p.lon != null),
    },
    {
      id: 'pointsPhoto',
      required: false,
      section: 'routes',
      ok: points.length > 0 && points.every((p) => filled(p.photo_path)),
    },
    { id: 'rewards', required: false, section: 'rewards', ok: (tree.rewards ?? []).length > 0 },
  ];

  const required = items.filter((item) => item.required);
  const requiredDone = required.filter((item) => item.ok).length;

  return {
    items,
    requiredDone,
    requiredTotal: required.length,
    complete: requiredDone === required.length,
  };
}
