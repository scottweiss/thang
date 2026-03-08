import { describe, it, expect } from 'vitest';
import { melodicWeights, selectMelodicNote, inferDirection } from './melodic-gravity';
import type { MelodicContext } from './melodic-gravity';

const BASE_CTX: MelodicContext = {
  prevIndex: 5,
  chordIndices: [0, 4, 7],
  direction: 0,
  tension: 0.5,
};

describe('melodicWeights', () => {
  it('returns array of correct length', () => {
    const weights = melodicWeights(10, BASE_CTX);
    expect(weights.length).toBe(10);
  });

  it('nearby notes weighted higher than distant', () => {
    const weights = melodicWeights(10, BASE_CTX);
    // Steps of 1-2 from prevIndex=5 should be higher than step of 8
    expect(weights[6]).toBeGreaterThan(weights[9]);
    expect(weights[4]).toBeGreaterThan(weights[0]);
  });

  it('chord tones get a boost', () => {
    const ctx: MelodicContext = { prevIndex: -1, chordIndices: [3], direction: 0, tension: 0.5 };
    const weights = melodicWeights(10, ctx);
    // Chord tone should be weighted higher than non-chord, non-adjacent tone
    expect(weights[3]).toBeGreaterThan(weights[8]);
  });

  it('ascending direction favors higher notes', () => {
    const ascending: MelodicContext = { ...BASE_CTX, direction: 1 };
    const weights = melodicWeights(10, ascending);
    // Note above prevIndex should be favored over note below
    expect(weights[6]).toBeGreaterThan(weights[4]);
  });

  it('descending direction favors lower notes', () => {
    const descending: MelodicContext = { ...BASE_CTX, direction: -1 };
    const weights = melodicWeights(10, descending);
    expect(weights[4]).toBeGreaterThan(weights[6]);
  });

  it('higher tension allows larger leaps', () => {
    const lowTension: MelodicContext = { ...BASE_CTX, tension: 0.1 };
    const highTension: MelodicContext = { ...BASE_CTX, tension: 0.9 };
    const lowWeights = melodicWeights(10, lowTension);
    const highWeights = melodicWeights(10, highTension);
    // At high tension, distant notes should have relatively higher weight
    const distantIdx = 9; // 4 steps from prevIndex=5
    const nearIdx = 6;    // 1 step from prevIndex=5
    const lowRatio = lowWeights[distantIdx] / lowWeights[nearIdx];
    const highRatio = highWeights[distantIdx] / highWeights[nearIdx];
    expect(highRatio).toBeGreaterThan(lowRatio);
  });

  it('same note as previous is penalized when direction set', () => {
    const ctx: MelodicContext = { ...BASE_CTX, direction: 1 };
    const weights = melodicWeights(10, ctx);
    // Same note (5) should be lower than adjacent step (6)
    expect(weights[5]).toBeLessThan(weights[6]);
  });

  it('all weights are positive', () => {
    const weights = melodicWeights(10, BASE_CTX);
    for (const w of weights) {
      expect(w).toBeGreaterThan(0);
    }
  });

  it('handles no previous note', () => {
    const ctx: MelodicContext = { prevIndex: -1, chordIndices: [0, 4, 7], direction: 0, tension: 0.5 };
    const weights = melodicWeights(10, ctx);
    expect(weights.length).toBe(10);
    // Without proximity bias, chord tones should still be boosted
    expect(weights[4]).toBeGreaterThan(weights[3]);
  });

  it('handles empty chord indices', () => {
    const ctx: MelodicContext = { prevIndex: 5, chordIndices: [], direction: 0, tension: 0.5 };
    const weights = melodicWeights(10, ctx);
    expect(weights.length).toBe(10);
  });
});

describe('selectMelodicNote', () => {
  it('returns valid index', () => {
    for (let i = 0; i < 20; i++) {
      const idx = selectMelodicNote(10, BASE_CTX);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(10);
    }
  });

  it('tends to select nearby notes', () => {
    const counts = new Array(10).fill(0);
    for (let i = 0; i < 200; i++) {
      counts[selectMelodicNote(10, BASE_CTX)]++;
    }
    // Nearby notes (4, 5, 6) should dominate
    const nearby = counts[4] + counts[5] + counts[6];
    const far = counts[0] + counts[9];
    expect(nearby).toBeGreaterThan(far);
  });

  it('handles single-note ladder', () => {
    expect(selectMelodicNote(1, BASE_CTX)).toBe(0);
  });
});

describe('inferDirection', () => {
  it('ascending when mostly up', () => {
    expect(inferDirection([1, 3, 5, 7])).toBe(1);
  });

  it('descending when mostly down', () => {
    expect(inferDirection([7, 5, 3, 1])).toBe(-1);
  });

  it('static when mixed', () => {
    expect(inferDirection([3, 5, 3, 5])).toBe(0);
  });

  it('static for single note', () => {
    expect(inferDirection([5])).toBe(0);
  });

  it('static for empty', () => {
    expect(inferDirection([])).toBe(0);
  });
});
