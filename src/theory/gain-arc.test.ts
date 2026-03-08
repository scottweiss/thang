import { describe, it, expect } from 'vitest';
import { gainArcMultiplier, shouldApplyGainArc } from './gain-arc';

describe('gainArcMultiplier', () => {
  it('build section crescendos over time', () => {
    const start = gainArcMultiplier('build', 0);
    const end = gainArcMultiplier('build', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('build uses ease-in curve (slow start)', () => {
    const quarter = gainArcMultiplier('build', 0.25);
    const half = gainArcMultiplier('build', 0.5);
    const start = gainArcMultiplier('build', 0);
    const end = gainArcMultiplier('build', 1);

    // Ease-in: more change in second half
    const firstHalf = half - start;
    const secondHalf = end - half;
    expect(secondHalf).toBeGreaterThan(firstHalf);
  });

  it('breakdown decrescendos over time', () => {
    const start = gainArcMultiplier('breakdown', 0);
    const end = gainArcMultiplier('breakdown', 1);
    expect(end).toBeLessThan(start);
  });

  it('peak is stable and near 1.0', () => {
    const start = gainArcMultiplier('peak', 0);
    const end = gainArcMultiplier('peak', 1);
    expect(start).toBeGreaterThanOrEqual(0.95);
    expect(Math.abs(end - start)).toBeLessThan(0.1);
  });

  it('stays within 0.7-1.05 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = gainArcMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.7);
        expect(val).toBeLessThanOrEqual(1.05);
      }
    }
  });

  it('clamps progress', () => {
    const normal = gainArcMultiplier('build', 1.0);
    const clamped = gainArcMultiplier('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });

  it('intro fades in gently', () => {
    const start = gainArcMultiplier('intro', 0);
    const end = gainArcMultiplier('intro', 1);
    expect(end).toBeGreaterThan(start);
    expect(start).toBeGreaterThanOrEqual(0.7);
  });
});

describe('shouldApplyGainArc', () => {
  it('returns true for build (crescendo)', () => {
    expect(shouldApplyGainArc('build')).toBe(true);
  });

  it('returns true for breakdown (decrescendo)', () => {
    expect(shouldApplyGainArc('breakdown')).toBe(true);
  });

  it('returns true for intro (fade-in)', () => {
    expect(shouldApplyGainArc('intro')).toBe(true);
  });

  it('returns false for peak (stable)', () => {
    expect(shouldApplyGainArc('peak')).toBe(false);
  });

  it('returns false for groove (minimal change)', () => {
    expect(shouldApplyGainArc('groove')).toBe(false);
  });
});
