import { describe, it, expect } from 'vitest';
import {
  intraBeatOffset,
  swingOffsets,
  shouldApplyIntraBeatSwing,
  swingDepth,
} from './intra-beat-swing';

describe('intraBeatOffset', () => {
  it('returns values within depth range', () => {
    const depth = swingDepth('lofi');
    for (let i = 0; i < 16; i++) {
      const offset = intraBeatOffset(i, 5, 'lofi', 'groove');
      expect(Math.abs(offset)).toBeLessThanOrEqual(depth * 1.01);
    }
  });

  it('can be positive or negative', () => {
    let hasPos = false, hasNeg = false;
    for (let i = 0; i < 30; i++) {
      const offset = intraBeatOffset(i, 10, 'lofi', 'groove');
      if (offset > 0) hasPos = true;
      if (offset < 0) hasNeg = true;
    }
    expect(hasPos).toBe(true);
    expect(hasNeg).toBe(true);
  });

  it('peaks are tighter than breakdowns', () => {
    let peakMax = 0, bdMax = 0;
    for (let i = 0; i < 20; i++) {
      peakMax = Math.max(peakMax, Math.abs(intraBeatOffset(i, 5, 'lofi', 'peak')));
      bdMax = Math.max(bdMax, Math.abs(intraBeatOffset(i, 5, 'lofi', 'breakdown')));
    }
    expect(bdMax).toBeGreaterThan(peakMax);
  });

  it('returns 0 for very tight moods at peak', () => {
    // trance at peak: 0.005 * 0.3 = 0.0015 < 0.002, should return 0
    for (let i = 0; i < 10; i++) {
      expect(intraBeatOffset(i, 5, 'trance', 'peak')).toBe(0);
    }
  });
});

describe('swingOffsets', () => {
  it('returns correct length', () => {
    const offsets = swingOffsets(16, 5, 'lofi', 'groove');
    expect(offsets).toHaveLength(16);
  });

  it('different positions get different offsets', () => {
    const offsets = swingOffsets(8, 5, 'lofi', 'groove');
    const unique = new Set(offsets);
    expect(unique.size).toBeGreaterThan(1);
  });
});

describe('shouldApplyIntraBeatSwing', () => {
  it('lofi groove applies', () => {
    expect(shouldApplyIntraBeatSwing('lofi', 'groove')).toBe(true);
  });

  it('trance peak does not apply', () => {
    expect(shouldApplyIntraBeatSwing('trance', 'peak')).toBe(false);
  });

  it('blockhead breakdown applies', () => {
    expect(shouldApplyIntraBeatSwing('blockhead', 'breakdown')).toBe(true);
  });
});

describe('swingDepth', () => {
  it('lofi is deepest', () => {
    expect(swingDepth('lofi')).toBe(0.020);
  });

  it('trance is shallowest', () => {
    expect(swingDepth('trance')).toBe(0.005);
  });
});
