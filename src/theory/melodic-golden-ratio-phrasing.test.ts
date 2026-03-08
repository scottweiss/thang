import { describe, it, expect } from 'vitest';
import {
  goldenRatioPhrasingGain,
  goldenStrengthValue,
} from './melodic-golden-ratio-phrasing';

describe('goldenRatioPhrasingGain', () => {
  it('at golden ratio gets max boost', () => {
    const gain = goldenRatioPhrasingGain(0.618, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('far from golden ratio is neutral', () => {
    const gain = goldenRatioPhrasingGain(0.1, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('closer to phi = more boost', () => {
    const near = goldenRatioPhrasingGain(0.55, 'avril', 'peak');
    const at = goldenRatioPhrasingGain(0.618, 'avril', 'peak');
    expect(at).toBeGreaterThan(near);
  });

  it('avril boosts more than blockhead', () => {
    const av = goldenRatioPhrasingGain(0.618, 'avril', 'peak');
    const bh = goldenRatioPhrasingGain(0.618, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p <= 1.0; p += 0.05) {
      const gain = goldenRatioPhrasingGain(p, 'avril', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('goldenStrengthValue', () => {
  it('avril is highest', () => {
    expect(goldenStrengthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(goldenStrengthValue('blockhead')).toBe(0.15);
  });
});
