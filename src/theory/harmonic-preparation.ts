/**
 * Harmonic preparation — dissonance preparation technique.
 *
 * In classical counterpoint, dissonant intervals are prepared by
 * sounding the dissonant note as a consonance first, then holding
 * it while the harmony changes underneath. This creates smooth,
 * inevitable dissonance rather than abrupt clash.
 *
 * Applied by detecting upcoming dissonant intervals and suggesting
 * preparatory notes to insert before the dissonance.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood preparation strength.
 */
const PREPARATION_STRENGTH: Record<Mood, number> = {
  trance:    0.15,  // minimal — drives forward
  avril:     0.55,  // strong — classical preparation
  disco:     0.20,  // light
  downtempo: 0.45,  // smooth jazz preparation
  blockhead: 0.25,  // some
  lofi:      0.50,  // jazzy — prepared dissonances
  flim:      0.40,  // organic preparation
  xtal:      0.35,  // moderate
  syro:      0.20,  // IDM — raw dissonance OK
  ambient:   0.30,  // gentle preparation,
  plantasia: 0.30,
};

/**
 * Interval consonance classification.
 * true = consonant (good preparation target), false = dissonant.
 */
const CONSONANT_INTERVALS: Record<number, boolean> = {
  0: true,   // unison
  3: true,   // minor 3rd
  4: true,   // major 3rd
  5: true,   // perfect 4th
  7: true,   // perfect 5th
  8: true,   // minor 6th
  9: true,   // major 6th
  12: true,  // octave
};

/**
 * Check if an interval (in semitones mod 12) is consonant.
 */
export function isConsonantInterval(semitones: number): boolean {
  const normalized = ((semitones % 12) + 12) % 12;
  return CONSONANT_INTERVALS[normalized] === true;
}

/**
 * Check if a note would be dissonant against a chord.
 *
 * @param noteMidi MIDI pitch of the note
 * @param chordMidis MIDI pitches of the chord tones
 * @returns true if the note creates dissonance with any chord tone
 */
export function isDissonantAgainstChord(
  noteMidi: number,
  chordMidis: number[]
): boolean {
  for (const chordMidi of chordMidis) {
    const interval = Math.abs(noteMidi - chordMidi) % 12;
    if (!isConsonantInterval(interval)) {
      return true;
    }
  }
  return false;
}

/**
 * Suggest a preparation note for a dissonant target.
 * The preparation should be consonant with the CURRENT chord
 * and as close as possible to the dissonant target note.
 *
 * @param targetMidi MIDI pitch of the upcoming dissonant note
 * @param currentChordMidis MIDI pitches of the current chord
 * @param scaleMidis Available scale MIDI pitches in range
 * @returns Best preparation MIDI pitch, or null if no good preparation
 */
export function suggestPreparation(
  targetMidi: number,
  currentChordMidis: number[],
  scaleMidis: number[]
): number | null {
  if (scaleMidis.length === 0) return null;

  // Find scale notes within ±4 semitones that are consonant with current chord
  const candidates = scaleMidis
    .filter(midi => {
      const dist = Math.abs(midi - targetMidi);
      return dist > 0 && dist <= 4 && !isDissonantAgainstChord(midi, currentChordMidis);
    })
    .sort((a, b) => Math.abs(a - targetMidi) - Math.abs(b - targetMidi));

  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Should preparation be applied based on tick hash?
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns true if preparation should be attempted
 */
export function shouldPrepare(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const strength = PREPARATION_STRENGTH[mood];
  const sectionMult: Record<Section, number> = {
    intro:     0.8,
    build:     1.0,
    peak:      0.6,  // less preparation at peak — raw energy
    breakdown: 1.2,  // more preparation — smooth
    groove:    1.0,
  };
  const threshold = strength * (sectionMult[section] ?? 1.0);
  const hash = ((tick * 2654435761) >>> 0) / 4294967296;
  return hash < threshold;
}

/**
 * Get preparation strength for a mood (for testing).
 */
export function preparationStrength(mood: Mood): number {
  return PREPARATION_STRENGTH[mood];
}
