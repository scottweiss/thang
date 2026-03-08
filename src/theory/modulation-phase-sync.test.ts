import { describe, it, expect } from 'vitest';
import {
  modRateMultiplier,
  modDepthMultiplier,
  shouldSyncModulation,
  modSensitivity,
} from './modulation-phase-sync';

describe('modRateMultiplier', () => {
  it('peaks have fastest modulation', () => {
    const peak = modRateMultiplier(0.5, 'trance', 'peak');
    const bd = modRateMultiplier(0.5, 'trance', 'breakdown');
    expect(peak).toBeGreaterThan(bd);
  });

  it('builds accelerate with progress', () => {
    const early = modRateMultiplier(0.1, 'trance', 'build');
    const late = modRateMultiplier(0.9, 'trance', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('clamped between 0.5 and 2.0', () => {
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      const rate = modRateMultiplier(0.5, 'trance', section);
      expect(rate).toBeGreaterThanOrEqual(0.5);
      expect(rate).toBeLessThanOrEqual(2.0);
    }
  });
});

describe('modDepthMultiplier', () => {
  it('breakdowns have widest modulation', () => {
    const bd = modDepthMultiplier('ambient', 'breakdown');
    const peak = modDepthMultiplier('ambient', 'peak');
    expect(bd).toBeGreaterThan(peak);
  });

  it('more sensitive moods have more depth', () => {
    const ambient = modDepthMultiplier('ambient', 'groove');
    const trance = modDepthMultiplier('trance', 'groove');
    expect(ambient).toBeGreaterThan(trance);
  });

  it('clamped between 0.3 and 1.5', () => {
    const depth = modDepthMultiplier('ambient', 'breakdown');
    expect(depth).toBeGreaterThanOrEqual(0.3);
    expect(depth).toBeLessThanOrEqual(1.5);
  });
});

describe('shouldSyncModulation', () => {
  it('ambient applies', () => {
    expect(shouldSyncModulation('ambient')).toBe(true);
  });

  it('trance applies', () => {
    expect(shouldSyncModulation('trance')).toBe(true);
  });
});

describe('modSensitivity', () => {
  it('ambient is most sensitive', () => {
    expect(modSensitivity('ambient')).toBe(0.55);
  });

  it('avril is least sensitive', () => {
    expect(modSensitivity('avril')).toBe(0.30);
  });
});
