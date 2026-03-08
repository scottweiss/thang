import { describe, it, expect } from 'vitest';
import {
  totalDensity,
  densityGainCorrection,
  densityLpfCorrection,
  shouldApplyTexturalBalance,
  claritySensitivity,
} from './textural-density-balance';

describe('totalDensity', () => {
  it('sums all layer densities', () => {
    expect(totalDensity({ melody: 0.8, arp: 0.6, harmony: 0.4 })).toBeCloseTo(1.8);
  });

  it('empty = 0', () => {
    expect(totalDensity({})).toBe(0);
  });
});

describe('densityGainCorrection', () => {
  it('low density = no correction', () => {
    expect(densityGainCorrection(2.0, 'lofi', 'groove')).toBe(1.0);
  });

  it('high density = gain reduction', () => {
    const correction = densityGainCorrection(5.0, 'lofi', 'groove');
    expect(correction).toBeLessThan(1.0);
  });

  it('clamped above 0.6', () => {
    expect(densityGainCorrection(6.0, 'ambient', 'breakdown')).toBeGreaterThanOrEqual(0.6);
  });

  it('ambient is more sensitive', () => {
    const ambient = densityGainCorrection(4.5, 'ambient', 'groove');
    const trance = densityGainCorrection(4.5, 'trance', 'groove');
    expect(ambient).toBeLessThan(trance);
  });
});

describe('densityLpfCorrection', () => {
  it('low density = no filter change', () => {
    expect(densityLpfCorrection(2.0, 'lofi')).toBe(1.0);
  });

  it('high density = tighter filter', () => {
    expect(densityLpfCorrection(5.0, 'lofi')).toBeLessThan(1.0);
  });

  it('clamped above 0.7', () => {
    expect(densityLpfCorrection(6.0, 'ambient')).toBeGreaterThanOrEqual(0.7);
  });
});

describe('shouldApplyTexturalBalance', () => {
  it('ambient applies', () => {
    expect(shouldApplyTexturalBalance('ambient')).toBe(true);
  });

  it('all moods above threshold apply', () => {
    expect(shouldApplyTexturalBalance('disco')).toBe(true);
  });
});

describe('claritySensitivity', () => {
  it('ambient is highest', () => {
    expect(claritySensitivity('ambient')).toBe(0.60);
  });

  it('disco is lowest regular', () => {
    expect(claritySensitivity('disco')).toBe(0.25);
  });
});
