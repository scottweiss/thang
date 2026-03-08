import { describe, it, expect } from 'vitest';
import {
  shouldSurpriseTiming,
  surpriseOffset,
  shouldApplyTimingSurprise,
  surpriseProbability,
} from './timing-surprise';

describe('shouldSurpriseTiming', () => {
  it('fires sometimes over many notes', () => {
    let fires = 0;
    for (let t = 0; t < 100; t++) {
      for (let n = 0; n < 8; n++) {
        if (shouldSurpriseTiming(t, n, 'lofi', 'groove')) fires++;
      }
    }
    // lofi = 0.15, ~15% of 800 = ~120
    expect(fires).toBeGreaterThan(30);
    expect(fires).toBeLessThan(300);
  });

  it('trance fires very rarely', () => {
    let fires = 0;
    for (let t = 0; t < 100; t++) {
      for (let n = 0; n < 8; n++) {
        if (shouldSurpriseTiming(t, n, 'trance', 'groove')) fires++;
      }
    }
    // trance = 0.02, ~2% of 800 = ~16
    expect(fires).toBeLessThan(50);
  });

  it('deterministic for same inputs', () => {
    const a = shouldSurpriseTiming(5, 3, 'lofi', 'groove');
    const b = shouldSurpriseTiming(5, 3, 'lofi', 'groove');
    expect(a).toBe(b);
  });
});

describe('surpriseOffset', () => {
  it('stays within max offset bounds', () => {
    for (let t = 0; t < 50; t++) {
      const offset = surpriseOffset(t, 0, 'lofi');
      expect(Math.abs(offset)).toBeLessThanOrEqual(0.05);
    }
  });

  it('can be positive or negative', () => {
    let hasPositive = false, hasNegative = false;
    for (let t = 0; t < 100; t++) {
      for (let n = 0; n < 8; n++) {
        const offset = surpriseOffset(t, n, 'lofi');
        if (offset > 0) hasPositive = true;
        if (offset < 0) hasNegative = true;
      }
    }
    expect(hasPositive).toBe(true);
    expect(hasNegative).toBe(true);
  });

  it('trance has smaller offsets than flim', () => {
    let tranceMax = 0, flimMax = 0;
    for (let t = 0; t < 50; t++) {
      tranceMax = Math.max(tranceMax, Math.abs(surpriseOffset(t, 0, 'trance')));
      flimMax = Math.max(flimMax, Math.abs(surpriseOffset(t, 0, 'flim')));
    }
    expect(tranceMax).toBeLessThan(flimMax);
  });
});

describe('shouldApplyTimingSurprise', () => {
  it('lofi in groove applies', () => {
    expect(shouldApplyTimingSurprise('lofi', 'groove')).toBe(true);
  });

  it('trance in intro does not', () => {
    // 0.02 * 0.5 = 0.01 < 0.03
    expect(shouldApplyTimingSurprise('trance', 'intro')).toBe(false);
  });
});

describe('surpriseProbability', () => {
  it('flim is highest', () => {
    expect(surpriseProbability('flim')).toBe(0.18);
  });

  it('trance is lowest', () => {
    expect(surpriseProbability('trance')).toBe(0.02);
  });
});
