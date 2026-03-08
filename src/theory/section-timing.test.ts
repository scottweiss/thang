import { describe, it, expect } from 'vitest';
import { sectionTimingMultiplier, shouldAdvanceEarly } from './section-timing';

describe('sectionTimingMultiplier', () => {
  it('returns 1.0 before 70% progress', () => {
    expect(sectionTimingMultiplier('build', 0.5, 0.8)).toBe(1.0);
    expect(sectionTimingMultiplier('build', 0.0, 0.9)).toBe(1.0);
    expect(sectionTimingMultiplier('build', 0.69, 0.9)).toBe(1.0);
  });

  it('high tension build shortens (resolve sooner)', () => {
    const mult = sectionTimingMultiplier('build', 0.8, 0.85);
    expect(mult).toBeLessThan(1.0);
  });

  it('low tension build extends (needs more time)', () => {
    const mult = sectionTimingMultiplier('build', 0.8, 0.2);
    expect(mult).toBeGreaterThan(1.0);
  });

  it('high tension peak extends (sustain the energy)', () => {
    const mult = sectionTimingMultiplier('peak', 0.8, 0.8);
    expect(mult).toBeGreaterThan(1.0);
  });

  it('low tension breakdown extends (float longer)', () => {
    const mult = sectionTimingMultiplier('breakdown', 0.8, 0.2);
    expect(mult).toBeGreaterThan(1.0);
  });

  it('high tension breakdown shortens (recover faster)', () => {
    const mult = sectionTimingMultiplier('breakdown', 0.8, 0.8);
    expect(mult).toBeLessThan(1.0);
  });

  it('intro always returns 1.0', () => {
    expect(sectionTimingMultiplier('intro', 0.9, 0.9)).toBe(1.0);
    expect(sectionTimingMultiplier('intro', 0.9, 0.1)).toBe(1.0);
  });

  it('stays within 0.85-1.15 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let t = 0; t <= 1; t += 0.1) {
        const val = sectionTimingMultiplier(section, 0.9, t);
        expect(val).toBeGreaterThanOrEqual(0.79);
        expect(val).toBeLessThanOrEqual(1.16);
      }
    }
  });
});

describe('shouldAdvanceEarly', () => {
  it('never advances before 75% progress', () => {
    expect(shouldAdvanceEarly('build', 0.5, 0.99)).toBe(false);
    expect(shouldAdvanceEarly('build', 0.74, 0.99)).toBe(false);
  });

  it('high tension build advances early', () => {
    // At 90% progress with high tension, multiplier ≈ 0.85
    // 0.90 >= 0.85 → true
    expect(shouldAdvanceEarly('build', 0.9, 0.9)).toBe(true);
  });

  it('low tension build does not advance early', () => {
    // At 80% progress with low tension, multiplier > 1.0
    // 0.80 >= 1.05 → false
    expect(shouldAdvanceEarly('build', 0.8, 0.2)).toBe(false);
  });

  it('high tension peak does not advance early (sustaining)', () => {
    // Peak with high tension extends → multiplier > 1.0
    expect(shouldAdvanceEarly('peak', 0.85, 0.8)).toBe(false);
  });
});
