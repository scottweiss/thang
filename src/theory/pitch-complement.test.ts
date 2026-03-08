import { describe, it, expect } from 'vitest';
import {
  complementWeights,
  weightLadder,
  selectComplement,
  complementStrength,
  shouldApplyComplement,
} from './pitch-complement';

describe('complementWeights', () => {
  const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const cMajChord = ['C', 'E', 'G'];

  it('boosts chord tones not in active set', () => {
    const weights = complementWeights(['E', 'G'], cMajor, cMajChord, 0.5);
    // C is a chord tone NOT active — should be boosted
    expect(weights.get('C')!).toBeGreaterThan(1.0);
  });

  it('reduces active notes', () => {
    const weights = complementWeights(['E', 'G'], cMajor, cMajChord, 0.5);
    // E is active — should be reduced
    expect(weights.get('E')!).toBeLessThan(1.0);
  });

  it('chord tones get less reduction than non-chord tones', () => {
    // Both E and D active; E is chord tone, D is not
    const weights = complementWeights(['E', 'D'], cMajor, cMajChord, 0.5);
    expect(weights.get('E')!).toBeGreaterThan(weights.get('D')!);
  });

  it('strength=0 returns all 1.0', () => {
    const weights = complementWeights(['E', 'G'], cMajor, cMajChord, 0);
    for (const note of cMajor) {
      expect(weights.get(note)).toBeCloseTo(1.0);
    }
  });

  it('higher strength = more differentiation', () => {
    const weak = complementWeights(['E'], cMajor, cMajChord, 0.2);
    const strong = complementWeights(['E'], cMajor, cMajChord, 0.8);
    // C (chord, not active) should be more boosted with strong
    expect(strong.get('C')!).toBeGreaterThan(weak.get('C')!);
    // E (active) should be more reduced with strong
    expect(strong.get('E')!).toBeLessThan(weak.get('E')!);
  });

  it('handles notes with octave numbers', () => {
    const weights = complementWeights(['E3', 'G4'], cMajor, ['C3', 'E3', 'G3'], 0.5);
    // Should still recognize E as active (strips octave)
    expect(weights.get('E')!).toBeLessThan(1.0);
  });
});

describe('weightLadder', () => {
  it('maps weights to ladder by pitch class', () => {
    const ladder = ['C3', 'D3', 'E3', 'F3', 'G3'];
    const weights = new Map([['C', 1.2], ['D', 0.8], ['E', 0.9], ['F', 1.0], ['G', 1.1]]);
    const result = weightLadder(ladder, weights);
    expect(result).toEqual([1.2, 0.8, 0.9, 1.0, 1.1]);
  });

  it('defaults to 1.0 for missing notes', () => {
    const ladder = ['C#3'];
    const weights = new Map<string, number>();
    expect(weightLadder(ladder, weights)).toEqual([1.0]);
  });
});

describe('selectComplement', () => {
  it('returns valid index', () => {
    const ladder = ['C3', 'E3', 'G3'];
    const weights = [1, 1, 1];
    const idx = selectComplement(ladder, weights);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(3);
  });

  it('strongly favors highest weight', () => {
    const ladder = ['C3', 'E3', 'G3'];
    const weights = [0.01, 0.01, 100]; // G3 heavily favored
    const counts = [0, 0, 0];
    for (let i = 0; i < 100; i++) {
      counts[selectComplement(ladder, weights)]++;
    }
    expect(counts[2]).toBeGreaterThan(90);
  });

  it('handles empty ladder', () => {
    expect(selectComplement([], [])).toBe(0);
  });
});

describe('complementStrength', () => {
  it('lofi has highest strength', () => {
    expect(complementStrength('lofi')).toBeGreaterThanOrEqual(complementStrength('trance'));
  });

  it('ambient has lowest strength', () => {
    expect(complementStrength('ambient')).toBeLessThanOrEqual(complementStrength('lofi'));
  });
});

describe('shouldApplyComplement', () => {
  it('returns true for most moods', () => {
    expect(shouldApplyComplement('lofi')).toBe(true);
    expect(shouldApplyComplement('syro')).toBe(true);
  });

  it('returns true for ambient (0.1 > 0.05)', () => {
    expect(shouldApplyComplement('ambient')).toBe(true);
  });
});
