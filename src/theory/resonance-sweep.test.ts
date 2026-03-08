import { describe, it, expect } from 'vitest';
import { resonanceSweepMultiplier, shouldApplyResonanceSweep } from './resonance-sweep';

describe('resonanceSweepMultiplier', () => {
  it('build section increases resonance', () => {
    const start = resonanceSweepMultiplier('build', 0);
    const end = resonanceSweepMultiplier('build', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('breakdown section decreases resonance', () => {
    const start = resonanceSweepMultiplier('breakdown', 0);
    const end = resonanceSweepMultiplier('breakdown', 1);
    expect(end).toBeLessThan(start);
  });

  it('peak is bright and stable', () => {
    const start = resonanceSweepMultiplier('peak', 0);
    const end = resonanceSweepMultiplier('peak', 1);
    expect(start).toBeGreaterThanOrEqual(1.0);
    expect(Math.abs(end - start)).toBeLessThan(0.15);
  });

  it('stays within 0.6-1.4 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = resonanceSweepMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.6);
        expect(val).toBeLessThanOrEqual(1.4);
      }
    }
  });

  it('clamps progress', () => {
    const normal = resonanceSweepMultiplier('build', 1.0);
    const clamped = resonanceSweepMultiplier('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('shouldApplyResonanceSweep', () => {
  it('returns true for build (rising edge)', () => {
    expect(shouldApplyResonanceSweep('build')).toBe(true);
  });

  it('returns true for breakdown (fading warmth)', () => {
    expect(shouldApplyResonanceSweep('breakdown')).toBe(true);
  });

  it('returns false for peak (stable)', () => {
    expect(shouldApplyResonanceSweep('peak')).toBe(false);
  });

  it('returns false for groove (minimal change)', () => {
    expect(shouldApplyResonanceSweep('groove')).toBe(false);
  });

  it('returns false for intro (minimal change)', () => {
    expect(shouldApplyResonanceSweep('intro')).toBe(false);
  });
});
