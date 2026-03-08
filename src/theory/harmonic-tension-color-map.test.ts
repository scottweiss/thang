import { describe, it, expect } from 'vitest';
import {
  tensionColorLpf,
  colorRange,
} from './harmonic-tension-color-map';

describe('tensionColorLpf', () => {
  it('high tension is brighter (> 1)', () => {
    const lpf = tensionColorLpf(0.9, 'ambient');
    expect(lpf).toBeGreaterThan(1.0);
  });

  it('low tension is warmer (< 1)', () => {
    const lpf = tensionColorLpf(0.1, 'ambient');
    expect(lpf).toBeLessThan(1.0);
  });

  it('mid tension is neutral', () => {
    const lpf = tensionColorLpf(0.5, 'ambient');
    expect(lpf).toBeCloseTo(1.0, 2);
  });

  it('ambient has wider range than disco', () => {
    const ambHigh = tensionColorLpf(0.9, 'ambient');
    const discoHigh = tensionColorLpf(0.9, 'disco');
    expect(ambHigh).toBeGreaterThan(discoHigh);
  });

  it('stays in 0.96-1.04 range', () => {
    for (let t = 0; t <= 1.0; t += 0.1) {
      const lpf = tensionColorLpf(t, 'ambient');
      expect(lpf).toBeGreaterThanOrEqual(0.96);
      expect(lpf).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('colorRange', () => {
  it('ambient is highest', () => {
    expect(colorRange('ambient')).toBe(0.55);
  });

  it('disco is lowest', () => {
    expect(colorRange('disco')).toBe(0.25);
  });
});
