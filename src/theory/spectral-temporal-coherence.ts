/**
 * Spectral-temporal coherence — bind spectral complexity to rhythmic density.
 *
 * The auditory system perceives tighter coherence when dense spectral
 * content aligns with dense rhythmic events (punctum moments), and
 * looser/shimmering feel when sparse rhythm meets rich spectrum.
 *
 * This module adjusts FM depth based on the ratio of rhythmic density
 * to spectral density, keeping them coupled for perceived clarity.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood coherence strength (higher = stricter coupling).
 */
const COHERENCE_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // tight lock
  avril:     0.40,  // moderate
  disco:     0.45,  // moderate-tight
  downtempo: 0.35,  // gentle
  blockhead: 0.45,  // moderate
  lofi:      0.30,  // loose — shimmer OK
  flim:      0.35,  // organic
  xtal:      0.25,  // loose — ambient texture
  syro:      0.20,  // IDM — incoherence OK
  ambient:   0.15,  // minimal — free floating
};

/**
 * Section multiplier for coherence effect.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,
  build:     0.9,
  peak:      1.0,
  breakdown: 0.5,
  groove:    0.8,
};

/**
 * Calculate FM depth multiplier based on rhythmic-spectral alignment.
 *
 * When rhythm is dense but spectrum is sparse, boost FM for richness.
 * When rhythm is sparse but spectrum is dense, reduce FM for clarity.
 *
 * @param rhythmicDensity 0-1 note density (non-rest ratio)
 * @param spectralDensity 0-1 estimated spectral complexity (e.g. from layer count or overtone count)
 * @param mood Current mood
 * @param section Current section
 * @returns FM depth multiplier (0.85 - 1.15)
 */
export function coherenceFmMultiplier(
  rhythmicDensity: number,
  spectralDensity: number,
  mood: Mood,
  section: Section
): number {
  const strength = COHERENCE_STRENGTH[mood] * SECTION_MULT[section];
  // Mismatch: positive = rhythm denser than spectrum → boost FM
  // negative = spectrum denser than rhythm → reduce FM
  const mismatch = rhythmicDensity - spectralDensity;
  const adjustment = mismatch * strength * 0.3;
  return Math.max(0.85, Math.min(1.15, 1.0 + adjustment));
}

/**
 * Calculate gain shimmer — subtle gain modulation when coherence is loose.
 * Returns a multiplier that adds subtle breathing to sustained sounds.
 *
 * @param coherenceGap Absolute difference between rhythmic and spectral density
 * @param mood Current mood
 * @returns Gain shimmer multiplier (0.95 - 1.0) — lower means more shimmer
 */
export function coherenceShimmer(
  coherenceGap: number,
  mood: Mood
): number {
  const strength = COHERENCE_STRENGTH[mood];
  // Low coherence = more shimmer (gain dip)
  const shimmer = coherenceGap * (1.0 - strength) * 0.05;
  return Math.max(0.95, 1.0 - shimmer);
}

/**
 * Should spectral-temporal coherence be applied?
 */
export function shouldApplyCoherence(mood: Mood, section: Section): boolean {
  return COHERENCE_STRENGTH[mood] * SECTION_MULT[section] > 0.08;
}

/**
 * Get coherence strength for a mood (for testing).
 */
export function coherenceStrength(mood: Mood): number {
  return COHERENCE_STRENGTH[mood];
}
