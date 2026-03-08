import { describe, it, expect } from 'vitest';
import {
  combinedGain,
  dynamicRangeMultiplier,
  shouldApplyDynamicRange,
  moodDynamicRange,
} from './dynamic-range';

describe('combinedGain', () => {
  it('single layer returns its value', () => {
    expect(combinedGain([0.5])).toBeCloseTo(0.5, 1);
  });

  it('multiple layers sum up', () => {
    const gain = combinedGain([0.3, 0.3, 0.3]);
    expect(gain).toBeGreaterThan(0.3);
  });

  it('empty returns 0', () => {
    expect(combinedGain([])).toBe(0);
  });

  it('grows with layer count', () => {
    const two = combinedGain([0.5, 0.5]);
    const four = combinedGain([0.5, 0.5, 0.5, 0.5]);
    expect(four).toBeGreaterThan(two);
  });
});

describe('dynamicRangeMultiplier', () => {
  it('limits loud passages', () => {
    const mult = dynamicRangeMultiplier(1.5, 'trance', 'groove');
    expect(mult).toBeLessThan(1.0);
  });

  it('boosts quiet passages', () => {
    const mult = dynamicRangeMultiplier(0.05, 'lofi', 'groove');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('no change for normal levels', () => {
    const mult = dynamicRangeMultiplier(0.6, 'trance', 'peak');
    expect(mult).toBeCloseTo(1.0, 1);
  });

  it('peak allows louder than intro', () => {
    const peakMult = dynamicRangeMultiplier(0.9, 'trance', 'peak');
    const introMult = dynamicRangeMultiplier(0.9, 'trance', 'intro');
    expect(peakMult).toBeGreaterThan(introMult);
  });
});

describe('shouldApplyDynamicRange', () => {
  it('applies when too loud', () => {
    expect(shouldApplyDynamicRange(1.2, 'peak')).toBe(true);
  });

  it('applies when too quiet', () => {
    expect(shouldApplyDynamicRange(0.1, 'peak')).toBe(true);
  });

  it('does not apply at normal levels', () => {
    expect(shouldApplyDynamicRange(0.6, 'groove')).toBe(false);
  });
});

describe('moodDynamicRange', () => {
  it('ambient has widest range', () => {
    expect(moodDynamicRange('ambient')).toBe(0.70);
  });

  it('trance has narrowest range', () => {
    expect(moodDynamicRange('trance')).toBe(0.35);
  });
});
