import { describe, it, expect } from 'vitest';
import {
  bassGravityGain,
  bassGravityDecay,
  gravityStrength,
} from './bass-register-gravity';

describe('bassGravityGain', () => {
  it('low notes get boost', () => {
    const gain = bassGravityGain(36, 'blockhead');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('high notes get slight reduction', () => {
    const gain = bassGravityGain(84, 'blockhead');
    expect(gain).toBeLessThan(1.0);
  });

  it('middle C is near neutral', () => {
    const gain = bassGravityGain(60, 'blockhead');
    expect(gain).toBeCloseTo(1.0, 2);
  });

  it('stays in 0.90-1.10 range', () => {
    for (let n = 24; n <= 96; n += 6) {
      const gain = bassGravityGain(n, 'downtempo');
      expect(gain).toBeGreaterThanOrEqual(0.90);
      expect(gain).toBeLessThanOrEqual(1.10);
    }
  });
});

describe('bassGravityDecay', () => {
  it('low notes sustain longer', () => {
    const decay = bassGravityDecay(36, 'downtempo');
    expect(decay).toBeGreaterThan(1.0);
  });

  it('high notes have shorter sustain', () => {
    const decay = bassGravityDecay(84, 'downtempo');
    expect(decay).toBeLessThan(1.0);
  });
});

describe('gravityStrength', () => {
  it('blockhead is highest', () => {
    expect(gravityStrength('blockhead')).toBe(0.65);
  });

  it('syro is low', () => {
    expect(gravityStrength('syro')).toBe(0.30);
  });
});
