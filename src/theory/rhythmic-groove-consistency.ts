import type { Mood, Section } from '../types';

/**
 * Rhythmic groove consistency — rewards layers that maintain a steady
 * groove pattern over time. Consistency builds listener entrainment;
 * sudden changes break the groove. Applies mainly to arp and texture.
 */

const moodConsistencyReward: Record<Mood, number> = {
  ambient: 0.15,
  plantasia: 0.15,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.60,
  avril: 0.30,
  xtal: 0.20,
  syro: 0.15,
  blockhead: 0.45,
  flim: 0.25,
  disco: 0.55,
};

const sectionMult: Record<Section, number> = {
  intro: 0.6,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.5,
  groove: 1.4,
};

/**
 * Gain multiplier rewarding groove consistency.
 * ticksInSection: how long the current section has been playing
 * Longer in section → groove is more established → more reward.
 */
export function grooveConsistencyGain(
  ticksInSection: number,
  mood: Mood,
  section: Section,
): number {
  const reward = moodConsistencyReward[mood] * sectionMult[section];
  // Groove establishes over ~5 ticks
  const establishment = Math.min(ticksInSection / 5, 1.0);
  const boost = establishment * reward * 0.04;
  return Math.min(1.04, 1.0 + boost);
}

/** Per-mood consistency reward for testing */
export function consistencyReward(mood: Mood): number {
  return moodConsistencyReward[mood];
}
