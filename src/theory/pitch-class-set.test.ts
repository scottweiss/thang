import { describe, it, expect } from 'vitest';
import {
  intervalVector,
  normalForm,
  primeForm,
  moodSetMatch,
  suggestPitchClassAdditions,
  dominantIntervalClass,
} from './pitch-class-set';

describe('intervalVector', () => {
  it('C major triad [0,4,7] → [0,0,1,1,1,0]', () => {
    // m3(3), M3(4), P5(7→5) → ic3=1, ic4=1, ic5=1
    expect(intervalVector([0, 4, 7])).toEqual([0, 0, 1, 1, 1, 0]);
  });

  it('chromatic cluster [0,1,2] → [2,1,0,0,0,0]', () => {
    // 0-1=ic1, 0-2=ic2, 1-2=ic1
    expect(intervalVector([0, 1, 2])).toEqual([2, 1, 0, 0, 0, 0]);
  });

  it('tritone [0,6] → [0,0,0,0,0,1]', () => {
    expect(intervalVector([0, 6])).toEqual([0, 0, 0, 0, 0, 1]);
  });

  it('whole-tone scale subset [0,2,4] → [0,2,0,1,0,0]', () => {
    // 0-2=ic2, 0-4=ic4, 2-4=ic2
    expect(intervalVector([0, 2, 4])).toEqual([0, 2, 0, 1, 0, 0]);
  });

  it('empty set returns all zeros', () => {
    expect(intervalVector([])).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('single pitch returns all zeros', () => {
    expect(intervalVector([5])).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('handles duplicates', () => {
    expect(intervalVector([0, 0, 4, 7])).toEqual([0, 0, 1, 1, 1, 0]);
  });
});

describe('normalForm', () => {
  it('C major triad is already compact', () => {
    const nf = normalForm([0, 4, 7]);
    expect(nf).toEqual([0, 4, 7]);
  });

  it('finds most compact rotation', () => {
    // {1, 5, 8} → rotation starting at 5: [5,8,1] spans 8, starting at 8: [8,1,5] spans 9, starting at 1: [1,5,8] spans 7
    const nf = normalForm([1, 5, 8]);
    expect(nf).toEqual([1, 5, 8]);
  });

  it('handles single pitch', () => {
    expect(normalForm([7])).toEqual([7]);
  });

  it('handles empty set', () => {
    expect(normalForm([])).toEqual([]);
  });
});

describe('primeForm', () => {
  it('C major triad → [0,3,7] or [0,4,7]', () => {
    const pf = primeForm([0, 4, 7]);
    // Prime form of major triad is [0,3,7] (inverted is more compact)
    expect(pf[0]).toBe(0);
    expect(pf.length).toBe(3);
  });

  it('minor triad has same prime form as major', () => {
    // C minor [0,3,7] and C major [0,4,7] should have same prime form
    const majPF = primeForm([0, 4, 7]);
    const minPF = primeForm([0, 3, 7]);
    expect(majPF).toEqual(minPF);
  });

  it('starts at 0', () => {
    const pf = primeForm([2, 6, 9]);
    expect(pf[0]).toBe(0);
  });

  it('empty set returns empty', () => {
    expect(primeForm([])).toEqual([]);
  });
});

describe('moodSetMatch', () => {
  it('open fifths score high for ambient', () => {
    // [0, 7] = just a perfect fifth (ic5=1)
    const score = moodSetMatch([0, 7], 'ambient');
    expect(score).toBeGreaterThan(0.7);
  });

  it('tritone scores high for syro', () => {
    // [0, 6] = tritone (ic6=1)
    const syroScore = moodSetMatch([0, 6], 'syro');
    const tranceScore = moodSetMatch([0, 6], 'trance');
    expect(syroScore).toBeGreaterThan(tranceScore);
  });

  it('major third scores high for disco', () => {
    // [0, 4] = major third (ic4=1)
    const discoScore = moodSetMatch([0, 4], 'disco');
    expect(discoScore).toBeGreaterThan(0.6);
  });

  it('returns 0.5 for single pitch', () => {
    expect(moodSetMatch([0], 'ambient')).toBe(0.5);
  });
});

describe('suggestPitchClassAdditions', () => {
  it('suggests pitches that improve mood match', () => {
    const suggestions = suggestPitchClassAdditions([0, 4, 7], 'ambient', 2);
    expect(suggestions.length).toBeLessThanOrEqual(2);
    // Each suggestion should be a valid pitch class
    for (const pc of suggestions) {
      expect(pc).toBeGreaterThanOrEqual(0);
      expect(pc).toBeLessThanOrEqual(11);
    }
  });

  it('does not suggest existing pitches', () => {
    const existing = [0, 4, 7];
    const suggestions = suggestPitchClassAdditions(existing, 'lofi', 3);
    for (const pc of suggestions) {
      expect(existing).not.toContain(pc);
    }
  });

  it('returns empty if no improvement possible', () => {
    // Full chromatic set — no pitches to add
    const full = Array.from({ length: 12 }, (_, i) => i);
    expect(suggestPitchClassAdditions(full, 'ambient', 1)).toEqual([]);
  });
});

describe('dominantIntervalClass', () => {
  it('major triad: ic5 dominates (tied with ic3, ic4)', () => {
    // [0,0,1,1,1,0] — ic3, ic4, ic5 tied; first max wins
    const dic = dominantIntervalClass([0, 4, 7]);
    expect(dic).toBe(3); // first of the tied values
  });

  it('chromatic cluster: ic1 dominates', () => {
    expect(dominantIntervalClass([0, 1, 2])).toBe(1);
  });

  it('whole-tone subset: ic2 dominates', () => {
    expect(dominantIntervalClass([0, 2, 4])).toBe(2);
  });
});
