import { describe, it, expect } from 'vitest';
import {
  peakSpacingQuality,
  peakSpacingGain,
  spacingStrengthValue,
} from './melodic-peak-spacing';

describe('peakSpacingQuality', () => {
  it('clustered peaks (< minSpacing) = 0', () => {
    expect(peakSpacingQuality(1)).toBe(0);
  });

  it('well-spaced peaks (>= idealSpacing) = 1', () => {
    expect(peakSpacingQuality(6)).toBe(1.0);
    expect(peakSpacingQuality(10)).toBe(1.0);
  });

  it('mid-range spacing is partial', () => {
    const q = peakSpacingQuality(4);
    expect(q).toBeGreaterThan(0);
    expect(q).toBeLessThan(1.0);
  });

  it('exactly at minSpacing = 0', () => {
    expect(peakSpacingQuality(2)).toBe(0);
  });
});

describe('peakSpacingGain', () => {
  it('well-spaced peak gets boost', () => {
    const gain = peakSpacingGain(8, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('clustered peak is neutral', () => {
    const gain = peakSpacingGain(1, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril boosts more than blockhead', () => {
    const av = peakSpacingGain(8, 'avril', 'peak');
    const bh = peakSpacingGain(8, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let t = 0; t <= 12; t++) {
      const gain = peakSpacingGain(t, 'avril', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('spacingStrengthValue', () => {
  it('avril is highest', () => {
    expect(spacingStrengthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(spacingStrengthValue('blockhead')).toBe(0.20);
  });
});
