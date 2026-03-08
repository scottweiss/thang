import { describe, it, expect } from 'vitest';
import { smoothArpStart, nearbyNotes } from './arp-voice-leading';

describe('smoothArpStart', () => {
  it('rotates to nearest note', () => {
    const notes = ['C3', 'E3', 'G3', 'C4'];
    // Reference F3 is closest to E3 (index 1)
    const result = smoothArpStart(notes, 'F3');
    expect(result[0]).toBe('E3');
    expect(result).toHaveLength(4);
  });

  it('preserves order after rotation', () => {
    const notes = ['C3', 'E3', 'G3', 'C4'];
    const result = smoothArpStart(notes, 'A3');
    // A3 is closest to G3 (index 2)
    expect(result).toEqual(['G3', 'C4', 'C3', 'E3']);
  });

  it('returns unchanged if no reference', () => {
    const notes = ['C3', 'E3', 'G3'];
    expect(smoothArpStart(notes, null)).toEqual(notes);
  });

  it('returns unchanged for single note', () => {
    expect(smoothArpStart(['C3'], 'G4')).toEqual(['C3']);
  });

  it('handles reference matching first note', () => {
    const notes = ['C3', 'E3', 'G3'];
    const result = smoothArpStart(notes, 'C3');
    expect(result[0]).toBe('C3');
  });

  it('handles sharps and flats', () => {
    const notes = ['C3', 'Eb3', 'G3', 'Bb3'];
    // F#3 is closest to G3
    const result = smoothArpStart(notes, 'F#3');
    expect(result[0]).toBe('G3');
  });
});

describe('nearbyNotes', () => {
  it('filters to notes within range', () => {
    const notes = ['C2', 'C3', 'E3', 'G3', 'C4', 'C5'];
    // Reference E3, range 5 semitones: should get C3, E3, G3
    const result = nearbyNotes(notes, 'E3', 5, 2);
    expect(result).toContain('C3');
    expect(result).toContain('E3');
    expect(result).toContain('G3');
    expect(result).not.toContain('C2');
    expect(result).not.toContain('C5');
  });

  it('returns all notes if pool is small', () => {
    const notes = ['C3', 'E3'];
    const result = nearbyNotes(notes, 'C5', 5, 3);
    expect(result).toEqual(notes);
  });

  it('falls back to closest N when range too narrow', () => {
    const notes = ['C2', 'C3', 'C4', 'C5', 'C6'];
    // Reference C4, range 1 semitone: only C4 matches, but minNotes=3
    const result = nearbyNotes(notes, 'C4', 1, 3);
    expect(result).toHaveLength(3);
    expect(result).toContain('C4');
  });

  it('returns unchanged if no reference', () => {
    const notes = ['C3', 'E3', 'G3'];
    expect(nearbyNotes(notes, null)).toEqual(notes);
  });
});
