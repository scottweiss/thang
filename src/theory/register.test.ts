import { describe, it, expect } from 'vitest';
import { getAdjustedOctaveRange, registerOverlap, mixClarityScore } from './register';

describe('registerOverlap', () => {
  it('returns 0 for non-overlapping bands', () => {
    expect(registerOverlap({ low: 24, high: 48 }, { low: 60, high: 84 })).toBe(0);
  });

  it('computes overlap for partially overlapping bands', () => {
    expect(registerOverlap({ low: 48, high: 72 }, { low: 60, high: 84 })).toBe(12);
  });

  it('computes overlap when one band contains the other', () => {
    expect(registerOverlap({ low: 48, high: 84 }, { low: 60, high: 72 })).toBe(12);
  });

  it('returns full range for identical bands', () => {
    expect(registerOverlap({ low: 48, high: 72 }, { low: 48, high: 72 })).toBe(24);
  });
});

describe('mixClarityScore', () => {
  it('returns 1 for a single layer', () => {
    expect(mixClarityScore({ melody: { low: 60, high: 84 } })).toBe(1);
  });

  it('returns 1 for non-overlapping layers', () => {
    expect(mixClarityScore({
      drone: { low: 24, high: 48 },
      melody: { low: 60, high: 84 },
    })).toBe(1);
  });

  it('returns less than 1 for overlapping layers', () => {
    const score = mixClarityScore({
      harmony: { low: 48, high: 72 },
      melody: { low: 60, high: 84 },
    });
    expect(score).toBeLessThan(1);
    expect(score).toBeGreaterThan(0);
  });

  it('returns lower score for more overlap', () => {
    const lessOverlap = mixClarityScore({
      a: { low: 48, high: 60 },
      b: { low: 55, high: 72 },
    });
    const moreOverlap = mixClarityScore({
      a: { low: 48, high: 72 },
      b: { low: 48, high: 72 },
    });
    expect(lessOverlap).toBeGreaterThan(moreOverlap);
  });
});

describe('getAdjustedOctaveRange', () => {
  it('returns default range for unknown layer', () => {
    expect(getAdjustedOctaveRange('unknown', {})).toEqual([3, 5]);
  });

  it('adjusts melody down when arp is high', () => {
    const [low, high] = getAdjustedOctaveRange('melody', { arp: 72 });
    expect(high).toBeLessThanOrEqual(5); // C5
  });

  it('adjusts melody up when arp is low', () => {
    const [low, high] = getAdjustedOctaveRange('melody', { arp: 48 });
    expect(low).toBeGreaterThanOrEqual(4);
  });

  it('returns base range when no conflicting layers', () => {
    const [low, high] = getAdjustedOctaveRange('melody', {});
    expect(low).toBe(4); // C4
    expect(high).toBe(6); // C6
  });
});
