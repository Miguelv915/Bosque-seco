import { useCallback, useEffect, useState } from 'react';

/**
 * Índice activo que avanza solo cada `intervalMs`.
 * Al elegir manualmente un elemento el recorrido automático se detiene.
 * Con `start` (índice válido) arranca en ese elemento y sin recorrido automático.
 */
export function useAutoTour(length, intervalMs = 6000, start = null) {
  const hasStart = Number.isInteger(start) && start >= 0 && start < length;
  const [index, setIndex] = useState(hasStart ? start : 0);
  const [paused, setPaused] = useState(hasStart);

  useEffect(() => {
    if (paused || length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [paused, length, intervalMs]);

  const select = useCallback((i) => {
    setPaused(true);
    setIndex(i);
  }, []);

  return [index, select];
}
