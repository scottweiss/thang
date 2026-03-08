import { describe, it, expect } from 'vitest';
import {
  metricGravity,
  gravityPlacementWeights,
  gravityVelocityPattern,
  isStrongBeat,
  rhythmicGravityStrength,
} from './rhythmic-gravity';

describe('metricGravity', () => {
  it('beat 1 is strongest', () => {
    expect(metricGravity(0, 'downtempo')).toBe(1.0);
  });

  it('beat 3 is secondary strong', () => {
    expect(metricGravity(8, 'downtempo')).toBeGreaterThan(0.7);
  });

  it('16th subdivisions are weak', () => {
    expect(metricGravity(1, 'downtempo')).toBeLessThan(0.3);
    expect(metricGravity(3, 'downtempo')).toBeLessThan(0.2);
  });

  it('disco shifts weight to backbeats', () => {
    const beat2 = metricGravity(4, 'disco');
    const beat4 = metricGravity(12, 'disco');
    expect(beat2).toBeGreaterThan(0.8);
    expect(beat4).toBeGreaterThan(0.8);
  });

  it('trance emphasizes all downbeats equally', () => {
    const b1 = metricGravity(0, 'trance');
    const b2 = metricGravity(4, 'trance');
    const b3 = metricGravity(8, 'trance');
    const b4 = metricGravity(12, 'trance');
    expect(b1).toBeGreaterThan(0.9);
    expect(b2).toBeGreaterThan(0.9);
    expect(b3).toBeGreaterThan(0.9);
    expect(b4).toBeGreaterThan(0.9);
  });

  it('wraps for different step counts', () => {
    // 8-step grid: step 0 maps to beat 1, step 4 maps to beat 3
    const gravity8 = metricGravity(0, 'downtempo', 8);
    expect(gravity8).toBe(1.0);
  });
});

describe('gravityPlacementWeights', () => {
  it('returns array of correct length', () => {
    const weights = gravityPlacementWeights(16, 'lofi');
    expect(weights).toHaveLength(16);
  });

  it('all weights are positive', () => {
    const weights = gravityPlacementWeights(16, 'trance', 0.8);
    weights.forEach(w => expect(w).toBeGreaterThan(0));
  });

  it('strong beats have higher weights for trance', () => {
    const weights = gravityPlacementWeights(16, 'trance', 0.5);
    // Beat 1 (idx 0) should be heavier than a subdivision (idx 1)
    expect(weights[0]).toBeGreaterThan(weights[1]);
  });

  it('ambient has nearly uniform weights', () => {
    const weights = gravityPlacementWeights(16, 'ambient', 0.5);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    // Very small range for ambient
    expect(max - min).toBeLessThan(0.05);
  });
});

describe('gravityVelocityPattern', () => {
  it('returns correct length', () => {
    expect(gravityVelocityPattern(16, 'lofi')).toHaveLength(16);
  });

  it('downbeat is louder for trance', () => {
    const vels = gravityVelocityPattern(16, 'trance', 0.7);
    expect(vels[0]).toBeGreaterThan(vels[1]);
  });

  it('all velocities stay within 0.1-1.0', () => {
    const vels = gravityVelocityPattern(16, 'trance', 0.9);
    vels.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0.1);
      expect(v).toBeLessThanOrEqual(1.0);
    });
  });

  it('8-step patterns work', () => {
    const vels = gravityVelocityPattern(8, 'disco', 0.7);
    expect(vels).toHaveLength(8);
  });
});

describe('isStrongBeat', () => {
  it('beat 1 is always strong', () => {
    expect(isStrongBeat(0, 'lofi')).toBe(true);
  });

  it('16th subdivisions are not strong', () => {
    expect(isStrongBeat(1, 'lofi')).toBe(false);
    expect(isStrongBeat(3, 'lofi')).toBe(false);
  });

  it('8th note positions can be strong', () => {
    expect(isStrongBeat(2, 'lofi')).toBe(true); // '&' of beat 1
  });
});

describe('rhythmicGravityStrength', () => {
  it('trance has strongest gravity', () => {
    expect(rhythmicGravityStrength('trance')).toBe(0.70);
  });

  it('ambient has weakest gravity', () => {
    expect(rhythmicGravityStrength('ambient')).toBe(0.05);
  });
});
