// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutoTour } from './useAutoTour';

describe('useAutoTour', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('avanza solo con cada intervalo y vuelve al inicio', () => {
    const { result } = renderHook(() => useAutoTour(3, 1000));
    expect(result.current[0]).toBe(0);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current[0]).toBe(1);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current[0]).toBe(0);
  });

  it('se detiene al elegir un elemento manualmente', () => {
    const { result } = renderHook(() => useAutoTour(3, 1000));

    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current[0]).toBe(2);
  });

  it('no avanza con un solo elemento', () => {
    const { result } = renderHook(() => useAutoTour(1, 1000));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current[0]).toBe(0);
  });
});
