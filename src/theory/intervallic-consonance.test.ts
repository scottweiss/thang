import { describe, it, expect } from 'vitest';
import { noteConsonance, consonanceWeights, noteToPitch } from './intervallic-consonance';

describe('noteToPitch', () => {
  it('converts basic notes', () => {
    expect(noteToPitch('C4')).toBe(48);
    expect(noteToPitch('A4')).toBe(57);
    expect(noteToPitch('C5')).toBe(60);
  });

  it('handles sharps and flats', () => {
    expect(noteToPitch('C#4')).toBe(49);
    expect(noteToPitch('Db4')).toBe(49);
    expect(noteToPitch('F#3')).toBe(42);
    expect(noteToPitch('Bb5')).toBe(70);
  });
});

describe('noteConsonance', () => {
  it('unison is maximally consonant', () => {
    expect(noteConsonance(60, [60])).toBeGreaterThan(0.9);
  });

  it('perfect 5th is highly consonant', () => {
    // C4 against G3 (7 semitones)
    expect(noteConsonance(60, [53])).toBeGreaterThan(0.7);
  });

  it('minor 2nd is dissonant', () => {
    // C4 against B3 (1 semitone)
    expect(noteConsonance(60, [59])).toBeLessThan(0.4);
  });

  it('tritone is dissonant', () => {
    // C4 against F#3 (6 semitones)
    expect(noteConsonance(60, [54])).toBeLessThan(0.4);
  });

  it('major 3rd is consonant', () => {
    // C4 against E3 (4 semitones = major 3rd)
    expect(noteConsonance(60, [56])).toBeGreaterThan(0.6);
  });

  it('best relationship dominates with multiple chord tones', () => {
    // C4 against [B3, G3] — dissonant with B3 but consonant with G3
    const score = noteConsonance(60, [59, 55]);
    // Should be pulled up by the good relationship with G3 (P5)
    expect(score).toBeGreaterThan(0.5);
  });

  it('returns 0.5 for empty chord', () => {
    expect(noteConsonance(60, [])).toBe(0.5);
  });

  it('octave equivalence works', () => {
    // C4 against C2 — still unison class
    expect(noteConsonance(60, [36])).toBeGreaterThan(0.9);
  });
});

describe('consonanceWeights', () => {
  it('returns correct length', () => {
    const w = consonanceWeights(5, [60, 62, 64, 65, 67], [60, 64, 67], 0.5);
    expect(w.length).toBe(5);
  });

  it('chord tones get highest weights', () => {
    // C major chord tones: C4=48, E4=52, G4=55
    const ladder = [48, 49, 50, 51, 52, 53, 54, 55]; // C4 through G4
    const chord = [48, 52, 55]; // C, E, G
    const w = consonanceWeights(8, ladder, chord, 0.3);

    // Chord tones (indices 0, 4, 7) should be higher than dissonant neighbors
    expect(w[0]).toBeGreaterThan(w[1]); // C > C#
    expect(w[4]).toBeGreaterThan(w[3]); // E > Eb
    expect(w[7]).toBeGreaterThan(w[6]); // G > F#
  });

  it('high tension reduces consonance preference', () => {
    const ladder = [48, 49, 50, 51, 52];
    const chord = [48]; // C only

    const lowT = consonanceWeights(5, ladder, chord, 0.1);
    const highT = consonanceWeights(5, ladder, chord, 0.9);

    // At low tension, the spread should be wider (more discrimination)
    const lowSpread = lowT[0] - lowT[1]; // C vs C# (unison vs m2)
    const highSpread = highT[0] - highT[1];
    expect(lowSpread).toBeGreaterThan(highSpread);
  });

  it('all weights are positive', () => {
    const w = consonanceWeights(10, [48,49,50,51,52,53,54,55,56,57], [48, 52, 55], 0.5);
    for (const weight of w) {
      expect(weight).toBeGreaterThan(0);
    }
  });

  it('empty chord returns uniform weights', () => {
    const w = consonanceWeights(5, [60,62,64,65,67], [], 0.5);
    expect(w.every(v => v === 1.0)).toBe(true);
  });

  it('handles empty ladder', () => {
    expect(consonanceWeights(0, [], [60], 0.5)).toEqual([]);
  });
});
