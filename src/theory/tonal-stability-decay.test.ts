import { describe, it, expect } from 'vitest';
import {
  stabilityDecayFm,
  stabilityRate,
} from './tonal-stability-decay';

describe('stabilityDecayFm', () => {
  it('fresh chord is near neutral', () => {
    const fm = stabilityDecayFm(1, 0, 'ambient');
    expect(fm).toBeCloseTo(1.0, 2);
  });

  it('sustained tonic decays FM', () => {
    const fm = stabilityDecayFm(1, 6, 'ambient');
    expect(fm).toBeLessThan(1.0);
  });

  it('tonic decays more than dominant', () => {
    const tonic = stabilityDecayFm(1, 6, 'ambient');
    const dom = stabilityDecayFm(5, 6, 'ambient');
    expect(tonic).toBeLessThan(dom);
  });

  it('ambient decays faster than syro', () => {
    const amb = stabilityDecayFm(1, 6, 'ambient');
    const sy = stabilityDecayFm(1, 6, 'syro');
    expect(amb).toBeLessThan(sy);
  });

  it('stays in 0.92-1.0 range', () => {
    for (let d = 1; d <= 7; d++) {
      for (let t = 0; t <= 10; t++) {
        const fm = stabilityDecayFm(d, t, 'ambient');
        expect(fm).toBeGreaterThanOrEqual(0.92);
        expect(fm).toBeLessThanOrEqual(1.0);
      }
    }
  });
});

describe('stabilityRate', () => {
  it('ambient is highest', () => {
    expect(stabilityRate('ambient')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(stabilityRate('syro')).toBe(0.20);
  });
});
