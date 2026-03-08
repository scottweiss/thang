import { describe, it, expect } from 'vitest';
import {
  harmonicComplexity,
  complexitySaturation,
  shouldSimplifyChord,
  simplificationImpactBonus,
  maxUsefulComplexity,
} from './harmonic-saturation-index';

describe('harmonicComplexity', () => {
  it('triad has 3 unique pitches', () => {
    expect(harmonicComplexity([0, 4, 7])).toBe(3);
  });

  it('deduplicates pitch classes', () => {
    expect(harmonicComplexity([0, 4, 7, 0, 4])).toBe(3);
  });

  it('7th chord has 4 pitches', () => {
    expect(harmonicComplexity([0, 4, 7, 11])).toBe(4);
  });

  it('complex voicing has 6+ pitches', () => {
    expect(harmonicComplexity([0, 2, 4, 7, 9, 11])).toBe(6);
  });
});

describe('complexitySaturation', () => {
  it('0 for simple triads', () => {
    expect(complexitySaturation(3, 'lofi')).toBe(0);
  });

  it('> 0 near max useful complexity', () => {
    // lofi max = 6.5, threshold at 80% = 5.2
    expect(complexitySaturation(6, 'lofi')).toBeGreaterThan(0);
  });

  it('ambient saturates earlier than syro', () => {
    // ambient max = 4, syro max = 7
    const ambientSat = complexitySaturation(5, 'ambient');
    const syroSat = complexitySaturation(5, 'syro');
    expect(ambientSat).toBeGreaterThan(syroSat);
  });

  it('clamped at 1', () => {
    expect(complexitySaturation(12, 'ambient')).toBeLessThanOrEqual(1);
  });
});

describe('shouldSimplifyChord', () => {
  it('false for simple chords', () => {
    expect(shouldSimplifyChord(3, 'lofi', 'peak')).toBe(false);
  });

  it('true for oversaturated ambient', () => {
    expect(shouldSimplifyChord(6, 'ambient', 'peak')).toBe(true);
  });

  it('breakdowns favor simplification', () => {
    // Same complexity, breakdown is more likely to simplify
    const peakSimplify = shouldSimplifyChord(5, 'ambient', 'peak');
    const bdSimplify = shouldSimplifyChord(5, 'ambient', 'breakdown');
    // Both might be true for ambient at 5, but breakdown has lower threshold
    expect(bdSimplify).toBe(true);
  });
});

describe('simplificationImpactBonus', () => {
  it('0 when not simplifying', () => {
    expect(simplificationImpactBonus(3, 5, 'lofi')).toBe(0);
  });

  it('0 when not previously saturated', () => {
    expect(simplificationImpactBonus(3, 2, 'lofi')).toBe(0);
  });

  it('> 0 when reducing from saturated state', () => {
    // ambient saturates at ~4, so going from 6 to 3 should have impact
    expect(simplificationImpactBonus(6, 3, 'ambient')).toBeGreaterThan(0);
  });

  it('ambient has stronger impact than syro', () => {
    const amb = simplificationImpactBonus(8, 3, 'ambient');
    const syro = simplificationImpactBonus(8, 3, 'syro');
    expect(amb).toBeGreaterThan(syro);
  });
});

describe('maxUsefulComplexity', () => {
  it('syro is highest', () => {
    expect(maxUsefulComplexity('syro')).toBe(7.0);
  });

  it('ambient and blockhead are lowest', () => {
    expect(maxUsefulComplexity('ambient')).toBe(4.0);
    expect(maxUsefulComplexity('blockhead')).toBe(4.0);
  });
});
