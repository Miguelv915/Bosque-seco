// Cálculos del análisis de contenido. Son funciones puras: reciben lo que ya
// está en la base y devuelven números listos para mostrar.

const HOUR = 60 * 60 * 1000;

/** Cuenta elementos por clave. Los que no tienen clave se ignoran. */
export function countBy(items, keyOf) {
  const counts = {};
  for (const item of items) {
    const key = keyOf(item);
    if (key == null || key === '') continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** Cuánto hay publicado en una asociación. */
export function summarizeContent(tree) {
  const spaces = tree.spaces ?? [];
  const providers = tree.providers ?? [];
  const media = tree.media ?? [];
  const subspaces = spaces.reduce(
    (total, space) => total + (space.subspaces ?? []).length,
    0,
  );

  return {
    spaces: spaces.length,
    subspaces,
    providers: providers.length,
    providersByKind: countBy(providers, (p) => p.kind),
    activities: (tree.activities ?? []).length,
    paymentMethods: (tree.payment_methods ?? []).length,
    photos: media.length,
    photosByCategory: countBy(media, (m) => m.category),
  };
}

/** Estado de las solicitudes y tiempo medio que tarda el administrador. */
export function summarizeRequests(requests) {
  const byStatus = countBy(requests, (r) => r.status);
  const approved = byStatus.approved ?? 0;
  const rejected = byStatus.rejected ?? 0;

  const durations = requests
    .filter((r) => r.reviewed_at && r.created_at)
    .map((r) => new Date(r.reviewed_at) - new Date(r.created_at))
    .filter((ms) => ms >= 0);

  return {
    total: requests.length,
    pending: byStatus.pending ?? 0,
    approved,
    rejected,
    approvalRate: approved + rejected > 0 ? approved / (approved + rejected) : null,
    avgResponseHours:
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length / HOUR : null,
  };
}

/** Espacios por departamento (un espacio en dos departamentos cuenta en ambos). */
export function spacesByDepartment(associations) {
  const counts = {};
  for (const association of associations) {
    for (const space of association.spaces ?? []) {
      for (const department of space.departments ?? []) {
        counts[department] = (counts[department] ?? 0) + 1;
      }
    }
  }
  return counts;
}

/** Tiempo legible: minutos, horas o días. */
export function splitDuration(hours) {
  if (hours == null) return null;
  if (hours < 1) return { unit: 'min', value: Math.max(1, Math.round(hours * 60)) };
  if (hours < 48) return { unit: 'h', value: Math.round(hours * 10) / 10 };
  return { unit: 'd', value: Math.round(hours / 24) };
}
