import { describe, it, expect } from 'vitest';
import {
  estimateCentroid,
  centroidDeviation,
  lpfCorrectionMultiplier,
  shouldCorrectCentroid,
  targetCentroid,
} from './spectral-centroid';

describe('estimateCentroid', () => {
  it('averages LPF values', () => {
    expect(estimateCentroid([1000, 3000])).toBe(2000);
  });

  it('single value returns itself', () => {
    expect(estimateCentroid([2500])).toBe(2500);
  });

  it('empty returns default', () => {
    expect(estimateCentroid([])).toBe(2000);
  });
});

describe('centroidDeviation', () => {
  it('positive when too bright', () => {
    const dev = centroidDeviation(3500, 'ambient', 'groove');
    expect(dev).toBeGreaterThan(0);
  });

  it('negative when too dark', () => {
    const dev = centroidDeviation(1000, 'trance', 'peak');
    expect(dev).toBeLessThan(0);
  });

  it('near zero when on target', () => {
    // trance target=2800, peak offset=+300 → target=3100
    const dev = centroidDeviation(3100, 'trance', 'peak');
    expect(Math.abs(dev)).toBeLessThan(50);
  });
});

describe('lpfCorrectionMultiplier', () => {
  it('darkens when too bright', () => {
    const mult = lpfCorrectionMultiplier(500, 'trance');
    expect(mult).toBeLessThan(1.0);
  });

  it('brightens when too dark', () => {
    const mult = lpfCorrectionMultiplier(-500, 'trance');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('near 1.0 when on target', () => {
    const mult = lpfCorrectionMultiplier(0, 'lofi');
    expect(mult).toBeCloseTo(1.0, 2);
  });

  it('clamps to 0.75-1.25', () => {
    expect(lpfCorrectionMultiplier(5000, 'trance')).toBeGreaterThanOrEqual(0.75);
    expect(lpfCorrectionMultiplier(-5000, 'trance')).toBeLessThanOrEqual(1.25);
  });
});

describe('shouldCorrectCentroid', () => {
  it('does not correct small deviation', () => {
    expect(shouldCorrectCentroid(100, 'trance')).toBe(false);
  });

  it('corrects large deviation', () => {
    expect(shouldCorrectCentroid(500, 'trance')).toBe(true);
  });

  it('ambient is more tolerant', () => {
    // 400 exceeds trance tolerance (300) but not ambient (500)
    expect(shouldCorrectCentroid(400, 'trance')).toBe(true);
    expect(shouldCorrectCentroid(400, 'ambient')).toBe(false);
  });
});

describe('targetCentroid', () => {
  it('trance is brightest', () => {
    expect(targetCentroid('trance')).toBe(2800);
  });

  it('ambient is darkest', () => {
    expect(targetCentroid('ambient')).toBe(1600);
  });
});
