import { describe, it, expect } from 'vitest';
import { insertBreaths, breathingRate, ensurePhraseBoundary } from './phrase-breathing';

describe('insertBreaths', () => {
  it('breathDensity 0 returns unchanged', () => {
    const input = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
    const result = insertBreaths(input, 0, 3);
    expect(result).toEqual(input);
  });

  it('adds rests after consecutive notes', () => {
    // Long run of notes with high breath density should get some rests
    const input = Array(16).fill('C3');
    const result = insertBreaths(input, 1.0, 2);
    const restCount = result.filter((e) => e === '~').length;
    expect(restCount).toBeGreaterThan(0);
  });

  it('preserves first note of each phrase', () => {
    // First note and notes after rests should never be replaced
    const input = ['C3', '~', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
    const result = insertBreaths(input, 1.0, 2);
    // First note of the array is always preserved
    expect(result[0]).toBe('C3');
    // Rest stays as rest
    expect(result[1]).toBe('~');
    // First note after a rest (D3 at index 2) is preserved
    expect(result[2]).toBe('D3');
  });

  it('respects minPhraseLength', () => {
    // With minPhraseLength 6 and only 5 notes, no breaths should be inserted
    const input = ['C3', 'D3', 'E3', 'F3', 'G3'];
    const result = insertBreaths(input, 1.0, 6);
    expect(result).toEqual(input);
  });

  it('preserves array length', () => {
    const input = ['C3', 'D3', 'E3', '~', 'F3', 'G3', 'A3', 'B3'];
    const result = insertBreaths(input, 0.8, 3);
    expect(result).toHaveLength(input.length);
  });
});

describe('breathingRate', () => {
  it('breakdown has highest rate', () => {
    const breakdown = breathingRate('breakdown', 0);
    const intro = breathingRate('intro', 0);
    const build = breathingRate('build', 0);
    const peak = breathingRate('peak', 0);
    const groove = breathingRate('groove', 0);
    expect(breakdown).toBeGreaterThan(intro);
    expect(breakdown).toBeGreaterThan(build);
    expect(breakdown).toBeGreaterThan(peak);
    expect(breakdown).toBeGreaterThan(groove);
  });

  it('peak has lowest rate', () => {
    const peak = breathingRate('peak', 0);
    const intro = breathingRate('intro', 0);
    const build = breathingRate('build', 0);
    const breakdown = breathingRate('breakdown', 0);
    const groove = breathingRate('groove', 0);
    expect(peak).toBeLessThan(intro);
    expect(peak).toBeLessThan(build);
    expect(peak).toBeLessThan(breakdown);
    expect(peak).toBeLessThan(groove);
  });

  it('tension reduces breathing', () => {
    const relaxed = breathingRate('groove', 0);
    const tense = breathingRate('groove', 0.8);
    expect(tense).toBeLessThan(relaxed);
  });
});

describe('ensurePhraseBoundary', () => {
  it('enforces max consecutive limit', () => {
    const input = Array(16).fill('C3');
    const result = ensurePhraseBoundary(input, 8);
    // Check that no run of consecutive notes exceeds 8
    let consecutive = 0;
    for (const el of result) {
      if (el === '~') {
        consecutive = 0;
      } else {
        consecutive++;
        expect(consecutive).toBeLessThanOrEqual(8);
      }
    }
    // Should have inserted at least one rest
    expect(result.filter((e) => e === '~').length).toBeGreaterThan(0);
  });

  it('passes through arrays under limit', () => {
    const input = ['C3', 'D3', 'E3', '~', 'F3', 'G3'];
    const result = ensurePhraseBoundary(input, 8);
    expect(result).toEqual(input);
  });
});
