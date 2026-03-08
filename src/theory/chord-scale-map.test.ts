import { describe, it, expect } from 'vitest';
import {
  chordScaleInfo,
  chordColorTones,
  isAvoidNote,
  chordScaleStrength,
  shouldApplyChordScale,
} from './chord-scale-map';

describe('chordScaleInfo', () => {
  it('maps I in major to ionian', () => {
    const info = chordScaleInfo(0, 'maj', 'major');
    expect(info.modeName).toBe('ionian');
  });

  it('maps ii in major to dorian', () => {
    const info = chordScaleInfo(1, 'min7', 'major');
    expect(info.modeName).toBe('dorian');
  });

  it('maps IV in major to lydian', () => {
    const info = chordScaleInfo(3, 'maj7', 'major');
    expect(info.modeName).toBe('lydian');
  });

  it('maps V in major to mixolydian', () => {
    const info = chordScaleInfo(4, 'dom7', 'major');
    expect(info.modeName).toBe('mixolydian');
  });

  it('maps i in minor to aeolian', () => {
    const info = chordScaleInfo(0, 'min', 'minor');
    expect(info.modeName).toBe('aeolian');
  });

  it('maps iv in minor to dorian', () => {
    const info = chordScaleInfo(3, 'min7', 'minor');
    expect(info.modeName).toBe('dorian');
  });

  it('wraps degree > 6', () => {
    const info = chordScaleInfo(7, 'maj', 'major');
    expect(info.modeName).toBe('ionian'); // 7 % 7 = 0
  });
});

describe('chordColorTones', () => {
  it('dorian has natural 6th as tension', () => {
    const tensions = chordColorTones(1, 'min7', 'major');
    expect(tensions).toContain(9); // natural 6th = 9 semitones
  });

  it('lydian has #11 as tension', () => {
    const tensions = chordColorTones(3, 'maj7', 'major');
    expect(tensions).toContain(6); // #11 = 6 semitones (tritone)
  });

  it('ionian has 9th as tension', () => {
    const tensions = chordColorTones(0, 'maj', 'major');
    expect(tensions).toContain(2); // 9th = 2 semitones
  });
});

describe('isAvoidNote', () => {
  it('4th is avoid on I major', () => {
    expect(isAvoidNote(5, 0, 'maj', 'major')).toBe(true);
  });

  it('dorian has no avoid notes', () => {
    expect(isAvoidNote(1, 1, 'min7', 'major')).toBe(false);
    expect(isAvoidNote(5, 1, 'min7', 'major')).toBe(false);
    expect(isAvoidNote(8, 1, 'min7', 'major')).toBe(false);
  });

  it('b9 is avoid on phrygian (iii)', () => {
    expect(isAvoidNote(1, 2, 'min', 'major')).toBe(true);
  });

  it('handles negative semitones via normalization', () => {
    // -7 semitones = 5 semitones (mod 12)
    expect(isAvoidNote(-7, 0, 'maj', 'major')).toBe(true); // 4th
  });
});

describe('chordScaleStrength', () => {
  it('lofi is strongest', () => {
    const lofi = chordScaleStrength('lofi');
    const trance = chordScaleStrength('trance');
    expect(lofi).toBeGreaterThan(trance);
  });

  it('returns values between 0 and 1', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      const s = chordScaleStrength(mood);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });
});

describe('shouldApplyChordScale', () => {
  it('true for lofi', () => {
    expect(shouldApplyChordScale('lofi')).toBe(true);
  });

  it('true for trance (just barely)', () => {
    expect(shouldApplyChordScale('trance')).toBe(true);
  });

  it('true for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(shouldApplyChordScale(mood)).toBe(true);
    }
  });
});
