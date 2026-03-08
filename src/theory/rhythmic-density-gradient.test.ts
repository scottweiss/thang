import { describe, it, expect } from 'vitest';
import {
  densityGradientCorrection,
  gradientCoupling,
} from './rhythmic-density-gradient';

describe('densityGradientCorrection', () => {
  it('1.0 when no partners', () => {
    expect(densityGradientCorrection('drone', { melody: 0.8 }, 'lofi')).toBe(1.0);
  });

  it('thins when partners are busy', () => {
    const corr = densityGradientCorrection('melody', { arp: 0.9, harmony: 0.8 }, 'lofi');
    expect(corr).toBeLessThan(1.0);
  });

  it('thickens when partners are sparse', () => {
    const corr = densityGradientCorrection('melody', { arp: 0.1, harmony: 0.1 }, 'lofi');
    expect(corr).toBeGreaterThan(1.0);
  });

  it('stays in 0.7-1.3 range', () => {
    const corr = densityGradientCorrection('melody', { arp: 1.0, harmony: 1.0 }, 'lofi');
    expect(corr).toBeGreaterThanOrEqual(0.7);
    expect(corr).toBeLessThanOrEqual(1.3);
  });

  it('lofi couples more than syro', () => {
    const lofi = densityGradientCorrection('melody', { arp: 0.9 }, 'lofi');
    const syro = densityGradientCorrection('melody', { arp: 0.9 }, 'syro');
    expect(Math.abs(lofi - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('gradientCoupling', () => {
  it('lofi is highest', () => {
    expect(gradientCoupling('lofi')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(gradientCoupling('syro')).toBe(0.20);
  });
});
