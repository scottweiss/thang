import { describe, it, expect } from 'vitest';
import {
  metricWeight,
  hierarchyGainMultiplier,
  hierarchyDepth,
} from './metric-accent-hierarchy';

describe('metricWeight', () => {
  it('downbeat is strongest', () => {
    expect(metricWeight(0)).toBe(1.0);
  });

  it('half-bar is second strongest', () => {
    expect(metricWeight(8)).toBe(0.75);
  });

  it('hierarchy: downbeat > half > quarter > eighth > sixteenth', () => {
    expect(metricWeight(0)).toBeGreaterThan(metricWeight(8));
    expect(metricWeight(8)).toBeGreaterThan(metricWeight(4));
    expect(metricWeight(4)).toBeGreaterThan(metricWeight(2));
    expect(metricWeight(2)).toBeGreaterThan(metricWeight(1));
  });

  it('stays in 0-1 range', () => {
    for (let p = 0; p < 16; p++) {
      const w = metricWeight(p);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThanOrEqual(1);
    }
  });

  it('handles negative positions', () => {
    expect(metricWeight(-16)).toBe(metricWeight(0));
  });
});

describe('hierarchyGainMultiplier', () => {
  it('downbeat gets boost', () => {
    const mul = hierarchyGainMultiplier(0, 'blockhead');
    expect(mul).toBeGreaterThan(1.0);
  });

  it('sixteenth gets reduction', () => {
    const mul = hierarchyGainMultiplier(1, 'blockhead');
    expect(mul).toBeLessThan(1.0);
  });

  it('stays in 0.85-1.15 range', () => {
    for (let p = 0; p < 16; p++) {
      const mul = hierarchyGainMultiplier(p, 'trance');
      expect(mul).toBeGreaterThanOrEqual(0.85);
      expect(mul).toBeLessThanOrEqual(1.15);
    }
  });

  it('flat mood has less contrast', () => {
    const syroDown = hierarchyGainMultiplier(0, 'syro');
    const tranceDown = hierarchyGainMultiplier(0, 'trance');
    expect(Math.abs(tranceDown - 1.0)).toBeGreaterThan(Math.abs(syroDown - 1.0));
  });
});

describe('hierarchyDepth', () => {
  it('blockhead is strongest', () => {
    expect(hierarchyDepth('blockhead')).toBe(0.60);
  });

  it('syro is weakest', () => {
    expect(hierarchyDepth('syro')).toBe(0.15);
  });
});
