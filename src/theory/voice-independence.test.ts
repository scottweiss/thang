import { describe, it, expect } from 'vitest';
import {
  independenceDensityMult,
  shouldApplyIndependence,
  independenceStrength,
} from './voice-independence';

describe('independenceDensityMult', () => {
  it('melody active = reduced density', () => {
    const melodyPattern = ['C4', 'D4', '~', 'E4'];
    const mult = independenceDensityMult(melodyPattern, 0, 'lofi', 'groove');
    expect(mult).toBeLessThan(1.0);
  });

  it('melody resting = full density', () => {
    const melodyPattern = ['C4', 'D4', '~', 'E4'];
    const mult = independenceDensityMult(melodyPattern, 2, 'lofi', 'groove');
    expect(mult).toBe(1.0);
  });

  it('empty melody = no change', () => {
    expect(independenceDensityMult([], 0, 'lofi', 'groove')).toBe(1.0);
  });

  it('trance has less independence', () => {
    const melodyPattern = ['C4', 'D4', 'E4'];
    const lofi = independenceDensityMult(melodyPattern, 0, 'lofi', 'groove');
    const trance = independenceDensityMult(melodyPattern, 0, 'trance', 'groove');
    expect(lofi).toBeLessThan(trance);
  });

  it('clamped above 0.3', () => {
    const melodyPattern = ['C4'];
    const mult = independenceDensityMult(melodyPattern, 0, 'lofi', 'breakdown');
    expect(mult).toBeGreaterThanOrEqual(0.3);
  });

  it('wraps around melody length', () => {
    const melodyPattern = ['C4', '~'];
    // Position 2 wraps to 0 (melody active)
    const active = independenceDensityMult(melodyPattern, 2, 'lofi', 'groove');
    // Position 3 wraps to 1 (melody rest)
    const rest = independenceDensityMult(melodyPattern, 3, 'lofi', 'groove');
    expect(active).toBeLessThan(rest);
  });
});

describe('shouldApplyIndependence', () => {
  it('lofi applies', () => {
    expect(shouldApplyIndependence('lofi')).toBe(true);
  });

  it('trance applies', () => {
    // 0.15 > 0.12
    expect(shouldApplyIndependence('trance')).toBe(true);
  });
});

describe('independenceStrength', () => {
  it('lofi is highest', () => {
    expect(independenceStrength('lofi')).toBe(0.55);
  });

  it('trance is lowest', () => {
    expect(independenceStrength('trance')).toBe(0.15);
  });
});
