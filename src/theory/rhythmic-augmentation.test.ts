import { describe, it, expect } from 'vitest';
import {
  augment,
  diminish,
  partialAugment,
  partialDiminish,
  shouldApplyAugDim,
  getTransformDirection,
  applyRhythmicTransform,
  augDimTendency,
} from './rhythmic-augmentation';

describe('augment', () => {
  it('doubles length with rests between notes', () => {
    const result = augment(['C4', 'D4', 'E4']);
    expect(result).toEqual(['C4', '~', 'D4', '~', 'E4', '~']);
  });

  it('handles empty input', () => {
    expect(augment([])).toEqual([]);
  });

  it('rests get augmented too', () => {
    const result = augment(['C4', '~']);
    expect(result).toEqual(['C4', '~', '~', '~']);
  });
});

describe('diminish', () => {
  it('removes all rests', () => {
    const result = diminish(['C4', '~', 'D4', '~', 'E4']);
    expect(result).toEqual(['C4', 'D4', 'E4']);
  });

  it('handles no rests', () => {
    expect(diminish(['C4', 'D4'])).toEqual(['C4', 'D4']);
  });

  it('handles empty input', () => {
    expect(diminish([])).toEqual([]);
  });
});

describe('partialAugment', () => {
  it('inserts rest every 2 notes', () => {
    const result = partialAugment(['C4', 'D4', 'E4', 'F4'], 2);
    expect(result).toEqual(['C4', 'D4', '~', 'E4', 'F4', '~']);
  });

  it('inserts rest every 3 notes', () => {
    const result = partialAugment(['C4', 'D4', 'E4'], 3);
    expect(result).toEqual(['C4', 'D4', 'E4', '~']);
  });
});

describe('partialDiminish', () => {
  it('removes every 2nd rest', () => {
    const result = partialDiminish(['C4', '~', '~', 'D4', '~', '~'], 2);
    // rest1 kept, rest2 removed, rest3 kept, rest4 removed
    expect(result).toEqual(['C4', '~', 'D4', '~']);
  });

  it('handles no rests', () => {
    expect(partialDiminish(['C4', 'D4'], 2)).toEqual(['C4', 'D4']);
  });
});

describe('shouldApplyAugDim', () => {
  it('never applies during groove (neutral)', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldApplyAugDim(i, 'syro', 'groove')).toBe(false);
    }
  });

  it('is deterministic', () => {
    const a = shouldApplyAugDim(42, 'syro', 'build');
    const b = shouldApplyAugDim(42, 'syro', 'build');
    expect(a).toBe(b);
  });

  it('syro applies more than ambient', () => {
    const syroCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyAugDim(i, 'syro', 'build')
    ).filter(Boolean).length;
    const ambientCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyAugDim(i, 'ambient', 'build')
    ).filter(Boolean).length;
    expect(syroCount).toBeGreaterThan(ambientCount);
  });
});

describe('getTransformDirection', () => {
  it('build diminishes', () => {
    expect(getTransformDirection('build')).toBe('diminish');
  });

  it('breakdown augments', () => {
    expect(getTransformDirection('breakdown')).toBe('augment');
  });
});

describe('applyRhythmicTransform', () => {
  it('augments during intro', () => {
    const result = applyRhythmicTransform(['C4', 'D4', 'E4', 'F4'], 'intro', 8);
    expect(result).toHaveLength(8);
    // Should be longer/more spacious than original
    const restCount = result.filter(n => n === '~').length;
    expect(restCount).toBeGreaterThan(0);
  });

  it('diminishes during build', () => {
    const input = ['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'];
    const result = applyRhythmicTransform(input, 'build', 8);
    // Should have fewer rests than input
    const inputRests = input.filter(n => n === '~').length;
    const resultRests = result.filter(n => n === '~').length;
    expect(resultRests).toBeLessThanOrEqual(inputRests);
  });

  it('returns unchanged during groove', () => {
    const input = ['C4', '~', 'D4', '~'];
    expect(applyRhythmicTransform(input, 'groove', 4)).toEqual(input);
  });
});

describe('augDimTendency', () => {
  it('syro has highest', () => {
    expect(augDimTendency('syro')).toBe(0.35);
  });

  it('ambient has lowest', () => {
    expect(augDimTendency('ambient')).toBe(0.05);
  });
});
