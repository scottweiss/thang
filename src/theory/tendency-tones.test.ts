import { describe, it, expect } from 'vitest';
import {
  tendencyWeights,
  ladderToScaleDegrees,
  moodTendencyStrength,
} from './tendency-tones';

describe('moodTendencyStrength', () => {
  it('trance has strongest tendencies', () => {
    expect(moodTendencyStrength('trance')).toBeGreaterThan(moodTendencyStrength('ambient'));
  });

  it('ambient has weakest tendencies', () => {
    expect(moodTendencyStrength('ambient')).toBeLessThan(0.5);
  });

  it('all moods return positive values', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      expect(moodTendencyStrength(m)).toBeGreaterThan(0);
    }
  });
});

describe('ladderToScaleDegrees', () => {
  it('maps C major ladder to degrees', () => {
    const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const ladder = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
    const degrees = ladderToScaleDegrees(ladder, scaleNotes);
    expect(degrees).toEqual([0, 1, 2, 3, 4, 5, 6, 0]);
  });

  it('returns null for chromatic notes not in scale', () => {
    const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const ladder = ['C3', 'C#3', 'D3'];
    const degrees = ladderToScaleDegrees(ladder, scaleNotes);
    expect(degrees).toEqual([0, null, 1]);
  });

  it('handles empty inputs', () => {
    expect(ladderToScaleDegrees([], ['C'])).toEqual([]);
  });
});

describe('tendencyWeights', () => {
  // C major scale: C=0, D=1, E=2, F=3, G=4, A=5, B=6
  const majorDegrees = [0, 1, 2, 3, 4, 5, 6, 0]; // 8-note ladder

  it('returns correct length', () => {
    const w = tendencyWeights(8, majorDegrees, 0.5, 'lofi');
    expect(w).toHaveLength(8);
  });

  it('leading tone (7) boosts tonic target', () => {
    const w = tendencyWeights(8, majorDegrees, 0.7, 'trance');
    // Index 7 is tonic (degree 0), index 6 is leading tone (degree 6)
    // Tonic at index 7 should be boosted
    expect(w[7]).toBeGreaterThan(1.0);
  });

  it('leading tone itself is suppressed', () => {
    const w = tendencyWeights(8, majorDegrees, 0.7, 'trance');
    // Leading tone (degree 6 at index 6) should be slightly reduced
    expect(w[6]).toBeLessThan(1.0);
  });

  it('4th degree boosts 3rd target', () => {
    const w = tendencyWeights(8, majorDegrees, 0.5, 'lofi');
    // Index 3 = 4th degree, index 2 = 3rd degree
    // 3rd should be boosted by 4→3 tendency
    expect(w[2]).toBeGreaterThan(1.0);
  });

  it('higher tension increases tendency strength', () => {
    const lowT = tendencyWeights(8, majorDegrees, 0.2, 'lofi');
    const highT = tendencyWeights(8, majorDegrees, 0.9, 'lofi');
    // Leading tone suppression stronger at high tension
    expect(highT[6]).toBeLessThan(lowT[6]);
  });

  it('trance has stronger tendencies than ambient', () => {
    const tranceW = tendencyWeights(8, majorDegrees, 0.5, 'trance');
    const ambientW = tendencyWeights(8, majorDegrees, 0.5, 'ambient');
    // Leading tone suppression should be stronger in trance
    expect(tranceW[6]).toBeLessThan(ambientW[6]);
  });

  it('neutral for notes without tendencies', () => {
    const w = tendencyWeights(8, majorDegrees, 0.5, 'lofi');
    // 5th degree (index 4) has no tendency defined pointing FROM it
    // It can still be BOOSTED as a target (6→5), but its own weight
    // is only modified if it's a FROM degree
    // The 5th itself shouldn't be suppressed
    expect(w[4]).toBeGreaterThanOrEqual(1.0);
  });

  it('returns all 1.0 for empty scale degrees', () => {
    const nullDegrees = [null, null, null, null];
    const w = tendencyWeights(4, nullDegrees, 0.5, 'lofi');
    expect(w).toEqual([1.0, 1.0, 1.0, 1.0]);
  });

  it('returns empty for zero-length ladder', () => {
    expect(tendencyWeights(0, [], 0.5, 'lofi')).toEqual([]);
  });

  it('does not affect distant targets', () => {
    // Ladder with degree 6 at index 0 and degree 0 at index 7
    // Distance of 7 positions — too far for tendency
    const farDegrees = [6, null, null, null, null, null, null, 0];
    const w = tendencyWeights(8, farDegrees, 0.5, 'trance');
    // No tendency applied since distance > 3
    expect(w[0]).toBe(1.0);
    expect(w[7]).toBe(1.0);
  });
});
