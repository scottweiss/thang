import { describe, it, expect } from 'vitest';
import {
  isChromaticMediant,
  chromaticMediantFm,
  mediantStrengthValue,
} from './harmonic-chromatic-mediant';

describe('isChromaticMediant', () => {
  it('major third up is mediant', () => {
    expect(isChromaticMediant(4)).toBe(true);
  });

  it('minor third up is mediant', () => {
    expect(isChromaticMediant(3)).toBe(true);
  });

  it('major sixth (inverted minor third) is mediant', () => {
    expect(isChromaticMediant(9)).toBe(true);
  });

  it('minor sixth (inverted major third) is mediant', () => {
    expect(isChromaticMediant(8)).toBe(true);
  });

  it('perfect fifth is not mediant', () => {
    expect(isChromaticMediant(7)).toBe(false);
  });

  it('semitone is not mediant', () => {
    expect(isChromaticMediant(1)).toBe(false);
  });

  it('negative interval normalizes correctly', () => {
    expect(isChromaticMediant(-4)).toBe(true); // -4 mod 12 = 8, which is mediant
  });
});

describe('chromaticMediantFm', () => {
  it('mediant with mode change gets boost', () => {
    const fm = chromaticMediantFm(0, 4, true, 'avril', 'peak');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('non-mediant is neutral', () => {
    const fm = chromaticMediantFm(0, 7, true, 'avril', 'peak');
    expect(fm).toBe(1.0);
  });

  it('mode change boosts more than same mode', () => {
    const withChange = chromaticMediantFm(0, 4, true, 'avril', 'peak');
    const withoutChange = chromaticMediantFm(0, 4, false, 'avril', 'peak');
    expect(withChange).toBeGreaterThan(withoutChange);
  });

  it('avril boosts more than blockhead', () => {
    const av = chromaticMediantFm(0, 4, true, 'avril', 'peak');
    const bh = chromaticMediantFm(0, 4, true, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let p = 0; p < 12; p++) {
      for (let c = 0; c < 12; c++) {
        const fm = chromaticMediantFm(p, c, true, 'avril', 'peak');
        expect(fm).toBeGreaterThanOrEqual(1.0);
        expect(fm).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('mediantStrengthValue', () => {
  it('avril is highest', () => {
    expect(mediantStrengthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(mediantStrengthValue('blockhead')).toBe(0.15);
  });
});
