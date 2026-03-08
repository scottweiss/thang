import { describe, it, expect } from 'vitest';
import { fmMorphMultiplier, shouldApplyTimbralMorph } from './timbral-morph';

describe('fmMorphMultiplier', () => {
  it('build section brightens over time', () => {
    const start = fmMorphMultiplier('build', 0);
    const end = fmMorphMultiplier('build', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('breakdown section warms over time', () => {
    const start = fmMorphMultiplier('breakdown', 0);
    const end = fmMorphMultiplier('breakdown', 1);
    expect(end).toBeLessThan(start);
  });

  it('stays within ±20% range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = fmMorphMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.75);
        expect(val).toBeLessThanOrEqual(1.2);
      }
    }
  });

  it('peak section is bright and stable', () => {
    const start = fmMorphMultiplier('peak', 0);
    const end = fmMorphMultiplier('peak', 1);
    expect(start).toBeGreaterThan(1.0);
    expect(Math.abs(end - start)).toBeLessThan(0.1);
  });

  it('clamps progress', () => {
    const normal = fmMorphMultiplier('build', 1.0);
    const clamped = fmMorphMultiplier('build', 1.5);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('shouldApplyTimbralMorph', () => {
  it('returns true for build', () => {
    expect(shouldApplyTimbralMorph('build')).toBe(true);
  });

  it('returns true for breakdown', () => {
    expect(shouldApplyTimbralMorph('breakdown')).toBe(true);
  });

  it('returns true for intro', () => {
    expect(shouldApplyTimbralMorph('intro')).toBe(true);
  });

  it('returns false for peak (minimal change)', () => {
    expect(shouldApplyTimbralMorph('peak')).toBe(false);
  });
});
