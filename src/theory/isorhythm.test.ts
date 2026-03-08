import { describe, it, expect } from 'vitest';
import {
  isorhythmicPattern,
  moodTalea,
  moodCoprimePair,
  isorhythmProbability,
  isorhythmToStrudel,
} from './isorhythm';

describe('isorhythmicPattern', () => {
  it('combines color and talea by independent cycling', () => {
    const color = ['C', 'E', 'G', 'B'];  // length 4
    const talea = [0.8, 0, 0.6];          // length 3
    const result = isorhythmicPattern(color, talea, 12);

    expect(result).toHaveLength(12);
    // Step 0: C + 0.8, Step 1: E + 0, Step 2: G + 0.6
    expect(result[0]).toEqual({ note: 'C', gain: 0.8 });
    expect(result[1]).toEqual({ note: 'E', gain: 0 });
    expect(result[2]).toEqual({ note: 'G', gain: 0.6 });
    // Step 3: B + 0.8 (color wraps, talea wraps)
    expect(result[3]).toEqual({ note: 'B', gain: 0.8 });
    // Step 4: C + 0 (color restarts, talea continues)
    expect(result[4]).toEqual({ note: 'C', gain: 0 });
  });

  it('phasing means same note gets different gain on each cycle', () => {
    const color = ['A', 'B', 'C'];
    const talea = [1.0, 0, 0.5, 0];
    const result = isorhythmicPattern(color, talea, 12);

    // First appearance of 'A': gain 1.0 (step 0)
    expect(result[0].gain).toBe(1.0);
    // Second appearance of 'A': gain 0 (step 3, talea[3]=0)
    expect(result[3].gain).toBe(0);
    // Third appearance of 'A': gain 0.5 (step 6, talea[2]=0.5)
    expect(result[6].gain).toBe(0.5);
    // Fourth appearance of 'A': gain 0 (step 9, talea[1]=0)
    expect(result[9].gain).toBe(0);
  });

  it('returns empty for empty inputs', () => {
    expect(isorhythmicPattern([], [0.5], 8)).toEqual([]);
    expect(isorhythmicPattern(['C'], [], 8)).toEqual([]);
    expect(isorhythmicPattern(['C'], [0.5], 0)).toEqual([]);
  });

  it('handles length shorter than both cycles', () => {
    const result = isorhythmicPattern(['C', 'D', 'E'], [0.5, 0.3], 2);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ note: 'C', gain: 0.5 });
    expect(result[1]).toEqual({ note: 'D', gain: 0.3 });
  });
});

describe('moodTalea', () => {
  it('returns non-empty array for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      const talea = moodTalea(m);
      expect(talea.length).toBeGreaterThan(0);
    }
  });

  it('ambient talea has rests (zeros)', () => {
    const talea = moodTalea('ambient');
    expect(talea.some(v => v === 0)).toBe(true);
  });

  it('trance talea has no rests (all non-zero)', () => {
    const talea = moodTalea('trance');
    expect(talea.every(v => v > 0)).toBe(true);
  });

  it('all values are between 0 and 1', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      for (const v of moodTalea(m)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('moodCoprimePair', () => {
  function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
  }

  it('returns coprime pairs for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      const [a, b] = moodCoprimePair(m);
      expect(gcd(a, b)).toBe(1);
    }
  });

  it('talea length matches actual talea', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      const [taleaLen] = moodCoprimePair(m);
      expect(moodTalea(m)).toHaveLength(taleaLen);
    }
  });
});

describe('isorhythmProbability', () => {
  it('ambient has high base probability', () => {
    const prob = isorhythmProbability('ambient', 'groove', 0.5);
    expect(prob).toBeGreaterThan(0.1);
  });

  it('trance has low probability', () => {
    const prob = isorhythmProbability('trance', 'groove', 0.5);
    expect(prob).toBeLessThan(0.1);
  });

  it('breakdown section boosts probability', () => {
    const breakdown = isorhythmProbability('ambient', 'breakdown', 0.5);
    const peak = isorhythmProbability('ambient', 'peak', 0.5);
    expect(breakdown).toBeGreaterThan(peak);
  });

  it('early section progress reduces probability', () => {
    const early = isorhythmProbability('ambient', 'groove', 0.05);
    const late = isorhythmProbability('ambient', 'groove', 0.5);
    expect(late).toBeGreaterThan(early);
  });

  it('never exceeds 0.6', () => {
    const prob = isorhythmProbability('ambient', 'breakdown', 1.0);
    expect(prob).toBeLessThanOrEqual(0.6);
  });
});

describe('isorhythmToStrudel', () => {
  it('converts pattern to note and gain strings', () => {
    const pattern = [
      { note: 'C4', gain: 0.8 },
      { note: 'E4', gain: 0 },
      { note: 'G4', gain: 0.6 },
    ];
    const { noteStr, gainStr } = isorhythmToStrudel(pattern);
    expect(noteStr).toBe('C4 ~ G4');
    expect(gainStr).toBe('0.8000 0.0000 0.6000');
  });

  it('handles all rests', () => {
    const pattern = [
      { note: 'C4', gain: 0 },
      { note: 'E4', gain: 0 },
    ];
    const { noteStr } = isorhythmToStrudel(pattern);
    expect(noteStr).toBe('~ ~');
  });

  it('handles empty pattern', () => {
    const { noteStr, gainStr } = isorhythmToStrudel([]);
    expect(noteStr).toBe('');
    expect(gainStr).toBe('');
  });
});
