/**
 * Melodic target tones — phrases aim toward resolution pitches.
 *
 * Great melodies don't wander — they have a destination. Each
 * phrase has a "target tone" it's heading toward, creating
 * directional energy. The target is typically a chord tone of
 * the next chord (anticipation) or the root of the current chord
 * (affirmation).
 *
 * Applied to melody note selection: as the phrase progresses,
 * notes are increasingly biased toward the target.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood targeting strength.
 * Higher = stronger pull toward target tone.
 */
const TARGETING_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // strong tonal direction
  avril:     0.55,  // classical melodic direction
  disco:     0.40,  // groove-oriented targets
  downtempo: 0.35,  // moderate
  blockhead: 0.30,  // some direction
  lofi:      0.45,  // jazz — target the 3rd or 7th
  flim:      0.35,  // organic
  xtal:      0.20,  // floating, less directed
  syro:      0.15,  // ambiguous targets
  ambient:   0.10,  // barely directed,
  plantasia: 0.10,
};

/**
 * Select the target tone for a phrase.
 * Priority: root > 3rd > 5th > 7th of current chord.
 *
 * @param chordNotes Notes in the current chord (with octaves)
 * @param mood Current mood
 * @param section Current section
 * @param tick Current tick for variety
 * @returns Target note name (e.g., "C4")
 */
export function selectTargetTone(
  chordNotes: string[],
  mood: Mood,
  section: Section,
  tick: number
): string {
  if (chordNotes.length === 0) return 'C4';

  // Jazz moods target 3rd/7th; tonal moods target root/5th
  const jazzMoods = ['lofi', 'downtempo', 'flim'];
  const hash = ((tick * 2654435761 + 31337) >>> 0) / 4294967296;

  if (jazzMoods.includes(mood)) {
    // Prefer 3rd (index 1) or 7th (index 3 if exists)
    if (chordNotes.length >= 4 && hash > 0.5) return chordNotes[3];
    if (chordNotes.length >= 2) return chordNotes[1];
    return chordNotes[0];
  }

  // Tonal moods: prefer root, sometimes 5th
  if (chordNotes.length >= 3 && hash > 0.7) return chordNotes[2]; // 5th
  return chordNotes[0]; // root
}

/**
 * Calculate how strongly the melody should pull toward the target
 * at a given position in the phrase.
 *
 * @param phrasePosition Position in phrase (0-1, 0=start, 1=end)
 * @param mood Current mood
 * @returns Pull strength (0 = no pull, 1 = maximum pull)
 */
export function targetPull(phrasePosition: number, mood: Mood): number {
  const strength = TARGETING_STRENGTH[mood];

  // Pull increases toward phrase end (exponential curve)
  return phrasePosition * phrasePosition * strength;
}

/**
 * Bias a note toward the target tone.
 *
 * @param currentMidi Current note MIDI number
 * @param targetMidi Target tone MIDI number
 * @param pull Pull strength (0-1)
 * @returns Adjusted MIDI number
 */
export function biasTowardTarget(
  currentMidi: number,
  targetMidi: number,
  pull: number
): number {
  const moved = currentMidi + (targetMidi - currentMidi) * pull;
  return Math.round(moved);
}

/**
 * Should melodic targeting be applied?
 *
 * @param mood Current mood
 * @returns Whether to apply
 */
export function shouldApplyTargeting(mood: Mood): boolean {
  return TARGETING_STRENGTH[mood] > 0.12;
}

/**
 * Get targeting strength for a mood (for testing).
 */
export function targetingStrength(mood: Mood): number {
  return TARGETING_STRENGTH[mood];
}
