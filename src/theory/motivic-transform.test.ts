import { describe, it, expect } from 'vitest';
import {
  invertMotif,
  retrogradeMotif,
  retrogradeInversion,
  augmentMotif,
  diminishMotif,
  transposeMotif,
  applyTransform,
  sectionTransform,
  transformProbability,
} from './motivic-transform';

describe('invertMotif', () => {
  it('flips intervals around the first note', () => {
    // [2, 4, 6] → pivot=2, intervals=[0,2,4] → inverted=[2,0,-2] → clamped=[2,0,0]
    expect(invertMotif([2, 4, 6], 10)).toEqual([2, 0, 0]);
  });

  it('preserves the pivot note', () => {
    const result = invertMotif([5, 7, 3], 10);
    expect(result[0]).toBe(5);
  });

  it('flips ascending to descending', () => {
    // [3, 5, 7] → pivot=3, intervals=[0,2,4] → inverted=[3,1,-1] → clamped=[3,1,0]
    const result = invertMotif([3, 5, 7], 10);
    expect(result[1]).toBeLessThan(result[0]); // descending
  });

  it('flips descending to ascending', () => {
    // [7, 5, 3] → pivot=7, intervals=[0,-2,-4] → inverted=[7,9,11] → clamped to 9
    const result = invertMotif([7, 5, 3], 10);
    expect(result[1]).toBeGreaterThan(result[0]); // ascending
  });

  it('clamps to ladder bounds', () => {
    const result = invertMotif([1, 8], 10);
    // pivot=1, interval=7, inverted=1-7=-6 → clamped to 0
    expect(result[1]).toBe(0);
  });

  it('handles single note', () => {
    expect(invertMotif([5], 10)).toEqual([5]);
  });

  it('handles empty', () => {
    expect(invertMotif([], 10)).toEqual([]);
  });
});

describe('retrogradeMotif', () => {
  it('reverses the order', () => {
    expect(retrogradeMotif([1, 3, 5, 7])).toEqual([7, 5, 3, 1]);
  });

  it('does not mutate original', () => {
    const original = [1, 2, 3];
    retrogradeMotif(original);
    expect(original).toEqual([1, 2, 3]);
  });
});

describe('retrogradeInversion', () => {
  it('inverts then reverses', () => {
    const result = retrogradeInversion([3, 5, 7], 10);
    const inverted = invertMotif([3, 5, 7], 10);
    const expected = inverted.reverse();
    expect(result).toEqual(expected);
  });
});

describe('augmentMotif', () => {
  it('inserts rests between notes', () => {
    expect(augmentMotif([0, 2, 4])).toEqual([0, -1, 2, -1, 4]);
  });

  it('handles single note', () => {
    expect(augmentMotif([5])).toEqual([5]);
  });

  it('handles empty', () => {
    expect(augmentMotif([])).toEqual([]);
  });

  it('doubles length minus 1', () => {
    const result = augmentMotif([1, 2, 3, 4]);
    expect(result).toHaveLength(7); // 4 notes + 3 rests
  });
});

describe('diminishMotif', () => {
  it('takes every other note', () => {
    expect(diminishMotif([0, 1, 2, 3, 4])).toEqual([0, 2, 4]);
  });

  it('includes last note for resolution', () => {
    const result = diminishMotif([0, 1, 2, 3]);
    expect(result[result.length - 1]).toBe(3);
  });

  it('preserves short motifs', () => {
    expect(diminishMotif([3, 7])).toEqual([3, 7]);
    expect(diminishMotif([5])).toEqual([5]);
  });

  it('reduces length roughly by half', () => {
    const result = diminishMotif([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result.length).toBeGreaterThanOrEqual(4);
  });
});

describe('transposeMotif', () => {
  it('shifts all indices up', () => {
    expect(transposeMotif([2, 4, 6], 3, 12)).toEqual([5, 7, 9]);
  });

  it('shifts all indices down', () => {
    expect(transposeMotif([5, 7, 9], -3, 12)).toEqual([2, 4, 6]);
  });

  it('clamps to bounds', () => {
    expect(transposeMotif([0, 1, 2], -5, 10)).toEqual([0, 0, 0]);
    expect(transposeMotif([8, 9], 5, 10)).toEqual([9, 9]);
  });

  it('preserves rests (-1)', () => {
    expect(transposeMotif([2, -1, 4], 3, 12)).toEqual([5, -1, 7]);
  });
});

describe('applyTransform', () => {
  it('identity returns copy', () => {
    const input = [1, 3, 5];
    const result = applyTransform(input, 'identity', 10);
    expect(result).toEqual(input);
    expect(result).not.toBe(input); // new array
  });

  it('routes to inversion', () => {
    expect(applyTransform([3, 5, 7], 'inversion', 10)).toEqual(invertMotif([3, 5, 7], 10));
  });

  it('routes to retrograde', () => {
    expect(applyTransform([1, 2, 3], 'retrograde', 10)).toEqual([3, 2, 1]);
  });

  it('routes to augmentation', () => {
    expect(applyTransform([0, 2, 4], 'augmentation', 10)).toEqual([0, -1, 2, -1, 4]);
  });

  it('routes to diminution', () => {
    const result = applyTransform([0, 1, 2, 3, 4], 'diminution', 10);
    expect(result.length).toBeLessThan(5);
  });
});

describe('sectionTransform', () => {
  it('intro starts with identity', () => {
    expect(sectionTransform('intro', 0.2)).toBe('identity');
  });

  it('intro evolves to inversion', () => {
    expect(sectionTransform('intro', 0.8)).toBe('inversion');
  });

  it('build uses augmentation early', () => {
    expect(sectionTransform('build', 0.2)).toBe('augmentation');
  });

  it('build shifts to diminution late', () => {
    expect(sectionTransform('build', 0.7)).toBe('diminution');
  });

  it('peak uses diminution', () => {
    expect(sectionTransform('peak', 0.3)).toBe('diminution');
  });

  it('peak climax uses retrograde-inversion', () => {
    expect(sectionTransform('peak', 0.9)).toBe('retrograde-inversion');
  });

  it('breakdown uses retrograde', () => {
    expect(sectionTransform('breakdown', 0.3)).toBe('retrograde');
  });

  it('groove uses identity early', () => {
    expect(sectionTransform('groove', 0.3)).toBe('identity');
  });
});

describe('transformProbability', () => {
  it('syro has highest probability', () => {
    const syro = transformProbability('syro', 'build');
    const disco = transformProbability('disco', 'build');
    expect(syro).toBeGreaterThan(disco);
  });

  it('ambient has lowest probability', () => {
    const ambient = transformProbability('ambient', 'groove');
    const lofi = transformProbability('lofi', 'groove');
    expect(ambient).toBeLessThan(lofi);
  });

  it('breakdown boosts probability', () => {
    const breakdown = transformProbability('lofi', 'breakdown');
    const groove = transformProbability('lofi', 'groove');
    expect(breakdown).toBeGreaterThan(groove);
  });

  it('never exceeds 1.0', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const mood of moods) {
      for (const section of sections) {
        expect(transformProbability(mood, section)).toBeLessThanOrEqual(1.0);
      }
    }
  });
});
