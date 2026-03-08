import { describe, it, expect } from 'vitest';
import {
  momentumScore,
  momentumGainMultiplier,
  momentumSensitivity,
} from './melodic-interval-momentum';

describe('momentumScore', () => {
  it('consecutive ascending intervals score high', () => {
    const score = momentumScore([2, 3, 2, 4]); // all ascending
    expect(score).toBeGreaterThanOrEqual(0.3);
  });

  it('alternating directions score lower', () => {
    const ascending = momentumScore([2, 3, 2, 4]);
    const alternating = momentumScore([2, -3, 2, -4]);
    expect(ascending).toBeGreaterThan(alternating);
  });

  it('leap recovery scores well', () => {
    const score = momentumScore([7, -2]); // big leap up then step down
    expect(score).toBeGreaterThan(0.1);
  });

  it('single interval returns 0.5', () => {
    expect(momentumScore([3])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    const score = momentumScore([1, 2, 3, 4, 5, 6, 7]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('momentumGainMultiplier', () => {
  it('stays in 0.90-1.10 range', () => {
    const mul = momentumGainMultiplier([2, 3, -1, 4], 'avril');
    expect(mul).toBeGreaterThanOrEqual(0.90);
    expect(mul).toBeLessThanOrEqual(1.10);
  });

  it('sensitive mood responds more', () => {
    const intervals = [2, 3, 2, 4, 2]; // strong momentum
    const avril = momentumGainMultiplier(intervals, 'avril');
    const syro = momentumGainMultiplier(intervals, 'syro');
    expect(Math.abs(avril - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('momentumSensitivity', () => {
  it('avril is high', () => {
    expect(momentumSensitivity('avril')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(momentumSensitivity('syro')).toBe(0.20);
  });
});
