import { describe, it, expect } from 'vitest';
import { filterEnvelopeMultiplier, shouldApplyFilterEnvelope } from './filter-envelope';

describe('filterEnvelopeMultiplier', () => {
  it('build section opens filter over time', () => {
    const start = filterEnvelopeMultiplier('build', 0, 0.5);
    const end = filterEnvelopeMultiplier('build', 1, 0.5);
    expect(end).toBeGreaterThan(start);
  });

  it('breakdown section closes filter over time', () => {
    const start = filterEnvelopeMultiplier('breakdown', 0, 0.3);
    const end = filterEnvelopeMultiplier('breakdown', 1, 0.3);
    expect(end).toBeLessThan(start);
  });

  it('peak section stays fully open', () => {
    const start = filterEnvelopeMultiplier('peak', 0, 0.5);
    const mid = filterEnvelopeMultiplier('peak', 0.5, 0.5);
    const end = filterEnvelopeMultiplier('peak', 1, 0.5);
    expect(start).toBeCloseTo(mid, 1);
    expect(mid).toBeCloseTo(end, 1);
  });

  it('higher tension opens filter more', () => {
    const low = filterEnvelopeMultiplier('build', 0.5, 0.1);
    const high = filterEnvelopeMultiplier('build', 0.5, 0.9);
    expect(high).toBeGreaterThan(low);
  });

  it('returns values in 0-1 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.25) {
        for (let t = 0; t <= 1; t += 0.5) {
          const val = filterEnvelopeMultiplier(section, p, t);
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(1.0);
        }
      }
    }
  });

  it('clamps out-of-range inputs', () => {
    const normal = filterEnvelopeMultiplier('build', 0.5, 0.5);
    const clamped = filterEnvelopeMultiplier('build', 1.5, 0.5);
    const endVal = filterEnvelopeMultiplier('build', 1.0, 0.5);
    expect(clamped).toBeCloseTo(endVal, 4);
  });

  it('intro opens gradually', () => {
    const start = filterEnvelopeMultiplier('intro', 0, 0.3);
    const end = filterEnvelopeMultiplier('intro', 1, 0.3);
    expect(end).toBeGreaterThan(start);
  });

  it('build uses exponential curve (slow start)', () => {
    const quarter = filterEnvelopeMultiplier('build', 0.25, 0);
    const half = filterEnvelopeMultiplier('build', 0.5, 0);
    const start = filterEnvelopeMultiplier('build', 0, 0);
    const end = filterEnvelopeMultiplier('build', 1, 0);

    // For exponential: value at 0.25 should be closer to start than to midpoint
    const range = end - start;
    const quarterNormalized = (quarter - start) / range;
    expect(quarterNormalized).toBeLessThan(0.25); // exponential = below linear
  });
});

describe('shouldApplyFilterEnvelope', () => {
  it('returns true for build (significant sweep)', () => {
    expect(shouldApplyFilterEnvelope('build')).toBe(true);
  });

  it('returns true for breakdown', () => {
    expect(shouldApplyFilterEnvelope('breakdown')).toBe(true);
  });

  it('returns true for intro', () => {
    expect(shouldApplyFilterEnvelope('intro')).toBe(true);
  });

  it('returns false for peak (static)', () => {
    expect(shouldApplyFilterEnvelope('peak')).toBe(false);
  });

  it('returns false for groove (nearly static)', () => {
    expect(shouldApplyFilterEnvelope('groove')).toBe(false);
  });
});
