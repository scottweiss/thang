/**
 * Pedal point (pedal tone) support for sustained bass notes.
 *
 * A pedal point is a sustained bass note held while harmony changes above it.
 * It creates tension when the chord conflicts with the pedal and resolution
 * when harmony returns to consonance. Classic uses:
 *
 * - Tonic pedal: held during intro/outro for stability
 * - Dominant pedal: held during builds to create anticipation
 * - Inverted pedal: high sustained note (used in melody, less common)
 *
 * The conflict between the pedal and moving harmony is what makes it
 * interesting — the ear anchors to the pedal while chords shift above,
 * creating a push-pull between stability and motion.
 */

import type { Section } from '../types';

/** Note name to chromatic pitch class (0-11) */
const NOTE_VALUES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/**
 * Extract the pitch class name from a note string, stripping any octave number.
 * e.g. "C2" → "C", "F#4" → "F#", "D" → "D"
 */
function noteClass(note: string): string {
  return note.replace(/\d+$/, '');
}

/**
 * Get the chromatic pitch class (0-11) for a note string.
 */
function pitchClass(note: string): number {
  return NOTE_VALUES[noteClass(note)] ?? 0;
}

/**
 * Minimum semitone distance between two pitch classes (0-6),
 * accounting for octave wrapping.
 */
function semitoneDist(a: number, b: number): number {
  const diff = Math.abs(a - b) % 12;
  return Math.min(diff, 12 - diff);
}

/**
 * Determine if a pedal point is appropriate right now.
 *
 * Probability varies by section — intro and build favour pedals,
 * peak and groove let harmony move freely. Only triggers near
 * chord changes (ticksSinceChordChange < 3) so the pedal activates
 * at musically meaningful moments.
 */
export function shouldUsePedal(
  section: Section,
  tension: number,
  ticksSinceChordChange: number,
): boolean {
  // Only activate near chord changes
  if (ticksSinceChordChange >= 3) return false;

  let probability: number;
  switch (section) {
    case 'intro':
      probability = 0.6;
      break;
    case 'build':
      probability = tension > 0.5 ? 0.7 : 0;
      break;
    case 'peak':
      probability = 0.2;
      break;
    case 'breakdown':
      probability = 0.5;
      break;
    case 'groove':
      probability = 0.15;
      break;
    default:
      probability = 0;
  }

  return Math.random() < probability;
}

/**
 * Returns which note to use as the pedal, in bass register (octave 2).
 *
 * - Intro/breakdown: tonic pedal (stability, grounding)
 * - Build: dominant pedal (creates anticipation, wants to resolve)
 * - Peak/groove: falls back to tonic
 */
export function getPedalNote(
  section: Section,
  scaleRoot: string,
  scaleDegree5th: string,
): string {
  let note: string;
  switch (section) {
    case 'intro':
    case 'breakdown':
      note = scaleRoot;
      break;
    case 'build':
      note = scaleDegree5th;
      break;
    case 'peak':
    case 'groove':
    default:
      note = scaleRoot;
      break;
  }
  return `${note}2`;
}

/**
 * Measure how much the pedal conflicts with the current chord (0-1).
 *
 * - 0:   pedal note is in the chord (consonant)
 * - 0.3: pedal is not close to any chord tone (neutral)
 * - 0.5: pedal is a whole step from a chord tone (mild tension)
 * - 0.9: pedal is a half step from a chord tone (strong dissonance)
 *
 * This value can drive gain/filter adjustments on the pedal voice.
 */
export function pedalConflictTension(
  pedalNote: string,
  chordNotes: string[],
): number {
  const pedalPC = pitchClass(pedalNote);
  const chordPCs = chordNotes.map(pitchClass);

  // Consonant: pedal is a chord tone
  if (chordPCs.some(pc => semitoneDist(pc, pedalPC) === 0)) return 0;

  // Check for half-step and whole-step relationships
  let minDist = Infinity;
  for (const pc of chordPCs) {
    const d = semitoneDist(pc, pedalPC);
    if (d < minDist) minDist = d;
  }

  if (minDist === 1) return 0.9;  // half step — strong dissonance
  if (minDist === 2) return 0.5;  // whole step — mild tension

  return 0.3;  // neutral
}

/**
 * Compute a gain multiplier (0.5-1.0) for the pedal voice based on
 * harmonic conflict and current section.
 *
 * The key idea: in build sections, lean INTO tension (louder pedal
 * emphasises the anticipation). In breakdown, soften the dissonance
 * for a gentler return to stability.
 */
export function pedalGainCurve(
  conflictTension: number,
  section: Section,
): number {
  switch (section) {
    case 'build':
      return 0.7 + conflictTension * 0.2;   // louder with tension
    case 'breakdown':
      return 0.8 - conflictTension * 0.2;   // softer with tension
    case 'intro':
      return 0.7;                            // consistent, grounding
    case 'peak':
      return 0.6;                            // reduced, let harmony speak
    case 'groove':
      return 0.65;                           // moderate presence
    default:
      return 0.7;
  }
}
