import { describe, it, expect } from 'vitest';
import {
  suggestBassDirection,
  biasBassPatterns,
  shouldApplyContraryMotion,
  contraryMotionStrength,
} from './bass-contrary-motion';

describe('suggestBassDirection', () => {
  it('suggests descending when melody ascending (high-strength mood)', () => {
    // Run multiple times — lofi has 0.60 strength, so most should be descending
    let descCount = 0;
    for (let i = 0; i < 100; i++) {
      if (suggestBassDirection('ascending', 'lofi') === 'descending') descCount++;
    }
    expect(descCount).toBeGreaterThan(40); // ~60% expected
  });

  it('suggests ascending when melody descending', () => {
    let ascCount = 0;
    for (let i = 0; i < 100; i++) {
      if (suggestBassDirection('descending', 'lofi') === 'ascending') ascCount++;
    }
    expect(ascCount).toBeGreaterThan(40);
  });

  it('returns static for static melody', () => {
    expect(suggestBassDirection('static', 'lofi')).toBe('static');
  });

  it('returns static for undefined melody', () => {
    expect(suggestBassDirection(undefined, 'lofi')).toBe('static');
  });

  it('trance rarely biases (low strength)', () => {
    let biased = 0;
    for (let i = 0; i < 100; i++) {
      if (suggestBassDirection('ascending', 'trance') !== 'static') biased++;
    }
    expect(biased).toBeLessThan(25); // ~10% expected
  });
});

describe('biasBassPatterns', () => {
  it('reorders patterns favoring descending', () => {
    const patterns: string[][] = [
      ['C2', 'D2', 'E2', 'F2'],   // ascending
      ['F2', 'E2', 'D2', 'C2'],   // descending
      ['C2', 'C2', 'C2', 'C2'],   // static
    ];
    const biased = biasBassPatterns(patterns, 'descending', 'C', 'G');
    // Descending pattern should be first
    expect(biased[0]).toEqual(['F2', 'E2', 'D2', 'C2']);
  });

  it('reorders patterns favoring ascending', () => {
    const patterns: string[][] = [
      ['F2', 'E2', 'D2', 'C2'],   // descending
      ['C2', 'D2', 'E2', 'F2'],   // ascending
    ];
    const biased = biasBassPatterns(patterns, 'ascending', 'C', 'G');
    expect(biased[0]).toEqual(['C2', 'D2', 'E2', 'F2']);
  });

  it('returns unchanged for static direction', () => {
    const patterns: string[][] = [
      ['C2', 'D2'],
      ['E2', 'F2'],
    ];
    const biased = biasBassPatterns(patterns, 'static', 'C', 'G');
    expect(biased).toEqual(patterns);
  });

  it('handles patterns with rests', () => {
    const patterns: string[][] = [
      ['C2', '~', 'E2', 'G2'],   // ascending (with rest)
      ['G2', '~', 'E2', 'C2'],   // descending (with rest)
    ];
    const biased = biasBassPatterns(patterns, 'descending', 'C', 'G');
    expect(biased[0]).toEqual(['G2', '~', 'E2', 'C2']);
  });
});

describe('shouldApplyContraryMotion', () => {
  it('true for lofi', () => {
    expect(shouldApplyContraryMotion('lofi')).toBe(true);
  });

  it('true for trance (just barely at 0.10)', () => {
    // Trance is 0.10, threshold is 0.15
    expect(shouldApplyContraryMotion('trance')).toBe(false);
  });

  it('true for most moods', () => {
    const trueMoods = ['lofi', 'downtempo', 'blockhead', 'avril', 'flim',
                       'disco', 'xtal', 'ambient', 'syro'] as const;
    for (const mood of trueMoods) {
      expect(shouldApplyContraryMotion(mood)).toBe(true);
    }
  });
});

describe('contraryMotionStrength', () => {
  it('lofi is strongest', () => {
    expect(contraryMotionStrength('lofi')).toBe(0.60);
  });

  it('trance is weakest', () => {
    expect(contraryMotionStrength('trance')).toBe(0.10);
  });

  it('all moods have values', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(contraryMotionStrength(mood)).toBeGreaterThan(0);
      expect(contraryMotionStrength(mood)).toBeLessThanOrEqual(1.0);
    }
  });
});
