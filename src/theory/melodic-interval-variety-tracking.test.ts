import { describe, it, expect } from 'vitest';
import {
  intervalVarietyGain,
  varietyAppetite,
} from './melodic-interval-variety-tracking';

describe('intervalVarietyGain', () => {
  it('underused interval gets boost', () => {
    const recent = [2, 2, 2, 3, 3, 2, 2]; // all 2nds and 3rds
    const gain = intervalVarietyGain(recent, 7, 'syro'); // 5th is fresh
    expect(gain).toBeGreaterThan(1.0);
  });

  it('overused interval gets reduction', () => {
    const recent = [2, 2, 2, 2, 2, 2, 2]; // all 2nds
    const gain = intervalVarietyGain(recent, 2, 'syro');
    expect(gain).toBeLessThan(1.0);
  });

  it('too few intervals is neutral', () => {
    const gain = intervalVarietyGain([2, 3], 5, 'syro');
    expect(gain).toBe(1.0);
  });

  it('syro has more appetite than ambient', () => {
    const recent = [2, 2, 2, 2, 2];
    const syro = intervalVarietyGain(recent, 7, 'syro');
    const amb = intervalVarietyGain(recent, 7, 'ambient');
    expect(syro).toBeGreaterThan(amb);
  });

  it('stays in 0.96-1.04 range', () => {
    const recent = [1, 2, 3, 4, 5, 6, 7];
    for (let i = 1; i <= 12; i++) {
      const gain = intervalVarietyGain(recent, i, 'syro');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('varietyAppetite', () => {
  it('syro is highest', () => {
    expect(varietyAppetite('syro')).toBe(0.60);
  });

  it('ambient is low', () => {
    expect(varietyAppetite('ambient')).toBe(0.25);
  });
});
