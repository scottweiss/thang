import { describe, it, expect } from 'vitest';
import { computeTension } from './tension';

describe('computeTension', () => {
  it('peak section has highest structural tension', () => {
    const peak = computeTension('peak', 0.8, 0.7, 1.0);
    const intro = computeTension('intro', 0.3, 0.3, 0.0);
    expect(peak.overall).toBeGreaterThan(intro.overall);
  });

  it('breakdown has lower tension than build', () => {
    const breakdown = computeTension('breakdown', 0.4, 0.4, 0.5);
    const build = computeTension('build', 0.6, 0.6, 0.5);
    expect(breakdown.overall).toBeLessThan(build.overall);
  });

  it('overall is clamped between 0 and 1', () => {
    const low = computeTension('intro', 0.0, 0.0, 0.0);
    const high = computeTension('peak', 1.0, 1.0, 1.0);
    expect(low.overall).toBeGreaterThanOrEqual(0);
    expect(high.overall).toBeLessThanOrEqual(1);
  });

  it('harmonic distance increases tension', () => {
    const close = computeTension('groove', 0.5, 0.5, 0.1);
    const far = computeTension('groove', 0.5, 0.5, 0.8);
    expect(far.overall).toBeGreaterThan(close.overall);
  });

  it('structural tension follows section hierarchy', () => {
    const sections = ['intro', 'breakdown', 'build', 'groove', 'peak'] as const;
    const tensions = sections.map(s => computeTension(s, 0.5, 0.5, 0.5).structural);
    // Each should be >= previous
    for (let i = 1; i < tensions.length; i++) {
      expect(tensions[i]).toBeGreaterThanOrEqual(tensions[i - 1]);
    }
  });

  // --- Multi-dimensional emotion axes ---

  it('returns all axes including energy, intimacy, and resolutionPull', () => {
    const t = computeTension('build', 0.5, 0.5, 0.5, 0.4, 3, 4, 'dom7');
    expect(t.structural).toBeDefined();
    expect(t.harmonic).toBeDefined();
    expect(t.rhythmic).toBeDefined();
    expect(t.overall).toBeDefined();
    expect(t.energy).toBeDefined();
    expect(t.intimacy).toBeDefined();
    expect(t.resolutionPull).toBeDefined();
  });

  it('energy is higher with high density+brightness than low', () => {
    const loud = computeTension('peak', 0.9, 0.9, 0.5);
    const quiet = computeTension('peak', 0.1, 0.1, 0.5);
    expect(loud.energy!).toBeGreaterThan(quiet.energy!);
  });

  it('energy combines density, brightness, and structural tension', () => {
    // Same section, different density/brightness
    const highEnergy = computeTension('peak', 1.0, 1.0, 0.5);
    const lowEnergy = computeTension('intro', 0.0, 0.0, 0.5);
    expect(highEnergy.energy!).toBeGreaterThan(0.7);
    expect(lowEnergy.energy!).toBeLessThan(0.3);
  });

  it('intimacy is higher with low spaciousness and few layers', () => {
    const intimate = computeTension('breakdown', 0.5, 0.5, 0.5, 0.1, 1);
    const spacious = computeTension('breakdown', 0.5, 0.5, 0.5, 0.9, 6);
    expect(intimate.intimacy!).toBeGreaterThan(spacious.intimacy!);
  });

  it('intimacy defaults to moderate when spaciousness/layers not provided', () => {
    const t = computeTension('build', 0.5, 0.5, 0.5);
    // Default: spaciousness=0.5, layers=3 → intimacy around 0.5
    expect(t.intimacy!).toBeGreaterThan(0.1);
    expect(t.intimacy!).toBeLessThan(0.9);
  });

  it('resolutionPull is high for degree 4 (V)', () => {
    const dominant = computeTension('groove', 0.5, 0.5, 0.5, 0.5, 3, 4, 'maj');
    expect(dominant.resolutionPull!).toBeGreaterThan(0.5);
  });

  it('resolutionPull is low for degree 0 (I)', () => {
    const tonic = computeTension('groove', 0.5, 0.5, 0.5, 0.5, 3, 0, 'maj');
    expect(tonic.resolutionPull!).toBeLessThan(0.15);
  });

  it('resolutionPull increases for dom7 quality on V', () => {
    const v = computeTension('groove', 0.5, 0.5, 0.5, 0.5, 3, 4, 'maj');
    const v7 = computeTension('groove', 0.5, 0.5, 0.5, 0.5, 3, 4, 'dom7');
    expect(v7.resolutionPull!).toBeGreaterThan(v.resolutionPull!);
  });

  it('resolutionPull defaults to moderate when chord info not provided', () => {
    const t = computeTension('build', 0.5, 0.5, 0.5);
    expect(t.resolutionPull!).toBeCloseTo(0.3, 1);
  });

  it('overall tension is unchanged from existing behavior (backward compat)', () => {
    // Compute with just the original 4 params — overall should be same formula
    const t = computeTension('groove', 0.6, 0.4, 0.7);
    const expected = Math.min(1, Math.max(0,
      0.7 * 0.45 + 0.6 * 0.2 + 0.4 * 0.1 + 0.7 * 0.25
    ));
    expect(t.overall).toBeCloseTo(expected, 5);
  });

  it('all axis values are clamped between 0 and 1', () => {
    // Extreme low
    const low = computeTension('intro', 0.0, 0.0, 0.0, 0.0, 0, 0, 'maj');
    expect(low.energy!).toBeGreaterThanOrEqual(0);
    expect(low.energy!).toBeLessThanOrEqual(1);
    expect(low.intimacy!).toBeGreaterThanOrEqual(0);
    expect(low.intimacy!).toBeLessThanOrEqual(1);
    expect(low.resolutionPull!).toBeGreaterThanOrEqual(0);
    expect(low.resolutionPull!).toBeLessThanOrEqual(1);

    // Extreme high
    const high = computeTension('peak', 1.0, 1.0, 1.0, 1.0, 6, 4, 'dom7');
    expect(high.energy!).toBeGreaterThanOrEqual(0);
    expect(high.energy!).toBeLessThanOrEqual(1);
    expect(high.intimacy!).toBeGreaterThanOrEqual(0);
    expect(high.intimacy!).toBeLessThanOrEqual(1);
    expect(high.resolutionPull!).toBeGreaterThanOrEqual(0);
    expect(high.resolutionPull!).toBeLessThanOrEqual(1);
  });
});
