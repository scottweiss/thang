import { describe, it, expect } from 'vitest';
import {
  extractNotes,
  isClash,
  nudgeNote,
  remapChordTones,
  adaptMelodyToChord,
  adaptArpToChord,
  adaptDroneToChord,
  phraseRepeatCount,
} from './phrase-persistence';

describe('extractNotes', () => {
  it('extracts positioned notes from a note() pattern', () => {
    const code = 'note("C4 E4 G4").sound("sine")';
    const result = extractNotes(code);
    expect(result).toEqual([
      { index: 0, note: 'C4' },
      { index: 1, note: 'E4' },
      { index: 2, note: 'G4' },
    ]);
  });

  it('skips rests (~)', () => {
    const code = 'note("C4 ~ E4 ~ G4")';
    const result = extractNotes(code);
    expect(result).toEqual([
      { index: 0, note: 'C4' },
      { index: 2, note: 'E4' },
      { index: 4, note: 'G4' },
    ]);
  });

  it('returns empty array when no note() call is present', () => {
    const code = 'sound("kick snare").gain(0.5)';
    expect(extractNotes(code)).toEqual([]);
  });

  it('handles sharps and flats', () => {
    const code = 'note("C#4 Eb4 F#3")';
    const result = extractNotes(code);
    expect(result).toEqual([
      { index: 0, note: 'C#4' },
      { index: 1, note: 'Eb4' },
      { index: 2, note: 'F#3' },
    ]);
  });
});

describe('isClash', () => {
  const cMajor = ['C', 'E', 'G'];

  it('returns false for a chord tone', () => {
    expect(isClash('C4', cMajor)).toBe(false);
    expect(isClash('E3', cMajor)).toBe(false);
    expect(isClash('G5', cMajor)).toBe(false);
  });

  it('returns false for 1-semitone neighbor (leading tone)', () => {
    // B is 1 semitone below C
    expect(isClash('B3', cMajor)).toBe(false);
    // F is 1 semitone above E
    expect(isClash('F4', cMajor)).toBe(false);
    // Ab is 1 semitone above G
    expect(isClash('Ab4', cMajor)).toBe(false);
  });

  it('returns true for 2+ semitones from all chord tones', () => {
    // D is 2 from C and E, 5 from G — closest is 2, so clash
    expect(isClash('D4', cMajor)).toBe(true);
    // Bb is 2 from C(min), 4 from G, 6 from E
    // Wait: Bb to C is 2 semitones? No: Bb=10, C=0, min dist = 2. Yes.
    // But Bb to A# = same = 10. G=7, dist(10,7) = 3. So min is 2 from C. Clash.
    expect(isClash('Bb4', cMajor)).toBe(true);
  });

  it('handles enharmonic equivalents', () => {
    // Db is 1 semitone from C — not a clash
    expect(isClash('Db4', cMajor)).toBe(false);
  });
});

describe('nudgeNote', () => {
  const cMajor = ['C', 'E', 'G'];

  it('moves a clashing note to the nearest chord tone', () => {
    // D4 is 2 from C and 2 from E — should pick one (C or E), preserving octave
    const result = nudgeNote('D4', cMajor);
    expect(['C4', 'E4']).toContain(result);
  });

  it('preserves octave', () => {
    const result = nudgeNote('D5', cMajor);
    expect(result).toMatch(/5$/);
  });

  it('returns the same note if it is already a chord tone', () => {
    expect(nudgeNote('C4', cMajor)).toBe('C4');
  });

  it('handles notes near chord tones with sharps/flats', () => {
    // F#4 is closest to G (1 semitone) — not a clash, so identity
    expect(nudgeNote('F#4', cMajor)).toBe('F#4');
  });
});

describe('remapChordTones', () => {
  it('maps C major chord tones to D major chord tones', () => {
    const oldChord = ['C', 'E', 'G'];
    const newChord = ['D', 'F#', 'A'];
    const notes = ['C4', 'E4', 'G4'];
    const result = remapChordTones(notes, oldChord, newChord);
    expect(result).toEqual(['D4', 'F#4', 'A4']);
  });

  it('identity mapping when chords are the same', () => {
    const chord = ['C', 'E', 'G'];
    const notes = ['C4', 'E4', 'G4'];
    const result = remapChordTones(notes, chord, chord);
    expect(result).toEqual(['C4', 'E4', 'G4']);
  });

  it('maps to nearest new chord tone for non-chord-tone notes', () => {
    const oldChord = ['C', 'E', 'G'];
    const newChord = ['D', 'F#', 'A'];
    // D4 is not in old chord; closest old chord tone is C or E (2 semitones each)
    // Should map to the new chord tone corresponding to nearest old tone
    const notes = ['D4'];
    const result = remapChordTones(notes, oldChord, newChord);
    // D is closest to C (2) or E (2) — maps to D (from C) or F# (from E)
    expect(['D4', 'F#4']).toContain(result[0]);
  });
});

describe('adaptMelodyToChord', () => {
  it('nudges only clashing notes', () => {
    const code = 'note("C4 D4 E4").sound("sine")';
    const chordTones = ['C', 'E', 'G'];
    const result = adaptMelodyToChord(code, chordTones);
    // C4 and E4 are chord tones — unchanged
    // D4 clashes (2 from C, 2 from E) — nudged to C or E
    expect(result).toMatch(/note\("/);
    // Extract the notes from result
    const notes = extractNotes(result);
    expect(notes[0].note).toBe('C4');
    expect(['C4', 'E4']).toContain(notes[1].note);
    expect(notes[2].note).toBe('E4');
  });

  it('preserves rests', () => {
    const code = 'note("C4 ~ D4").sound("sine")';
    const chordTones = ['C', 'E', 'G'];
    const result = adaptMelodyToChord(code, chordTones);
    expect(result).toContain('~');
  });
});

describe('adaptArpToChord', () => {
  it('remaps arp notes from old chord to new chord', () => {
    const code = 'note("C4 E4 G4 E4").sound("sawtooth")';
    const oldChord = ['C', 'E', 'G'];
    const newChord = ['D', 'F#', 'A'];
    const result = adaptArpToChord(code, oldChord, newChord);
    const notes = extractNotes(result);
    expect(notes[0].note).toBe('D4');
    expect(notes[1].note).toBe('F#4');
    expect(notes[2].note).toBe('A4');
    expect(notes[3].note).toBe('F#4');
  });
});

describe('adaptDroneToChord', () => {
  it('swaps root note name', () => {
    const code = 'note("C2 C2 C2").sound("sine")';
    const result = adaptDroneToChord(code, 'C', 'D');
    expect(result).toContain('D2');
    expect(result).not.toContain('C2');
  });

  it('handles sharps in old root', () => {
    const code = 'note("F#2 F#2").sound("sine")';
    const result = adaptDroneToChord(code, 'F#', 'A');
    expect(result).toContain('A2');
  });
});

describe('phraseRepeatCount', () => {
  it('returns high range for trance', () => {
    const count = phraseRepeatCount('trance');
    expect(count).toBeGreaterThanOrEqual(5);
    expect(count).toBeLessThanOrEqual(6);
  });

  it('returns 1 for ambient', () => {
    // ambient range is [1,1]
    expect(phraseRepeatCount('ambient')).toBe(1);
  });

  it('returns moderate range for lofi', () => {
    const count = phraseRepeatCount('lofi');
    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(3);
  });

  it('returns moderate range for disco', () => {
    const count = phraseRepeatCount('disco');
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(5);
  });

  it('returns moderate range for syro', () => {
    const count = phraseRepeatCount('syro');
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(2);
  });
});
