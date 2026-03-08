import { describe, it, expect } from 'vitest';
import {
  isAnticipation,
  anticipationGain,
  anticipationStrengthValue,
} from './rhythmic-displacement-anticipation';

describe('isAnticipation', () => {
  it('position 15 anticipates beat 1 (strongest)', () => {
    expect(isAnticipation(15)).toBe(1.0);
  });

  it('position 7 anticipates beat 3', () => {
    expect(isAnticipation(7)).toBe(0.8);
  });

  it('position 3 anticipates beat 2', () => {
    expect(isAnticipation(3)).toBe(0.7);
  });

  it('strong beat positions are not anticipations', () => {
    expect(isAnticipation(0)).toBe(0);
    expect(isAnticipation(4)).toBe(0);
    expect(isAnticipation(8)).toBe(0);
  });

  it('mid-beat positions are not anticipations', () => {
    expect(isAnticipation(2)).toBe(0);
    expect(isAnticipation(6)).toBe(0);
  });
});

describe('anticipationGain', () => {
  it('anticipated position gets boost', () => {
    const gain = anticipationGain(15, 'syro', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-anticipated position is neutral', () => {
    const gain = anticipationGain(0, 'syro', 'groove');
    expect(gain).toBe(1.0);
  });

  it('syro boosts more than ambient', () => {
    const sy = anticipationGain(15, 'syro', 'groove');
    const am = anticipationGain(15, 'ambient', 'groove');
    expect(sy).toBeGreaterThan(am);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = anticipationGain(p, 'syro', 'groove');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('anticipationStrengthValue', () => {
  it('syro is highest', () => {
    expect(anticipationStrengthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(anticipationStrengthValue('ambient')).toBe(0.10);
  });
});
