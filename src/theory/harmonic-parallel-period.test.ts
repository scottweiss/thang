import { describe, it, expect } from 'vitest';
import {
  periodSimilarity,
  parallelPeriodGain,
  periodStrengthValue,
} from './harmonic-parallel-period';

describe('periodSimilarity', () => {
  it('identical phrases with different cadence scores high', () => {
    const sim = periodSimilarity([0, 4, 5, 4], [0, 4, 5, 0]);
    expect(sim).toBeGreaterThan(0.5);
  });

  it('identical phrases with same cadence scores lower', () => {
    const same = periodSimilarity([0, 4, 5, 0], [0, 4, 5, 0]);
    const diff = periodSimilarity([0, 4, 5, 4], [0, 4, 5, 0]);
    expect(diff).toBeGreaterThan(same);
  });

  it('completely different phrases = 0', () => {
    expect(periodSimilarity([0, 4, 5, 4], [3, 6, 2, 1])).toBe(0);
  });

  it('too short phrases = 0', () => {
    expect(periodSimilarity([0], [4])).toBe(0);
  });
});

describe('parallelPeriodGain', () => {
  it('parallel period gets boost', () => {
    const gain = parallelPeriodGain([0, 4, 5, 4], [0, 4, 5, 0], 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('unrelated phrases are neutral', () => {
    const gain = parallelPeriodGain([0, 4, 5, 4], [3, 6, 2, 1], 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril boosts more than syro', () => {
    const av = parallelPeriodGain([0, 4, 5, 4], [0, 4, 5, 0], 'avril', 'peak');
    const sy = parallelPeriodGain([0, 4, 5, 4], [0, 4, 5, 0], 'syro', 'peak');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.03 range', () => {
    const phrases = [[0, 4, 5, 0], [0, 4, 5, 4], [3, 6, 2, 1], [0, 3, 4, 0]];
    for (const a of phrases) {
      for (const b of phrases) {
        const gain = parallelPeriodGain(a, b, 'avril', 'peak');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.03);
      }
    }
  });
});

describe('periodStrengthValue', () => {
  it('avril is highest', () => {
    expect(periodStrengthValue('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(periodStrengthValue('syro')).toBe(0.15);
  });
});
