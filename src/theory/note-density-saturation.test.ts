import { describe, it, expect } from 'vitest';
import {
  densitySaturationGain,
  saturationThreshold,
} from './note-density-saturation';

describe('densitySaturationGain', () => {
  it('below threshold is neutral', () => {
    const gain = densitySaturationGain(2, 'ambient');
    expect(gain).toBe(1.0);
  });

  it('above threshold gets reduction', () => {
    const gain = densitySaturationGain(6, 'ambient');
    expect(gain).toBeLessThan(1.0);
  });

  it('ambient saturates earlier than syro', () => {
    const amb = densitySaturationGain(5, 'ambient');
    const syro = densitySaturationGain(5, 'syro');
    expect(amb).toBeLessThan(syro);
  });

  it('stays in 0.94-1.0 range', () => {
    for (let l = 1; l <= 6; l++) {
      const gain = densitySaturationGain(l, 'ambient');
      expect(gain).toBeGreaterThanOrEqual(0.94);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('saturationThreshold', () => {
  it('syro is highest', () => {
    expect(saturationThreshold('syro')).toBe(6.0);
  });

  it('ambient is lowest', () => {
    expect(saturationThreshold('ambient')).toBe(3.0);
  });
});
