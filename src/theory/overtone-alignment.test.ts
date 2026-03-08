import { describe, it, expect } from 'vitest';
import {
  snapToHarmonic,
  alignedFmh,
  shouldAlignOvertones,
  coherenceStrength,
} from './overtone-alignment';

describe('snapToHarmonic', () => {
  it('integer stays unchanged', () => {
    expect(snapToHarmonic(2.0, 0.5)).toBe(2.0);
  });

  it('near-integer snaps closer', () => {
    const snapped = snapToHarmonic(2.3, 0.5);
    expect(snapped).toBeGreaterThan(2.0);
    expect(snapped).toBeLessThan(2.3);
  });

  it('strength 0 = no change', () => {
    expect(snapToHarmonic(2.7, 0)).toBe(2.7);
  });

  it('strength 1 = full snap', () => {
    expect(snapToHarmonic(2.3, 1.0)).toBeCloseTo(2.0, 5);
  });

  it('does not snap to 0', () => {
    expect(snapToHarmonic(0.3, 0.5)).not.toBe(0);
  });
});

describe('alignedFmh', () => {
  it('no other layers = no change', () => {
    expect(alignedFmh(2.5, [], 'trance', 'groove')).toBe(2.5);
  });

  it('nudges toward reinforcing ratio with another layer', () => {
    // Layer at 2.3, other at 1.0 → should nudge toward 2.0 (integer ratio)
    const adjusted = alignedFmh(2.3, [1.0], 'trance', 'groove');
    expect(adjusted).toBeLessThan(2.3);
    expect(adjusted).toBeGreaterThan(1.5);
  });

  it('syro barely adjusts', () => {
    const trance = alignedFmh(2.5, [1.0], 'trance', 'groove');
    const syro = alignedFmh(2.5, [1.0], 'syro', 'groove');
    // trance should move more than syro
    expect(Math.abs(trance - 2.5)).toBeGreaterThan(Math.abs(syro - 2.5));
  });

  it('never goes below 0.5', () => {
    expect(alignedFmh(0.5, [0.1], 'trance', 'intro')).toBeGreaterThanOrEqual(0.5);
  });
});

describe('shouldAlignOvertones', () => {
  it('true for trance with multiple layers', () => {
    expect(shouldAlignOvertones('trance', 3)).toBe(true);
  });

  it('false for single layer', () => {
    expect(shouldAlignOvertones('trance', 1)).toBe(false);
  });

  it('false for syro (low coherence)', () => {
    expect(shouldAlignOvertones('syro', 3)).toBe(false);
  });
});

describe('coherenceStrength', () => {
  it('trance is highest', () => {
    expect(coherenceStrength('trance')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(coherenceStrength('syro')).toBe(0.10);
  });
});
