import type { Mood, Section } from '../types';

/**
 * Rhythmic downbeat anchor — coordinated gain emphasis across all
 * layers on bar downbeats. Creates a unified pulse that grounds
 * the groove. Strength varies by mood and section.
 */

const moodAnchorStrength: Record<Mood, number> = {
  ambient: 0.10,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.55,
  avril: 0.35,
  xtal: 0.20,
  syro: 0.15,
  blockhead: 0.50,
  flim: 0.25,
  disco: 0.55,
};

const sectionMult: Record<Section, number> = {
  intro: 0.6,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.5,
  groove: 1.3,
};

/**
 * Gain multiplier for downbeat anchoring.
 * beatPosition: 0-15 grid position (0 = downbeat)
 * Downbeat (0) → boost, other positions → neutral.
 */
export function downbeatAnchorGain(
  beatPosition: number,
  mood: Mood,
  section: Section,
): number {
  const pos = ((beatPosition % 16) + 16) % 16;
  if (pos !== 0 && pos !== 8) return 1.0; // only downbeat and half-bar
  const strength = moodAnchorStrength[mood] * sectionMult[section];
  const boost = pos === 0 ? strength * 0.05 : strength * 0.025;
  return Math.min(1.05, 1.0 + boost);
}

/** Per-mood anchor strength for testing */
export function anchorStrength(mood: Mood): number {
  return moodAnchorStrength[mood];
}
