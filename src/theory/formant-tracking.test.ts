import { describe, it, expect } from 'vitest';
import {
  formantLpf,
  formantLpfMultiplier,
  formantStrength,
} from './formant-tracking';

describe('formantLpf', () => {
  it('low notes give lower LPF', () => {
    const low = formantLpf(40, 'lofi');
    const high = formantLpf(80, 'lofi');
    expect(low).toBeLessThan(high);
  });

  it('returns reasonable frequencies', () => {
    const lpf = formantLpf(60, 'ambient');
    expect(lpf).toBeGreaterThan(500);
    expect(lpf).toBeLessThan(2500);
  });

  it('stronger mood has more variation from neutral', () => {
    const ambient = formantLpf(40, 'ambient');
    const disco = formantLpf(40, 'disco');
    // Ambient should deviate more from 1500 (neutral)
    expect(Math.abs(ambient - 1500)).toBeGreaterThan(Math.abs(disco - 1500));
  });
});

describe('formantLpfMultiplier', () => {
  it('returns ratio near 1.0 when LPF matches formant', () => {
    const target = formantLpf(60, 'lofi');
    const mul = formantLpfMultiplier(60, target, 'lofi');
    expect(mul).toBeCloseTo(1.0, 1);
  });

  it('stays in 0.6-1.5 range', () => {
    const mul = formantLpfMultiplier(36, 3000, 'ambient');
    expect(mul).toBeGreaterThanOrEqual(0.6);
    expect(mul).toBeLessThanOrEqual(1.5);
  });
});

describe('formantStrength', () => {
  it('ambient is high', () => {
    expect(formantStrength('ambient')).toBe(0.55);
  });

  it('disco is low', () => {
    expect(formantStrength('disco')).toBe(0.15);
  });
});
