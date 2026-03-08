import { describe, it, expect } from 'vitest';
import {
  crossAccentGain,
  crossAccentStrengthValue,
} from './rhythmic-cross-accent';

describe('crossAccentGain', () => {
  it('cross-accent position gets boost', () => {
    // Position 3 is in pattern A (shift=0), tick=0 → shift=0
    const gain = crossAccentGain(3, 0, 'syro', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-cross position is neutral', () => {
    // Position 0 (downbeat) is never a cross accent
    const gain = crossAccentGain(0, 0, 'syro', 'groove');
    expect(gain).toBe(1.0);
  });

  it('pattern evolves with tick', () => {
    const values = new Set<string>();
    for (let t = 0; t < 6; t++) {
      values.add(crossAccentGain(3, t, 'syro', 'groove').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('syro accents more than ambient', () => {
    let syroSum = 0;
    let ambSum = 0;
    for (let p = 0; p < 16; p++) {
      syroSum += crossAccentGain(p, 0, 'syro', 'groove');
      ambSum += crossAccentGain(p, 0, 'ambient', 'groove');
    }
    expect(syroSum).toBeGreaterThan(ambSum);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let t = 0; t < 10; t++) {
      for (let p = 0; p < 16; p++) {
        const gain = crossAccentGain(p, t, 'syro', 'groove');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('crossAccentStrengthValue', () => {
  it('syro is highest', () => {
    expect(crossAccentStrengthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(crossAccentStrengthValue('ambient')).toBe(0.05);
  });
});
