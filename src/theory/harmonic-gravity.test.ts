import { describe, it, expect } from 'vitest';
import {
  harmonicWeight,
  gravityDurationMultiplier,
  shouldApplyHarmonicGravity,
  gravitySensitivity,
} from './harmonic-gravity';

describe('harmonicWeight', () => {
  it('tonic is heaviest', () => {
    expect(harmonicWeight(1)).toBe(1.0);
  });

  it('dominant is strong', () => {
    expect(harmonicWeight(5)).toBe(0.8);
  });

  it('leading tone is lightest', () => {
    expect(harmonicWeight(7)).toBe(0.3);
  });

  it('unknown degree gets default', () => {
    expect(harmonicWeight(0)).toBe(0.35);
  });
});

describe('gravityDurationMultiplier', () => {
  it('tonic in groove lasts longer', () => {
    const mult = gravityDurationMultiplier(1, 'trance', 'groove');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('leading tone in groove is shorter', () => {
    const mult = gravityDurationMultiplier(7, 'trance', 'groove');
    expect(mult).toBeLessThan(1.0);
  });

  it('clamped between 0.7 and 1.4', () => {
    for (let d = 1; d <= 7; d++) {
      const mult = gravityDurationMultiplier(d, 'avril', 'breakdown');
      expect(mult).toBeGreaterThanOrEqual(0.7);
      expect(mult).toBeLessThanOrEqual(1.4);
    }
  });

  it('ambient has minimal effect', () => {
    const tonic = gravityDurationMultiplier(1, 'ambient', 'groove');
    const vii = gravityDurationMultiplier(7, 'ambient', 'groove');
    expect(Math.abs(tonic - vii)).toBeLessThan(0.1);
  });
});

describe('shouldApplyHarmonicGravity', () => {
  it('trance applies', () => {
    expect(shouldApplyHarmonicGravity('trance')).toBe(true);
  });

  it('ambient applies (barely)', () => {
    // 0.10 < 0.12
    expect(shouldApplyHarmonicGravity('ambient')).toBe(false);
  });
});

describe('gravitySensitivity', () => {
  it('avril is highest', () => {
    expect(gravitySensitivity('avril')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(gravitySensitivity('ambient')).toBe(0.10);
  });
});
