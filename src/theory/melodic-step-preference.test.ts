import { describe, it, expect } from 'vitest';
import {
  stepPreferenceGain,
  stepPref,
} from './melodic-step-preference';

describe('stepPreferenceGain', () => {
  it('stepwise motion gets boost', () => {
    const gain = stepPreferenceGain(2, 'lofi');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('large leap gets reduction', () => {
    const gain = stepPreferenceGain(10, 'lofi');
    expect(gain).toBeLessThan(1.0);
  });

  it('lofi prefers steps more than syro', () => {
    const lofi = stepPreferenceGain(2, 'lofi');
    const syro = stepPreferenceGain(2, 'syro');
    expect(lofi).toBeGreaterThan(syro);
  });

  it('stays in 0.93-1.06 range', () => {
    for (let i = 0; i <= 12; i++) {
      const gain = stepPreferenceGain(i, 'lofi');
      expect(gain).toBeGreaterThanOrEqual(0.93);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('stepPref', () => {
  it('lofi is highest', () => {
    expect(stepPref('lofi')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(stepPref('syro')).toBe(0.15);
  });
});
