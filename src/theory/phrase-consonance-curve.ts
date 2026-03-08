/**
 * Intra-phrase consonance curve — tension profile within a single phrase.
 *
 * Every melodic phrase has internal tension that rises and resolves
 * toward a resting tone. This module generates a per-note tension
 * multiplier based on distance from the phrase center (usually root),
 * creating micro-resolution dynamics within phrases.
 *
 * Applied as gain/decay modulation per note position.
 */

import type { Mood } from '../types';

/**
 * Per-mood consonance sensitivity (higher = tighter phrase shaping).
 */
const CONSONANCE_SENSITIVITY: Record<Mood, number> = {
  trance:    0.40,  // hypnotic plateau
  avril:     0.85,  // tight classical phrasing
  disco:     0.45,  // beat-driven
  downtempo: 0.60,  // laid-back resolution
  blockhead: 0.50,  // linear
  lofi:      0.65,  // relaxed jazz
  flim:      0.70,  // organic breathing
  xtal:      0.80,  // crystalline intonation
  syro:      0.55,  // playful
  ambient:   0.75,  // gentle gravity
};

const NOTE_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/**
 * Calculate pitch-class distance (0-6, wrapping at octave).
 */
function pcDistance(a: number, b: number): number {
  const raw = Math.abs(a - b);
  return Math.min(raw, 12 - raw);
}

/**
 * Generate tension profile for a melodic phrase.
 * Returns per-note tension multiplier (0.6 = relaxed, 1.2 = tense).
 *
 * @param notes Array of note strings (e.g. ["C4", "D4", "~", "E4"])
 * @param phraseRoot Root pitch class name (e.g. "C")
 * @param mood Current mood
 * @returns Array of tension multipliers (same length as notes)
 */
export function phraseTensionProfile(
  notes: string[],
  phraseRoot: string,
  mood: Mood
): number[] {
  const rootPc = NOTE_PC[phraseRoot] ?? 0;
  const sensitivity = CONSONANCE_SENSITIVITY[mood];

  return notes.map(note => {
    if (note === '~') return 1.0; // rests are neutral
    const name = note.replace(/\d+$/, '');
    const pc = NOTE_PC[name];
    if (pc === undefined) return 1.0;

    const dist = pcDistance(pc, rootPc);
    // Closer to root = more consonant (lower tension)
    // Distance 0 = 0.6 (relaxed), distance 6 = 1.2 (tense)
    const tension = 0.6 + (dist / 6) * 0.6 * sensitivity;
    return Math.max(0.6, Math.min(1.2, tension));
  });
}

/**
 * Find the resolution point — where tension resolves in the phrase.
 * Usually the last non-rest note closest to the root.
 *
 * @param notes Array of note strings
 * @param phraseRoot Root pitch class name
 * @param mood Current mood
 * @returns Index of resolution point (-1 if no resolution found)
 */
export function resolvePoint(
  notes: string[],
  phraseRoot: string,
  mood: Mood
): number {
  const rootPc = NOTE_PC[phraseRoot] ?? 0;
  let bestIdx = -1;
  let bestDist = 12;

  // Search from end — resolution tends to be near phrase end
  for (let i = notes.length - 1; i >= Math.floor(notes.length * 0.5); i--) {
    if (notes[i] === '~') continue;
    const name = notes[i].replace(/\d+$/, '');
    const pc = NOTE_PC[name];
    if (pc === undefined) continue;
    const dist = pcDistance(pc, rootPc);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Calculate gain multiplier from tension profile.
 * Higher tension = slightly louder (more prominent).
 *
 * @param tensionValue Per-note tension (0.6 - 1.2)
 * @param mood Current mood
 * @returns Gain multiplier (0.92 - 1.08)
 */
export function tensionGainMultiplier(
  tensionValue: number,
  mood: Mood
): number {
  const sensitivity = CONSONANCE_SENSITIVITY[mood];
  const deviation = tensionValue - 0.9; // center around 0.9
  return Math.max(0.92, Math.min(1.08, 1.0 + deviation * sensitivity * 0.15));
}

/**
 * Get consonance sensitivity for a mood (for testing).
 */
export function consonanceSensitivity(mood: Mood): number {
  return CONSONANCE_SENSITIVITY[mood];
}
