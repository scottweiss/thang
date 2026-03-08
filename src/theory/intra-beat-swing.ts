/**
 * Intra-beat swing — grace-note timing within beat subdivisions.
 *
 * Global swing shifts alternating 8th notes. This module operates
 * at a finer level: within a single beat's subdivisions, individual
 * notes can be slightly early or late to create a "loose" feel
 * independent of the global groove.
 *
 * Applied as per-note .late() offsets that add subtle humanization.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood swing depth (maximum timing offset in seconds).
 */
const SWING_DEPTH: Record<Mood, number> = {
  trance:    0.005,  // very tight
  avril:     0.012,  // classical rubato-like
  disco:     0.008,  // moderate groove
  downtempo: 0.015,  // lazy swing
  blockhead: 0.018,  // heavy hip-hop swing
  lofi:      0.020,  // maximum jazz looseness
  flim:      0.014,  // organic
  xtal:      0.010,  // subtle
  syro:      0.012,  // moderate IDM
  ambient:   0.006,  // very subtle
};

/**
 * Section multipliers for swing depth.
 */
const SECTION_SWING: Record<Section, number> = {
  intro:     0.7,   // relaxed
  build:     0.5,   // tightening
  peak:      0.3,   // tightest
  breakdown: 1.0,   // loosest
  groove:    0.8,   // natural
};

/**
 * Calculate per-note timing offset for intra-beat swing.
 *
 * @param noteIndex Position in pattern
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns Timing offset in seconds (can be positive or negative)
 */
export function intraBeatOffset(
  noteIndex: number,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = SWING_DEPTH[mood] * (SECTION_SWING[section] ?? 1.0);
  if (depth < 0.002) return 0;

  // Hash to get deterministic but varied offsets per note position
  const hash = (((tick + 17) * 2246822507 ^ (noteIndex + 3) * 3266489917) >>> 0) / 4294967296;
  // Map to -depth..+depth range
  return (hash * 2 - 1) * depth;
}

/**
 * Generate an array of late() offsets for a pattern.
 *
 * @param patternLength Number of steps
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns Array of timing offsets (seconds)
 */
export function swingOffsets(
  patternLength: number,
  tick: number,
  mood: Mood,
  section: Section
): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < patternLength; i++) {
    offsets.push(intraBeatOffset(i, tick, mood, section));
  }
  return offsets;
}

/**
 * Should intra-beat swing be applied?
 */
export function shouldApplyIntraBeatSwing(mood: Mood, section: Section): boolean {
  return SWING_DEPTH[mood] * (SECTION_SWING[section] ?? 1.0) >= 0.004;
}

/**
 * Get swing depth for a mood (for testing).
 */
export function swingDepth(mood: Mood): number {
  return SWING_DEPTH[mood];
}
