import { describe, it, expect } from 'vitest';
import {
  gainJitter,
  fmJitter,
  filterJitter,
  shouldApplyResonance,
  noiseIntensity,
} from './stochastic-resonance';

describe('gainJitter', () => {
  it('near 1.0 for all ticks', () => {
    for (let tick = 0; tick < 10; tick++) {
      const val = gainJitter(tick, 0, 'lofi', 'breakdown');
      expect(val).toBeGreaterThanOrEqual(0.96);
      expect(val).toBeLessThanOrEqual(1.04);
    }
  });

  it('varies between ticks (not constant)', () => {
    const a = gainJitter(0, 0, 'lofi', 'breakdown');
    const b = gainJitter(1, 0, 'lofi', 'breakdown');
    // They should differ (extremely unlikely to be identical)
    expect(a).not.toBe(b);
  });

  it('varies between layers', () => {
    const a = gainJitter(5, 0, 'lofi', 'breakdown');
    const b = gainJitter(5, 1, 'lofi', 'breakdown');
    expect(a).not.toBe(b);
  });

  it('lofi has wider jitter than trance', () => {
    let lofiRange = 0;
    let tranceRange = 0;
    for (let tick = 0; tick < 20; tick++) {
      lofiRange += Math.abs(gainJitter(tick, 0, 'lofi', 'breakdown') - 1.0);
      tranceRange += Math.abs(gainJitter(tick, 0, 'trance', 'breakdown') - 1.0);
    }
    expect(lofiRange).toBeGreaterThan(tranceRange);
  });
});

describe('fmJitter', () => {
  it('clamped 0.95-1.05', () => {
    for (let tick = 0; tick < 10; tick++) {
      const val = fmJitter(tick, 0, 'lofi', 'groove');
      expect(val).toBeGreaterThanOrEqual(0.95);
      expect(val).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('filterJitter', () => {
  it('clamped 0.97-1.03', () => {
    for (let tick = 0; tick < 10; tick++) {
      const val = filterJitter(tick, 0, 'lofi', 'groove');
      expect(val).toBeGreaterThanOrEqual(0.97);
      expect(val).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('shouldApplyResonance', () => {
  it('true for lofi breakdown', () => {
    expect(shouldApplyResonance('lofi', 'breakdown')).toBe(true);
  });

  it('true for trance peak (0.10 * 0.6 = 0.06 > 0.05)', () => {
    expect(shouldApplyResonance('trance', 'peak')).toBe(true);
  });
});

describe('noiseIntensity', () => {
  it('lofi is highest', () => {
    expect(noiseIntensity('lofi')).toBe(0.40);
  });

  it('trance is lowest', () => {
    expect(noiseIntensity('trance')).toBe(0.10);
  });
});
