import { describe, it, expect } from 'vitest';
import { inverseDensityMultiplier, shouldApplyInverseDensity } from './inverse-density';

describe('inverseDensityMultiplier', () => {
  it('returns lower multiplier right after chord change', () => {
    const atChange = inverseDensityMultiplier(0, 'lofi');
    const afterHold = inverseDensityMultiplier(8, 'lofi');
    expect(atChange).toBeLessThan(afterHold);
  });

  it('returns higher multiplier after long hold', () => {
    const mult = inverseDensityMultiplier(10, 'lofi');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('is near 1.0 at moderate hold time', () => {
    const mult = inverseDensityMultiplier(4, 'lofi');
    expect(mult).toBeGreaterThan(0.9);
    expect(mult).toBeLessThan(1.1);
  });

  it('stays within 0.7-1.3 range', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let ticks = 0; ticks <= 20; ticks++) {
        const mult = inverseDensityMultiplier(ticks, mood);
        expect(mult).toBeGreaterThanOrEqual(0.7);
        expect(mult).toBeLessThanOrEqual(1.3);
      }
    }
  });

  it('avril responds more than trance', () => {
    const avrilRange = inverseDensityMultiplier(8, 'avril') - inverseDensityMultiplier(0, 'avril');
    const tranceRange = inverseDensityMultiplier(8, 'trance') - inverseDensityMultiplier(0, 'trance');
    expect(avrilRange).toBeGreaterThan(tranceRange);
  });
});

describe('shouldApplyInverseDensity', () => {
  it('returns true for most moods', () => {
    expect(shouldApplyInverseDensity('lofi')).toBe(true);
    expect(shouldApplyInverseDensity('avril')).toBe(true);
  });

  it('returns true for trance (low but nonzero)', () => {
    expect(shouldApplyInverseDensity('trance')).toBe(true);
  });
});
