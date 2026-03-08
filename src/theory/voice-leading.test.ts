import { describe, it, expect } from 'vitest';
import { voiceLeadingCost, smoothVoicing, parseMidi } from './voice-leading';

describe('parseMidi', () => {
  it('parses C4 correctly', () => {
    expect(parseMidi('C4')).toBe(60);
  });

  it('parses A4 correctly', () => {
    expect(parseMidi('A4')).toBe(69);
  });

  it('parses C#3 correctly', () => {
    expect(parseMidi('C#3')).toBe(49);
  });

  it('parses across octaves', () => {
    expect(parseMidi('C5') - parseMidi('C4')).toBe(12);
  });
});

describe('voiceLeadingCost', () => {
  it('returns 0 for identical voicings', () => {
    const voicing = ['C4', 'E4', 'G4'];
    expect(voiceLeadingCost(voicing, voicing)).toBe(0);
  });

  it('lower cost for stepwise motion than leaps', () => {
    const prev = ['C4', 'E4', 'G4'];
    const stepwise = ['D4', 'F4', 'A4']; // each voice moves 2 semitones
    const leaping = ['F4', 'A4', 'C5'];  // each voice moves 5+ semitones
    expect(voiceLeadingCost(prev, stepwise)).toBeLessThan(
      voiceLeadingCost(prev, leaping)
    );
  });

  it('penalizes parallel fifths', () => {
    // Two voices both moving up by a whole step, maintaining a perfect fifth
    const prev = ['C4', 'G4'];
    const withParallel = ['D4', 'A4']; // parallel fifths (both move up 2)
    const withoutParallel = ['D4', 'G4']; // oblique motion, no parallel fifth
    expect(voiceLeadingCost(prev, withParallel)).toBeGreaterThan(
      voiceLeadingCost(prev, withoutParallel)
    );
  });

  it('rewards contrary motion', () => {
    const prev = ['C4', 'G4'];
    const contrary = ['D4', 'F4']; // voices move in opposite directions
    const parallel = ['D4', 'A4']; // voices move in same direction
    // Contrary should have lower cost (bonus reduces it)
    // But parallel fifths penalty applies to parallel case too
    expect(voiceLeadingCost(prev, contrary)).toBeLessThan(
      voiceLeadingCost(prev, parallel)
    );
  });

  it('handles different length voicings', () => {
    const prev = ['C4', 'E4', 'G4'];
    const next = ['D4', 'F4'];
    // Should not throw, uses min length
    expect(() => voiceLeadingCost(prev, next)).not.toThrow();
  });
});

describe('smoothVoicing', () => {
  it('returns newChordNotes when prevNotes is empty', () => {
    const result = smoothVoicing([], ['C4', 'E4', 'G4']);
    expect(result).toEqual(['C4', 'E4', 'G4']);
  });

  it('minimizes voice movement', () => {
    const prev = ['C4', 'E4', 'G4'];
    const newChord = ['D4', 'F#4', 'A4'];
    const result = smoothVoicing(prev, newChord);
    // Result should be close to prev — all notes within an octave
    const resultMidi = result.map(parseMidi);
    const prevMidi = prev.map(parseMidi);
    for (let i = 0; i < Math.min(resultMidi.length, prevMidi.length); i++) {
      expect(Math.abs(resultMidi[i] - prevMidi[i])).toBeLessThanOrEqual(12);
    }
  });

  it('keeps notes within specified range', () => {
    const prev = ['C4', 'E4', 'G4'];
    const newChord = ['F4', 'A4', 'C5'];
    const range: [number, number] = [48, 84]; // C3 to C6
    const result = smoothVoicing(prev, newChord, range);
    const resultMidi = result.map(parseMidi);
    resultMidi.forEach(m => {
      expect(m).toBeGreaterThanOrEqual(range[0]);
      expect(m).toBeLessThanOrEqual(range[1]);
    });
  });

  it('returns sorted voicing (low to high)', () => {
    const prev = ['C4', 'E4', 'G4'];
    const newChord = ['G3', 'B3', 'D4'];
    const result = smoothVoicing(prev, newChord);
    const midi = result.map(parseMidi);
    for (let i = 1; i < midi.length; i++) {
      expect(midi[i]).toBeGreaterThanOrEqual(midi[i - 1]);
    }
  });
});
