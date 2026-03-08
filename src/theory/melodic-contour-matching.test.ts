import { describe, it, expect } from 'vitest';
import {
  contourMatchWeight,
  melodyDirection,
  contourMatchingStrength,
} from './melodic-contour-matching';

describe('contourMatchWeight', () => {
  it('parallel motion boosted for trance', () => {
    const weight = contourMatchWeight(1, 1, 'trance');
    expect(weight).toBeGreaterThan(1.0);
  });

  it('contrary motion boosted for syro', () => {
    const weight = contourMatchWeight(1, -1, 'syro');
    expect(weight).toBeGreaterThan(1.0);
  });

  it('no contour returns 1.0', () => {
    expect(contourMatchWeight(0, 1, 'lofi')).toBe(1.0);
  });

  it('stays in 0.5-1.5 range', () => {
    for (const dir of [-1, 0, 1]) {
      for (const cand of [-1, 0, 1]) {
        const w = contourMatchWeight(dir, cand, 'avril');
        expect(w).toBeGreaterThanOrEqual(0.5);
        expect(w).toBeLessThanOrEqual(1.5);
      }
    }
  });
});

describe('melodyDirection', () => {
  it('ascending returns 1', () => {
    expect(melodyDirection([60, 64])).toBe(1);
  });

  it('descending returns -1', () => {
    expect(melodyDirection([64, 60])).toBe(-1);
  });

  it('static returns 0', () => {
    expect(melodyDirection([60, 60])).toBe(0);
  });

  it('single note returns 0', () => {
    expect(melodyDirection([60])).toBe(0);
  });

  it('uses last two notes', () => {
    expect(melodyDirection([60, 64, 62])).toBe(-1);
  });
});

describe('contourMatchingStrength', () => {
  it('avril is high', () => {
    expect(contourMatchingStrength('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(contourMatchingStrength('syro')).toBe(0.15);
  });
});
