import { describe, it, expect } from 'vitest';
import { complementaryDensity, measurePatternDensity, callResponseAmount } from './call-response';

describe('complementaryDensity', () => {
  it('when other is busy, density decreases', () => {
    const base = 0.7;
    const adjusted = complementaryDensity(1.0, base, 0.8);
    expect(adjusted).toBeLessThan(base);
  });

  it('when other is sparse, density stays at base or increases slightly', () => {
    const base = 0.5;
    const adjusted = complementaryDensity(0.0, base, 0.8);
    expect(adjusted).toBeGreaterThanOrEqual(base);
  });

  it('amount=0 returns baseDensity unchanged', () => {
    expect(complementaryDensity(1.0, 0.6, 0)).toBeCloseTo(0.6);
    expect(complementaryDensity(0.0, 0.6, 0)).toBeCloseTo(0.6);
    expect(complementaryDensity(0.5, 0.3, 0)).toBeCloseTo(0.3);
  });

  it('result is always >= 0.05', () => {
    // Even with maximum suppression, never fully silent
    const result = complementaryDensity(1.0, 0.05, 1.0);
    expect(result).toBeGreaterThanOrEqual(0.05);

    // Try extreme values
    const extreme = complementaryDensity(1.0, 0.0, 1.0);
    expect(extreme).toBeGreaterThanOrEqual(0.05);
  });
});

describe('measurePatternDensity', () => {
  it('all notes returns 1', () => {
    expect(measurePatternDensity('C3 E3 G3 C4')).toBe(1);
  });

  it('all rests returns 0', () => {
    expect(measurePatternDensity('~ ~ ~ ~')).toBe(0);
  });

  it('mixed pattern returns correct ratio', () => {
    // 3 notes, 5 rests = 3/8
    expect(measurePatternDensity('C3 ~ E3 ~ G3 ~ ~ ~')).toBeCloseTo(3 / 8);
    // 4 notes, 4 rests = 0.5
    expect(measurePatternDensity('bd ~ hh ~ sd ~ hh ~')).toBeCloseTo(0.5);
  });

  it('custom rest token works', () => {
    expect(measurePatternDensity('C3 - E3 - G3 -', '-')).toBeCloseTo(0.5);
  });
});

describe('callResponseAmount', () => {
  it('syro has highest value', () => {
    const syroAmount = callResponseAmount('syro');
    const moods = ['blockhead', 'flim', 'downtempo', 'disco', 'lofi', 'xtal', 'avril', 'trance', 'ambient'] as const;
    for (const mood of moods) {
      expect(syroAmount).toBeGreaterThan(callResponseAmount(mood));
    }
  });

  it('ambient has lowest value', () => {
    const ambientAmount = callResponseAmount('ambient');
    const moods = ['syro', 'blockhead', 'flim', 'downtempo', 'disco', 'lofi', 'xtal', 'avril', 'trance'] as const;
    for (const mood of moods) {
      expect(ambientAmount).toBeLessThan(callResponseAmount(mood));
    }
  });
});
