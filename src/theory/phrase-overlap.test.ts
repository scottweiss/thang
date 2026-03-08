import { describe, it, expect } from 'vitest';
import {
  isPhraseEnding,
  overlapGainBoost,
  shouldApplyPhraseOverlap,
  overlapStrength,
} from './phrase-overlap';

describe('isPhraseEnding', () => {
  it('rests at end = phrase ending', () => {
    expect(isPhraseEnding('C4 D4 E4 F4 G4 ~ ~ ~')).toBe(true);
  });

  it('notes at end = not ending', () => {
    expect(isPhraseEnding('~ ~ C4 D4 E4 F4 G4 A4')).toBe(false);
  });

  it('all rests = ending', () => {
    expect(isPhraseEnding('~ ~ ~ ~')).toBe(true);
  });

  it('short pattern = not ending', () => {
    expect(isPhraseEnding('C4 ~')).toBe(false);
  });
});

describe('overlapGainBoost', () => {
  it('no boost when other is not ending', () => {
    expect(overlapGainBoost('trance', 'peak', false)).toBe(1.0);
  });

  it('boost when other is ending', () => {
    const boost = overlapGainBoost('trance', 'peak', true);
    expect(boost).toBeGreaterThan(1.0);
  });

  it('trance peak has strongest boost', () => {
    const trancePeak = overlapGainBoost('trance', 'peak', true);
    const ambientBreakdown = overlapGainBoost('ambient', 'breakdown', true);
    expect(trancePeak).toBeGreaterThan(ambientBreakdown);
  });
});

describe('shouldApplyPhraseOverlap', () => {
  it('needs 2+ layers', () => {
    expect(shouldApplyPhraseOverlap('trance', 1)).toBe(false);
    expect(shouldApplyPhraseOverlap('trance', 2)).toBe(true);
  });

  it('applies for most moods', () => {
    expect(shouldApplyPhraseOverlap('lofi', 3)).toBe(true);
  });
});

describe('overlapStrength', () => {
  it('trance has highest overlap', () => {
    expect(overlapStrength('trance')).toBe(0.50);
  });

  it('ambient has lowest overlap', () => {
    expect(overlapStrength('ambient')).toBe(0.15);
  });
});
