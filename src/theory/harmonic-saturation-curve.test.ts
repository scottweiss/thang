import { describe, it, expect } from 'vitest';
import {
  saturationGainReduction,
  saturationLpfCorrection,
  saturationThreshold,
} from './harmonic-saturation-curve';

describe('saturationGainReduction', () => {
  it('no reduction below threshold', () => {
    expect(saturationGainReduction(3, 'lofi')).toBe(1.0);
  });

  it('reduces above threshold', () => {
    expect(saturationGainReduction(7, 'trance')).toBeLessThan(1.0);
  });

  it('more voices = more reduction', () => {
    const five = saturationGainReduction(5, 'trance');
    const seven = saturationGainReduction(7, 'trance');
    expect(seven).toBeLessThan(five);
  });

  it('stays above 0.7', () => {
    expect(saturationGainReduction(10, 'disco')).toBeGreaterThanOrEqual(0.7);
  });

  it('lofi tolerates more than disco', () => {
    const lofi = saturationGainReduction(5, 'lofi');
    const disco = saturationGainReduction(5, 'disco');
    expect(lofi).toBeGreaterThan(disco);
  });
});

describe('saturationLpfCorrection', () => {
  it('no correction below threshold', () => {
    expect(saturationLpfCorrection(3, 'lofi')).toBe(1.0);
  });

  it('darkens above threshold', () => {
    expect(saturationLpfCorrection(7, 'trance')).toBeLessThan(1.0);
  });

  it('stays above 0.8', () => {
    expect(saturationLpfCorrection(10, 'disco')).toBeGreaterThanOrEqual(0.8);
  });
});

describe('saturationThreshold', () => {
  it('syro is highest', () => {
    expect(saturationThreshold('syro')).toBe(6.0);
  });

  it('disco is lowest', () => {
    expect(saturationThreshold('disco')).toBe(3.0);
  });
});
