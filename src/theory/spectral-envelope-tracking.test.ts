import { describe, it, expect } from 'vitest';
import {
  spectralEnvelopeLpf,
  shouldTrackSpectralEnvelope,
  spectralTrackingDepth,
} from './spectral-envelope-tracking';

describe('spectralEnvelopeLpf', () => {
  it('starts at 1.0 at onset', () => {
    const lpf = spectralEnvelopeLpf(0, 'lofi', 'build');
    expect(lpf).toBeCloseTo(1.0, 1);
  });

  it('decays over time', () => {
    const early = spectralEnvelopeLpf(1, 'lofi', 'build');
    const late = spectralEnvelopeLpf(5, 'lofi', 'build');
    expect(late).toBeLessThan(early);
  });

  it('ambient decays more than disco', () => {
    const ambient = spectralEnvelopeLpf(3, 'ambient', 'build');
    const disco = spectralEnvelopeLpf(3, 'disco', 'build');
    expect(ambient).toBeLessThan(disco);
  });

  it('breakdown section has more tracking', () => {
    const breakdown = spectralEnvelopeLpf(3, 'lofi', 'breakdown');
    const peak = spectralEnvelopeLpf(3, 'lofi', 'peak');
    expect(breakdown).toBeLessThan(peak);
  });

  it('stays above 0.4', () => {
    expect(spectralEnvelopeLpf(100, 'ambient', 'breakdown')).toBeGreaterThanOrEqual(0.4);
  });

  it('stays at or below 1.0', () => {
    expect(spectralEnvelopeLpf(0, 'disco', 'peak')).toBeLessThanOrEqual(1.0);
  });
});

describe('shouldTrackSpectralEnvelope', () => {
  it('true for ambient', () => {
    expect(shouldTrackSpectralEnvelope('ambient', 'build')).toBe(true);
  });

  it('true for lofi', () => {
    expect(shouldTrackSpectralEnvelope('lofi', 'build')).toBe(true);
  });
});

describe('spectralTrackingDepth', () => {
  it('ambient is highest', () => {
    expect(spectralTrackingDepth('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(spectralTrackingDepth('disco')).toBe(0.20);
  });
});
