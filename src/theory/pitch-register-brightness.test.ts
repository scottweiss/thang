import { describe, it, expect } from 'vitest';
import {
  registerBrightnessLpf,
  registerBrightnessSensitivity,
} from './pitch-register-brightness';

describe('registerBrightnessLpf', () => {
  it('high register is brighter', () => {
    const lpf = registerBrightnessLpf(76, 'avril');
    expect(lpf).toBeGreaterThan(1.0);
  });

  it('low register is warmer', () => {
    const lpf = registerBrightnessLpf(52, 'avril');
    expect(lpf).toBeLessThan(1.0);
  });

  it('center is neutral', () => {
    const lpf = registerBrightnessLpf(64, 'avril');
    expect(lpf).toBeCloseTo(1.0, 2);
  });

  it('avril is more sensitive than syro', () => {
    const av = registerBrightnessLpf(76, 'avril');
    const sy = registerBrightnessLpf(76, 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 0.94-1.06 range', () => {
    for (let m = 40; m <= 88; m += 4) {
      const lpf = registerBrightnessLpf(m, 'avril');
      expect(lpf).toBeGreaterThanOrEqual(0.94);
      expect(lpf).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('registerBrightnessSensitivity', () => {
  it('avril is high', () => {
    expect(registerBrightnessSensitivity('avril')).toBe(0.55);
  });

  it('syro is low', () => {
    expect(registerBrightnessSensitivity('syro')).toBe(0.25);
  });
});
