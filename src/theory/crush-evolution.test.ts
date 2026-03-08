import { describe, it, expect } from 'vitest';
import { crushOffset, shouldApplyCrushEvolution } from './crush-evolution';

describe('crushOffset', () => {
  it('build gets grittier over time (negative offset)', () => {
    const start = crushOffset('build', 0);
    const end = crushOffset('build', 1);
    expect(end).toBeLessThan(start);
    expect(end).toBeLessThan(0); // actually grittier
  });

  it('breakdown cleans up over time (positive offset)', () => {
    const start = crushOffset('breakdown', 0);
    const end = crushOffset('breakdown', 1);
    expect(end).toBeGreaterThan(start);
    expect(end).toBeGreaterThan(0); // actually cleaner
  });

  it('peak is gritty but stable', () => {
    const start = crushOffset('peak', 0);
    const end = crushOffset('peak', 1);
    expect(start).toBeLessThan(0);
    expect(Math.abs(end - start)).toBeLessThan(1);
  });

  it('intro starts clean', () => {
    const start = crushOffset('intro', 0);
    expect(start).toBeGreaterThan(0);
  });

  it('groove is neutral', () => {
    const mid = crushOffset('groove', 0.5);
    expect(mid).toBeCloseTo(0, 4);
  });

  it('stays within -2.5 to 2.0 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = crushOffset(section, p);
        expect(val).toBeGreaterThanOrEqual(-2.5);
        expect(val).toBeLessThanOrEqual(2.0);
      }
    }
  });

  it('clamps progress', () => {
    const normal = crushOffset('build', 1.0);
    const clamped = crushOffset('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('shouldApplyCrushEvolution', () => {
  it('returns true for build (big delta)', () => {
    expect(shouldApplyCrushEvolution('build')).toBe(true);
  });

  it('returns true for breakdown (cleaning up)', () => {
    expect(shouldApplyCrushEvolution('breakdown')).toBe(true);
  });

  it('returns false for intro (delta = 0.5, at threshold)', () => {
    expect(shouldApplyCrushEvolution('intro')).toBe(false);
  });

  it('returns false for groove (no change)', () => {
    expect(shouldApplyCrushEvolution('groove')).toBe(false);
  });

  it('returns false for peak (delta = 0.5, at threshold)', () => {
    expect(shouldApplyCrushEvolution('peak')).toBe(false);
  });
});
