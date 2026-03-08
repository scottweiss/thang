import { describe, it, expect } from 'vitest';
import { placePeak, moodPeakPosition, shouldPlacePeak } from './phrase-peak';

describe('placePeak', () => {
  it('moves highest note toward target position', () => {
    // C5 is highest, initially at position 0 (first note)
    const elements = ['C5', 'E3', '~', 'G3', 'A3', '~', 'D3', 'B3'];
    // Target 0.67 = 4th of 6 non-rest notes (index in noteIndices = 4)
    const result = placePeak(elements, 0.67);
    // C5 should no longer be first
    const notePositions = result.map((e, i) => e !== '~' ? i : -1).filter(i => i >= 0);
    const c5Pos = result.indexOf('C5');
    // C5 should be near the later part of the phrase
    expect(notePositions.indexOf(c5Pos)).toBeGreaterThan(2);
  });

  it('preserves rests', () => {
    const elements = ['C3', '~', 'E3', 'G5', '~', 'A3'];
    const result = placePeak(elements, 0.67);
    expect(result[1]).toBe('~');
    expect(result[4]).toBe('~');
  });

  it('returns unchanged if too few notes', () => {
    const elements = ['C3', '~', 'E3'];
    expect(placePeak(elements, 0.67)).toEqual(elements);
  });

  it('returns unchanged if peak already near target', () => {
    // 4 notes, target 0.67 = position 2 (3rd note)
    // G5 (highest) is already at the 3rd non-rest position
    const elements = ['C3', 'E3', 'G5', 'A3'];
    const result = placePeak(elements, 0.67);
    expect(result[2]).toBe('G5'); // unchanged
  });

  it('handles all same octave notes', () => {
    const elements = ['C3', 'E3', 'G3', 'B3', 'D3', 'F3'];
    // B3 is highest (B=11), should move toward position ~4 (0.67*6≈4)
    const result = placePeak(elements, 0.67);
    expect(result).toHaveLength(6);
    // All notes should still be present
    const sorted = [...result].sort();
    expect(sorted).toEqual(['B3', 'C3', 'D3', 'E3', 'F3', 'G3']);
  });

  it('does not modify rest-only arrays', () => {
    const elements = ['~', '~', '~', '~'];
    expect(placePeak(elements, 0.67)).toEqual(elements);
  });
});

describe('moodPeakPosition', () => {
  it('trance peaks later than ambient', () => {
    expect(moodPeakPosition('trance')).toBeGreaterThan(moodPeakPosition('ambient'));
  });

  it('all values are between 0.4 and 0.8', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      const p = moodPeakPosition(mood);
      expect(p).toBeGreaterThanOrEqual(0.4);
      expect(p).toBeLessThanOrEqual(0.8);
    }
  });
});

describe('shouldPlacePeak', () => {
  it('returns boolean', () => {
    const result = shouldPlacePeak('lofi');
    expect(typeof result).toBe('boolean');
  });
});
