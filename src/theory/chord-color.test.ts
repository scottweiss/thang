import { describe, it, expect } from 'vitest';
import {
  availableColorTones,
  pickColorTone,
  colorToneProbability,
  shouldConsiderColorTones,
} from './chord-color';

describe('availableColorTones', () => {
  it('returns color tones for major chords', () => {
    const colors = availableColorTones('maj');
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.some(c => c.name.includes('#11'))).toBe(true);
  });

  it('returns color tones for minor chords', () => {
    const colors = availableColorTones('min');
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.some(c => c.name.includes('dorian'))).toBe(true);
  });

  it('returns color tones for dom7', () => {
    const colors = availableColorTones('dom7');
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.some(c => c.name.includes('Hendrix'))).toBe(true);
  });

  it('returns empty for dim/aug', () => {
    expect(availableColorTones('dim')).toEqual([]);
    expect(availableColorTones('aug')).toEqual([]);
  });
});

describe('pickColorTone', () => {
  const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  it('eventually returns a color tone for lofi', () => {
    let found = false;
    for (let i = 0; i < 50; i++) {
      const tone = pickColorTone('C', 'maj', cMajor, 'lofi', 4);
      if (tone) {
        found = true;
        expect(tone).toMatch(/^[A-G][b#]?\d$/);
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('returns valid note format', () => {
    for (let i = 0; i < 100; i++) {
      const tone = pickColorTone('C', 'min7', cMajor, 'lofi', 3);
      if (tone) {
        expect(tone).toMatch(/^[A-G][b#]?\d$/);
      }
    }
  });

  it('only returns diatonic tones', () => {
    // C major scale: C D E F G A B
    // For C major chord, #11 would be F# — NOT diatonic in C major
    // So it should only return 6th (A) or 9th (D) which are diatonic
    for (let i = 0; i < 100; i++) {
      const tone = pickColorTone('C', 'maj', cMajor, 'lofi', 4);
      if (tone) {
        const noteName = tone.replace(/\d+$/, '');
        expect(cMajor).toContain(noteName);
      }
    }
  });

  it('returns null for qualities with no colors', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickColorTone('C', 'dim', cMajor, 'lofi', 4)).toBeNull();
    }
  });
});

describe('colorToneProbability', () => {
  it('lofi has highest probability', () => {
    expect(colorToneProbability('lofi')).toBeGreaterThanOrEqual(colorToneProbability('trance'));
  });

  it('all values are between 0 and 1', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      const p = colorToneProbability(mood);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});

describe('shouldConsiderColorTones', () => {
  it('returns true for most moods', () => {
    expect(shouldConsiderColorTones('lofi')).toBe(true);
    expect(shouldConsiderColorTones('trance')).toBe(true);
  });
});
