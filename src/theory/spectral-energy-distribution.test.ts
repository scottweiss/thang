import { describe, it, expect } from 'vitest';
import {
  layerBand,
  spectralDistributionScore,
  spectralBalanceLpf,
  balanceStrictness,
} from './spectral-energy-distribution';

describe('layerBand', () => {
  it('drone is low', () => {
    expect(layerBand('drone')).toBe('low');
  });

  it('melody is high', () => {
    expect(layerBand('melody')).toBe('high');
  });

  it('harmony is mid', () => {
    expect(layerBand('harmony')).toBe('mid');
  });
});

describe('spectralDistributionScore', () => {
  it('empty is perfect', () => {
    expect(spectralDistributionScore([])).toBe(1.0);
  });

  it('balanced layers score higher', () => {
    const balanced = spectralDistributionScore(['drone', 'harmony', 'melody']);
    const unbalanced = spectralDistributionScore(['drone', 'atmosphere', 'harmony']);
    expect(balanced).toBeGreaterThanOrEqual(unbalanced);
  });

  it('stays in 0-1 range', () => {
    const score = spectralDistributionScore(['drone', 'drone', 'drone', 'harmony']);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('spectralBalanceLpf', () => {
  it('balanced mix returns 1.0', () => {
    const mul = spectralBalanceLpf('harmony', ['drone', 'harmony', 'melody'], 'trance');
    expect(mul).toBeCloseTo(1.0, 1);
  });

  it('stays in 0.8-1.2 range', () => {
    const mul = spectralBalanceLpf('harmony', ['harmony', 'texture', 'arp', 'melody'], 'blockhead');
    expect(mul).toBeGreaterThanOrEqual(0.8);
    expect(mul).toBeLessThanOrEqual(1.2);
  });
});

describe('balanceStrictness', () => {
  it('blockhead is strict', () => {
    expect(balanceStrictness('blockhead')).toBe(0.55);
  });

  it('syro is relaxed', () => {
    expect(balanceStrictness('syro')).toBe(0.25);
  });
});
