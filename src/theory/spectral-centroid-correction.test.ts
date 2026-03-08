import { describe, it, expect } from 'vitest';
import {
  centroidCorrectionLpf,
  targetCentroid,
  centroidCorrectionStrength,
} from './spectral-centroid-correction';

describe('centroidCorrectionLpf', () => {
  it('near-target LPF gets multiplier near 1.0', () => {
    const target = targetCentroid('lofi');
    const mul = centroidCorrectionLpf(target, 'lofi');
    expect(mul).toBeCloseTo(1.0, 1);
  });

  it('too-bright LPF gets reduced', () => {
    const mul = centroidCorrectionLpf(4000, 'lofi'); // way above 1600 target
    expect(mul).toBeLessThan(1.0);
  });

  it('too-dark LPF gets boosted', () => {
    const mul = centroidCorrectionLpf(500, 'lofi'); // way below 1600 target
    expect(mul).toBeGreaterThan(1.0);
  });

  it('stays in 0.7-1.3 range', () => {
    const bright = centroidCorrectionLpf(5000, 'ambient');
    const dark = centroidCorrectionLpf(200, 'ambient');
    expect(bright).toBeGreaterThanOrEqual(0.7);
    expect(dark).toBeLessThanOrEqual(1.3);
  });

  it('stronger mood corrects more aggressively', () => {
    const ambient = centroidCorrectionLpf(3000, 'ambient');
    const disco = centroidCorrectionLpf(3000, 'disco');
    // Both above target, but ambient corrects more since target is 1400 vs 3000
    // and strength is higher
    expect(ambient).toBeLessThan(disco);
  });
});

describe('targetCentroid', () => {
  it('disco is brightest', () => {
    expect(targetCentroid('disco')).toBe(3000);
  });

  it('ambient is warmest', () => {
    expect(targetCentroid('ambient')).toBe(1400);
  });
});

describe('centroidCorrectionStrength', () => {
  it('ambient is highest', () => {
    expect(centroidCorrectionStrength('ambient')).toBe(0.55);
  });

  it('disco is low', () => {
    expect(centroidCorrectionStrength('disco')).toBe(0.25);
  });
});
