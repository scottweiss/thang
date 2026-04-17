/**
 * Vertical sonority analysis — interval-based dissonance model for chords.
 *
 * Analyzes the vertical "sound" of a chord by measuring the intervallic
 * content between all note pairs. This allows the system to:
 *
 * 1. Score a voicing's consonance/dissonance (roughness)
 * 2. Choose extensions that match the mood's target roughness
 * 3. Prefer voicings with optimal spacing for the current section
 *
 * Based on Hindemith's interval classification and psychoacoustic
 * roughness models. Perfect intervals (P5, P4, octave) are consonant;
 * minor seconds and tritones are dissonant; thirds and sixths are moderate.
 *
 * Different moods have different "target roughness" levels:
 * - Jazz (lofi): moderate roughness (crunchy 7ths, 9ths welcome)
 * - Ambient: low roughness (open intervals, no clusters)
 * - IDM (syro): high roughness (minor 2nds, tritones acceptable)
 */

import type { Mood, Section } from '../types';

/**
 * Interval roughness scores (semitone distance → roughness).
 * Based on psychoacoustic dissonance curves.
 * 0 = perfectly consonant, 1 = maximally rough.
 */
const INTERVAL_ROUGHNESS: Record<number, number> = {
  0:  0.0,   // unison
  1:  0.95,  // minor 2nd (very rough)
  2:  0.6,   // major 2nd (moderate)
  3:  0.2,   // minor 3rd (consonant)
  4:  0.15,  // major 3rd (very consonant)
  5:  0.1,   // perfect 4th (consonant)
  6:  0.7,   // tritone (rough)
  7:  0.05,  // perfect 5th (very consonant)
  8:  0.2,   // minor 6th (consonant)
  9:  0.15,  // major 6th (very consonant)
  10: 0.55,  // minor 7th (moderate)
  11: 0.8,   // major 7th (rough)
};

/** Target roughness per mood (0 = pure consonance, 1 = max dissonance) */
const MOOD_TARGET_ROUGHNESS: Record<Mood, number> = {
  ambient:   0.10,   // open, pure intervals,
  plantasia: 0.10,
  xtal:      0.15,   // gentle warmth
  flim:      0.25,   // delicate tension
  avril:     0.20,   // intimate clarity
  downtempo: 0.30,   // smooth but colorful
  lofi:      0.40,   // jazz crunch welcome
  blockhead: 0.35,   // hip-hop richness
  disco:     0.30,   // funky but clean
  syro:      0.50,   // IDM loves dissonance
  trance:    0.25,   // clear power chords
};

/** Section modifies target roughness */
const SECTION_ROUGHNESS_OFFSET: Record<Section, number> = {
  intro:     -0.10,  // cleaner at start
  build:      0.05,  // slightly edgier
  peak:       0.10,  // most tension
  breakdown: -0.05,  // soften
  groove:     0.00,  // neutral
};

/**
 * Compute the roughness score for a set of notes.
 * Analyzes all pairwise intervals and averages their roughness.
 *
 * @param notes  Array of note names with octave (e.g., ['C3', 'E3', 'G3', 'B3'])
 * @returns Roughness score 0-1 (0 = perfectly smooth, 1 = maximally rough)
 */
export function voicingRoughness(notes: string[]): number {
  if (notes.length < 2) return 0;

  const midiValues = notes.map(noteToMidi).filter(m => m >= 0);
  if (midiValues.length < 2) return 0;

  let totalRoughness = 0;
  let pairs = 0;

  for (let i = 0; i < midiValues.length; i++) {
    for (let j = i + 1; j < midiValues.length; j++) {
      const interval = Math.abs(midiValues[j] - midiValues[i]) % 12;
      totalRoughness += INTERVAL_ROUGHNESS[interval] ?? 0.5;
      pairs++;
    }
  }

  return pairs > 0 ? totalRoughness / pairs : 0;
}

/**
 * Score how well a voicing matches the target sonority for the current mood/section.
 * Lower = better match. Used to compare voicing alternatives.
 *
 * @param notes    Voicing notes
 * @param mood     Current mood
 * @param section  Current section
 * @returns Distance from ideal roughness (0 = perfect match)
 */
export function sonorityDistance(
  notes: string[],
  mood: Mood,
  section: Section
): number {
  const roughness = voicingRoughness(notes);
  const target = targetRoughness(mood, section);
  return Math.abs(roughness - target);
}

/**
 * Choose the best voicing from alternatives based on sonority fit.
 *
 * @param alternatives  Array of voicing options
 * @param mood          Current mood
 * @param section       Current section
 * @returns Index of the best-fitting voicing
 */
export function bestSonority(
  alternatives: string[][],
  mood: Mood,
  section: Section
): number {
  if (alternatives.length === 0) return 0;

  let bestIdx = 0;
  let bestDist = Infinity;

  for (let i = 0; i < alternatives.length; i++) {
    const dist = sonorityDistance(alternatives[i], mood, section);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }

  return bestIdx;
}

/**
 * Whether an extension note would improve or worsen the sonority fit.
 *
 * @param baseNotes     Current chord notes
 * @param extensionNote Proposed extension note
 * @param mood          Current mood
 * @param section       Current section
 * @returns true if adding the extension moves closer to target roughness
 */
export function extensionImprovesSonority(
  baseNotes: string[],
  extensionNote: string,
  mood: Mood,
  section: Section
): boolean {
  const baseDist = sonorityDistance(baseNotes, mood, section);
  const extDist = sonorityDistance([...baseNotes, extensionNote], mood, section);
  return extDist < baseDist;
}

/**
 * Get the target roughness for a mood and section.
 */
export function targetRoughness(mood: Mood, section: Section): number {
  const base = MOOD_TARGET_ROUGHNESS[mood];
  const offset = SECTION_ROUGHNESS_OFFSET[section];
  return Math.max(0, Math.min(1, base + offset));
}

/**
 * Convert a note name to MIDI number for interval calculation.
 * Handles sharps and flats.
 */
function noteToMidi(note: string): number {
  const match = note.match(/^([A-G])(b|#)?(\d+)$/);
  if (!match) return -1;

  const [, name, accidental, octStr] = match;
  const baseMap: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };

  let midi = baseMap[name] ?? 0;
  if (accidental === '#') midi++;
  if (accidental === 'b') midi--;

  return midi + (parseInt(octStr) + 1) * 12;
}

/**
 * Get roughness for a specific interval (for testing).
 */
export function intervalRoughness(semitones: number): number {
  return INTERVAL_ROUGHNESS[semitones % 12] ?? 0.5;
}
