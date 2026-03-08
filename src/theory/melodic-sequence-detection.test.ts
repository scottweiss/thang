import { describe, it, expect } from 'vitest';
import {
  detectSequence,
  suggestSequenceContinuation,
  shouldDetectSequence,
  sequenceSensitivity,
} from './melodic-sequence-detection';

describe('detectSequence', () => {
  it('detects ascending sequence', () => {
    // C D E | D E F# (transposed up 2)
    const history = [60, 62, 64, 62, 64, 66];
    expect(detectSequence(history, 3)).toBe(2);
  });

  it('detects descending sequence', () => {
    // E D C | D C Bb (transposed down 1)
    const history = [64, 62, 60, 63, 61, 59];
    expect(detectSequence(history, 3)).toBe(-1);
  });

  it('returns null for no sequence', () => {
    const history = [60, 62, 64, 67, 65, 63];
    expect(detectSequence(history, 3)).toBeNull();
  });

  it('returns null for too short history', () => {
    expect(detectSequence([60, 62], 3)).toBeNull();
  });

  it('detects 2-note sequence', () => {
    // C E | D F# (transposed up 2)
    const history = [60, 64, 62, 66];
    expect(detectSequence(history, 2)).toBe(2);
  });

  it('detects unison repetition (interval 0)', () => {
    const history = [60, 64, 67, 60, 64, 67];
    expect(detectSequence(history, 3)).toBe(0);
  });
});

describe('suggestSequenceContinuation', () => {
  it('suggests next transposition', () => {
    // Pattern [60, 62, 64] transposed by +2 → [62, 64, 66]
    // Next sequence starts at currentFragment[0] + interval = 62 + 2 = 64
    const history = [60, 62, 64, 62, 64, 66];
    expect(suggestSequenceContinuation(history, 3, 2)).toBe(64);
  });

  it('returns null for short history', () => {
    expect(suggestSequenceContinuation([60], 3, 2)).toBeNull();
  });
});

describe('shouldDetectSequence', () => {
  it('avril applies', () => {
    expect(shouldDetectSequence('avril')).toBe(true);
  });

  it('ambient does not', () => {
    expect(shouldDetectSequence('ambient')).toBe(false);
  });
});

describe('sequenceSensitivity', () => {
  it('avril is highest', () => {
    expect(sequenceSensitivity('avril')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(sequenceSensitivity('ambient')).toBe(0.15);
  });
});
