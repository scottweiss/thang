import { describe, it, expect } from 'vitest';
import {
  tensionFmh,
  tensionFmIndex,
  shouldApplyHarmonicColor,
} from './harmonic-color';

describe('tensionFmh', () => {
  it('low tension pulls fmh toward integer', () => {
    // Base fmh of 2.3 should move closer to 2.0 at low tension
    const low = tensionFmh(2.3, 0.1, 'ambient');
    expect(low).toBeLessThan(2.3);
    expect(low).toBeGreaterThan(1.5); // doesn't collapse
  });

  it('high tension pushes fmh away from integer', () => {
    const high = tensionFmh(2.0, 0.9, 'ambient');
    // Should drift from pure 2.0
    expect(Math.abs(high - 2.0)).toBeGreaterThan(0.01);
  });

  it('medium tension is close to base', () => {
    const mid = tensionFmh(3.0, 0.5, 'ambient');
    expect(Math.abs(mid - 3.0)).toBeLessThan(0.3);
  });

  it('respects mood depth — trance has minimal change', () => {
    const tranceLow = tensionFmh(2.0, 0.1, 'trance');
    const tranceHigh = tensionFmh(2.0, 0.9, 'trance');
    const ambientLow = tensionFmh(2.0, 0.1, 'ambient');
    const ambientHigh = tensionFmh(2.0, 0.9, 'ambient');

    const tranceRange = Math.abs(tranceHigh - tranceLow);
    const ambientRange = Math.abs(ambientHigh - ambientLow);
    expect(ambientRange).toBeGreaterThan(tranceRange);
  });

  it('never goes below 0.5', () => {
    expect(tensionFmh(0.5, 1.0, 'syro')).toBeGreaterThanOrEqual(0.5);
    expect(tensionFmh(1.0, 0.0, 'ambient')).toBeGreaterThanOrEqual(0.5);
  });
});

describe('tensionFmIndex', () => {
  it('low tension reduces FM index', () => {
    expect(tensionFmIndex(0.1, 'ambient')).toBeLessThan(1.0);
  });

  it('high tension increases FM index', () => {
    expect(tensionFmIndex(0.9, 'ambient')).toBeGreaterThan(1.0);
  });

  it('medium tension is near 1.0', () => {
    expect(tensionFmIndex(0.5, 'ambient')).toBeCloseTo(1.0, 1);
  });

  it('stays within reasonable range', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let t = 0; t <= 1; t += 0.1) {
        const mult = tensionFmIndex(t, mood);
        expect(mult).toBeGreaterThanOrEqual(0.6);
        expect(mult).toBeLessThanOrEqual(1.5);
      }
    }
  });
});

describe('shouldApplyHarmonicColor', () => {
  it('returns true for most moods', () => {
    expect(shouldApplyHarmonicColor('ambient')).toBe(true);
    expect(shouldApplyHarmonicColor('syro')).toBe(true);
  });

  it('returns true for all moods (all >= 0.2)', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(shouldApplyHarmonicColor(mood)).toBe(true);
    }
  });
});
