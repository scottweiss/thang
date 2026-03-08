import { describe, it, expect } from 'vitest';
import {
  anticipationWeight,
  anticipationGhostNote,
  shouldAnticipate,
} from './harmonic-anticipation';

describe('anticipationWeight', () => {
  it('returns 0 before onset threshold', () => {
    expect(anticipationWeight(0, 'downtempo')).toBe(0);
    expect(anticipationWeight(3, 'downtempo')).toBe(0);
  });

  it('starts ramping at onset', () => {
    // downtempo onset is 4
    expect(anticipationWeight(4, 'downtempo')).toBe(0);
    expect(anticipationWeight(5, 'downtempo')).toBeGreaterThan(0);
  });

  it('increases over time after onset', () => {
    const w1 = anticipationWeight(5, 'downtempo');
    const w2 = anticipationWeight(7, 'downtempo');
    expect(w2).toBeGreaterThan(w1);
  });

  it('caps at mood max weight', () => {
    // After many ticks, should not exceed max
    const w = anticipationWeight(100, 'downtempo');
    expect(w).toBeLessThanOrEqual(0.2);
    expect(w).toBeCloseTo(0.2, 2);
  });

  it('trance anticipates earlier than ambient', () => {
    // trance onset=2, ambient onset=6
    const tranceW = anticipationWeight(3, 'trance');
    const ambientW = anticipationWeight(3, 'ambient');
    expect(tranceW).toBeGreaterThan(0);
    expect(ambientW).toBe(0);
  });

  it('syro has highest max weight', () => {
    const syro = anticipationWeight(100, 'syro');
    const ambient = anticipationWeight(100, 'ambient');
    expect(syro).toBeGreaterThan(ambient);
  });

  it('avril anticipates latest', () => {
    // avril onset=8
    expect(anticipationWeight(7, 'avril')).toBe(0);
    expect(anticipationWeight(9, 'avril')).toBeGreaterThan(0);
  });

  it('all moods produce values between 0 and max', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let t = 0; t < 20; t++) {
        const w = anticipationWeight(t, mood);
        expect(w).toBeGreaterThanOrEqual(0);
        expect(w).toBeLessThanOrEqual(0.5);
      }
    }
  });
});

describe('anticipationGhostNote', () => {
  it('returns null when weight is too low', () => {
    expect(anticipationGhostNote('C', 'G', 2, 0.01)).toBeNull();
  });

  it('returns null when roots are the same', () => {
    expect(anticipationGhostNote('C', 'C', 2, 0.5)).toBeNull();
  });

  it('returns strudel code when weight is significant', () => {
    const code = anticipationGhostNote('C', 'G', 2, 0.2);
    expect(code).not.toBeNull();
    expect(code).toContain('G2');
    expect(code).toContain('.sound("sine")');
    expect(code).toContain('.gain(');
  });

  it('gain scales with weight', () => {
    const low = anticipationGhostNote('C', 'G', 2, 0.1);
    const high = anticipationGhostNote('C', 'G', 2, 0.3);
    // Extract gain values
    const lowGain = parseFloat(low!.match(/\.gain\(([^)]+)\)/)![1]);
    const highGain = parseFloat(high!.match(/\.gain\(([^)]+)\)/)![1]);
    expect(highGain).toBeGreaterThan(lowGain);
  });

  it('uses correct octave', () => {
    const code = anticipationGhostNote('C', 'E', 1, 0.2);
    expect(code).toContain('E1');
  });
});

describe('shouldAnticipate', () => {
  it('false when no hint', () => {
    expect(shouldAnticipate(10, 'downtempo', false)).toBe(false);
  });

  it('false when too early', () => {
    expect(shouldAnticipate(1, 'downtempo', true)).toBe(false);
  });

  it('true when past onset with hint', () => {
    expect(shouldAnticipate(5, 'downtempo', true)).toBe(true);
  });
});
