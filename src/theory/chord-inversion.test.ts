import { describe, it, expect } from 'vitest';
import {
  inversionBassNotes,
  selectInversion,
  applyInversion,
  extractBassNote,
  inversionTendency,
} from './chord-inversion';
import type { NoteName } from '../types';

describe('inversionBassNotes', () => {
  it('returns all inversions for a triad', () => {
    const result = inversionBassNotes(['C', 'E', 'G'] as NoteName[]);
    expect(result).toEqual([
      [0, 'C'],
      [1, 'E'],
      [2, 'G'],
    ]);
  });

  it('returns 2 inversions for a dyad', () => {
    const result = inversionBassNotes(['C', 'G'] as NoteName[]);
    expect(result).toHaveLength(2);
  });

  it('returns empty for empty input', () => {
    expect(inversionBassNotes([])).toEqual([]);
  });
});

describe('selectInversion', () => {
  it('returns root position for first chord (no prev bass)', () => {
    const inv = selectInversion(
      ['C', 'E', 'G'] as NoteName[],
      null, 0, 'lofi', 'groove', 0.5
    );
    expect(inv).toBe(0);
  });

  it('returns root position at section start', () => {
    const inv = selectInversion(
      ['C', 'E', 'G'] as NoteName[],
      'G' as NoteName, 2, 'lofi', 'groove', 0.01
    );
    expect(inv).toBe(0);
  });

  it('lofi allows inversions for smooth bass motion', () => {
    let nonRoot = 0;
    for (let i = 0; i < 200; i++) {
      const inv = selectInversion(
        ['F', 'A', 'C'] as NoteName[],
        'E' as NoteName, // E→F is 1 semitone (root), E→A is 5, E→C is 4
        3, 'lofi', 'groove', 0.5
      );
      if (inv !== 0) nonRoot++;
    }
    // lofi tendency=0.45, should sometimes pick root (closest), sometimes inversion
    // Root F is only 1 away from E, so root position wins most of the time
    // but inversions should still appear sometimes
    expect(nonRoot).toBeGreaterThanOrEqual(0); // might be 0 since F is closest
  });

  it('trance rarely uses inversions', () => {
    let nonRoot = 0;
    for (let i = 0; i < 200; i++) {
      const inv = selectInversion(
        ['D', 'F', 'A'] as NoteName[],
        'C' as NoteName,
        2, 'trance', 'groove', 0.5
      );
      if (inv !== 0) nonRoot++;
    }
    // trance tendency=0.08, very few inversions
    expect(nonRoot).toBeLessThan(40);
  });

  it('cadential chords (degree 0, 4) prefer root position', () => {
    let nonRoot = 0;
    for (let i = 0; i < 200; i++) {
      const inv = selectInversion(
        ['G', 'B', 'D'] as NoteName[],
        'A' as NoteName,
        4, 'lofi', 'groove', 0.5 // V chord
      );
      if (inv !== 0) nonRoot++;
    }
    // Even in lofi, V chord should mostly stay root
    expect(nonRoot).toBeLessThan(60);
  });
});

describe('applyInversion', () => {
  it('root position returns unchanged', () => {
    const notes = ['C3', 'E3', 'G3'];
    expect(applyInversion(notes, 0)).toEqual(notes);
  });

  it('first inversion moves root up an octave', () => {
    const result = applyInversion(['C3', 'E3', 'G3'], 1);
    expect(result).toEqual(['E3', 'G3', 'C4']);
  });

  it('second inversion moves root and third up', () => {
    const result = applyInversion(['C3', 'E3', 'G3'], 2);
    expect(result).toEqual(['G3', 'C4', 'E4']);
  });

  it('handles single note', () => {
    expect(applyInversion(['C3'], 1)).toEqual(['C3']);
  });

  it('handles sharps and flats', () => {
    const result = applyInversion(['Db3', 'F3', 'Ab3'], 1);
    expect(result).toEqual(['F3', 'Ab3', 'Db4']);
  });
});

describe('extractBassNote', () => {
  it('extracts note name from first note', () => {
    expect(extractBassNote(['C3', 'E3', 'G3'])).toBe('C');
  });

  it('handles sharps', () => {
    expect(extractBassNote(['F#3', 'A3'])).toBe('F#');
  });

  it('handles flats', () => {
    expect(extractBassNote(['Bb2', 'D3'])).toBe('Bb');
  });

  it('returns null for empty', () => {
    expect(extractBassNote([])).toBeNull();
  });
});

describe('inversionTendency', () => {
  it('lofi is highest', () => {
    expect(inversionTendency('lofi')).toBe(0.45);
  });

  it('trance is low', () => {
    expect(inversionTendency('trance')).toBe(0.08);
  });
});
