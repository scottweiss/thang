import { describe, it, expect } from 'vitest';
import {
  regularityScore,
  regularityGainMultiplier,
  regularityPreference,
} from './harmonic-rhythm-regularity';

describe('regularityScore', () => {
  it('perfectly regular intervals score 1.0', () => {
    expect(regularityScore([4, 4, 4, 4])).toBe(1.0);
  });

  it('irregular intervals score lower', () => {
    const regular = regularityScore([4, 4, 4, 4]);
    const irregular = regularityScore([2, 6, 1, 8]);
    expect(regular).toBeGreaterThan(irregular);
  });

  it('single interval returns 0.5', () => {
    expect(regularityScore([4])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    const score = regularityScore([1, 10, 2, 8]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('regularityGainMultiplier', () => {
  it('regular changes boost for trance', () => {
    const mul = regularityGainMultiplier([4, 4, 4, 4], 'trance');
    expect(mul).toBeGreaterThan(1.0);
  });

  it('stays in 0.93-1.07 range', () => {
    const mul = regularityGainMultiplier([4, 4, 4], 'disco');
    expect(mul).toBeGreaterThanOrEqual(0.93);
    expect(mul).toBeLessThanOrEqual(1.07);
  });

  it('preference-driven mood responds more', () => {
    const intervals = [4, 4, 4, 4];
    const trance = regularityGainMultiplier(intervals, 'trance');
    const syro = regularityGainMultiplier(intervals, 'syro');
    expect(Math.abs(trance - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('regularityPreference', () => {
  it('trance is highest', () => {
    expect(regularityPreference('trance')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(regularityPreference('syro')).toBe(0.15);
  });
});
