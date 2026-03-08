import { describe, it, expect } from 'vitest';
import {
  countCommonTones,
  commonTonePreservationGain,
  preserveStrengthValue,
} from './harmonic-common-tone-preservation';

describe('countCommonTones', () => {
  it('identical chords share all tones', () => {
    expect(countCommonTones([0, 4, 7], [0, 4, 7])).toBe(3);
  });

  it('C major and A minor share C and E', () => {
    expect(countCommonTones([0, 4, 7], [9, 0, 4])).toBe(2);
  });

  it('no common tones', () => {
    expect(countCommonTones([0, 4, 7], [1, 5, 8])).toBe(0);
  });

  it('one common tone', () => {
    expect(countCommonTones([0, 4, 7], [2, 7, 11])).toBe(1);
  });
});

describe('commonTonePreservationGain', () => {
  it('common tones get boost', () => {
    const gain = commonTonePreservationGain([0, 4, 7], [9, 0, 4], 'ambient', 'breakdown');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('no common tones is neutral', () => {
    const gain = commonTonePreservationGain([0, 4, 7], [1, 5, 8], 'ambient', 'breakdown');
    expect(gain).toBe(1.0);
  });

  it('more common tones = more boost', () => {
    const two = commonTonePreservationGain([0, 4, 7], [9, 0, 4], 'ambient', 'breakdown');
    const three = commonTonePreservationGain([0, 4, 7], [0, 4, 7], 'ambient', 'breakdown');
    expect(three).toBeGreaterThan(two);
  });

  it('ambient boosts more than syro', () => {
    const amb = commonTonePreservationGain([0, 4, 7], [9, 0, 4], 'ambient', 'build');
    const syro = commonTonePreservationGain([0, 4, 7], [9, 0, 4], 'syro', 'build');
    expect(amb).toBeGreaterThan(syro);
  });

  it('stays in 1.0-1.03 range', () => {
    const chords = [[0, 4, 7], [2, 5, 9], [4, 7, 11], [0, 3, 7, 10]];
    for (const a of chords) {
      for (const b of chords) {
        const gain = commonTonePreservationGain(a, b, 'ambient', 'breakdown');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.03);
      }
    }
  });
});

describe('preserveStrengthValue', () => {
  it('ambient is highest', () => {
    expect(preserveStrengthValue('ambient')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(preserveStrengthValue('syro')).toBe(0.15);
  });
});
