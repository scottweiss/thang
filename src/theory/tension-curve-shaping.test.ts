import { describe, it, expect } from 'vitest';
import { shapedTension, curveIntensity } from './tension-curve-shaping';

describe('shapedTension', () => {
  it('starts near 0', () => {
    expect(shapedTension(0, 'trance')).toBeCloseTo(0, 1);
  });

  it('ends near 1', () => {
    expect(shapedTension(1.0, 'trance')).toBeCloseTo(1.0, 1);
  });

  it('stays in 0-1 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const t = shapedTension(p, 'syro');
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });

  it('exponential curve is below linear at midpoint', () => {
    const shaped = shapedTension(0.5, 'trance');
    expect(shaped).toBeLessThan(0.5);
  });

  it('different moods give different curves', () => {
    const trance = shapedTension(0.5, 'trance');
    const disco = shapedTension(0.5, 'disco');
    expect(trance).not.toBeCloseTo(disco, 2);
  });
});

describe('curveIntensity', () => {
  it('syro is highest', () => {
    expect(curveIntensity('syro')).toBe(0.60);
  });

  it('blockhead is low', () => {
    expect(curveIntensity('blockhead')).toBe(0.30);
  });
});
