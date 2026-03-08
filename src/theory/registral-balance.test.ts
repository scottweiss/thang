import { describe, it, expect } from 'vitest';
import {
  registerCrowding,
  registralGainCorrection,
  balanceSensitivity,
} from './registral-balance';

describe('registerCrowding', () => {
  it('0 for single layer', () => {
    expect(registerCrowding([440])).toBe(0);
  });

  it('high for same frequency', () => {
    expect(registerCrowding([440, 440])).toBeGreaterThan(0.8);
  });

  it('low for widely separated', () => {
    expect(registerCrowding([100, 3200])).toBeLessThan(0.1);
  });

  it('moderate for octave apart', () => {
    const score = registerCrowding([440, 880]);
    expect(score).toBeCloseTo(0, 0);
  });
});

describe('registralGainCorrection', () => {
  it('reduces gain for crowded layer', () => {
    // Two layers at same frequency
    const gain = registralGainCorrection(440, [440, 450], 'lofi');
    expect(gain).toBeLessThan(1.0);
  });

  it('boosts gain for isolated layer', () => {
    // One layer far from others
    const gain = registralGainCorrection(5000, [100, 200, 5000], 'lofi');
    expect(gain).toBeGreaterThanOrEqual(1.0);
  });

  it('stays in 0.85-1.15 range', () => {
    const gain = registralGainCorrection(440, [440, 440, 440], 'ambient');
    expect(gain).toBeGreaterThanOrEqual(0.85);
    expect(gain).toBeLessThanOrEqual(1.15);
  });

  it('ambient corrects more than syro', () => {
    const ambient = registralGainCorrection(440, [440, 450], 'ambient');
    const syro = registralGainCorrection(440, [440, 450], 'syro');
    expect(Math.abs(ambient - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('balanceSensitivity', () => {
  it('ambient is highest', () => {
    expect(balanceSensitivity('ambient')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(balanceSensitivity('syro')).toBe(0.25);
  });
});
