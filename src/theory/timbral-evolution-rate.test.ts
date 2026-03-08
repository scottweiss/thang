import { describe, it, expect } from 'vitest';
import {
  smoothedFm,
  evolutionRate,
} from './timbral-evolution-rate';

describe('smoothedFm', () => {
  it('moves toward target', () => {
    const result = smoothedFm(1.0, 2.0, 'trance', 'groove');
    expect(result).toBeGreaterThan(1.0);
    expect(result).toBeLessThan(2.0);
  });

  it('same value stays same', () => {
    const result = smoothedFm(1.5, 1.5, 'trance', 'groove');
    expect(result).toBe(1.5);
  });

  it('faster rate moves more', () => {
    const fast = smoothedFm(1.0, 2.0, 'syro', 'groove');
    const slow = smoothedFm(1.0, 2.0, 'ambient', 'groove');
    expect(fast).toBeGreaterThan(slow);
  });

  it('peak section moves faster than breakdown', () => {
    const peak = smoothedFm(1.0, 2.0, 'trance', 'peak');
    const bd = smoothedFm(1.0, 2.0, 'trance', 'breakdown');
    expect(peak).toBeGreaterThan(bd);
  });
});

describe('evolutionRate', () => {
  it('syro is fastest', () => {
    expect(evolutionRate('syro')).toBe(0.55);
  });

  it('ambient is slowest', () => {
    expect(evolutionRate('ambient')).toBe(0.25);
  });
});
