/**
 * Envelope following — musical dynamics responsiveness between layers.
 *
 * Instead of simple sidechain ducking (which already exists), this
 * module implements musical envelope following: when the melody
 * is active, accompaniment layers breathe with it. When melody
 * rests, accompaniment swells. Creates organic push-pull dynamics.
 *
 * Based on call-and-response dynamics in ensemble playing.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sensitivity to envelope following.
 * Higher = more responsive to other layers' activity.
 */
const FOLLOW_SENSITIVITY: Record<Mood, number> = {
  trance:    0.15,  // steady, less responsive
  avril:     0.35,  // piano-like dynamics
  disco:     0.20,  // groove-steady
  downtempo: 0.40,  // breathing room
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // jazz dynamics, maximum breathing
  flim:      0.45,  // organic responsiveness
  xtal:      0.35,  // floating, moderate
  syro:      0.25,  // independent voices
  ambient:   0.30,  // gentle responsiveness
};

/**
 * Section multiplier for following sensitivity.
 */
const SECTION_FOLLOW_MULT: Record<Section, number> = {
  intro:     0.7,   // sparse, less interaction
  build:     1.0,   // growing
  peak:      0.6,   // everyone plays full out
  breakdown: 1.3,   // maximum breathing room
  groove:    1.1,   // musical interaction
};

/**
 * Estimate the "activity level" of a layer from its pattern.
 * Counts non-rest notes vs total positions.
 *
 * @param notePattern Space-separated note string (e.g., "C4 ~ E4 ~ G4 ~ ~ ~")
 * @returns Activity level 0-1
 */
export function layerActivity(notePattern: string): number {
  const parts = notePattern.split(' ');
  if (parts.length === 0) return 0;
  const notes = parts.filter(p => p !== '~' && p.length > 0);
  return notes.length / parts.length;
}

/**
 * Calculate gain adjustment for an accompaniment layer
 * based on the lead layer's activity.
 *
 * @param leadActivity Lead layer activity level (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier for accompaniment (0.5-1.3)
 */
export function accompanimentGainResponse(
  leadActivity: number,
  mood: Mood,
  section: Section
): number {
  const sensitivity = FOLLOW_SENSITIVITY[mood] * SECTION_FOLLOW_MULT[section];

  // When lead is active, accompaniment dips slightly
  // When lead rests, accompaniment swells
  const response = 1.0 - (leadActivity - 0.5) * sensitivity * 2;
  return Math.max(0.5, Math.min(1.3, response));
}

/**
 * Should envelope following be applied?
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to apply
 */
export function shouldFollowEnvelope(mood: Mood, section: Section): boolean {
  return FOLLOW_SENSITIVITY[mood] * SECTION_FOLLOW_MULT[section] > 0.15;
}

/**
 * Which layers should follow the melody's envelope?
 * Returns layers that act as accompaniment.
 *
 * @param mood Current mood
 * @returns Layer names that should follow
 */
export function followingLayers(mood: Mood): string[] {
  const sensitivity = FOLLOW_SENSITIVITY[mood];
  if (sensitivity < 0.20) return ['arp'];
  if (sensitivity < 0.35) return ['arp', 'harmony'];
  return ['arp', 'harmony', 'atmosphere'];
}

/**
 * Get follow sensitivity for a mood (for testing).
 */
export function followSensitivity(mood: Mood): number {
  return FOLLOW_SENSITIVITY[mood];
}
