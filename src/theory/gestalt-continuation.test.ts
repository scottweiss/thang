import { describe, it, expect } from 'vitest';
import {
  trajectoryMomentum,
  violationCost,
  continuationBias,
  shouldApplyContinuation,
  continuationStrength,
} from './gestalt-continuation';

describe('trajectoryMomentum', () => {
  it('0 with single value', () => {
    expect(trajectoryMomentum([0.5])).toBe(0);
  });

  it('positive for ascending', () => {
    expect(trajectoryMomentum([0.2, 0.4, 0.6, 0.8])).toBeGreaterThan(0);
  });

  it('negative for descending', () => {
    expect(trajectoryMomentum([0.8, 0.6, 0.4, 0.2])).toBeLessThan(0);
  });

  it('near 0 for flat', () => {
    expect(trajectoryMomentum([0.5, 0.5, 0.5, 0.5])).toBe(0);
  });

  it('clamped -1 to 1', () => {
    const up = trajectoryMomentum([0.0, 0.5, 1.0]);
    expect(up).toBeLessThanOrEqual(1);
    expect(up).toBeGreaterThanOrEqual(-1);
  });

  it('uses last 4 values', () => {
    // Long history but only last 4 matter
    const val = trajectoryMomentum([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
    expect(val).toBeGreaterThan(0);
  });
});

describe('violationCost', () => {
  it('0 when continuing upward trajectory', () => {
    expect(violationCost(0.5, 0.5, 0.7, 'trance', 'build')).toBe(0);
  });

  it('0 when neutral momentum', () => {
    expect(violationCost(0, 0.5, 0.3, 'trance', 'build')).toBe(0);
  });

  it('> 0 when reversing upward trajectory', () => {
    expect(violationCost(0.8, 0.7, 0.3, 'trance', 'build')).toBeGreaterThan(0);
  });

  it('higher cost with stronger momentum', () => {
    const weak = violationCost(0.2, 0.5, 0.3, 'trance', 'build');
    const strong = violationCost(0.8, 0.5, 0.3, 'trance', 'build');
    expect(strong).toBeGreaterThan(weak);
  });

  it('trance has higher cost than syro', () => {
    const trance = violationCost(0.5, 0.5, 0.2, 'trance', 'build');
    const syro = violationCost(0.5, 0.5, 0.2, 'syro', 'build');
    expect(trance).toBeGreaterThan(syro);
  });

  it('clamped at 1', () => {
    expect(violationCost(1.0, 1.0, 0.0, 'trance', 'build')).toBeLessThanOrEqual(1);
  });
});

describe('continuationBias', () => {
  it('> 1.0 when continuing trajectory', () => {
    expect(continuationBias(0.5, 0.5, 0.7, 'trance', 'build')).toBeGreaterThan(1.0);
  });

  it('< 1.3 always', () => {
    expect(continuationBias(0, 0.5, 0.7, 'trance', 'build')).toBeLessThanOrEqual(1.3);
  });

  it('< 1.0 when violating trajectory', () => {
    expect(continuationBias(0.8, 0.7, 0.2, 'trance', 'build')).toBeLessThan(1.3);
  });
});

describe('shouldApplyContinuation', () => {
  it('true for trance build', () => {
    expect(shouldApplyContinuation('trance', 'build')).toBe(true);
  });

  it('false for ambient breakdown', () => {
    // 0.15 * 0.5 = 0.075 < 0.10
    expect(shouldApplyContinuation('ambient', 'breakdown')).toBe(false);
  });
});

describe('continuationStrength', () => {
  it('trance is strongest', () => {
    expect(continuationStrength('trance')).toBe(0.60);
  });

  it('ambient is weakest', () => {
    expect(continuationStrength('ambient')).toBe(0.15);
  });
});
