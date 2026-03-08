import { describe, it, expect } from 'vitest';
import {
  regularityRewardGain,
  rewardStrength,
} from './rhythmic-regularity-reward';

describe('regularityRewardGain', () => {
  it('high regularity gets boost', () => {
    const gain = regularityRewardGain(0.9, 'trance', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('low regularity gets reduction', () => {
    const gain = regularityRewardGain(0.1, 'trance', 'groove');
    expect(gain).toBeLessThan(1.0);
  });

  it('mid regularity is near neutral', () => {
    const gain = regularityRewardGain(0.5, 'trance', 'groove');
    expect(gain).toBeCloseTo(1.0, 2);
  });

  it('trance rewards more than ambient', () => {
    const tr = regularityRewardGain(0.9, 'trance', 'groove');
    const amb = regularityRewardGain(0.9, 'ambient', 'groove');
    expect(tr).toBeGreaterThan(amb);
  });

  it('groove section rewards more than breakdown', () => {
    const gr = regularityRewardGain(0.9, 'trance', 'groove');
    const bd = regularityRewardGain(0.9, 'trance', 'breakdown');
    expect(gr).toBeGreaterThan(bd);
  });

  it('stays in 0.97-1.04 range', () => {
    for (let s = 0; s <= 1.0; s += 0.1) {
      const gain = regularityRewardGain(s, 'trance', 'peak');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('rewardStrength', () => {
  it('trance is high', () => {
    expect(rewardStrength('trance')).toBe(0.60);
  });

  it('ambient is low', () => {
    expect(rewardStrength('ambient')).toBe(0.10);
  });
});
