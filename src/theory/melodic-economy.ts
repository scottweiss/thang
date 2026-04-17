/**
 * Melodic economy — fewer notes, used more effectively.
 *
 * Great melodies often use a surprisingly small number of distinct
 * pitches. "Ode to Joy" uses 5 notes for its opening. Many folk
 * melodies are pentatonic. Minimalist music thrives on repetition
 * of a small pitch set.
 *
 * This module constrains the available pitch vocabulary based on
 * mood and section, encouraging the melody to be more focused
 * and memorable rather than wandering across all available notes.
 *
 * High economy: 3-4 pitch classes (pentatonic subset)
 * Medium economy: 5-6 pitch classes (scale degrees)
 * Low economy: full scale (7+ notes, chromatic passing tones)
 *
 * Economy typically starts high (intro — establish a hook) and
 * gradually decreases as sections add complexity, then returns
 * at breakdowns for relief.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood appetite for melodic economy.
 * Higher = more restrictive pitch vocabulary.
 */
const ECONOMY_STRENGTH: Record<Mood, number> = {
  ambient:   0.60,  // minimal — few pitches, much repetition,
  plantasia: 0.60,
  trance:    0.50,  // anthemic hooks use few notes
  avril:     0.45,  // singable melodies are economical
  xtal:      0.40,  // dreamy but focused
  flim:      0.35,  // organic simplicity
  downtempo: 0.30,  // moderate economy
  disco:     0.25,  // hooks but some variety
  lofi:      0.20,  // jazz allows more notes
  blockhead: 0.15,  // hip-hop samples vary widely
  syro:      0.08,  // IDM — maximum pitch variety
};

/**
 * Section modifiers for economy.
 */
const SECTION_ECONOMY: Record<Section, number> = {
  intro:     1.3,   // high economy — establish the hook
  build:     0.9,   // slightly less — building complexity
  peak:      0.7,   // least economy — climax allows full vocabulary
  breakdown: 1.2,   // return to simplicity
  groove:    0.8,   // moderate
};

/**
 * Calculate how many distinct pitch classes to allow.
 *
 * @param scaleLength  Number of notes in the current scale (typically 7)
 * @param mood         Current mood
 * @param section      Current section
 * @returns Number of pitch classes to use (3 to scaleLength)
 */
export function pitchVocabularySize(
  scaleLength: number,
  mood: Mood,
  section: Section
): number {
  const strength = ECONOMY_STRENGTH[mood] * SECTION_ECONOMY[section];

  // Minimum 3 notes (tonic, dominant, one other)
  // Maximum = full scale
  const reduction = Math.floor(strength * (scaleLength - 3));
  return Math.max(3, scaleLength - reduction);
}

/**
 * Select the most important pitch classes from a scale.
 * Priority: root > 5th > 3rd > 7th > others
 *
 * @param scaleNotes  Scale note names (e.g., ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
 * @param count       How many to select
 * @param root        Scale root note name
 * @returns Selected note names in priority order
 */
export function selectCorePitches(
  scaleNotes: string[],
  count: number,
  root: string
): string[] {
  if (count >= scaleNotes.length) return [...scaleNotes];
  if (scaleNotes.length === 0) return [];

  const result: string[] = [];
  const remaining = [...scaleNotes];

  // Priority 1: root
  const rootIdx = remaining.indexOf(root);
  if (rootIdx >= 0) {
    result.push(remaining.splice(rootIdx, 1)[0]);
  }

  // Priority 2: 5th (index 4 in major/minor scales)
  if (result.length < count && remaining.length > 0) {
    const fifthIdx = Math.min(3, remaining.length - 1); // approximate 5th position
    result.push(remaining.splice(fifthIdx, 1)[0]);
  }

  // Priority 3: 3rd (index 2 in scale)
  if (result.length < count && remaining.length > 0) {
    const thirdIdx = Math.min(1, remaining.length - 1);
    result.push(remaining.splice(thirdIdx, 1)[0]);
  }

  // Priority 4: 7th
  if (result.length < count && remaining.length > 0) {
    const seventhIdx = remaining.length - 1;
    result.push(remaining.splice(seventhIdx, 1)[0]);
  }

  // Fill remaining slots
  while (result.length < count && remaining.length > 0) {
    result.push(remaining.shift()!);
  }

  return result;
}

/**
 * Filter a note pattern to only use the allowed pitch classes.
 * Notes not in the vocabulary are replaced with the nearest allowed pitch.
 *
 * @param steps        Note pattern
 * @param allowed      Allowed pitch class names
 * @returns Modified pattern using only allowed pitches
 */
export function constrainToVocabulary(
  steps: string[],
  allowed: string[]
): string[] {
  if (allowed.length === 0) return steps;

  return steps.map(step => {
    if (step === '~') return '~';

    const name = step.replace(/\d+$/, '');
    const octave = step.match(/\d+$/)?.[0] ?? '4';

    if (allowed.includes(name)) return step;

    // Find nearest allowed pitch by semitone distance
    const NOTE_TO_PC: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
    };

    const pc = NOTE_TO_PC[name] ?? 0;
    let nearest = allowed[0];
    let minDist = 12;

    for (const a of allowed) {
      const apc = NOTE_TO_PC[a] ?? 0;
      const dist = Math.min(Math.abs(pc - apc), 12 - Math.abs(pc - apc));
      if (dist < minDist) {
        minDist = dist;
        nearest = a;
      }
    }

    return `${nearest}${octave}`;
  });
}

/**
 * Should melodic economy be applied?
 */
export function shouldApplyEconomy(
  mood: Mood,
  section: Section
): boolean {
  return ECONOMY_STRENGTH[mood] * SECTION_ECONOMY[section] > 0.15;
}

/**
 * Get economy strength for a mood (for testing).
 */
export function economyStrength(mood: Mood): number {
  return ECONOMY_STRENGTH[mood];
}
