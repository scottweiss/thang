import { describe, it, expect } from 'vitest';
import {
  fragmentLength,
  extractFragment,
  repeatFragment,
  shouldFragment,
  fragmentationTendency,
} from './motivic-fragmentation';

describe('fragmentLength', () => {
  it('intro keeps full motif', () => {
    const len = fragmentLength(4, 'syro', 'intro', 0.5);
    expect(len).toBe(4); // section ratio = 0 → no fragmentation
  });

  it('peak with high tension fragments heavily', () => {
    const len = fragmentLength(8, 'syro', 'peak', 0.9);
    expect(len).toBeLessThan(8);
    expect(len).toBeGreaterThanOrEqual(1);
  });

  it('ambient barely fragments even at peak', () => {
    const len = fragmentLength(8, 'ambient', 'peak', 0.5);
    expect(len).toBeGreaterThanOrEqual(6); // low tendency
  });

  it('never returns 0', () => {
    const len = fragmentLength(4, 'syro', 'peak', 1.0);
    expect(len).toBeGreaterThanOrEqual(1);
  });

  it('handles single-note motif', () => {
    expect(fragmentLength(1, 'syro', 'peak', 1.0)).toBe(1);
  });

  it('higher tension → shorter fragment', () => {
    const lowT = fragmentLength(8, 'trance', 'build', 0.2);
    const highT = fragmentLength(8, 'trance', 'build', 0.9);
    expect(highT).toBeLessThanOrEqual(lowT);
  });
});

describe('extractFragment', () => {
  it('returns head motif', () => {
    const frag = extractFragment(['C4', 'D4', 'E4', 'F4'], 2);
    expect(frag).toEqual(['C4', 'D4']);
  });

  it('returns full motif if length >= motifLength', () => {
    const frag = extractFragment(['C4', 'D4'], 5);
    expect(frag).toEqual(['C4', 'D4']);
  });

  it('returns copy, not reference', () => {
    const motif = ['C4', 'D4'];
    const frag = extractFragment(motif, 2);
    frag[0] = 'G4';
    expect(motif[0]).toBe('C4');
  });
});

describe('repeatFragment', () => {
  it('fills target length with repetitions', () => {
    const result = repeatFragment(['C4', 'D4'], 8, false);
    expect(result).toHaveLength(8);
    expect(result[0]).toBe('C4');
    expect(result[1]).toBe('D4');
    expect(result[2]).toBe('C4');
    expect(result[3]).toBe('D4');
  });

  it('handles single-note fragment', () => {
    const result = repeatFragment(['E4'], 4, false);
    expect(result).toEqual(['E4', 'E4', 'E4', 'E4']);
  });

  it('handles empty fragment', () => {
    const result = repeatFragment([], 4);
    expect(result).toEqual(['~', '~', '~', '~']);
  });

  it('with vary=true inserts breaths', () => {
    // Every 3rd repetition inserts a rest
    const result = repeatFragment(['C4'], 10, true);
    expect(result).toHaveLength(10);
    const restCount = result.filter(n => n === '~').length;
    // Should have some rests from breathing
    expect(restCount).toBeGreaterThanOrEqual(1);
  });

  it('never exceeds target length', () => {
    const result = repeatFragment(['A4', 'B4', 'C5'], 5, true);
    expect(result).toHaveLength(5);
  });
});

describe('shouldFragment', () => {
  it('is deterministic', () => {
    const a = shouldFragment(42, 'syro', 'build');
    const b = shouldFragment(42, 'syro', 'build');
    expect(a).toBe(b);
  });

  it('never fragments during intro', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldFragment(i, 'syro', 'intro')).toBe(false);
    }
  });

  it('syro peak fragments more than ambient groove', () => {
    const syroCount = Array.from({ length: 200 }, (_, i) =>
      shouldFragment(i, 'syro', 'peak')
    ).filter(Boolean).length;
    const ambientCount = Array.from({ length: 200 }, (_, i) =>
      shouldFragment(i, 'ambient', 'groove')
    ).filter(Boolean).length;
    expect(syroCount).toBeGreaterThan(ambientCount);
  });
});

describe('fragmentationTendency', () => {
  it('syro has highest tendency', () => {
    expect(fragmentationTendency('syro')).toBe(0.45);
  });

  it('ambient has lowest tendency', () => {
    expect(fragmentationTendency('ambient')).toBe(0.05);
  });
});
