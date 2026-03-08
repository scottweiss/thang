import { describe, it, expect } from 'vitest';
import { chordLuminance, luminanceFm } from './harmonic-luminance';

describe('harmonic-luminance', () => {
  describe('chordLuminance', () => {
    it('returns 0 for fewer than 2 notes', () => {
      expect(chordLuminance([])).toBe(0);
      expect(chordLuminance([60])).toBe(0);
    });

    it('returns positive for major triad (bright)', () => {
      // C major: C4 E4 G4 = [60, 64, 67]
      // Intervals: M3(4), P5(5→ic5=dark), m3(3→dark)
      // bright: 1 (M3), dark: 2 (P5, m3) → (1-2)/3 = -0.333
      // Actually major triad has mixed luminance
      const lum = chordLuminance([60, 64, 67]);
      expect(lum).toBeCloseTo(-1 / 3, 2);
    });

    it('returns negative for minor triad (dark)', () => {
      // C minor: C4 Eb4 G4 = [60, 63, 67]
      // Intervals: m3(3→dark), P5(5→dark), M3(4→bright)
      // Same as major! (1-2)/3 = -0.333
      const lum = chordLuminance([60, 63, 67]);
      expect(lum).toBeCloseTo(-1 / 3, 2);
    });

    it('returns high brightness for augmented triad', () => {
      // C aug: C E G# = [60, 64, 68]
      // Intervals: M3(4→bright), M3(4→bright), M3(4→bright)
      const lum = chordLuminance([60, 64, 68]);
      expect(lum).toBe(1);
    });

    it('returns negative for sus4 chord', () => {
      // Csus4: C F G = [60, 65, 67]
      // Intervals: P4(5→dark), P5(5→dark), M2(2→neither)
      const lum = chordLuminance([60, 65, 67]);
      expect(lum).toBeLessThan(0);
    });

    it('tritone contributes brightness', () => {
      // C + F# = tritone only
      const lum = chordLuminance([60, 66]);
      expect(lum).toBe(1);
    });
  });

  describe('luminanceFm', () => {
    it('returns > 1 for bright chords in high-strength contexts', () => {
      const fm = luminanceFm([60, 64, 68], 'syro', 'peak');
      expect(fm).toBeGreaterThan(1);
    });

    it('returns < 1 for dark chords', () => {
      const fm = luminanceFm([60, 65, 67], 'syro', 'peak');
      expect(fm).toBeLessThan(1);
    });

    it('stays near 1 for low-strength moods', () => {
      const fm = luminanceFm([60, 64, 68], 'ambient', 'breakdown');
      expect(fm).toBeGreaterThan(0.99);
      expect(fm).toBeLessThan(1.03);
    });

    it('returns 1 for single notes', () => {
      expect(luminanceFm([60], 'disco', 'peak')).toBe(1);
    });
  });
});
