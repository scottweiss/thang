import { describe, it, expect } from 'vitest';
import {
  resonanceTarget,
  trackingLpf,
  trackingAccuracy,
} from './resonance-frequency-tracking';

describe('resonanceTarget', () => {
  it('fundamental is in bass range', () => {
    const freq = resonanceTarget(0, 1); // C2
    expect(freq).toBeGreaterThan(60);
    expect(freq).toBeLessThan(70);
  });

  it('higher harmonics are multiples', () => {
    const fund = resonanceTarget(0, 1);
    const third = resonanceTarget(0, 3);
    expect(third).toBeCloseTo(fund * 3, 0);
  });

  it('different roots give different frequencies', () => {
    expect(resonanceTarget(0, 1)).not.toBeCloseTo(resonanceTarget(7, 1), 0);
  });
});

describe('trackingLpf', () => {
  it('moves toward harmonic target', () => {
    const original = 2000;
    const tracked = trackingLpf(0, original, 'syro');
    // Should shift from 2000 toward a root harmonic
    expect(tracked).not.toBeCloseTo(original, 0);
  });

  it('syro tracks more than ambient', () => {
    const base = 2000;
    const syro = trackingLpf(0, base, 'syro');
    const ambient = trackingLpf(0, base, 'ambient');
    expect(Math.abs(syro - base)).toBeGreaterThan(Math.abs(ambient - base));
  });

  it('stays positive', () => {
    expect(trackingLpf(0, 1000, 'syro')).toBeGreaterThan(0);
  });
});

describe('trackingAccuracy', () => {
  it('syro is highest', () => {
    expect(trackingAccuracy('syro')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(trackingAccuracy('ambient')).toBe(0.25);
  });
});
