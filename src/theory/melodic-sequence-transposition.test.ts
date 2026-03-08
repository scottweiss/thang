import { describe, it, expect } from 'vitest';
import {
  transpositionSimilarity,
  sequenceTranspositionGain,
  seqStrengthValue,
} from './melodic-sequence-transposition';

describe('transpositionSimilarity', () => {
  it('identical intervals = 1.0', () => {
    expect(transpositionSimilarity([2, -1, 3], [2, -1, 3])).toBe(1.0);
  });

  it('completely different = 0', () => {
    expect(transpositionSimilarity([2, -1, 3], [7, 5, -6])).toBe(0);
  });

  it('approximate (±1) gets partial credit', () => {
    const sim = transpositionSimilarity([2, -1, 3], [3, -2, 4]);
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1.0);
  });

  it('empty arrays return 0', () => {
    expect(transpositionSimilarity([], [1, 2])).toBe(0);
    expect(transpositionSimilarity([1, 2], [])).toBe(0);
  });

  it('uses shorter length', () => {
    const sim = transpositionSimilarity([2, -1], [2, -1, 3, 4]);
    expect(sim).toBe(1.0);
  });
});

describe('sequenceTranspositionGain', () => {
  it('exact transposition gets boost', () => {
    const gain = sequenceTranspositionGain([2, -1, 3], [2, -1, 3], 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('unrelated intervals are neutral', () => {
    const gain = sequenceTranspositionGain([2, -1, 3], [7, 5, -6], 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril boosts more than blockhead', () => {
    const av = sequenceTranspositionGain([2, -1, 3], [2, -1, 3], 'avril', 'peak');
    const bh = sequenceTranspositionGain([2, -1, 3], [2, -1, 3], 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.03 range', () => {
    const intervals = [[2, -1, 3], [1, 1, 1], [-3, 2, -1], [5, -5, 2]];
    for (const a of intervals) {
      for (const b of intervals) {
        const gain = sequenceTranspositionGain(a, b, 'avril', 'peak');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.03);
      }
    }
  });
});

describe('seqStrengthValue', () => {
  it('avril is highest', () => {
    expect(seqStrengthValue('avril')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(seqStrengthValue('ambient')).toBe(0.15);
  });
});
