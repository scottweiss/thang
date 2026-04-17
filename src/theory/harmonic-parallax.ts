/**
 * Harmonic parallax — layers respond to chord changes at different speeds.
 *
 * Like visual parallax where near objects move fast and far objects move slow,
 * foreground layers (melody, arp) react to chord changes immediately while
 * background layers (drone, atmosphere) lag behind, creating depth.
 *
 * Applied as a chord-change delay per layer type.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood parallax depth (higher = more speed difference between layers).
 */
const PARALLAX_DEPTH: Record<Mood, number> = {
  trance:    0.15,  // weak — unified chord changes
  avril:     0.40,  // strong — orchestral depth
  disco:     0.10,  // minimal — tight changes
  downtempo: 0.45,  // strong — lazy staggered changes
  blockhead: 0.25,  // moderate
  lofi:      0.50,  // strong — jazz independence
  flim:      0.35,  // moderate
  xtal:      0.55,  // strong — ambient depth
  syro:      0.30,  // moderate
  ambient:   0.60,  // strongest — deep parallax,
  plantasia: 0.60,
};

/**
 * Layer "distance" — how far from foreground (0 = immediate, 1 = most delayed).
 */
const LAYER_DISTANCE: Record<string, number> = {
  melody:     0.0,  // foreground — immediate
  arp:        0.1,  // near-foreground
  texture:    0.2,  // mid
  harmony:    0.3,  // mid-background
  atmosphere: 0.7,  // far background
  drone:      0.9,  // farthest — most delayed
};

/**
 * Section multiplier.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // more parallax — establishing depth
  build:     0.8,
  peak:      0.5,   // least parallax — unified impact
  breakdown: 1.4,   // most parallax — deconstructed
  groove:    1.0,
};

/**
 * Calculate chord-change response delay for a layer (in ticks).
 *
 * @param layerName Layer name
 * @param mood Current mood
 * @param section Current section
 * @returns Delay in ticks (0 - 3)
 */
export function parallaxDelay(
  layerName: string,
  mood: Mood,
  section: Section
): number {
  const depth = PARALLAX_DEPTH[mood] * SECTION_MULT[section];
  const distance = LAYER_DISTANCE[layerName] ?? 0.5;
  return Math.round(distance * depth * 3);
}

/**
 * Should this layer hold the previous chord (due to parallax delay)?
 *
 * @param layerName Layer name
 * @param ticksSinceChordChange Ticks since last chord change
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to keep the old chord
 */
export function shouldHoldPreviousChord(
  layerName: string,
  ticksSinceChordChange: number,
  mood: Mood,
  section: Section
): boolean {
  const delay = parallaxDelay(layerName, mood, section);
  return ticksSinceChordChange < delay;
}

/**
 * Get parallax depth for a mood (for testing).
 */
export function parallaxDepth(mood: Mood): number {
  return PARALLAX_DEPTH[mood];
}
