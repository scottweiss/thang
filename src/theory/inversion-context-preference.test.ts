import { describe, it, expect } from 'vitest';
import {
  inversionScore,
  inversionGainAdjustment,
  inversionFreedom,
} from './inversion-context-preference';

describe('inversionScore', () => {
  it('root position scores high for tonic', () => {
    const score = inversionScore(0, true, 0.5, 'avril');
    expect(score).toBeGreaterThan(0.7);
  });

  it('first inversion better for passing chords', () => {
    const root = inversionScore(0, false, 0.5, 'lofi');
    const first = inversionScore(1, false, 0.5, 'lofi');
    expect(first).toBeGreaterThan(root);
  });

  it('second inversion scores higher pre-cadence', () => {
    const early = inversionScore(2, false, 0.3, 'avril');
    const late = inversionScore(2, false, 0.9, 'avril');
    expect(late).toBeGreaterThan(early);
  });

  it('stays in 0-1 range', () => {
    for (let inv = 0; inv <= 2; inv++) {
      const score = inversionScore(inv, true, 0.5, 'ambient');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });
});

describe('inversionGainAdjustment', () => {
  it('root position returns 1.0', () => {
    expect(inversionGainAdjustment(0, 'trance')).toBe(1.0);
  });

  it('inversions get slight reduction', () => {
    const gain = inversionGainAdjustment(1, 'trance');
    expect(gain).toBeLessThan(1.0);
    expect(gain).toBeGreaterThanOrEqual(0.90);
  });

  it('free mood has less penalty', () => {
    const lofi = inversionGainAdjustment(1, 'lofi');
    const trance = inversionGainAdjustment(1, 'trance');
    expect(lofi).toBeGreaterThan(trance);
  });
});

describe('inversionFreedom', () => {
  it('lofi is highest', () => {
    expect(inversionFreedom('lofi')).toBe(0.60);
  });

  it('blockhead is lowest', () => {
    expect(inversionFreedom('blockhead')).toBe(0.15);
  });
});
