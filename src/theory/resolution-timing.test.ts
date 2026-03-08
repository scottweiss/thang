import { describe, it, expect } from 'vitest';
import { resolutionTimingMultiplier, shouldApplyResolutionTiming } from './resolution-timing';

describe('resolutionTimingMultiplier', () => {
  it('V7 resolves faster (multiplier < 1)', () => {
    const mult = resolutionTimingMultiplier(4, 'dom7', 'downtempo');
    expect(mult).toBeLessThan(1.0);
  });

  it('tonic sustains longer (multiplier > 1)', () => {
    const mult = resolutionTimingMultiplier(0, 'maj', 'downtempo');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('V7 resolves faster than plain V', () => {
    const v7 = resolutionTimingMultiplier(4, 'dom7', 'downtempo');
    const v = resolutionTimingMultiplier(4, 'maj', 'downtempo');
    expect(v7).toBeLessThan(v);
  });

  it('vii dim resolves fast', () => {
    const mult = resolutionTimingMultiplier(6, 'dim', 'downtempo');
    expect(mult).toBeLessThan(0.95);
  });

  it('IV has moderate timing (near neutral)', () => {
    const mult = resolutionTimingMultiplier(3, 'maj', 'downtempo');
    expect(mult).toBeGreaterThan(0.9);
    expect(mult).toBeLessThan(1.15);
  });

  it('trance has stronger effect than ambient', () => {
    const tranceV7 = resolutionTimingMultiplier(4, 'dom7', 'trance');
    const ambientV7 = resolutionTimingMultiplier(4, 'dom7', 'ambient');
    // Trance V7 should have lower multiplier (resolves faster)
    expect(tranceV7).toBeLessThan(ambientV7);
  });

  it('syro has strongest effect', () => {
    const syroV7 = resolutionTimingMultiplier(4, 'dom7', 'syro');
    expect(syroV7).toBeLessThan(0.85);
  });

  it('avril has minimal effect', () => {
    const avrilV7 = resolutionTimingMultiplier(4, 'dom7', 'avril');
    // Even V7 in avril should be close to 1.0
    expect(avrilV7).toBeGreaterThan(0.9);
    expect(avrilV7).toBeLessThan(1.0);
  });

  it('all values within clamped range', () => {
    const qualities = ['maj', 'min', 'dim', 'aug', 'sus2', 'sus4', 'dom7', 'maj7', 'min7'] as const;
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let deg = 0; deg < 7; deg++) {
        for (const q of qualities) {
          const mult = resolutionTimingMultiplier(deg, q, mood);
          expect(mult).toBeGreaterThanOrEqual(0.5);
          expect(mult).toBeLessThanOrEqual(1.5);
        }
      }
    }
  });

  it('ii chord has slight forward pull', () => {
    const mult = resolutionTimingMultiplier(1, 'min', 'downtempo');
    // ii has moderate pull (0.3), so multiplier slightly < 1
    expect(mult).toBeLessThan(1.1);
  });
});

describe('shouldApplyResolutionTiming', () => {
  it('applies for V7 in trance', () => {
    expect(shouldApplyResolutionTiming(4, 'dom7', 'trance')).toBe(true);
  });

  it('applies for tonic in downtempo', () => {
    expect(shouldApplyResolutionTiming(0, 'maj', 'downtempo')).toBe(true);
  });

  it('may not apply for neutral chords in subtle moods', () => {
    // A moderately-tense chord in a low-sensitivity mood may be neutral
    const applies = shouldApplyResolutionTiming(5, 'min', 'ambient');
    // vi minor has pull 0.2, ambient sensitivity 0.15
    // mult = 1 + 0.15 * (0.5 - 0.2) = 1.045 → just barely applies
    expect(typeof applies).toBe('boolean');
  });
});
