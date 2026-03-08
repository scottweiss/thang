import { describe, it, expect } from 'vitest';
import {
  tupletFeelGain,
  tupletStrengthValue,
} from './rhythmic-tuplet-feel';

describe('tupletFeelGain', () => {
  it('duple positions (0, 4, 8, 12) are neutral', () => {
    expect(tupletFeelGain(0, 'syro', 'groove')).toBe(1.0);
    expect(tupletFeelGain(4, 'syro', 'groove')).toBe(1.0);
    expect(tupletFeelGain(8, 'syro', 'groove')).toBe(1.0);
    expect(tupletFeelGain(12, 'syro', 'groove')).toBe(1.0);
  });

  it('position near triplet grid gets boost', () => {
    // Position 1 is near triplet position 1.33 (dist=0.33, within 0.4)
    const gain = tupletFeelGain(1, 'syro', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('position far from triplet grid is neutral', () => {
    // Position 2 is between triplet 1.33 and 2.67 — dist = 0.67 from 1.33, 0.67 from 2.67
    const gain = tupletFeelGain(2, 'syro', 'groove');
    expect(gain).toBe(1.0);
  });

  it('syro boosts more than ambient', () => {
    const syro = tupletFeelGain(1, 'syro', 'groove');
    const amb = tupletFeelGain(1, 'ambient', 'groove');
    if (syro > 1.0 && amb > 1.0) {
      expect(syro).toBeGreaterThan(amb);
    }
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = tupletFeelGain(p, 'syro', 'groove');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('tupletStrengthValue', () => {
  it('syro is highest', () => {
    expect(tupletStrengthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(tupletStrengthValue('ambient')).toBe(0.10);
  });
});
