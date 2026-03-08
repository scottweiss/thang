/**
 * Textural density wave — rhythmic density breathes within sections.
 *
 * Instead of static density per section, density oscillates in
 * a sine-wave pattern. This creates natural "breathing" where
 * the texture thickens and thins organically, even within a
 * sustained section like a groove or peak.
 *
 * Applied as a gain multiplier that modulates over several ticks.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood wave amplitude (how much density varies).
 * Higher = bigger breathing swings.
 */
const WAVE_AMPLITUDE: Record<Mood, number> = {
  trance:    0.08,  // subtle pulse
  avril:     0.15,  // moderate breathing
  disco:     0.10,  // groove breathing
  downtempo: 0.18,  // noticeable swells
  blockhead: 0.12,  // moderate
  lofi:      0.20,  // jazz dynamics
  flim:      0.18,  // organic
  xtal:      0.22,  // floating swells
  syro:      0.12,  // complex but steady
  ambient:   0.25,  // maximum breathing
};

/**
 * Per-mood wave period (ticks per full cycle).
 * Lower = faster breathing.
 */
const WAVE_PERIOD: Record<Mood, number> = {
  trance:    8,   // medium cycle
  avril:     12,  // slow, classical phrasing
  disco:     6,   // faster groove pulse
  downtempo: 14,  // slow breathing
  blockhead: 8,   // medium
  lofi:      10,  // moderate
  flim:      12,  // slow
  xtal:      16,  // very slow swells
  syro:      6,   // fast cycling
  ambient:   20,  // very slow breathing
};

/**
 * Section multiplier for wave amplitude.
 */
const SECTION_WAVE: Record<Section, number> = {
  intro:     0.6,  // subtle
  build:     0.8,  // growing
  peak:      0.5,  // sustained, less variation
  breakdown: 1.3,  // maximum breathing
  groove:    1.0,  // normal
};

/**
 * Calculate the density wave multiplier at the current tick.
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.75-1.25 range)
 */
export function densityWaveMultiplier(
  tick: number,
  mood: Mood,
  section: Section
): number {
  const amplitude = WAVE_AMPLITUDE[mood] * SECTION_WAVE[section];
  const period = WAVE_PERIOD[mood];

  const phase = (tick / period) * 2 * Math.PI;
  const wave = Math.sin(phase) * amplitude;

  return 1.0 + wave;
}

/**
 * Should density wave be applied?
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to apply
 */
export function shouldApplyDensityWave(mood: Mood, section: Section): boolean {
  return WAVE_AMPLITUDE[mood] * SECTION_WAVE[section] > 0.05;
}

/**
 * Get wave amplitude for a mood (for testing).
 */
export function waveAmplitude(mood: Mood): number {
  return WAVE_AMPLITUDE[mood];
}

/**
 * Get wave period for a mood (for testing).
 */
export function wavePeriod(mood: Mood): number {
  return WAVE_PERIOD[mood];
}
