// Datos de EJEMPLO para Visitas y Visitantes mientras la app móvil no sincroniza
// los reales. Son deterministas (misma semilla, mismas cifras) y la interfaz los
// marca siempre como ficticios.
const AGE_RANGES = ['18-25', '26-35', '36-45', '46-60', '60+'];
const AGE_WEIGHTS = [0.22, 0.31, 0.24, 0.17, 0.06];
const MONTHS = 6;

function hash(text) {
  let h = 2166136261;
  for (const char of String(text)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function randomFrom(seed) {
  let state = hash(seed);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let r = Math.imul(state ^ (state >>> 15), 1 | state);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Los últimos `MONTHS` meses terminando en el de `now`, como 'YYYY-MM'. */
function lastMonths(now) {
  return Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

/**
 * Visitas ficticias de una asociación (o del conjunto, con una semilla fija).
 * `scale` aproxima el tamaño: una asociación ~1, la red ~ cuántas hay.
 */
export function demoVisits(seed, { scale = 1, now = new Date() } = {}) {
  const random = randomFrom(seed);

  const byMonth = lastMonths(now).map((month) => ({
    month,
    value: Math.max(1, Math.round((8 + random() * 22) * scale)),
  }));
  const visits = byMonth.reduce((sum, row) => sum + row.value, 0);
  const visitors = Math.round(visits * (2.4 + random() * 1.4));

  const raw = AGE_WEIGHTS.map((weight) => weight * (0.8 + random() * 0.4));
  const rawTotal = raw.reduce((sum, v) => sum + v, 0);
  const byAge = AGE_RANGES.map((label, i) => ({
    label,
    value: Math.round((raw[i] / rawTotal) * visitors),
  }));
  // El redondeo puede descuadrar el total: el ajuste va al rango más numeroso.
  const gap = visitors - byAge.reduce((sum, row) => sum + row.value, 0);
  const top = byAge.reduce((best, row) => (row.value > best.value ? row : best));
  top.value += gap;

  return { visits, visitors, avgMinutes: Math.round(95 + random() * 110), byMonth, byAge };
}
