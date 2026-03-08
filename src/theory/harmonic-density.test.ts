import { describe, it, expect } from 'vitest';
import {
  targetChordSize,
  addChordExtension,
  simplifyChord,
  adjustChordDensity,
} from './harmonic-density';

describe('targetChordSize', () => {
  it('breakdown returns 3', () => {
    expect(targetChordSize('breakdown', 0.5)).toBe(3);
  });

  it('peak with high tension returns 5', () => {
    expect(targetChordSize('peak', 0.9)).toBe(5);
  });

  it('clamped to [3, 5]', () => {
    // Intro with any tension should not go below 3
    expect(targetChordSize('intro', 0)).toBeGreaterThanOrEqual(3);
    // Peak with max tension should not exceed 5
    expect(targetChordSize('peak', 1)).toBeLessThanOrEqual(5);
    // Build with extreme tension
    expect(targetChordSize('build', 1)).toBeLessThanOrEqual(5);
    expect(targetChordSize('build', 0)).toBeGreaterThanOrEqual(3);
  });
});

describe('addChordExtension', () => {
  const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  it('adds 9th when target is 4', () => {
    const triad = ['C3', 'E3', 'G3'];
    const result = addChordExtension(triad, cMajorScale, 4);
    expect(result).toHaveLength(4);
    // 9th of C in C major scale is E (2 scale steps up from C)
    expect(result[3]).toBe('E4'); // placed in octave above highest note (3+1=4)
  });

  it("doesn't exceed target size", () => {
    const triad = ['C3', 'E3', 'G3'];
    const result = addChordExtension(triad, cMajorScale, 4);
    expect(result).toHaveLength(4);
  });

  it('returns unchanged if already at target', () => {
    const chord = ['C3', 'E3', 'G3', 'B3'];
    const result = addChordExtension(chord, cMajorScale, 4);
    expect(result).toEqual(chord);
  });
});

describe('simplifyChord', () => {
  it('removes highest notes first', () => {
    const chord = ['C3', 'E3', 'G3', 'B3', 'D4'];
    const result = simplifyChord(chord, 3);
    expect(result).toHaveLength(3);
    expect(result).toEqual(['C3', 'E3', 'G3']);
  });

  it('keeps root and basic triad', () => {
    const chord = ['C3', 'E3', 'G3', 'B3', 'D4'];
    const result = simplifyChord(chord, 3);
    expect(result[0]).toBe('C3'); // root preserved
    expect(result).toHaveLength(3); // triad preserved
  });
});

describe('adjustChordDensity', () => {
  const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  it('breakdown simplifies to triad', () => {
    const extended = ['C3', 'E3', 'G3', 'B3', 'D4'];
    const result = adjustChordDensity(extended, cMajorScale, 'breakdown', 0.5);
    expect(result).toHaveLength(3);
    expect(result).toEqual(['C3', 'E3', 'G3']);
  });

  it('peak adds extensions', () => {
    const triad = ['C3', 'E3', 'G3'];
    const result = adjustChordDensity(triad, cMajorScale, 'peak', 0.9);
    expect(result.length).toBeGreaterThan(3);
    expect(result.length).toBe(5);
  });
});
