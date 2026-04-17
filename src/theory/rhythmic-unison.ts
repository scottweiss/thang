/**
 * Rhythmic unison — coordinated rhythmic alignment across layers.
 *
 * In orchestral and electronic music, some of the most powerful moments
 * occur when all instruments suddenly lock into the same rhythm: a
 * sforzando chord, a unison riff, a coordinated stab. This contrasts
 * with the usual independence between layers.
 *
 * When triggered (at tension peaks, section arrivals, or rare dramatic
 * moments), all layers briefly adopt a shared rhythmic pattern —
 * typically strong downbeat hits with coordinated rests.
 *
 * The effect is: independence → sudden unity → return to independence.
 * The contrast makes both states more powerful.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood tendency for rhythmic unison moments.
 * Higher = more frequent unison events.
 */
const UNISON_TENDENCY: Record<Mood, number> = {
  trance:    0.30,  // big unison stabs are core to trance
  disco:     0.25,  // disco hits and breaks
  avril:     0.20,  // dramatic together moments
  blockhead: 0.18,  // hip-hop stabs
  downtempo: 0.12,  // occasional accent
  flim:      0.08,  // subtle coordination
  lofi:      0.06,  // rare but effective
  xtal:      0.04,  // mostly independent
  syro:      0.03,  // intentionally desynchronized
  ambient:   0.02,  // almost never — ambience needs independence,
  plantasia: 0.02,
};

/**
 * Section multipliers for unison likelihood.
 * Peak and groove have the most unison moments.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.3,
  build:     0.8,
  peak:      1.5,
  breakdown: 0.4,
  groove:    1.2,
};

/**
 * Unison pattern types — different rhythmic shapes for the coordinated hit.
 */
export type UnisonPattern = 'downbeat' | 'stab' | 'double' | 'syncopated';

/**
 * Should a rhythmic unison event occur at this tick?
 * Only triggers near section boundaries or at high tension moments.
 */
export function shouldApplyUnison(
  tick: number,
  mood: Mood,
  section: Section,
  sectionProgress: number,
  tension: number
): boolean {
  const tendency = UNISON_TENDENCY[mood] * SECTION_MULT[section];

  // More likely at section start (first 15%) or climax (last 10%)
  const posBonus =
    sectionProgress < 0.15 ? 1.8 :
    sectionProgress > 0.90 ? 1.5 :
    0.6;

  // High tension increases likelihood
  const tensionBonus = 1.0 + tension * 0.5;

  const prob = tendency * posBonus * tensionBonus * 0.15;

  const hash = ((tick * 2654435761 + 78901) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Select which unison pattern to use.
 */
export function selectUnisonPattern(tick: number, mood: Mood): UnisonPattern {
  const hash = ((tick * 1597334677 + 44101) >>> 0) / 4294967296;

  // Mood-influenced pattern selection
  if (mood === 'trance' || mood === 'disco') {
    // Dance moods favor strong downbeat hits
    if (hash < 0.5) return 'downbeat';
    if (hash < 0.75) return 'stab';
    if (hash < 0.9) return 'double';
    return 'syncopated';
  }

  if (mood === 'syro' || mood === 'blockhead') {
    // Rhythmic moods favor syncopated unison
    if (hash < 0.35) return 'syncopated';
    if (hash < 0.6) return 'stab';
    if (hash < 0.85) return 'double';
    return 'downbeat';
  }

  // Default: balanced selection
  if (hash < 0.4) return 'downbeat';
  if (hash < 0.65) return 'stab';
  if (hash < 0.85) return 'double';
  return 'syncopated';
}

/**
 * Generate a unison accent mask for a 16-step pattern.
 * Returns gain multipliers: 1.0 = normal, >1.0 = accent, 0.0 = silence.
 *
 * During a unison event, accented positions get boosted and
 * non-accent positions get suppressed, creating a stark rhythmic shape.
 */
export function unisonAccentMask(
  pattern: UnisonPattern,
  length: number,
  intensity: number
): number[] {
  const mask = new Array(length).fill(1.0);
  const boost = 1.0 + intensity * 0.4;  // accent positions
  const suppress = 1.0 - intensity * 0.3; // non-accent positions

  switch (pattern) {
    case 'downbeat':
      // Hit on beat 1, suppress everything else
      for (let i = 0; i < length; i++) {
        mask[i] = i === 0 ? boost : suppress;
      }
      break;

    case 'stab':
      // Short stab: beats 1 and the "and" of 1
      for (let i = 0; i < length; i++) {
        mask[i] = (i === 0 || i === 1) ? boost : suppress;
      }
      break;

    case 'double':
      // Two hits: beat 1 and beat 3
      for (let i = 0; i < length; i++) {
        const isBeat1 = i === 0;
        const isBeat3 = length >= 8 && i === Math.floor(length / 2);
        mask[i] = (isBeat1 || isBeat3) ? boost : suppress;
      }
      break;

    case 'syncopated':
      // Off-beat hit: the "and" of 4 (anticipation)
      for (let i = 0; i < length; i++) {
        const isAnticipation = i === length - 1;
        const isBeat1 = i === 0;
        mask[i] = (isAnticipation || isBeat1) ? boost : suppress;
      }
      break;
  }

  return mask;
}

/**
 * Calculate unison intensity based on tension and section.
 * Higher intensity = more dramatic contrast between accent and non-accent.
 */
export function unisonIntensity(
  mood: Mood,
  section: Section,
  tension: number
): number {
  const base = UNISON_TENDENCY[mood];
  const sectionMult = SECTION_MULT[section];
  // Clamp to 0-1 range
  return Math.min(1.0, Math.max(0.0, base * sectionMult * (0.5 + tension)));
}

/**
 * Get unison tendency for a mood (for testing).
 */
export function unisonTendency(mood: Mood): number {
  return UNISON_TENDENCY[mood];
}
