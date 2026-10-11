import { useCallback, useEffect, useState } from 'react';

/**
 * Índice activo que avanza solo cada `intervalMs`.
 * Al elegir manualmente un elemento el recorrido automático se detiene.
 */
export function useAutoTour(length, intervalMs = 6000) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

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
