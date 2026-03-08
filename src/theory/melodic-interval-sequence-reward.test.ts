import { describe, it, expect } from 'vitest';
import {
  intervalSequenceRewardGain,
  rewardSensitivityValue,
} from './melodic-interval-sequence-reward';

describe('intervalSequenceRewardGain', () => {
  it('no similarity is neutral', () => {
    const gain = intervalSequenceRewardGain(0, 'avril', 'build');
    expect(gain).toBe(1.0);
  });

  it('full similarity gets boost', () => {
    const gain = intervalSequenceRewardGain(1.0, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('higher similarity = more boost', () => {
    const half = intervalSequenceRewardGain(0.5, 'syro', 'peak');
    const full = intervalSequenceRewardGain(1.0, 'syro', 'peak');
    expect(full).toBeGreaterThan(half);
  });

  it('avril boosts more than ambient', () => {
    const av = intervalSequenceRewardGain(1.0, 'avril', 'build');
    const amb = intervalSequenceRewardGain(1.0, 'ambient', 'build');
    expect(av).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let s = 0; s <= 1.0; s += 0.1) {
      const gain = intervalSequenceRewardGain(s, 'avril', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('rewardSensitivityValue', () => {
  it('avril is high', () => {
    expect(rewardSensitivityValue('avril')).toBe(0.50);
  });

  it('ambient is lowest', () => {
    expect(rewardSensitivityValue('ambient')).toBe(0.15);
  });
});
