import { describe, it, expect } from 'vitest';
import {
  fluxCorrection,
  estimateFlux,
  targetFlux,
} from './spectral-flux';

describe('fluxCorrection', () => {
  it('boosts when flux is low', () => {
    const corr = fluxCorrection(0.1, 'xtal', 'build');
    expect(corr).toBeGreaterThan(1.0);
  });

  it('reduces when flux is high', () => {
    const corr = fluxCorrection(0.9, 'disco', 'build');
    expect(corr).toBeLessThan(1.0);
  });

  it('neutral when near target', () => {
    const target = targetFlux('lofi');
    const corr = fluxCorrection(target, 'lofi', 'build');
    expect(corr).toBe(1.0);
  });

  it('stays in 0.5-2.0 range', () => {
    for (const flux of [0, 0.1, 0.3, 0.5, 0.8, 1.0]) {
      const c = fluxCorrection(flux, 'ambient', 'peak');
      expect(c).toBeGreaterThanOrEqual(0.5);
      expect(c).toBeLessThanOrEqual(2.0);
    }
  });
});

describe('estimateFlux', () => {
  it('stable LPF gives low flux', () => {
    expect(estimateFlux([1000, 1000, 1000])).toBe(0);
  });

  it('changing LPF gives higher flux', () => {
    const flux = estimateFlux([1000, 1200, 800]);
    expect(flux).toBeGreaterThan(0);
  });

  it('single value returns 0.5', () => {
    expect(estimateFlux([1000])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    expect(estimateFlux([100, 5000, 200, 4000])).toBeLessThanOrEqual(1.0);
    expect(estimateFlux([100, 5000, 200, 4000])).toBeGreaterThanOrEqual(0.0);
  });
});

describe('targetFlux', () => {
  it('xtal is highest', () => {
    expect(targetFlux('xtal')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(targetFlux('disco')).toBe(0.25);
  });
});
