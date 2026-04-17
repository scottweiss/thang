/**
 * Register collision avoidance — real-time register overlap detection.
 *
 * When melody, arp, and harmony converge in the same octave, they
 * mask each other. This module detects such collisions and suggests
 * octave shifts or gain adjustments to separate them.
 *
 * Applied as octave offset suggestions and gain corrections.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood collision sensitivity (lower = more aggressive avoidance).
 */
const COLLISION_SENSITIVITY: Record<Mood, number> = {
  trance:    0.40,  // moderate — some density OK
  avril:     0.60,  // strong — classical voicing clarity
  disco:     0.35,  // moderate
  downtempo: 0.50,  // clean
  blockhead: 0.40,  // moderate
  lofi:      0.55,  // clean jazz separation
  flim:      0.45,  // organic
  xtal:      0.60,  // maximum clarity
  syro:      0.30,  // IDM — some collision OK
  ambient:   0.65,  // strongest avoidance,
  plantasia: 0.65,
};

/**
 * Detect register collision between layers.
 * Returns collision severity (0 = no collision, 1 = same octave).
 *
 * @param layerCenters Record of layer name → average MIDI pitch
 * @param layerA First layer name
 * @param layerB Second layer name
 * @returns Collision severity (0-1)
 */
export function registerCollision(
  layerCenters: Record<string, number>,
  layerA: string,
  layerB: string
): number {
  const centerA = layerCenters[layerA];
  const centerB = layerCenters[layerB];
  if (centerA === undefined || centerB === undefined) return 0;

  const distance = Math.abs(centerA - centerB);
  // Same octave (< 12 semitones) = collision
  if (distance >= 12) return 0;
  return 1.0 - (distance / 12);
}

/**
 * Suggest octave offset to resolve collision.
 *
 * @param myCenterMidi This layer's center MIDI pitch
 * @param otherCenterMidi Other layer's center MIDI pitch
 * @param mood Current mood
 * @returns Suggested octave offset (-1, 0, or +1)
 */
export function suggestOctaveShift(
  myCenterMidi: number,
  otherCenterMidi: number,
  mood: Mood
): number {
  const distance = Math.abs(myCenterMidi - otherCenterMidi);
  if (distance >= 12) return 0; // no collision

  const sensitivity = COLLISION_SENSITIVITY[mood];
  const severity = 1.0 - (distance / 12);

  // Only shift if collision is severe enough for this mood
  if (severity < (1.0 - sensitivity)) return 0;

  // Shift away from the other layer
  return myCenterMidi > otherCenterMidi ? 1 : -1;
}

/**
 * Calculate gain reduction for a colliding layer.
 * The secondary (lower-priority) layer gets gain reduction.
 *
 * @param collisionSeverity 0-1 collision severity
 * @param mood Current mood
 * @param isPrimary Whether this is the primary (higher priority) layer
 * @returns Gain multiplier (0.85 - 1.0)
 */
export function collisionGainReduction(
  collisionSeverity: number,
  mood: Mood,
  isPrimary: boolean
): number {
  if (isPrimary || collisionSeverity < 0.1) return 1.0;

  const sensitivity = COLLISION_SENSITIVITY[mood];
  const reduction = collisionSeverity * sensitivity * 0.15;
  return Math.max(0.85, 1.0 - reduction);
}

/**
 * Should collision avoidance be applied?
 */
export function shouldAvoidCollisions(
  mood: Mood,
  activeLayerCount: number
): boolean {
  return activeLayerCount >= 3 && COLLISION_SENSITIVITY[mood] > 0.25;
}

/**
 * Get collision sensitivity for a mood (for testing).
 */
export function collisionSensitivity(mood: Mood): number {
  return COLLISION_SENSITIVITY[mood];
}
