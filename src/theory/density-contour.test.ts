import { describe, it, expect } from 'vitest';
import { densityContour, shouldApplyDensityContour } from './density-contour';

describe('densityContour', () => {
  it('intro starts sparse and increases', () => {
    const early = densityContour('intro', 0.1, 1.0);
    const late = densityContour('intro', 0.9, 1.0);
    expect(late).toBeGreaterThan(early);
  });

  it('build accelerates toward end', () => {
    const early = densityContour('build', 0.1, 1.0);
    const mid = densityContour('build', 0.5, 1.0);
    const late = densityContour('build', 0.9, 1.0);
    expect(mid).toBeGreaterThan(early);
    expect(late).toBeGreaterThan(mid);
  });

  it('breakdown drops quickly', () => {
    const early = densityContour('breakdown', 0.0, 1.0);
    const mid = densityContour('breakdown', 0.5, 1.0);
    expect(early).toBeGreaterThan(mid);
  });

  it('peak stays near base density', () => {
    const values: number[] = [];
    for (let p = 0; p <= 1; p += 0.1) {
      values.push(densityContour('peak', p, 1.0));
    }
    // All values should be within ±15% of base
    for (const v of values) {
      expect(v).toBeGreaterThan(0.8);
      expect(v).toBeLessThan(1.2);
    }
  });

  it('groove oscillates gently', () => {
    const values: number[] = [];
    for (let p = 0; p <= 1; p += 0.05) {
      values.push(densityContour('groove', p, 1.0));
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Should vary but not dramatically
    expect(max - min).toBeLessThan(0.5);
    expect(max - min).toBeGreaterThan(0.05);
  });

  it('scales with baseDensity', () => {
    const half = densityContour('peak', 0.5, 0.5);
    const full = densityContour('peak', 0.5, 1.0);
    expect(full).toBeGreaterThan(half);
  });

  it('clamps progress to 0-1', () => {
    expect(densityContour('build', -0.5, 1.0)).toBeGreaterThan(0);
    expect(densityContour('build', 2.0, 1.0)).toBeGreaterThan(0);
  });

  it('always returns positive values', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        expect(densityContour(section, p, 1.0)).toBeGreaterThan(0);
      }
    }
  });
});

describe('shouldApplyDensityContour', () => {
  it('false at very start', () => {
    expect(shouldApplyDensityContour(0)).toBe(false);
  });

  it('true once progress begins', () => {
    expect(shouldApplyDensityContour(0.1)).toBe(true);
  });
});
