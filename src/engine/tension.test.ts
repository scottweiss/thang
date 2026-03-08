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
});
