import { describe, it, expect } from 'vitest';
import {
  warmthFmCorrection,
  warmthTarget,
} from './spectral-warmth-tracking';

describe('warmthFmCorrection', () => {
  it('integer ratio returns near 1.0 for warm mood', () => {
    // ratio 2.0 is warm, lofi wants warm — minimal correction
    const correction = warmthFmCorrection(2.0, 'lofi');
    expect(correction).toBeGreaterThanOrEqual(0.95);
    expect(correction).toBeLessThanOrEqual(1.05);
  });

  it('detuned ratio gets correction for warm mood', () => {
    // ratio 2.7 is cold, lofi wants warm — should adjust
    const correction = warmthFmCorrection(2.7, 'lofi');
    expect(Math.abs(correction - 1.0)).toBeGreaterThan(0.02);
  });

  it('warm mood corrects more for cold ratio', () => {
    // ratio 5.3 is cold (far from simple integer, high partial)
    const lofi = warmthFmCorrection(5.3, 'lofi');
    const syro = warmthFmCorrection(5.3, 'syro');
    // lofi wants warm so corrects more; syro accepts cold
    expect(Math.abs(lofi - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });

  it('stays in 0.85-1.15 range', () => {
    for (let r = 0.5; r <= 8.0; r += 0.5) {
      const c = warmthFmCorrection(r, 'ambient');
      expect(c).toBeGreaterThanOrEqual(0.85);
      expect(c).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('warmthTarget', () => {
  it('lofi is highest', () => {
    expect(warmthTarget('lofi')).toBe(0.80);
  });

  it('syro is low', () => {
    expect(warmthTarget('syro')).toBe(0.35);
  });
});
