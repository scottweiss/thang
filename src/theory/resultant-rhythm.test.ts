import { describe, it, expect } from 'vitest';
import {
  resultantPattern,
  resultantAccentMask,
  selectPeriods,
  shouldApplyResultant,
  resultantGainMask,
  resultantTendency,
} from './resultant-rhythm';

describe('resultantPattern', () => {
  it('3-against-4 creates 12-step pattern', () => {
    const p = resultantPattern(3, 4);
    expect(p).toHaveLength(12);
    // Hits at: 0,3,4,6,8,9
    expect(p[0]).toBe(true);  // both
    expect(p[3]).toBe(true);  // 3
    expect(p[4]).toBe(true);  // 4
    expect(p[6]).toBe(true);  // 3
    expect(p[8]).toBe(true);  // 4
    expect(p[9]).toBe(true);  // 3
    // Non-hits
    expect(p[1]).toBe(false);
    expect(p[2]).toBe(false);
    expect(p[5]).toBe(false);
  });

  it('5-against-4 creates 20-step pattern', () => {
    const p = resultantPattern(5, 4);
    expect(p).toHaveLength(20);
  });

  it('same period creates simple pattern', () => {
    const p = resultantPattern(4, 4);
    expect(p).toHaveLength(4);
    expect(p[0]).toBe(true);
    expect(p[1]).toBe(false);
    expect(p[2]).toBe(false);
    expect(p[3]).toBe(false);
  });

  it('handles zero/negative gracefully', () => {
    expect(resultantPattern(0, 4)).toEqual([]);
    expect(resultantPattern(3, -1)).toEqual([]);
  });
});

describe('resultantAccentMask', () => {
  it('maps booleans to gain values', () => {
    const mask = resultantAccentMask([true, false, true]);
    expect(mask[0]).toBe(1.15);
    expect(mask[1]).toBe(0.85);
    expect(mask[2]).toBe(1.15);
  });

  it('respects custom boost/reduce', () => {
    const mask = resultantAccentMask([true, false], 1.3, 0.7);
    expect(mask[0]).toBe(1.3);
    expect(mask[1]).toBe(0.7);
  });
});

describe('selectPeriods', () => {
  it('syro gets complex ratios', () => {
    const [a, b] = selectPeriods('syro', 'groove');
    expect(a * b).toBeGreaterThanOrEqual(20); // at least 5*4
  });

  it('trance gets simple 3:4', () => {
    const [a, b] = selectPeriods('trance', 'groove');
    expect(a).toBe(3);
    expect(b).toBe(4);
  });

  it('peak prefers simpler ratios', () => {
    const [a1, b1] = selectPeriods('syro', 'peak');
    const [a2, b2] = selectPeriods('syro', 'groove');
    expect(a1 * b1).toBeLessThanOrEqual(a2 * b2);
  });
});

describe('shouldApplyResultant', () => {
  it('is deterministic', () => {
    const a = shouldApplyResultant(42, 'syro', 'groove');
    const b = shouldApplyResultant(42, 'syro', 'groove');
    expect(a).toBe(b);
  });

  it('syro applies more than trance', () => {
    const syroCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyResultant(i, 'syro', 'groove')
    ).filter(Boolean).length;
    const tranceCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyResultant(i, 'trance', 'groove')
    ).filter(Boolean).length;
    expect(syroCount).toBeGreaterThan(tranceCount);
  });
});

describe('resultantGainMask', () => {
  it('returns correct length', () => {
    const mask = resultantGainMask(16, 'lofi', 'groove');
    expect(mask).toHaveLength(16);
  });

  it('all values are positive', () => {
    const mask = resultantGainMask(16, 'syro', 'breakdown');
    for (const v of mask) {
      expect(v).toBeGreaterThan(0);
    }
  });

  it('contains both boost and reduce values', () => {
    const mask = resultantGainMask(16, 'blockhead', 'groove');
    const hasBoost = mask.some(v => v > 1.0);
    const hasReduce = mask.some(v => v < 1.0);
    expect(hasBoost).toBe(true);
    expect(hasReduce).toBe(true);
  });
});

describe('resultantTendency', () => {
  it('syro has highest tendency', () => {
    expect(resultantTendency('syro')).toBe(0.40);
  });

  it('trance has lowest tendency', () => {
    expect(resultantTendency('trance')).toBe(0.04);
  });
});
