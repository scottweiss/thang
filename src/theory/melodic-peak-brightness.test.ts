import { describe, it, expect } from 'vitest';
import {
  peakBrightnessGain,
  peakBrightnessLpf,
  peakEmphasis,
} from './melodic-peak-brightness';

describe('peakBrightnessGain', () => {
  it('at peak gets boost', () => {
    const gain = peakBrightnessGain(72, 72, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('near peak gets moderate boost', () => {
    const gain = peakBrightnessGain(71, 72, 'avril');
    expect(gain).toBeGreaterThan(1.0);
    expect(gain).toBeLessThan(peakBrightnessGain(72, 72, 'avril'));
  });

  it('far from peak returns 1.0', () => {
    expect(peakBrightnessGain(60, 72, 'avril')).toBe(1.0);
  });

  it('stays in 0.96-1.10 range', () => {
    for (let n = 48; n <= 84; n += 3) {
      const gain = peakBrightnessGain(n, 72, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.10);
    }
  });
});

describe('peakBrightnessLpf', () => {
  it('at peak gets LPF boost', () => {
    const lpf = peakBrightnessLpf(72, 72, 'avril');
    expect(lpf).toBeGreaterThan(1.0);
  });

  it('far from peak returns 1.0', () => {
    expect(peakBrightnessLpf(60, 72, 'avril')).toBe(1.0);
  });
});

describe('peakEmphasis', () => {
  it('avril is highest', () => {
    expect(peakEmphasis('avril')).toBe(0.65);
  });

  it('syro is low', () => {
    expect(peakEmphasis('syro')).toBe(0.25);
  });
});
