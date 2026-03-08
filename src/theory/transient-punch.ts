/**
 * Transient punch — attack-phase brightness boost for builds.
 *
 * During builds and peaks, note attacks should feel "punchy" —
 * brighter and slightly louder in the first moment, then relaxing
 * into the sustain. This simulates compressor-like punch without
 * actual compression, using LPF and gain envelope tricks.
 *
 * Applied as LPF boost and gain accent on the attack portion.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood punch intensity.
 */
const PUNCH_INTENSITY: Record<Mood, number> = {
  trance:    0.55,  // strong — driving
  avril:     0.25,  // gentle — classical
  disco:     0.50,  // punchy groove
  downtempo: 0.30,  // moderate
  blockhead: 0.60,  // strongest — hip-hop punch
  lofi:      0.20,  // warm — minimal punch
  flim:      0.30,  // organic
  xtal:      0.15,  // subtle
  syro:      0.45,  // IDM snap
  ambient:   0.08,  // barely any
};

/**
 * Section punch multiplier — builds and peaks are punchiest.
 */
const SECTION_PUNCH: Record<Section, number> = {
  intro:     0.3,
  build:     1.0,
  peak:      1.2,   // punchiest
  breakdown: 0.2,   // soft
  groove:    0.8,
};

/**
 * Calculate LPF boost multiplier for transient punch.
 * > 1.0 means brighter attack, decays to neutral.
 *
 * @param mood Current mood
 * @param section Current section
 * @param isAttack Whether this is an attack-phase note (first note after rest)
 * @returns LPF multiplier (1.0 - 1.3)
 */
export function punchLpfMultiplier(
  mood: Mood,
  section: Section,
  isAttack: boolean
): number {
  if (!isAttack) return 1.0;

  const intensity = PUNCH_INTENSITY[mood];
  const sectionMult = SECTION_PUNCH[section] ?? 1.0;
  const punch = intensity * sectionMult * 0.3;

  return Math.min(1.3, 1.0 + punch);
}

/**
 * Calculate gain boost for transient punch.
 *
 * @param mood Current mood
 * @param section Current section
 * @param isAttack Whether this is an attack-phase note
 * @returns Gain multiplier (1.0 - 1.15)
 */
export function punchGainMultiplier(
  mood: Mood,
  section: Section,
  isAttack: boolean
): number {
  if (!isAttack) return 1.0;

  const intensity = PUNCH_INTENSITY[mood];
  const sectionMult = SECTION_PUNCH[section] ?? 1.0;
  const punch = intensity * sectionMult * 0.15;

  return Math.min(1.15, 1.0 + punch);
}

/**
 * Detect attack positions in a note pattern.
 * An attack is the first note after one or more rests.
 *
 * @param notes Array of note strings ('~' = rest)
 * @returns Array of booleans (true = attack position)
 */
export function detectAttacks(notes: string[]): boolean[] {
  return notes.map((note, i) => {
    if (note === '~') return false;
    if (i === 0) return true; // first note is always an attack
    return notes[i - 1] === '~'; // note after rest = attack
  });
}

/**
 * Should transient punch be applied?
 */
export function shouldApplyPunch(mood: Mood, section: Section): boolean {
  return PUNCH_INTENSITY[mood] * (SECTION_PUNCH[section] ?? 1.0) > 0.10;
}

/**
 * Get punch intensity for a mood (for testing).
 */
export function punchIntensity(mood: Mood): number {
  return PUNCH_INTENSITY[mood];
}
