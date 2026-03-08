import { describe, it, expect } from 'vitest';
import {
  breathingSpread,
  breathingDepth,
  shouldApplyBreathing,
} from './harmonic-breathing';

describe('breathingSpread', () => {
  it('neutral at phrase start (0.0)', () => {
    const spread = breathingSpread(0.0, 'ambient', 'breakdown');
    expect(spread).toBeCloseTo(1.0, 1);
  });

  it('widest at phrase midpoint (0.5)', () => {
    const spread = breathingSpread(0.5, 'ambient', 'breakdown');
    expect(spread).toBeGreaterThan(1.0);
  });

  it('returns to neutral at phrase end (1.0)', () => {
    const spread = breathingSpread(1.0, 'ambient', 'breakdown');
    expect(spread).toBeCloseTo(1.0, 1);
  });

  it('midpoint > start', () => {
    const start = breathingSpread(0.0, 'lofi', 'groove');
    const mid = breathingSpread(0.5, 'lofi', 'groove');
    expect(mid).toBeGreaterThan(start);
  });

  it('ambient > syro at midpoint', () => {
    const ambient = breathingSpread(0.5, 'ambient', 'groove');
    const syro = breathingSpread(0.5, 'syro', 'groove');
    expect(ambient).toBeGreaterThan(syro);
  });

  it('stays in 0.8-1.4 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const spread = breathingSpread(p, 'ambient', 'breakdown');
      expect(spread).toBeGreaterThanOrEqual(0.8);
      expect(spread).toBeLessThanOrEqual(1.4);
    }
  });
});

describe('breathingDepth', () => {
  it('ambient is deepest', () => {
    expect(breathingDepth('ambient')).toBe(0.65);
  });

  it('syro is shallowest', () => {
    expect(breathingDepth('syro')).toBe(0.15);
  });
});

describe('shouldApplyBreathing', () => {
  it('true for ambient breakdown', () => {
    expect(shouldApplyBreathing('ambient', 'breakdown')).toBe(true);
  });

  it('true for syro groove', () => {
    expect(shouldApplyBreathing('syro', 'groove')).toBe(true);
  });
});
