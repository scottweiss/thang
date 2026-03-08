import { describe, it, expect } from 'vitest';
import {
  densityTarget,
  densityDegradeBy,
  densityEnvelopeRange,
} from './rhythmic-density-envelope';

describe('densityTarget', () => {
  it('build section increases over time', () => {
    const early = densityTarget(0.1, 'lofi', 'build');
    const late = densityTarget(0.9, 'lofi', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('breakdown decreases over time', () => {
    const early = densityTarget(0.1, 'lofi', 'breakdown');
    const late = densityTarget(0.9, 'lofi', 'breakdown');
    expect(late).toBeLessThan(early);
  });

  it('peak stays high', () => {
    const mid = densityTarget(0.5, 'trance', 'peak');
    expect(mid).toBeGreaterThan(0.6);
  });

  it('stays in 0.1-1.0 range', () => {
    for (let p = 0; p <= 1.0; p += 0.2) {
      const d = densityTarget(p, 'xtal', 'build');
      expect(d).toBeGreaterThanOrEqual(0.1);
      expect(d).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('densityDegradeBy', () => {
  it('0 when density is below target', () => {
    expect(densityDegradeBy(0.2, 0.5, 'lofi', 'peak')).toBe(0);
  });

  it('positive when density exceeds target', () => {
    const degrade = densityDegradeBy(1.0, 0.1, 'lofi', 'intro');
    expect(degrade).toBeGreaterThan(0);
  });

  it('stays under 0.8', () => {
    expect(densityDegradeBy(1.0, 0.0, 'ambient', 'intro')).toBeLessThanOrEqual(0.8);
  });
});

describe('densityEnvelopeRange', () => {
  it('xtal is highest', () => {
    expect(densityEnvelopeRange('xtal')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(densityEnvelopeRange('disco')).toBe(0.30);
  });
});
