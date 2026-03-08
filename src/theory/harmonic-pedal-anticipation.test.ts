import { describe, it, expect } from 'vitest';
import {
  anticipationWeight,
  shouldAnticipate,
  pedalAnticipationStrength,
} from './harmonic-pedal-anticipation';

describe('anticipationWeight', () => {
  it('next root gets highest weight near change', () => {
    const onRoot = anticipationWeight(7, 7, 1, 'lofi');
    const farFromRoot = anticipationWeight(1, 7, 1, 'lofi');
    expect(onRoot).toBeGreaterThan(farFromRoot);
  });

  it('no anticipation when change is far', () => {
    expect(anticipationWeight(7, 7, 5, 'lofi')).toBe(1.0);
  });

  it('more urgent closer to change', () => {
    const oneAway = anticipationWeight(7, 7, 1, 'lofi');
    const twoAway = anticipationWeight(7, 7, 2, 'lofi');
    expect(oneAway).toBeGreaterThan(twoAway);
  });

  it('lofi anticipates more than syro', () => {
    const lofi = anticipationWeight(7, 7, 1, 'lofi');
    const syro = anticipationWeight(7, 7, 1, 'syro');
    expect(lofi).toBeGreaterThan(syro);
  });

  it('stays in 0.8-1.5 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const w = anticipationWeight(pc, 0, 1, 'avril');
      expect(w).toBeGreaterThanOrEqual(0.8);
      expect(w).toBeLessThanOrEqual(1.5);
    }
  });
});

describe('shouldAnticipate', () => {
  it('true when change is near for lofi', () => {
    expect(shouldAnticipate(1, 'lofi')).toBe(true);
  });

  it('false when change is far', () => {
    expect(shouldAnticipate(5, 'lofi')).toBe(false);
  });
});

describe('pedalAnticipationStrength', () => {
  it('lofi is highest', () => {
    expect(pedalAnticipationStrength('lofi')).toBe(0.55);
  });

  it('syro is low', () => {
    expect(pedalAnticipationStrength('syro')).toBe(0.20);
  });
});
