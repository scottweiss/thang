import { describe, it, expect } from 'vitest';
import {
  contourDynamicGain,
  contourDynamicBrightness,
  dynamicContourCoupling,
} from './dynamic-contour';

describe('contourDynamicGain', () => {
  it('ascending is louder', () => {
    expect(contourDynamicGain(5, 'avril')).toBeGreaterThan(1.0);
  });

  it('descending is softer', () => {
    expect(contourDynamicGain(-5, 'avril')).toBeLessThan(1.0);
  });

  it('no movement returns 1.0', () => {
    expect(contourDynamicGain(0, 'avril')).toBe(1.0);
  });

  it('stays in 0.85-1.15 range', () => {
    for (const delta of [-12, -6, 0, 6, 12]) {
      const g = contourDynamicGain(delta, 'ambient');
      expect(g).toBeGreaterThanOrEqual(0.85);
      expect(g).toBeLessThanOrEqual(1.15);
    }
  });

  it('avril responds more than disco', () => {
    const avril = contourDynamicGain(6, 'avril');
    const disco = contourDynamicGain(6, 'disco');
    expect(avril - 1.0).toBeGreaterThan(disco - 1.0);
  });
});

describe('contourDynamicBrightness', () => {
  it('ascending is brighter', () => {
    expect(contourDynamicBrightness(5, 'lofi')).toBeGreaterThan(1.0);
  });

  it('descending is darker', () => {
    expect(contourDynamicBrightness(-5, 'lofi')).toBeLessThan(1.0);
  });

  it('stays in 0.9-1.1 range', () => {
    const b = contourDynamicBrightness(12, 'ambient');
    expect(b).toBeGreaterThanOrEqual(0.9);
    expect(b).toBeLessThanOrEqual(1.1);
  });
});

describe('dynamicContourCoupling', () => {
  it('avril is highest', () => {
    expect(dynamicContourCoupling('avril')).toBe(0.50);
  });

  it('disco is low', () => {
    expect(dynamicContourCoupling('disco')).toBe(0.15);
  });
});
