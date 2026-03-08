/**
 * Grid phase lock — layer start quantization to harmonic rhythm.
 *
 * When multiple layers run at different densities, their patterns
 * can drift relative to the harmonic grid. This module ensures that
 * layer downbeats align with chord changes, creating coherent
 * polyrhythmic clarity rather than chaotic phase relationships.
 *
 * Applied as a .late() correction to snap layer starts to the grid.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood phase lock tightness (0 = loose, 1 = very tight).
 */
const LOCK_TIGHTNESS: Record<Mood, number> = {
  trance:    0.70,  // very tight grid
  avril:     0.40,  // moderate
  disco:     0.65,  // tight groove
  downtempo: 0.35,  // relaxed
  blockhead: 0.55,  // hip-hop pocket
  lofi:      0.30,  // loose — jazz
  flim:      0.35,  // organic
  xtal:      0.25,  // very loose
  syro:      0.50,  // moderate IDM
  ambient:   0.15,  // loosest
};

/**
 * Section tightness multiplier.
 */
const SECTION_TIGHTNESS: Record<Section, number> = {
  intro:     0.5,   // loose
  build:     0.8,   // tightening
  peak:      1.0,   // tightest
  breakdown: 0.4,   // loose
  groove:    0.9,   // tight groove
};

/**
 * Calculate phase lock correction.
 * Returns a timing correction that nudges the layer toward the grid.
 *
 * @param layerName Layer identifier
 * @param ticksSinceChordChange Ticks since last chord change
 * @param mood Current mood
 * @param section Current section
 * @returns Timing correction in seconds (0 = already on grid)
 */
export function phaseLockCorrection(
  layerName: string,
  ticksSinceChordChange: number,
  mood: Mood,
  section: Section
): number {
  const tightness = LOCK_TIGHTNESS[mood] * (SECTION_TIGHTNESS[section] ?? 1.0);
  if (tightness < 0.10) return 0;

  // Layers that drift most need most correction
  const driftProne: Record<string, number> = {
    arp:        0.8,   // fast patterns drift easily
    melody:     0.5,   // moderate drift
    texture:    0.6,   // drum patterns
    harmony:    0.3,   // slow — less drift
    drone:      0.1,   // nearly static
    atmosphere: 0.1,
  };

  const drift = driftProne[layerName] ?? 0.3;

  // Correction: at chord change (tick 0), snap to grid
  // After chord change, gradually relax the lock
  if (ticksSinceChordChange === 0) {
    return 0; // already at grid point
  }

  // Small correction that decays with time since change
  const decay = Math.exp(-ticksSinceChordChange * 0.5);
  return drift * tightness * decay * 0.01; // max ~8ms correction
}

/**
 * Should phase lock be applied?
 */
export function shouldApplyPhaseLock(
  mood: Mood,
  section: Section,
  ticksSinceChordChange: number
): boolean {
  const tightness = LOCK_TIGHTNESS[mood] * (SECTION_TIGHTNESS[section] ?? 1.0);
  return tightness > 0.10 && ticksSinceChordChange > 0 && ticksSinceChordChange <= 4;
}

/**
 * Get lock tightness for a mood (for testing).
 */
export function lockTightness(mood: Mood): number {
  return LOCK_TIGHTNESS[mood];
}
