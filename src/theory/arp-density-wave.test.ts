import { describe, it, expect } from 'vitest';
import {
  arpDensityDegrade,
  shouldApplyArpDensityWave,
  arpBreathAmplitude,
  arpBreathPeriod,
} from './arp-density-wave';

describe('arpDensityDegrade', () => {
  it('oscillates over time', () => {
    let hasLow = false, hasHigh = false;
    for (let t = 0; t < 20; t++) {
      const d = arpDensityDegrade(t, 'lofi', 'groove');
      if (d < 0.05) hasLow = true;
      if (d > 0.15) hasHigh = true;
    }
    expect(hasLow).toBe(true);
    expect(hasHigh).toBe(true);
  });

  it('always non-negative', () => {
    for (let t = 0; t < 30; t++) {
      expect(arpDensityDegrade(t, 'xtal', 'groove')).toBeGreaterThanOrEqual(0);
    }
  });

  it('capped at 0.5', () => {
    for (let t = 0; t < 30; t++) {
      expect(arpDensityDegrade(t, 'ambient', 'breakdown')).toBeLessThanOrEqual(0.5);
    }
  });

  it('breakdown has more breathing', () => {
    let bdMax = 0, pkMax = 0;
    for (let t = 0; t < 20; t++) {
      bdMax = Math.max(bdMax, arpDensityDegrade(t, 'lofi', 'breakdown'));
      pkMax = Math.max(pkMax, arpDensityDegrade(t, 'lofi', 'peak'));
    }
    expect(bdMax).toBeGreaterThan(pkMax);
  });
});

describe('shouldApplyArpDensityWave', () => {
  it('lofi applies', () => {
    expect(shouldApplyArpDensityWave('lofi')).toBe(true);
  });

  it('trance applies', () => {
    expect(shouldApplyArpDensityWave('trance')).toBe(true);
  });
});

describe('arpBreathAmplitude', () => {
  it('ambient is highest', () => {
    expect(arpBreathAmplitude('ambient')).toBe(0.50);
  });

  it('trance is lowest', () => {
    expect(arpBreathAmplitude('trance')).toBe(0.15);
  });
});

describe('arpBreathPeriod', () => {
  it('ambient is slowest', () => {
    expect(arpBreathPeriod('ambient')).toBe(16);
  });

  it('disco is fastest', () => {
    expect(arpBreathPeriod('disco')).toBe(5);
  });
});
