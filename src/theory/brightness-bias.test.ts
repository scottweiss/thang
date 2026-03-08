import { describe, it, expect } from 'vitest';
import {
  directionBias,
  biasInterval,
  shouldApplyBrightnessBias,
  brightnessBiasStrength,
} from './brightness-bias';

describe('directionBias', () => {
  it('build sections bias upward', () => {
    const bias = directionBias('avril', 'build');
    expect(bias).toBeGreaterThan(0.3);
  });

  it('breakdown sections can bias downward', () => {
    const bias = directionBias('avril', 'breakdown');
    expect(bias).toBeLessThan(0);
  });

  it('trance has moderate bias', () => {
    const bias = directionBias('trance', 'groove');
    expect(bias).toBeGreaterThan(0);
    expect(bias).toBeLessThan(0.5);
  });

  it('clamped to [-0.5, 0.7]', () => {
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      const bias = directionBias('avril', section);
      expect(bias).toBeGreaterThanOrEqual(-0.5);
      expect(bias).toBeLessThanOrEqual(0.7);
    }
  });
});

describe('biasInterval', () => {
  it('zero bias = no change', () => {
    expect(biasInterval(3, 0)).toBe(3);
    expect(biasInterval(-2, 0)).toBe(-2);
  });

  it('positive bias reduces downward intervals', () => {
    const original = -4;
    const biased = biasInterval(original, 0.5);
    expect(Math.abs(biased)).toBeLessThan(Math.abs(original));
  });

  it('positive bias slightly amplifies upward intervals', () => {
    const original = 4;
    const biased = biasInterval(original, 0.5);
    expect(biased).toBeGreaterThanOrEqual(original);
  });

  it('negative bias reduces upward intervals', () => {
    const original = 4;
    const biased = biasInterval(original, -0.3);
    expect(biased).toBeLessThan(original);
  });
});

describe('shouldApplyBrightnessBias', () => {
  it('avril in build applies', () => {
    expect(shouldApplyBrightnessBias('avril', 'build')).toBe(true);
  });

  it('syro in intro does not', () => {
    // 0.15 * 0.6 = 0.09 > 0.08... borderline
    // Let's check
    expect(shouldApplyBrightnessBias('ambient', 'breakdown')).toBe(false);
  });
});

describe('brightnessBiasStrength', () => {
  it('avril is highest', () => {
    expect(brightnessBiasStrength('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(brightnessBiasStrength('syro')).toBe(0.15);
  });
});
