import { describe, it, expect } from 'vitest';
import { hpfSweepOffset, shouldApplyHpfSweep } from './hpf-sweep';

describe('hpfSweepOffset', () => {
  it('build section sweeps up dramatically', () => {
    const start = hpfSweepOffset('build', 0);
    const end = hpfSweepOffset('build', 1);
    expect(end).toBeGreaterThan(start);
    expect(end).toBeGreaterThanOrEqual(200); // significant sweep
  });

  it('build uses exponential curve (slow start)', () => {
    const quarter = hpfSweepOffset('build', 0.25);
    const half = hpfSweepOffset('build', 0.5);
    const start = hpfSweepOffset('build', 0);
    const end = hpfSweepOffset('build', 1);

    // Exponential: most change happens in last quarter
    const firstHalf = half - start;
    const secondHalf = end - half;
    expect(secondHalf).toBeGreaterThan(firstHalf);
  });

  it('peak section has zero offset', () => {
    expect(hpfSweepOffset('peak', 0)).toBe(0);
    expect(hpfSweepOffset('peak', 1)).toBe(0);
  });

  it('breakdown has gentle rise', () => {
    const start = hpfSweepOffset('breakdown', 0);
    const end = hpfSweepOffset('breakdown', 1);
    expect(end).toBeGreaterThan(start);
    expect(end).toBeLessThan(100); // much less than build
  });

  it('returns non-negative values', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        expect(hpfSweepOffset(section, p)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('clamps progress', () => {
    const normal = hpfSweepOffset('build', 1.0);
    const clamped = hpfSweepOffset('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('shouldApplyHpfSweep', () => {
  it('returns true for build (major sweep)', () => {
    expect(shouldApplyHpfSweep('build')).toBe(true);
  });

  it('returns true for breakdown', () => {
    expect(shouldApplyHpfSweep('breakdown')).toBe(true);
  });

  it('returns true for intro', () => {
    expect(shouldApplyHpfSweep('intro')).toBe(true);
  });

  it('returns false for peak (no sweep)', () => {
    expect(shouldApplyHpfSweep('peak')).toBe(false);
  });

  it('returns false for groove (minimal)', () => {
    expect(shouldApplyHpfSweep('groove')).toBe(false);
  });
});
