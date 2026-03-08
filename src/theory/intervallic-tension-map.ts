/**
 * Intervallic tension mapping — the interval between melody and bass
 * creates specific tension qualities.
 *
 * The relationship between the highest and lowest sounding notes
 * creates a "tension color" independent of the chords themselves:
 *
 * - Unison/octave: grounded, powerful
 * - Perfect 5th: open, stable
 * - Major 3rd: warm, bright
 * - Minor 3rd: dark, intimate
 * - Tritone: maximum tension, instability
 * - Major 7th: bittersweet, yearning
 * - Minor 2nd: harsh, dissonant (cluster)
 *
 * This module calculates the outer interval and provides multipliers
 * for reverb, FM depth, and gain that respond to the intervallic
 * tension, creating a more responsive and alive sound.
 */

import type { Mood } from '../types';

/**
 * Tension value for each interval in semitones (0-11).
 * Based on psychoacoustic consonance/dissonance ratings.
 */
const INTERVAL_TENSION: number[] = [
  0.00,  // 0: unison — no tension
  0.90,  // 1: minor 2nd — very dissonant
  0.60,  // 2: major 2nd — mild dissonance
  0.30,  // 3: minor 3rd — consonant
  0.25,  // 4: major 3rd — consonant
  0.20,  // 5: perfect 4th — consonant
  0.85,  // 6: tritone — very dissonant
  0.10,  // 7: perfect 5th — very consonant
  0.35,  // 8: minor 6th — mild consonance
  0.30,  // 9: major 6th — consonant
  0.70,  // 10: minor 7th — moderate dissonance
  0.80,  // 11: major 7th — dissonant
];

/**
 * Calculate the intervallic tension between two notes.
 *
 * @param note1  First note (e.g., 'C4')
 * @param note2  Second note (e.g., 'G4')
 * @returns Tension value (0 = consonant, 1 = dissonant)
 */
export function intervallicTension(note1: string, note2: string): number {
  const pc1 = noteToPitchClass(note1);
  const pc2 = noteToPitchClass(note2);
  if (pc1 === -1 || pc2 === -1) return 0.3; // fallback

  const interval = ((pc2 - pc1) % 12 + 12) % 12;
  return INTERVAL_TENSION[interval];
}

/**
 * Calculate outer interval tension between melody and bass layers.
 *
 * @param melodyNote  Highest sounding melody note
 * @param bassNote    Lowest sounding bass/drone note
 * @returns Tension value (0-1)
 */
export function outerIntervalTension(
  melodyNote: string | null,
  bassNote: string | null
): number {
  if (!melodyNote || !bassNote) return 0.3;
  if (melodyNote === '~' || bassNote === '~') return 0.3;
  return intervallicTension(bassNote, melodyNote);
}

/**
 * Reverb multiplier based on intervallic tension.
 * Consonant intervals get more reverb (spacious, open).
 * Dissonant intervals get less reverb (tight, focused).
 */
export function intervalReverb(tension: number, mood: Mood): number {
  const sensitivity = intervalSensitivity(mood);
  // Invert: low tension → more reverb, high tension → less
  return 1.0 + (0.5 - tension) * sensitivity * 0.3;
}

/**
 * FM depth multiplier based on intervallic tension.
 * Dissonant intervals get more FM (richer harmonics).
 * Consonant intervals get less FM (purer tone).
 */
export function intervalFmDepth(tension: number, mood: Mood): number {
  const sensitivity = intervalSensitivity(mood);
  return 1.0 + (tension - 0.3) * sensitivity * 0.25;
}

/**
 * Per-mood sensitivity to intervallic tension effects.
 */
export function intervalSensitivity(mood: Mood): number {
  const SENSITIVITY: Record<Mood, number> = {
    trance:    0.40,
    avril:     0.45,
    disco:     0.30,
    blockhead: 0.25,
    downtempo: 0.30,
    lofi:      0.35,
    flim:      0.20,
    xtal:      0.15,
    syro:      0.10,
    ambient:   0.08,
  };
  return SENSITIVITY[mood];
}

/** Convert note string to pitch class (0-11) */
function noteToPitchClass(note: string): number {
  const name = note.replace(/\d+$/, '');
  const PC: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };
  return PC[name] ?? -1;
}
