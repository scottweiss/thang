import { describe, it, expect } from 'vitest';
import {
  spacingQuality,
  suggestSpacingFix,
  applySpacingOptimization,
  moodSpacingPreference,
} from './voice-spacing';

describe('spacingQuality', () => {
  it('returns 1.0 for single note', () => {
    expect(spacingQuality(['C4'], 'lofi')).toBe(1.0);
  });

  it('well-spaced voicing scores high', () => {
    // C3-E3-G3-B3: all separated by 3-4 semitones, mid register
    const quality = spacingQuality(['C3', 'E3', 'G3', 'B3'], 'lofi');
    expect(quality).toBeGreaterThan(0.8);
  });

  it('clustered low register scores lower', () => {
    // C2-Db2-D2: minor 2nds in the low register = very muddy
    const quality = spacingQuality(['C2', 'Db2', 'D2'], 'lofi');
    expect(quality).toBeLessThan(0.5);
  });

  it('high register close voicing is acceptable', () => {
    // C5-D5-E5: close but in high register
    const quality = spacingQuality(['C5', 'D5', 'E5'], 'lofi');
    expect(quality).toBeGreaterThan(0.7);
  });

  it('very wide gaps penalize', () => {
    // C2-C4: two octave gap between adjacent voices
    const quality = spacingQuality(['C2', 'C4'], 'lofi');
    expect(quality).toBeLessThan(0.9);
  });

  it('ambient prefers wider spacing', () => {
    // Same voicing gets different scores for ambient vs syro
    const notes = ['C3', 'Eb3', 'G3'];
    const ambientQ = spacingQuality(notes, 'ambient');
    const syroQ = spacingQuality(notes, 'syro');
    // Ambient may penalize close spacing more
    expect(ambientQ).not.toBe(syroQ);
  });
});

describe('suggestSpacingFix', () => {
  it('returns all zeros for well-spaced voicing', () => {
    const shifts = suggestSpacingFix(['C3', 'E3', 'G3'], 'lofi');
    expect(shifts).toEqual([0, 0, 0]);
  });

  it('suggests shift up for low register cluster', () => {
    const shifts = suggestSpacingFix(['C2', 'Db2', 'G3'], 'lofi');
    // Db2 is too close to C2 in low register, should shift up
    expect(shifts[1]).toBeGreaterThanOrEqual(1);
  });

  it('returns correct length array', () => {
    const shifts = suggestSpacingFix(['C3', 'E3', 'G3', 'B3'], 'lofi');
    expect(shifts).toHaveLength(4);
  });
});

describe('applySpacingOptimization', () => {
  it('does not modify well-spaced voicing', () => {
    const notes = ['C3', 'E3', 'G3', 'B3'];
    const result = applySpacingOptimization(notes, 'lofi');
    expect(result).toEqual(notes);
  });

  it('fixes low register cluster', () => {
    const notes = ['C2', 'Db2', 'G3'];
    const result = applySpacingOptimization(notes, 'ambient');
    // After fix, quality should improve
    const beforeQ = spacingQuality(notes, 'ambient');
    const afterQ = spacingQuality(result, 'ambient');
    expect(afterQ).toBeGreaterThanOrEqual(beforeQ);
  });

  it('preserves single notes', () => {
    expect(applySpacingOptimization(['C4'], 'lofi')).toEqual(['C4']);
  });
});

describe('moodSpacingPreference', () => {
  it('ambient prefers wider spacing', () => {
    expect(moodSpacingPreference('ambient')).toBeGreaterThan(1.0);
  });

  it('syro prefers tighter spacing', () => {
    expect(moodSpacingPreference('syro')).toBeLessThan(1.0);
  });

  it('avril is neutral', () => {
    expect(moodSpacingPreference('avril')).toBe(1.0);
  });
});
