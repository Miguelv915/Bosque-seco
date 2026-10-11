// Ventana geográfica del mapa esquemático (corredor Sullana – Máncora).
const LON_MIN = -81.2;
const LON_SPAN = 0.9;
const LAT_MAX = -3.8;
const LAT_SPAN = 1.2;

/** Convierte lat/lon a posición porcentual dentro del mapa esquemático. */
export function project({ lat, lon }) {
  return {
    x: `${(((lon - LON_MIN) / LON_SPAN) * 100).toFixed(1)}%`,
    y: `${(((LAT_MAX - lat) / LAT_SPAN) * 100).toFixed(1)}%`,
  };
}
