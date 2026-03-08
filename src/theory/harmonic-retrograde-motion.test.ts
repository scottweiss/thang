import { describe, it, expect } from 'vitest';
import {
  isRetrogradeMotion,
  retrogradeMotionGain,
  retrogradeDepthValue,
} from './harmonic-retrograde-motion';

describe('isRetrogradeMotion', () => {
  it('exact mirror is retrograde', () => {
    expect(isRetrogradeMotion(-5, 5)).toBe(true);
  });

  it('approximate mirror is retrograde', () => {
    expect(isRetrogradeMotion(-4, 5)).toBe(true);
  });

  it('same direction is not retrograde', () => {
    expect(isRetrogradeMotion(5, 3)).toBe(false);
  });

  it('zero motion is not retrograde', () => {
    expect(isRetrogradeMotion(0, 5)).toBe(false);
  });

  it('very different magnitudes are not retrograde', () => {
    expect(isRetrogradeMotion(-2, 7)).toBe(false);
  });
});

describe('retrogradeMotionGain', () => {
  it('retrograde gets boost', () => {
    const gain = retrogradeMotionGain(-5, 5, 'avril', 'breakdown');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-retrograde is neutral', () => {
    const gain = retrogradeMotionGain(5, 3, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('exact mirror boosts more than approximate', () => {
    const exact = retrogradeMotionGain(-5, 5, 'avril', 'peak');
    const approx = retrogradeMotionGain(-3, 5, 'avril', 'peak');
    expect(exact).toBeGreaterThan(approx);
  });

  it('avril boosts more than blockhead', () => {
    const av = retrogradeMotionGain(-5, 5, 'avril', 'peak');
    const bh = retrogradeMotionGain(-5, 5, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let r = -7; r <= 7; r++) {
      for (let p = -7; p <= 7; p++) {
        const gain = retrogradeMotionGain(r, p, 'avril', 'breakdown');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.03);
      }
    }
  });
});

describe('retrogradeDepthValue', () => {
  it('avril is highest', () => {
    expect(retrogradeDepthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(retrogradeDepthValue('blockhead')).toBe(0.15);
  });
});
