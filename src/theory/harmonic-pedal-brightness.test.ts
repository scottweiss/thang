import { describe, it, expect } from 'vitest';
import {
  pedalBrightnessLpf,
  darkeningRate,
} from './harmonic-pedal-brightness';

describe('pedalBrightnessLpf', () => {
  it('fresh note is near 1.0', () => {
    const lpf = pedalBrightnessLpf(0, 'ambient');
    expect(lpf).toBeCloseTo(1.0, 2);
  });

  it('sustained note darkens', () => {
    const lpf = pedalBrightnessLpf(5, 'ambient');
    expect(lpf).toBeLessThan(1.0);
  });

  it('ambient darkens faster than disco', () => {
    const amb = pedalBrightnessLpf(4, 'ambient');
    const disco = pedalBrightnessLpf(4, 'disco');
    expect(amb).toBeLessThan(disco);
  });

  it('stays in 0.90-1.0 range', () => {
    for (let t = 0; t <= 10; t++) {
      const lpf = pedalBrightnessLpf(t, 'ambient');
      expect(lpf).toBeGreaterThanOrEqual(0.90);
      expect(lpf).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('darkeningRate', () => {
  it('ambient is highest', () => {
    expect(darkeningRate('ambient')).toBe(0.60);
  });

  it('disco is lowest', () => {
    expect(darkeningRate('disco')).toBe(0.15);
  });
});
