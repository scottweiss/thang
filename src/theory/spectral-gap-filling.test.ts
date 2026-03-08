import { describe, it, expect } from 'vitest';
import {
  gapFillingGain,
  gapSensitivity,
} from './spectral-gap-filling';

describe('gapFillingGain', () => {
  it('layer far from others gets boost', () => {
    const gain = gapFillingGain(72, [48, 55], 'ambient');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('layer close to others stays neutral', () => {
    const gain = gapFillingGain(64, [62, 66], 'ambient');
    expect(gain).toBeCloseTo(1.0, 2);
  });

  it('no other layers is neutral', () => {
    const gain = gapFillingGain(64, [], 'ambient');
    expect(gain).toBe(1.0);
  });

  it('ambient is more sensitive than disco', () => {
    const amb = gapFillingGain(72, [48], 'ambient');
    const disco = gapFillingGain(72, [48], 'disco');
    expect(amb).toBeGreaterThan(disco);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let m = 40; m <= 88; m += 6) {
      const gain = gapFillingGain(m, [60], 'ambient');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('gapSensitivity', () => {
  it('ambient is highest', () => {
    expect(gapSensitivity('ambient')).toBe(0.55);
  });

  it('disco is low', () => {
    expect(gapSensitivity('disco')).toBe(0.30);
  });
});
