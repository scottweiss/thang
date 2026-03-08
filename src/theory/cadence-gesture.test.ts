import { describe, it, expect } from 'vitest';
import { applyCadenceGesture } from './cadence-gesture';

describe('applyCadenceGesture', () => {
  const ladder = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
  const chordIndices = [0, 2, 4]; // C, E, G (C major triad)

  it('returns correct length', () => {
    const elements = ['C3', 'D3', 'E3', '~', 'F3', 'G3', '~', '~'];
    const result = applyCadenceGesture(elements, ladder, chordIndices, 'avril');
    expect(result).toHaveLength(8);
  });

  it('preserves rests', () => {
    const elements = ['C3', '~', 'E3', '~', '~', '~', '~', '~'];
    const result = applyCadenceGesture(elements, ladder, chordIndices, 'lofi');
    expect(result[1]).toBe('~');
    expect(result[3]).toBe('~');
  });

  it('modifies phrase-ending notes', () => {
    // Run many times — at least some should modify the ending
    const elements = ['C3', 'D3', 'F3', 'A3', '~', '~', '~', '~'];
    let modified = false;
    for (let i = 0; i < 50; i++) {
      const result = applyCadenceGesture(elements, ladder, chordIndices, 'avril');
      if (result[3] !== 'A3' || result[2] !== 'F3') {
        modified = true;
        break;
      }
    }
    expect(modified).toBe(true);
  });

  it('ending notes resolve to chord tones', () => {
    const elements = ['C3', 'D3', 'F3', 'A3', '~', '~', '~', '~'];
    for (let i = 0; i < 50; i++) {
      const result = applyCadenceGesture(elements, ladder, chordIndices, 'avril');
      const lastNote = result[3];
      if (lastNote !== 'A3') {
        // If modified, the last note should be a chord tone
        const lastIdx = ladder.indexOf(lastNote);
        expect(chordIndices).toContain(lastIdx);
      }
    }
  });

  it('does not modify single-note phrases', () => {
    const elements = ['~', 'C3', '~', '~'];
    const result = applyCadenceGesture(elements, ladder, chordIndices, 'lofi');
    // Single note phrase — should not be modified (needs >= 2 notes)
    expect(result[1]).toBe('C3');
  });

  it('handles empty elements', () => {
    expect(applyCadenceGesture([], ladder, chordIndices, 'lofi')).toEqual([]);
  });

  it('handles all rests', () => {
    const elements = ['~', '~', '~', '~'];
    expect(applyCadenceGesture(elements, ladder, chordIndices, 'lofi')).toEqual(elements);
  });

  it('handles empty chord indices', () => {
    const elements = ['C3', 'D3', 'E3', '~'];
    expect(applyCadenceGesture(elements, ladder, [], 'lofi')).toEqual(elements);
  });

  it('handles short ladder', () => {
    const elements = ['C3', 'D3', '~'];
    expect(applyCadenceGesture(elements, ['C3', 'D3'], [0], 'lofi')).toHaveLength(3);
  });
});
