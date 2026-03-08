import { describe, it, expect } from 'vitest';
import {
  spectralDensityFm,
  controlStrength,
} from './spectral-density-control';

describe('spectralDensityFm', () => {
  it('3 layers is near neutral', () => {
    const fm = spectralDensityFm(3, 'ambient');
    expect(fm).toBeCloseTo(1.0, 2);
  });

  it('6 layers reduces FM', () => {
    const fm = spectralDensityFm(6, 'ambient');
    expect(fm).toBeLessThan(1.0);
  });

  it('1 layer boosts FM', () => {
    const fm = spectralDensityFm(1, 'ambient');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('ambient controls more than syro', () => {
    const amb = spectralDensityFm(6, 'ambient');
    const syro = spectralDensityFm(6, 'syro');
    expect(amb).toBeLessThan(syro);
  });

  it('stays in 0.75-1.15 range', () => {
    for (let c = 1; c <= 6; c++) {
      const fm = spectralDensityFm(c, 'ambient');
      expect(fm).toBeGreaterThanOrEqual(0.75);
      expect(fm).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('controlStrength', () => {
  it('ambient is highest', () => {
    expect(controlStrength('ambient')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(controlStrength('syro')).toBe(0.30);
  });
});
