import { describe, it, expect } from 'vitest';
import {
  spectralExtensions,
  spectralSeventh,
  spectralEleventh,
  spectralConsonance,
  shouldApplySpectralHarmony,
  spectralTendency,
  suggestSpectralEnrichment,
} from './spectral-harmony';

describe('spectralExtensions', () => {
  it('returns notes from overtone series for C', () => {
    const ext = spectralExtensions('C', 3);
    expect(ext).toHaveLength(3);
    // Harmonic 5=E, 7=Bb, 9=D
    expect(ext).toEqual(['E', 'Bb', 'D']);
  });

  it('returns notes from overtone series for G', () => {
    const ext = spectralExtensions('G', 3);
    expect(ext).toHaveLength(3);
    // G+4=B, G+10=F, G+2=A
    expect(ext).toEqual(['B', 'F', 'A']);
  });

  it('respects maxCount', () => {
    expect(spectralExtensions('C', 1)).toHaveLength(1);
    expect(spectralExtensions('C', 5)).toHaveLength(5);
  });

  it('handles unknown root gracefully', () => {
    expect(spectralExtensions('X' as any)).toEqual([]);
  });
});

describe('spectralSeventh', () => {
  it('C spectral 7th is Bb', () => {
    expect(spectralSeventh('C')).toBe('Bb');
  });

  it('G spectral 7th is F', () => {
    expect(spectralSeventh('G')).toBe('F');
  });

  it('D spectral 7th is C', () => {
    expect(spectralSeventh('D')).toBe('C');
  });
});

describe('spectralEleventh', () => {
  it('C spectral 11th is F#', () => {
    expect(spectralEleventh('C')).toBe('F#');
  });

  it('G spectral 11th is C#', () => {
    expect(spectralEleventh('G')).toBe('C#');
  });
});

describe('spectralConsonance', () => {
  it('all overtone notes score 1.0', () => {
    // C overtone set: C(0), G(7), E(4), Bb(10), D(2), F#(6), Ab(8)
    const score = spectralConsonance('C', ['C', 'E', 'G', 'Bb']);
    expect(score).toBe(1.0);
  });

  it('no overtone notes score 0', () => {
    // F and Eb are not in C overtone series
    const score = spectralConsonance('C', ['F', 'Eb']);
    expect(score).toBe(0);
  });

  it('mixed notes score proportionally', () => {
    // E is overtone, F is not
    const score = spectralConsonance('C', ['E', 'F']);
    expect(score).toBe(0.5);
  });

  it('returns 0 for empty notes', () => {
    expect(spectralConsonance('C', [])).toBe(0);
  });
});

describe('shouldApplySpectralHarmony', () => {
  it('is deterministic', () => {
    const a = shouldApplySpectralHarmony(42, 'ambient', 'breakdown');
    const b = shouldApplySpectralHarmony(42, 'ambient', 'breakdown');
    expect(a).toBe(b);
  });

  it('breakdown has more spectral harmony than peak', () => {
    const breakdownCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplySpectralHarmony(i, 'ambient', 'breakdown')
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplySpectralHarmony(i, 'ambient', 'peak')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThan(peakCount);
  });
});

describe('spectralTendency', () => {
  it('ambient has highest tendency', () => {
    expect(spectralTendency('ambient')).toBe(0.55);
  });

  it('trance has lowest tendency', () => {
    expect(spectralTendency('trance')).toBe(0.05);
  });
});

describe('suggestSpectralEnrichment', () => {
  it('suggests notes not already in chord', () => {
    // C major triad = C, E, G. Spectral extensions = E, Bb, D...
    // E is already in chord, so should suggest Bb
    const suggestions = suggestSpectralEnrichment('C', ['C', 'E', 'G'], 1);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toBe('Bb');
  });

  it('returns empty if all extensions present', () => {
    const ext = spectralExtensions('C', 5);
    const suggestions = suggestSpectralEnrichment('C', ['C', 'E', 'G', ...ext], 2);
    expect(suggestions).toHaveLength(0);
  });

  it('respects maxAdd', () => {
    const suggestions = suggestSpectralEnrichment('G', ['G', 'B', 'D'], 2);
    expect(suggestions.length).toBeLessThanOrEqual(2);
  });
});
