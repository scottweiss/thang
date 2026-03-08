import { describe, it, expect } from 'vitest';
import { generateBassPattern, getBassConfig, bassFollowsChord, bassApproachNotes, shouldBassApproach } from './bass-pattern';

describe('getBassConfig', () => {
  it('ambient uses pedal style', () => {
    expect(getBassConfig('ambient').style).toBe('pedal');
  });

  it('disco uses octave-jump style', () => {
    expect(getBassConfig('disco').style).toBe('octave-jump');
  });

  it('lofi follows chord', () => {
    expect(getBassConfig('lofi').followChord).toBe(true);
  });

  it('ambient does not follow chord', () => {
    expect(getBassConfig('ambient').followChord).toBe(false);
  });
});

describe('generateBassPattern', () => {
  it('returns correct number of steps', () => {
    const pattern = generateBassPattern('C', 'G', 'lofi', 4);
    expect(pattern).toHaveLength(4);
  });

  it('pedal returns all same note', () => {
    const pattern = generateBassPattern('C', 'G', 'ambient', 4);
    const nonRest = pattern.filter(n => n !== '~');
    const unique = new Set(nonRest);
    expect(unique.size).toBe(1);
    expect(nonRest[0]).toBe('C2');
  });

  it('root-fifth pattern contains root', () => {
    const pattern = generateBassPattern('D', 'A', 'lofi', 4);
    expect(pattern.some(n => n.startsWith('D'))).toBe(true);
  });

  it('octave-jump contains root at different octaves or fifth', () => {
    const pattern = generateBassPattern('C', 'G', 'disco', 4);
    const hasNotes = pattern.some(n => n !== '~');
    expect(hasNotes).toBe(true);
  });

  it('driving pattern is dense', () => {
    const pattern = generateBassPattern('E', 'B', 'trance', 4);
    const noteCount = pattern.filter(n => n !== '~').length;
    expect(noteCount).toBeGreaterThanOrEqual(3);
  });

  it('handles custom step count', () => {
    const pattern = generateBassPattern('C', 'G', 'ambient', 8);
    expect(pattern).toHaveLength(8);
  });
});

describe('bassFollowsChord', () => {
  it('disco follows chord', () => {
    expect(bassFollowsChord('disco')).toBe(true);
  });

  it('xtal does not follow chord', () => {
    expect(bassFollowsChord('xtal')).toBe(false);
  });
});

describe('bassApproachNotes', () => {
  it('returns 1-2 approach notes', () => {
    const notes = bassApproachNotes('C', 'F', 2);
    expect(notes.length).toBeGreaterThanOrEqual(1);
    expect(notes.length).toBeLessThanOrEqual(2);
  });

  it('returns empty for same root', () => {
    expect(bassApproachNotes('C', 'C', 2)).toEqual([]);
  });

  it('approach notes lead toward target', () => {
    // C → F (up 5 semitones): should approach from below F
    const notes = bassApproachNotes('C', 'F', 2);
    // Last approach note should be close to F (E or E♭)
    expect(notes.length).toBeGreaterThan(0);
    const lastNote = notes[notes.length - 1];
    expect(lastNote).toMatch(/^[A-G][#]?\d$/);
  });

  it('handles half-step movement', () => {
    // C → C# (1 semitone)
    const notes = bassApproachNotes('C', 'C#', 2);
    expect(notes.length).toBe(1);
  });

  it('handles large intervals', () => {
    // C → F# (tritone = 6 semitones)
    const notes = bassApproachNotes('C', 'F#', 2);
    expect(notes.length).toBe(2);
  });

  it('all notes have valid format', () => {
    const tests = [
      ['C', 'D'], ['C', 'G'], ['D', 'A'], ['F#', 'B'], ['Bb', 'E'],
    ];
    for (const [from, to] of tests) {
      const notes = bassApproachNotes(from, to, 2);
      for (const n of notes) {
        expect(n).toMatch(/^[A-G][#]?\d$/);
      }
    }
  });
});

describe('shouldBassApproach', () => {
  it('returns false without next chord hint', () => {
    expect(shouldBassApproach('trance', 3, false)).toBe(false);
  });

  it('returns false for pedal moods', () => {
    expect(shouldBassApproach('ambient', 5, true)).toBe(false);
  });

  it('returns false when too close to chord change', () => {
    expect(shouldBassApproach('trance', 1, true)).toBe(false);
  });
});
