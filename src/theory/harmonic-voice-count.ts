/**
 * Harmonic voice count — voice count adjusts with section density.
 *
 * Intros and breakdowns sound better with fewer voices (2-3).
 * Peaks and builds benefit from richer voicings (4-5).
 * This module provides a target voice count and a gain
 * adjustment when the actual count deviates from target.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood voice sensitivity (higher = more section-responsive).
 */
const VOICE_SENSITIVITY: Record<Mood, number> = {
  trance:    0.50,  // moderate — clear voicings
  avril:     0.60,  // high — orchestral dynamics
  disco:     0.35,  // moderate — consistent
  downtempo: 0.45,  // moderate
  blockhead: 0.40,  // moderate
  lofi:      0.55,  // high — dynamic voicings
  flim:      0.50,  // moderate
  xtal:      0.45,  // moderate
  syro:      0.35,  // low — dense OK
  ambient:   0.60,  // high — sparse sections important,
  plantasia: 0.60,
};

/**
 * Target voice count per section.
 */
const SECTION_VOICES: Record<Section, number> = {
  intro:     2.5,
  build:     3.5,
  peak:      4.5,
  breakdown: 2.0,
  groove:    3.5,
};

/**
 * Calculate voice count gain adjustment.
 *
 * @param actualVoices Number of voices currently playing
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.90 - 1.08)
 */
export function voiceCountGain(
  actualVoices: number,
  mood: Mood,
  section: Section
): number {
  const sensitivity = VOICE_SENSITIVITY[mood];
  const target = SECTION_VOICES[section];

  // Deviation from target
  const deviation = actualVoices - target;
  // Too many voices = reduce gain; too few = slight boost
  const adjustment = -deviation * sensitivity * 0.05;

  return Math.max(0.90, Math.min(1.08, 1.0 + adjustment));
}

/**
 * Get voice sensitivity for a mood (for testing).
 */
export function voiceSensitivity(mood: Mood): number {
  return VOICE_SENSITIVITY[mood];
}

/**
 * Get target voice count for a section (for testing).
 */
export function targetVoices(section: Section): number {
  return SECTION_VOICES[section];
}
