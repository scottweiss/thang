import { describe, it, expect } from 'vitest';
import {
  predictiveLpfMultiplier,
  shouldApplyPredictiveEq,
  predictiveStrength,
} from './predictive-eq';

describe('predictiveLpfMultiplier', () => {
  it('opens up when next chord is brighter', () => {
    const mult = predictiveLpfMultiplier('min', 'aug', 1, 'lofi');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('closes down when next chord is darker', () => {
    const mult = predictiveLpfMultiplier('maj7', 'dim', 1, 'lofi');
    expect(mult).toBeLessThan(1.0);
  });

  it('no change when same quality', () => {
    const mult = predictiveLpfMultiplier('maj', 'maj', 1, 'lofi');
    expect(mult).toBe(1.0);
  });

  it('more urgent when closer to change', () => {
    const far = predictiveLpfMultiplier('min', 'aug', 3, 'lofi');
    const close = predictiveLpfMultiplier('min', 'aug', 1, 'lofi');
    expect(Math.abs(close - 1.0)).toBeGreaterThan(Math.abs(far - 1.0));
  });

  it('clamped between 0.9 and 1.1', () => {
    const mult = predictiveLpfMultiplier('dim', 'aug', 0, 'lofi');
    expect(mult).toBeGreaterThanOrEqual(0.9);
    expect(mult).toBeLessThanOrEqual(1.1);
  });
});

describe('shouldApplyPredictiveEq', () => {
  it('true when next chord hint exists and close', () => {
    expect(shouldApplyPredictiveEq('lofi', true, 2)).toBe(true);
  });

  it('false without next chord hint', () => {
    expect(shouldApplyPredictiveEq('lofi', false, 1)).toBe(false);
  });

  it('false when change is far away', () => {
    expect(shouldApplyPredictiveEq('lofi', true, 5)).toBe(false);
  });
});

describe('predictiveStrength', () => {
  it('lofi is strongest', () => {
    expect(predictiveStrength('lofi')).toBe(0.50);
  });

  it('trance is moderate', () => {
    expect(predictiveStrength('trance')).toBe(0.20);
  });
});
