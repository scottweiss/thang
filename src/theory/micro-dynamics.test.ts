import { describe, it, expect } from 'vitest';
import {
  microDynamicGain,
  accentPattern,
  microDynamicRange,
} from './micro-dynamics';

describe('microDynamicGain', () => {
  it('stays in 0.7-1.3 range', () => {
    for (let i = 0; i < 20; i++) {
      const g = microDynamicGain(i, 5, 'lofi');
      expect(g).toBeGreaterThanOrEqual(0.7);
      expect(g).toBeLessThanOrEqual(1.3);
    }
  });

  it('different notes get different velocities', () => {
    const n0 = microDynamicGain(0, 0, 'lofi');
    const n1 = microDynamicGain(1, 0, 'lofi');
    expect(n0).not.toBeCloseTo(n1, 2);
  });

  it('lofi has more variation than trance', () => {
    let lofiVar = 0, tranceVar = 0;
    for (let i = 0; i < 20; i++) {
      lofiVar += Math.abs(microDynamicGain(i, 0, 'lofi') - 1.0);
      tranceVar += Math.abs(microDynamicGain(i, 0, 'trance') - 1.0);
    }
    expect(lofiVar).toBeGreaterThan(tranceVar);
  });
});

describe('accentPattern', () => {
  it('first note gets accent', () => {
    const first = accentPattern(0, 8, 'lofi');
    expect(first).toBeGreaterThan(1.0);
  });

  it('last note gets accent', () => {
    const last = accentPattern(7, 8, 'lofi');
    expect(last).toBeGreaterThan(1.0);
  });

  it('middle notes slightly quieter', () => {
    const mid = accentPattern(4, 8, 'lofi');
    expect(mid).toBeLessThan(1.0);
  });

  it('single note returns 1.0', () => {
    expect(accentPattern(0, 1, 'lofi')).toBe(1.0);
  });
});

describe('microDynamicRange', () => {
  it('lofi is highest', () => {
    expect(microDynamicRange('lofi')).toBe(0.35);
  });

  it('disco is low', () => {
    expect(microDynamicRange('disco')).toBe(0.08);
  });
});
