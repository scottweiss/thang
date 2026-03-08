import { describe, it, expect } from 'vitest';
import {
  syncopationRewardGain,
  syncopationStrength,
} from './rhythmic-syncopation-reward';

describe('syncopationRewardGain', () => {
  it('off-beat gets boost in groove mood', () => {
    const gain = syncopationRewardGain(true, 'lofi');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('on-beat gets slight reduction in groove mood', () => {
    const gain = syncopationRewardGain(false, 'lofi');
    expect(gain).toBeLessThan(1.0);
  });

  it('lofi rewards more than ambient', () => {
    const lofi = syncopationRewardGain(true, 'lofi');
    const amb = syncopationRewardGain(true, 'ambient');
    expect(lofi).toBeGreaterThan(amb);
  });

  it('stays in 0.97-1.04 range', () => {
    for (const offbeat of [true, false]) {
      const gain = syncopationRewardGain(offbeat, 'syro');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('syncopationStrength', () => {
  it('syro is highest', () => {
    expect(syncopationStrength('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(syncopationStrength('ambient')).toBe(0.10);
  });
});
