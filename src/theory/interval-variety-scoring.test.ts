import { describe, it, expect } from 'vitest';
import {
  intervalVarietyScore,
  varietyGainMultiplier,
  varietyAppetite,
} from './interval-variety-scoring';

describe('intervalVarietyScore', () => {
  it('all different intervals scores high', () => {
    const score = intervalVarietyScore([1, 3, 5, 7, 2]);
    expect(score).toBeGreaterThan(0.7);
  });

  it('repeated intervals score lower', () => {
    const varied = intervalVarietyScore([1, 3, 5, 7]);
    const monotone = intervalVarietyScore([2, 2, 2, 2]);
    expect(varied).toBeGreaterThan(monotone);
  });

  it('single interval returns 0.5', () => {
    expect(intervalVarietyScore([3])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    const score = intervalVarietyScore([1, 1, 1, 1, 1, 1]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('mix of small and large gets bonus', () => {
    const mixed = intervalVarietyScore([1, 7]); // small + large
    const uniform = intervalVarietyScore([3, 4]); // both medium
    expect(mixed).toBeGreaterThan(uniform);
  });
});

describe('varietyGainMultiplier', () => {
  it('stays in 0.92-1.08 range', () => {
    const mul = varietyGainMultiplier([2, 3, 5, 1], 'syro');
    expect(mul).toBeGreaterThanOrEqual(0.92);
    expect(mul).toBeLessThanOrEqual(1.08);
  });

  it('hungry mood responds more', () => {
    const intervals = [1, 3, 5, 7, 2]; // varied
    const syro = varietyGainMultiplier(intervals, 'syro');
    const trance = varietyGainMultiplier(intervals, 'trance');
    expect(Math.abs(syro - 1.0)).toBeGreaterThan(Math.abs(trance - 1.0));
  });
});

describe('varietyAppetite', () => {
  it('syro is highest', () => {
    expect(varietyAppetite('syro')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(varietyAppetite('disco')).toBe(0.20);
  });
});
