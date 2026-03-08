import { describe, it, expect } from 'vitest';
import { intervalWeight, intervalCharacterWeights } from './interval-character';

describe('intervalWeight', () => {
  it('returns positive values for all moods and intervals', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let semi = 0; semi <= 12; semi++) {
        const w = intervalWeight(semi, mood);
        expect(w).toBeGreaterThan(0);
      }
    }
  });

  it('lofi prefers minor 3rds over tritones', () => {
    expect(intervalWeight(3, 'lofi')).toBeGreaterThan(intervalWeight(6, 'lofi'));
  });

  it('trance prefers perfect 5ths over minor 2nds', () => {
    expect(intervalWeight(7, 'trance')).toBeGreaterThan(intervalWeight(1, 'trance'));
  });

  it('syro prefers tritones over perfect 4ths', () => {
    expect(intervalWeight(6, 'syro')).toBeGreaterThan(intervalWeight(5, 'syro'));
  });

  it('ambient prefers minor 2nds over major 3rds', () => {
    expect(intervalWeight(1, 'ambient')).toBeGreaterThan(intervalWeight(4, 'ambient'));
  });

  it('avril prefers seconds over tritones', () => {
    expect(intervalWeight(2, 'avril')).toBeGreaterThan(intervalWeight(6, 'avril'));
  });

  it('wraps intervals above 12 via octave equivalence', () => {
    expect(intervalWeight(15, 'lofi')).toBe(intervalWeight(2, 'lofi'));
  });

  it('handles negative intervals', () => {
    expect(intervalWeight(-7, 'trance')).toBe(intervalWeight(7, 'trance'));
  });

  it('unison is generally penalized', () => {
    const moods = ['lofi', 'trance', 'syro', 'ambient', 'disco'] as const;
    for (const mood of moods) {
      expect(intervalWeight(0, mood)).toBeLessThan(1.0);
    }
  });
});

describe('intervalCharacterWeights', () => {
  it('returns correct length', () => {
    const pitches = [60, 62, 64, 65, 67];
    const weights = intervalCharacterWeights(5, pitches, 60, 'lofi');
    expect(weights).toHaveLength(5);
  });

  it('all weights are positive', () => {
    const pitches = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64];
    const weights = intervalCharacterWeights(10, pitches, 60, 'trance');
    for (const w of weights) {
      expect(w).toBeGreaterThan(0);
    }
  });

  it('trance weights perfect 5th higher than minor 2nd from prevPitch', () => {
    // prevPitch=60, ladder has 61 (m2) and 67 (P5)
    const pitches = [61, 67];
    const weights = intervalCharacterWeights(2, pitches, 60, 'trance');
    expect(weights[1]).toBeGreaterThan(weights[0]); // P5 > m2
  });

  it('lofi weights minor 3rd higher than tritone from prevPitch', () => {
    // prevPitch=60, ladder has 63 (m3) and 66 (TT)
    const pitches = [63, 66];
    const weights = intervalCharacterWeights(2, pitches, 60, 'lofi');
    expect(weights[0]).toBeGreaterThan(weights[1]); // m3 > TT
  });

  it('returns neutral 1.0 when pitches not available', () => {
    const weights = intervalCharacterWeights(3, [], 60, 'lofi');
    expect(weights).toEqual([1.0, 1.0, 1.0]);
  });
});
