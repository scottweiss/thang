import { describe, it, expect } from 'vitest';
import {
  hocketDensityMultiplier,
  shouldApplyHocket,
  hocketStrength,
} from './rhythmic-hocket';

describe('hocketDensityMultiplier', () => {
  it('no other layers = no reduction', () => {
    expect(hocketDensityMultiplier(0.5, [], 'lofi', 'groove')).toBe(1.0);
  });

  it('dense others reduce this layer', () => {
    const mult = hocketDensityMultiplier(0.8, [0.9, 0.7], 'lofi', 'groove');
    expect(mult).toBeLessThan(1.0);
  });

  it('sparse others cause little reduction', () => {
    const mult = hocketDensityMultiplier(0.8, [0.1, 0.1], 'lofi', 'groove');
    expect(mult).toBeGreaterThan(0.9);
  });

  it('never goes below 0.5', () => {
    expect(hocketDensityMultiplier(1.0, [1.0, 1.0, 1.0], 'flim', 'breakdown'))
      .toBeGreaterThanOrEqual(0.5);
  });

  it('stronger moods reduce more', () => {
    const lofi = hocketDensityMultiplier(0.5, [0.8], 'lofi', 'groove');
    const trance = hocketDensityMultiplier(0.5, [0.8], 'trance', 'groove');
    expect(lofi).toBeLessThan(trance);
  });

  it('breakdown amplifies hocket', () => {
    const bd = hocketDensityMultiplier(0.5, [0.8], 'lofi', 'breakdown');
    const pk = hocketDensityMultiplier(0.5, [0.8], 'lofi', 'peak');
    expect(bd).toBeLessThan(pk);
  });
});

describe('shouldApplyHocket', () => {
  it('lofi in groove applies', () => {
    expect(shouldApplyHocket('lofi', 'groove')).toBe(true);
  });

  it('trance in intro does not', () => {
    // 0.15 * 0.4 = 0.06 < 0.10
    expect(shouldApplyHocket('trance', 'intro')).toBe(false);
  });
});

describe('hocketStrength', () => {
  it('flim is high', () => {
    expect(hocketStrength('flim')).toBe(0.60);
  });

  it('trance is low', () => {
    expect(hocketStrength('trance')).toBe(0.15);
  });
});
