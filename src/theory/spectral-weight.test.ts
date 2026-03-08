import { describe, it, expect } from 'vitest';
import {
  spectralWeight,
  weightLpfMultiplier,
  weightHpfMultiplier,
  shouldApplyWeight,
  baseWeight,
} from './spectral-weight';

describe('spectralWeight', () => {
  it('returns base weight at section start with neutral section', () => {
    expect(spectralWeight('blockhead', 'peak', 0)).toBeCloseTo(0.62, 2);
  });

  it('builds get lighter (lower weight) with progress', () => {
    const early = spectralWeight('lofi', 'build', 0.1);
    const late = spectralWeight('lofi', 'build', 0.9);
    expect(late).toBeLessThan(early);
  });

  it('breakdowns get heavier (higher weight) with progress', () => {
    const early = spectralWeight('lofi', 'breakdown', 0.1);
    const late = spectralWeight('lofi', 'breakdown', 0.9);
    expect(late).toBeGreaterThan(early);
  });

  it('clamped 0-1', () => {
    const val = spectralWeight('ambient', 'build', 1.0);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1);
  });
});

describe('weightLpfMultiplier', () => {
  it('~1.0 at weight 0.5', () => {
    expect(weightLpfMultiplier(0.5, 'trance')).toBeCloseTo(1.0, 1);
  });

  it('> 1.0 for light weight (bright)', () => {
    expect(weightLpfMultiplier(0.2, 'lofi')).toBeGreaterThan(1.0);
  });

  it('< 1.0 for heavy weight (dark)', () => {
    expect(weightLpfMultiplier(0.8, 'blockhead')).toBeLessThan(1.0);
  });
});

describe('weightHpfMultiplier', () => {
  it('> 1.0 for light weight (raise HPF)', () => {
    expect(weightHpfMultiplier(0.2, 'ambient')).toBeGreaterThan(1.0);
  });

  it('< 1.0 for heavy weight (lower HPF for bass)', () => {
    expect(weightHpfMultiplier(0.8, 'blockhead')).toBeLessThan(1.0);
  });
});

describe('shouldApplyWeight', () => {
  it('true for build (offset -0.10)', () => {
    expect(shouldApplyWeight('trance', 'build')).toBe(true);
  });

  it('false for peak (offset 0.0)', () => {
    expect(shouldApplyWeight('trance', 'peak')).toBe(false);
  });
});

describe('baseWeight', () => {
  it('blockhead is heaviest', () => {
    expect(baseWeight('blockhead')).toBe(0.62);
  });

  it('ambient is lightest', () => {
    expect(baseWeight('ambient')).toBe(0.35);
  });
});
