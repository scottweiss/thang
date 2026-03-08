import { describe, it, expect } from 'vitest';
import {
  polymetricAccentGain,
  polymetricDepthValue,
} from './rhythmic-polymetric-accent';

describe('polymetricAccentGain', () => {
  it('position 0 always gets accent', () => {
    const gain = polymetricAccentGain(0, 0, 'syro', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-aligned position is neutral', () => {
    // tick=0 → meter=3, position 1 is not divisible by 3
    const gain = polymetricAccentGain(1, 0, 'syro', 'groove');
    expect(gain).toBe(1.0);
  });

  it('meter evolves with tick', () => {
    const values = new Set<string>();
    for (let t = 0; t < 24; t++) {
      // Position 5: divisible by 5 (meter B) but not 3 or 7
      values.add(polymetricAccentGain(5, t, 'syro', 'groove').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('syro accents more than ambient', () => {
    let syroSum = 0;
    let ambSum = 0;
    for (let p = 0; p < 16; p++) {
      syroSum += polymetricAccentGain(p, 0, 'syro', 'groove');
      ambSum += polymetricAccentGain(p, 0, 'ambient', 'groove');
    }
    expect(syroSum).toBeGreaterThan(ambSum);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let t = 0; t < 30; t++) {
      for (let p = 0; p < 16; p++) {
        const gain = polymetricAccentGain(p, t, 'syro', 'groove');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('polymetricDepthValue', () => {
  it('syro is highest', () => {
    expect(polymetricDepthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(polymetricDepthValue('ambient')).toBe(0.10);
  });
});
