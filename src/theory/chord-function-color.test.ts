import { describe, it, expect } from 'vitest';
import {
  functionFmMultiplier,
  coloringIntensity,
} from './chord-function-color';

describe('functionFmMultiplier', () => {
  it('tonic has less FM (warm)', () => {
    const fm = functionFmMultiplier(1, 'avril');
    expect(fm).toBeLessThan(1.0);
  });

  it('dominant has more FM (bright)', () => {
    const fm = functionFmMultiplier(5, 'avril');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('subdominant is near neutral', () => {
    const fm = functionFmMultiplier(4, 'avril');
    expect(fm).toBeCloseTo(1.0, 1);
  });

  it('avril colors more than syro', () => {
    const avrilDom = functionFmMultiplier(5, 'avril');
    const syroDom = functionFmMultiplier(5, 'syro');
    expect(avrilDom).toBeGreaterThan(syroDom);
  });

  it('stays in 0.90-1.12 range', () => {
    for (let d = 1; d <= 7; d++) {
      const fm = functionFmMultiplier(d, 'avril');
      expect(fm).toBeGreaterThanOrEqual(0.90);
      expect(fm).toBeLessThanOrEqual(1.12);
    }
  });
});

describe('coloringIntensity', () => {
  it('avril is highest', () => {
    expect(coloringIntensity('avril')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(coloringIntensity('syro')).toBe(0.20);
  });
});
