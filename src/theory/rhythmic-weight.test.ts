import { describe, it, expect } from 'vitest';
import {
  metricWeight,
  weightGainMultiplier,
  weightDecayMultiplier,
  shouldApplyRhythmicWeight,
  weightDepth,
} from './rhythmic-weight';

describe('metricWeight', () => {
  it('downbeat is strongest', () => {
    expect(metricWeight(0, 8)).toBe(1.0);
  });

  it('half-way is second strongest', () => {
    expect(metricWeight(4, 8)).toBe(0.75);
  });

  it('quarter points are moderate', () => {
    expect(metricWeight(2, 8)).toBe(0.5);
  });

  it('off-beats are weakest', () => {
    expect(metricWeight(1, 8)).toBe(0.25);
  });

  it('handles zero total gracefully', () => {
    expect(metricWeight(0, 0)).toBe(0.5);
  });
});

describe('weightGainMultiplier', () => {
  it('downbeat gets boost', () => {
    const mult = weightGainMultiplier(0, 8, 'blockhead');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('off-beat gets reduction', () => {
    const mult = weightGainMultiplier(1, 8, 'blockhead');
    expect(mult).toBeLessThan(1.0);
  });

  it('ambient has minimal contrast', () => {
    const down = weightGainMultiplier(0, 8, 'ambient');
    const off = weightGainMultiplier(1, 8, 'ambient');
    expect(down - off).toBeLessThan(0.1);
  });
});

describe('weightDecayMultiplier', () => {
  it('downbeat gets longer decay', () => {
    expect(weightDecayMultiplier(0, 8, 'disco')).toBeGreaterThan(1.0);
  });

  it('off-beat gets shorter decay', () => {
    expect(weightDecayMultiplier(1, 8, 'disco')).toBeLessThan(1.0);
  });

  it('less extreme than gain', () => {
    const gainDiff = Math.abs(weightGainMultiplier(0, 8, 'disco') - weightGainMultiplier(1, 8, 'disco'));
    const decayDiff = Math.abs(weightDecayMultiplier(0, 8, 'disco') - weightDecayMultiplier(1, 8, 'disco'));
    expect(decayDiff).toBeLessThan(gainDiff);
  });
});

describe('shouldApplyRhythmicWeight', () => {
  it('blockhead applies', () => {
    expect(shouldApplyRhythmicWeight('blockhead')).toBe(true);
  });

  it('ambient does not', () => {
    expect(shouldApplyRhythmicWeight('ambient')).toBe(false);
  });
});

describe('weightDepth', () => {
  it('blockhead is deepest', () => {
    expect(weightDepth('blockhead')).toBe(0.50);
  });

  it('ambient is shallowest', () => {
    expect(weightDepth('ambient')).toBe(0.10);
  });
});
