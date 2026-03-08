import { describe, it, expect } from 'vitest';
import {
  intervalVariety,
  intervalVarietyGain,
  varietyStrengthValue,
} from './melodic-interval-variety';

describe('intervalVariety', () => {
  it('all same interval = low variety', () => {
    expect(intervalVariety([2, 2, 2, 2])).toBe(0.25);
  });

  it('all different = high variety', () => {
    expect(intervalVariety([1, 3, 5, 7])).toBe(1.0);
  });

  it('mixed intervals = moderate', () => {
    const v = intervalVariety([2, 3, 2, 5]);
    expect(v).toBeGreaterThan(0.25);
    expect(v).toBeLessThan(1.0);
  });

  it('too short = 0', () => {
    expect(intervalVariety([2])).toBe(0);
  });

  it('treats positive and negative same interval as same', () => {
    expect(intervalVariety([2, -2, 2, -2])).toBe(0.25);
  });
});

describe('intervalVarietyGain', () => {
  it('varied intervals get boost', () => {
    const gain = intervalVarietyGain([1, 3, 5, 7], 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('monotonous intervals are neutral', () => {
    const gain = intervalVarietyGain([2, 2, 2, 2, 2, 2], 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril boosts more than ambient', () => {
    const av = intervalVarietyGain([1, 3, 5, 7], 'avril', 'peak');
    const am = intervalVarietyGain([1, 3, 5, 7], 'ambient', 'peak');
    expect(av).toBeGreaterThan(am);
  });

  it('stays in 1.0-1.03 range', () => {
    const cases = [[1, 3, 5], [2, 2, 2], [1, 7, 2, 4], [3, -3, 3]];
    for (const c of cases) {
      const gain = intervalVarietyGain(c, 'avril', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('varietyStrengthValue', () => {
  it('avril is highest', () => {
    expect(varietyStrengthValue('avril')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(varietyStrengthValue('ambient')).toBe(0.20);
  });
});
