/**
 * Harmonic ellipsis — deliberate chord tone omission.
 *
 * Classical and jazz composers often omit chord tones to create
 * "hollow" voicings where the listener's ear fills in the gap.
 * Dropping the 5th keeps the quality clear but creates space.
 * Dropping the root over a bass note suggests freedom.
 * Dropping the 3rd creates ambiguity (neither major nor minor).
 *
 * Applied to harmony voicings to create breathing room.
 */

import type { Mood, Section, ChordQuality } from '../types';

/**
 * Per-mood ellipsis strength (probability of omission).
 */
const ELLIPSIS_STRENGTH: Record<Mood, number> = {
  trance:    0.10,  // full voicings for power
  avril:     0.40,  // classical economy
  disco:     0.15,  // full for groove
  downtempo: 0.35,  // jazz voicing
  blockhead: 0.20,  // moderate
  lofi:      0.45,  // jazz — rootless voicings
  flim:      0.35,  // sparse textures
  xtal:      0.40,  // ambient openness
  syro:      0.25,  // moderate
  ambient:   0.50,  // maximum sparseness,
  plantasia: 0.50,
};

/**
 * Section multipliers — builds are fuller, breakdowns sparser.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // sparse — mysterious
  build:     0.6,   // filling up
  peak:      0.3,   // full voicings
  breakdown: 1.4,   // most sparse
  groove:    0.8,
};

/**
 * Which chord member to omit (priority order by quality).
 * Returns the index to drop from a chord note array.
 * - 5th (index 2) is safest to drop
 * - root (index 0) works when bass covers it
 * - 3rd (index 1) creates ambiguity
 */
export function selectOmission(
  quality: ChordQuality,
  tick: number,
  mood: Mood
): number | null {
  const hash = ((tick * 2654435761 + 7919) >>> 0) / 4294967296;

  // 5th is almost always safe to drop
  // Root can be dropped in jazz (bass covers it)
  // 3rd is dropped rarely for deliberate ambiguity
  if (quality === 'dim' || quality === 'aug') {
    // Don't omit from diminished/augmented — quality IS the intervals
    return null;
  }

  if (hash < 0.55) return 2;  // drop 5th (safest)
  if (hash < 0.85) return 0;  // drop root
  return 1;                    // drop 3rd (rare ambiguity)
}

/**
 * Should ellipsis be applied?
 */
export function shouldApplyEllipsis(
  tick: number,
  mood: Mood,
  section: Section,
  chordSize: number
): boolean {
  if (chordSize <= 3) return false; // need at least 4 notes to drop one
  const strength = ELLIPSIS_STRENGTH[mood] * (SECTION_MULT[section] ?? 1.0);
  const hash = ((tick * 1597334677) >>> 0) / 4294967296;
  return hash < strength;
}

/**
 * Apply ellipsis: remove one chord tone from a voicing.
 *
 * @param notes Chord notes array
 * @param omitIndex Index to remove
 * @returns New array with one note removed
 */
export function applyEllipsis(
  notes: string[],
  omitIndex: number
): string[] {
  if (omitIndex < 0 || omitIndex >= notes.length) return notes;
  return [...notes.slice(0, omitIndex), ...notes.slice(omitIndex + 1)];
}

/**
 * Get ellipsis strength for a mood (for testing).
 */
export function ellipsisStrength(mood: Mood): number {
  return ELLIPSIS_STRENGTH[mood];
}
