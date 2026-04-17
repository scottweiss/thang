import type { Mood, Section } from '../types';

/**
 * Rhythmic density breathing — note density oscillates in a slow
 * sine-wave pattern, creating a breathing effect in each layer.
 * This prevents mechanical uniformity and adds organic life.
 */

const moodAmplitude: Record<Mood, number> = {
  ambient: 0.55,
  plantasia: 0.55,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.15,
  avril: 0.35,
  xtal: 0.50,
  syro: 0.30,
  blockhead: 0.25,
  flim: 0.45,
  disco: 0.20,
};

const sectionMult: Record<Section, number> = {
  intro: 1.2,
  build: 0.8,
  peak: 0.6,
  breakdown: 1.3,
  groove: 1.0,
};

/**
 * Gain multiplier from density breathing wave.
 * tick: current tick count (for phase)
 * layerIndex: 0-5 offset so layers breathe at different phases
 * Returns subtle gain modulation (0.97-1.03).
 */
export function densityBreathingGain(
  tick: number,
  layerIndex: number,
  mood: Mood,
  section: Section,
): number {
  const amp = moodAmplitude[mood] * sectionMult[section];
  // Each layer has offset phase for independence
  const phase = (tick * 0.12 + layerIndex * 1.05) % (2 * Math.PI);
  const wave = Math.sin(phase);
  return 1.0 + wave * amp * 0.04;
}

/** Per-mood breathing amplitude for testing */
export function breathingAmplitude(mood: Mood): number {
  return moodAmplitude[mood];
}
