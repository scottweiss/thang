import { describe, it, expect } from 'vitest';
import {
  spectralTiltLpf,
  spectralTiltHpf,
  shouldApplySpectralTilt,
  tiltStrength,
} from './spectral-tilt';

describe('spectralTiltLpf', () => {
  it('peak section is brightest', () => {
    const peak = spectralTiltLpf(0.5, 'trance', 'peak');
    const breakdown = spectralTiltLpf(0.5, 'trance', 'breakdown');
    expect(peak).toBeGreaterThan(breakdown);
  });

  it('builds get brighter with progress', () => {
    const early = spectralTiltLpf(0.1, 'trance', 'build');
    const late = spectralTiltLpf(0.9, 'trance', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('breakdowns get darker with progress', () => {
    const early = spectralTiltLpf(0.1, 'trance', 'breakdown');
    const late = spectralTiltLpf(0.9, 'trance', 'breakdown');
    expect(late).toBeLessThan(early);
  });

  it('clamped between 0.7 and 1.3', () => {
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      for (let p = 0; p <= 1; p += 0.25) {
        const lpf = spectralTiltLpf(p, 'trance', section);
        expect(lpf).toBeGreaterThanOrEqual(0.7);
        expect(lpf).toBeLessThanOrEqual(1.3);
      }
    }
  });

  it('ambient has less tilt than trance', () => {
    const tranceDiff = spectralTiltLpf(0.5, 'trance', 'peak') - spectralTiltLpf(0.5, 'trance', 'breakdown');
    const ambientDiff = spectralTiltLpf(0.5, 'ambient', 'peak') - spectralTiltLpf(0.5, 'ambient', 'breakdown');
    expect(tranceDiff).toBeGreaterThan(ambientDiff);
  });
});

describe('spectralTiltHpf', () => {
  it('bright sections raise HPF', () => {
    const peak = spectralTiltHpf(0.5, 'trance', 'peak');
    expect(peak).toBeGreaterThan(1.0);
  });

  it('dark sections lower HPF', () => {
    const breakdown = spectralTiltHpf(0.5, 'trance', 'breakdown');
    expect(breakdown).toBeLessThan(1.0);
  });

  it('clamped between 0.7 and 1.3', () => {
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      const hpf = spectralTiltHpf(0.5, 'trance', section);
      expect(hpf).toBeGreaterThanOrEqual(0.7);
      expect(hpf).toBeLessThanOrEqual(1.3);
    }
  });
});

describe('shouldApplySpectralTilt', () => {
  it('trance applies', () => {
    expect(shouldApplySpectralTilt('trance')).toBe(true);
  });

  it('ambient applies (barely)', () => {
    expect(shouldApplySpectralTilt('ambient')).toBe(true);
  });
});

describe('tiltStrength', () => {
  it('trance is strongest', () => {
    expect(tiltStrength('trance')).toBe(0.55);
  });

  it('ambient is weakest', () => {
    expect(tiltStrength('ambient')).toBe(0.20);
  });
});
