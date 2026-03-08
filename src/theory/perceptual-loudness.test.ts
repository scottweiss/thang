import { describe, it, expect } from 'vitest';
import {
  perceptualGainCorrection,
  normalizationStrength,
} from './perceptual-loudness';

describe('perceptualGainCorrection', () => {
  it('low frequency needs boost', () => {
    const low = perceptualGainCorrection(80, 'blockhead');
    expect(low).toBeGreaterThan(1.0);
  });

  it('mid frequency needs less correction', () => {
    const mid = perceptualGainCorrection(2000, 'blockhead');
    const low = perceptualGainCorrection(80, 'blockhead');
    expect(mid).toBeLessThan(low);
  });

  it('high frequency needs some boost', () => {
    const high = perceptualGainCorrection(8000, 'blockhead');
    expect(high).toBeGreaterThan(1.0);
  });

  it('stays in 0.85-1.25 range', () => {
    const freqs = [40, 80, 200, 500, 1000, 2000, 4000, 8000];
    for (const f of freqs) {
      const gain = perceptualGainCorrection(f, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.85);
      expect(gain).toBeLessThanOrEqual(1.25);
    }
  });

  it('ambient applies less correction than blockhead', () => {
    const ambient = perceptualGainCorrection(80, 'ambient');
    const blockhead = perceptualGainCorrection(80, 'blockhead');
    expect(Math.abs(ambient - 1.0)).toBeLessThan(Math.abs(blockhead - 1.0));
  });
});

describe('normalizationStrength', () => {
  it('blockhead and avril are highest', () => {
    expect(normalizationStrength('blockhead')).toBe(0.50);
    expect(normalizationStrength('avril')).toBe(0.50);
  });

  it('ambient is low', () => {
    expect(normalizationStrength('ambient')).toBe(0.20);
  });
});
