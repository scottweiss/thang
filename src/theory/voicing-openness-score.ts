/**
 * Voicing openness score — open vs close voicing for spaciousness.
 *
 * Close voicings (notes within an octave) sound thick and dense.
 * Open voicings (notes spread across 2+ octaves) sound spacious.
 * Different sections and moods benefit from different voicing widths.
 * This module scores voicing openness and adjusts gain accordingly.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood openness preference (0 = close, 1 = open).
 */
const OPENNESS_PREFERENCE: Record<Mood, number> = {
  trance:    0.55,  // moderate-open — power chords
  avril:     0.65,  // open — orchestral spread
  disco:     0.40,  // moderate — tight groove
  downtempo: 0.60,  // open — spacious
  blockhead: 0.35,  // close — dense beats
  lofi:      0.50,  // moderate
  flim:      0.55,  // moderate-open
  xtal:      0.70,  // very open — atmospheric
  syro:      0.45,  // moderate
  ambient:   0.75,  // most open — spacious voicings,
  plantasia: 0.75,
};

/**
 * Section openness modifier.
 */
const SECTION_OPENNESS: Record<Section, number> = {
  intro:     0.7,
  build:     0.5,
  peak:      0.4,
  breakdown: 0.8,
  groove:    0.5,
};

/**
 * Score voicing openness (0 = very close, 1 = very open).
 */
function opennessScore(lowestMidi: number, highestMidi: number): number {
  const span = Math.abs(highestMidi - lowestMidi);
  // 0 semitones = 0, 12 = 0.5, 24+ = 1.0
  return Math.min(1.0, span / 24);
}

/**
 * Calculate voicing openness gain adjustment.
 *
 * @param lowestMidi Lowest note MIDI number
 * @param highestMidi Highest note MIDI number
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.93 - 1.06)
 */
export function opennessGain(
  lowestMidi: number,
  highestMidi: number,
  mood: Mood,
  section: Section
): number {
  const moodPref = OPENNESS_PREFERENCE[mood];
  const sectionPref = SECTION_OPENNESS[section];
  const target = moodPref * 0.6 + sectionPref * 0.4;

  const actual = opennessScore(lowestMidi, highestMidi);
  const alignment = 1.0 - Math.abs(actual - target);

  const adjustment = (alignment - 0.5) * 0.10;
  return Math.max(0.93, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get openness preference for a mood (for testing).
 */
export function opennessPreference(mood: Mood): number {
  return OPENNESS_PREFERENCE[mood];
}
