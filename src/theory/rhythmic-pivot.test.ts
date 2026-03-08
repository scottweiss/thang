import { describe, it, expect } from 'vitest';
import {
  pivotIntensity,
  pivotDensityMultiplier,
  pivotGainSwell,
  shouldApplyRhythmicPivot,
  pivotStrengthForMood,
} from './rhythmic-pivot';

describe('pivotIntensity', () => {
  it('zero before pivot zone', () => {
    expect(pivotIntensity(0.5, 'trance')).toBe(0);
    expect(pivotIntensity(0.7, 'trance')).toBe(0);
  });

  it('positive in pivot zone', () => {
    expect(pivotIntensity(0.9, 'trance')).toBeGreaterThan(0);
  });

  it('increases toward section end', () => {
    const mid = pivotIntensity(0.85, 'trance');
    const end = pivotIntensity(0.99, 'trance');
    expect(end).toBeGreaterThan(mid);
  });

  it('stronger moods have higher intensity', () => {
    const trance = pivotIntensity(0.9, 'trance');
    const ambient = pivotIntensity(0.9, 'ambient');
    expect(trance).toBeGreaterThan(ambient);
  });
});

describe('pivotDensityMultiplier', () => {
  it('1.0 outside pivot zone', () => {
    expect(pivotDensityMultiplier(0.5, 'trance', 'build')).toBe(1.0);
  });

  it('builds accelerate (> 1.0)', () => {
    const mult = pivotDensityMultiplier(0.95, 'trance', 'build');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('peaks decelerate slightly (< 1.0)', () => {
    const mult = pivotDensityMultiplier(0.95, 'trance', 'peak');
    expect(mult).toBeLessThan(1.0);
  });

  it('groove is neutral', () => {
    const mult = pivotDensityMultiplier(0.95, 'trance', 'groove');
    expect(mult).toBe(1.0);
  });

  it('clamped between 0.5 and 1.8', () => {
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      const mult = pivotDensityMultiplier(0.99, 'trance', section);
      expect(mult).toBeGreaterThanOrEqual(0.5);
      expect(mult).toBeLessThanOrEqual(1.8);
    }
  });
});

describe('pivotGainSwell', () => {
  it('1.0 outside pivot zone', () => {
    expect(pivotGainSwell(0.5, 'trance', 'build')).toBe(1.0);
  });

  it('builds swell up', () => {
    const swell = pivotGainSwell(0.95, 'trance', 'build');
    expect(swell).toBeGreaterThan(1.0);
  });

  it('breakdowns swell down', () => {
    const swell = pivotGainSwell(0.95, 'trance', 'breakdown');
    expect(swell).toBeLessThan(1.0);
  });

  it('clamped between 0.9 and 1.15', () => {
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      const swell = pivotGainSwell(0.99, 'trance', section);
      expect(swell).toBeGreaterThanOrEqual(0.9);
      expect(swell).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('shouldApplyRhythmicPivot', () => {
  it('false before pivot zone', () => {
    expect(shouldApplyRhythmicPivot(0.5, 'trance')).toBe(false);
  });

  it('true in pivot zone', () => {
    expect(shouldApplyRhythmicPivot(0.9, 'trance')).toBe(true);
  });
});

describe('pivotStrengthForMood', () => {
  it('trance is strong', () => {
    expect(pivotStrengthForMood('trance')).toBe(0.55);
  });

  it('ambient is weakest', () => {
    expect(pivotStrengthForMood('ambient')).toBe(0.15);
  });
});
