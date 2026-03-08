import { describe, it, expect } from 'vitest';
import {
  smoothedCentroid,
  centroidMomentumCorrection,
  centroidInertia,
} from './spectral-centroid-momentum';

describe('smoothedCentroid', () => {
  it('small changes pass through', () => {
    const result = smoothedCentroid(1000, 1100, 'ambient');
    expect(result).toBeCloseTo(1100, -1);
  });

  it('large jumps are damped', () => {
    const result = smoothedCentroid(1000, 3000, 'ambient');
    // Should be less than target due to damping
    expect(result).toBeLessThan(3000);
    expect(result).toBeGreaterThan(1000);
  });

  it('high-inertia mood damps more', () => {
    const ambient = smoothedCentroid(1000, 3000, 'ambient');
    const syro = smoothedCentroid(1000, 3000, 'syro');
    // syro allows faster change (closer to target)
    expect(syro).toBeGreaterThan(ambient);
  });

  it('same value returns same', () => {
    expect(smoothedCentroid(2000, 2000, 'trance')).toBe(2000);
  });
});

describe('centroidMomentumCorrection', () => {
  it('no change returns 1.0', () => {
    expect(centroidMomentumCorrection(2000, 2000, 'lofi')).toBe(1.0);
  });

  it('stays in 0.7-1.3 range', () => {
    const mul = centroidMomentumCorrection(1000, 4000, 'ambient');
    expect(mul).toBeGreaterThanOrEqual(0.7);
    expect(mul).toBeLessThanOrEqual(1.3);
  });

  it('zero target returns 1.0', () => {
    expect(centroidMomentumCorrection(1000, 0, 'trance')).toBe(1.0);
  });
});

describe('centroidInertia', () => {
  it('ambient is highest', () => {
    expect(centroidInertia('ambient')).toBe(0.65);
  });

  it('syro is low', () => {
    expect(centroidInertia('syro')).toBe(0.20);
  });
});
