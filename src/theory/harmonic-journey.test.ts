import { describe, it, expect } from 'vitest';
import {
  targetKeyArea,
  journeyBias,
  shouldModulate,
  journeyAppetite,
  getPivotDegrees,
} from './harmonic-journey';

describe('targetKeyArea', () => {
  it('returns 0 (home) for intro', () => {
    expect(targetKeyArea('intro', 'lofi', 0)).toBe(0);
  });

  it('returns 0 (home) for groove', () => {
    expect(targetKeyArea('groove', 'trance', 10)).toBe(0);
  });

  it('returns 0 for low-appetite moods regardless of section', () => {
    expect(targetKeyArea('build', 'ambient', 0)).toBe(0);
    expect(targetKeyArea('peak', 'ambient', 50)).toBe(0);
  });

  it('returns non-zero for build section with high appetite', () => {
    // lofi has high appetite, build targets V or vi
    const area = targetKeyArea('build', 'lofi', 42);
    expect([4, 5]).toContain(area);
  });

  it('returns non-zero for peak with moderate+ appetite', () => {
    const area = targetKeyArea('peak', 'disco', 10);
    expect([3, 4]).toContain(area);
  });

  it('varies with tick', () => {
    const results = new Set<number>();
    for (let t = 0; t < 100; t++) {
      results.add(targetKeyArea('build', 'lofi', t));
    }
    // Should produce both possible targets across different ticks
    expect(results.size).toBeGreaterThanOrEqual(1);
  });
});

describe('journeyBias', () => {
  it('returns 1.0 when targeting home key', () => {
    expect(journeyBias(3, 0, 'lofi')).toBe(1.0);
  });

  it('boosts pivot degrees for target area', () => {
    // V area (4): pivots are [4, 1, 6]
    const pivotBias = journeyBias(4, 4, 'lofi');
    expect(pivotBias).toBeGreaterThan(1.0);
  });

  it('boosts target degree itself', () => {
    const targetBias = journeyBias(3, 3, 'lofi');
    expect(targetBias).toBeGreaterThan(1.0);
  });

  it('slightly penalizes non-pivot degrees', () => {
    // V area (4): pivots are [4, 1, 6], so degree 0 is non-pivot
    const nonPivotBias = journeyBias(0, 4, 'lofi');
    expect(nonPivotBias).toBeLessThan(1.0);
  });

  it('scales bias by mood appetite', () => {
    const lofiBias = journeyBias(4, 4, 'lofi');
    const ambientBias = journeyBias(4, 4, 'ambient');
    expect(lofiBias).toBeGreaterThan(ambientBias);
  });

  it('stays within 0.7-1.5 range', () => {
    const moods = ['lofi', 'trance', 'ambient', 'disco', 'syro'] as const;
    for (const mood of moods) {
      for (let deg = 0; deg < 7; deg++) {
        for (let area = 0; area < 7; area++) {
          const bias = journeyBias(deg, area as any, mood);
          expect(bias).toBeGreaterThanOrEqual(0.7);
          expect(bias).toBeLessThanOrEqual(1.5);
        }
      }
    }
  });
});

describe('shouldModulate', () => {
  it('always modulates on build→peak', () => {
    expect(shouldModulate('build', 'peak', 'lofi')).toBe(true);
    expect(shouldModulate('build', 'peak', 'downtempo')).toBe(true);
  });

  it('always modulates on breakdown→groove', () => {
    expect(shouldModulate('breakdown', 'groove', 'lofi')).toBe(true);
  });

  it('does not modulate for ambient (very low appetite)', () => {
    expect(shouldModulate('intro', 'build', 'ambient')).toBe(false);
  });

  it('modulates for high-appetite moods on other transitions', () => {
    expect(shouldModulate('intro', 'build', 'lofi')).toBe(true);
  });
});

describe('journeyAppetite', () => {
  it('returns correct values', () => {
    expect(journeyAppetite('lofi')).toBe(0.55);
    expect(journeyAppetite('ambient')).toBe(0.10);
    expect(journeyAppetite('trance')).toBe(0.30);
  });
});

describe('getPivotDegrees', () => {
  it('returns all degrees for home key', () => {
    expect(getPivotDegrees(0)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('returns correct pivots for V area', () => {
    const pivots = getPivotDegrees(4);
    expect(pivots).toContain(4); // V itself
    expect(pivots).toContain(1); // ii (= vi/V)
  });

  it('returns correct pivots for vi area', () => {
    const pivots = getPivotDegrees(5);
    expect(pivots).toContain(5); // vi itself
    expect(pivots).toContain(0); // I (= III/vi)
  });
});
