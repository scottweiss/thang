/**
 * Registral density — prevent frequency crowding between layers.
 *
 * When melody, harmony, and arp all sit in octave 4, they mask
 * each other. This module tracks which octave ranges are occupied
 * and nudges layers toward less crowded registers.
 *
 * Based on orchestration principle: distribute voices across the
 * full frequency range, with each layer having "room to breathe."
 */

import type { Mood } from '../types';

/**
 * Per-mood tolerance for registral crowding.
 * Higher = more tolerant (allows clustered voicings).
 */
const CROWDING_TOLERANCE: Record<Mood, number> = {
  trance:    0.35,  // some overlap OK for power
  avril:     0.25,  // piano-like clarity
  disco:     0.30,  // moderate overlap
  downtempo: 0.25,  // clear separation
  blockhead: 0.40,  // tight is funky
  lofi:      0.20,  // jazz — clear separation
  flim:      0.30,  // organic, moderate
  xtal:      0.15,  // crystalline clarity
  syro:      0.35,  // complex, some overlap
  ambient:   0.10,  // maximum separation
};

/**
 * Ideal center octave per layer (default orchestration spread).
 */
const LAYER_CENTER_OCTAVE: Record<string, number> = {
  drone: 2,       // bass register
  harmony: 3,     // lower-mid
  melody: 4,      // mid
  arp: 5,         // upper-mid
  texture: 3,     // drums are in lower-mid
  atmosphere: 4,  // mid (pads)
};

/**
 * Calculate registral density — how crowded a particular octave is.
 *
 * @param layerOctaves Map of layer name → center octave
 * @param targetOctave The octave to check
 * @returns Number of layers in or near this octave
 */
export function octaveDensity(
  layerOctaves: Record<string, number>,
  targetOctave: number
): number {
  let count = 0;
  for (const oct of Object.values(layerOctaves)) {
    const dist = Math.abs(oct - targetOctave);
    if (dist <= 0.5) count += 1.0;
    else if (dist <= 1.0) count += 0.5;
  }
  return count;
}

/**
 * Should a layer shift its register to reduce crowding?
 *
 * @param layerName This layer's name
 * @param layerOctaves All active layers' center octaves
 * @param mood Current mood
 * @returns Whether to shift
 */
export function shouldShiftForClarity(
  layerName: string,
  layerOctaves: Record<string, number>,
  mood: Mood
): boolean {
  const myOctave = layerOctaves[layerName];
  if (myOctave === undefined) return false;

  const density = octaveDensity(layerOctaves, myOctave);
  const tolerance = CROWDING_TOLERANCE[mood];

  // 2+ layers in same octave and tolerance is low → shift
  return density > 1.5 && tolerance < 0.35;
}

/**
 * Suggest an octave shift direction for a layer to reduce crowding.
 * Returns -1 (shift down), 0 (no shift), or 1 (shift up).
 *
 * @param layerName This layer's name
 * @param layerOctaves All active layers' center octaves
 * @returns Shift direction
 */
export function shiftDirection(
  layerName: string,
  layerOctaves: Record<string, number>
): number {
  const myOctave = layerOctaves[layerName];
  if (myOctave === undefined) return 0;

  const ideal = LAYER_CENTER_OCTAVE[layerName] ?? myOctave;

  // Move toward ideal octave
  if (myOctave < ideal) return 1;
  if (myOctave > ideal) return -1;

  // At ideal: check which direction is less crowded
  const aboveDensity = octaveDensity(layerOctaves, myOctave + 1);
  const belowDensity = octaveDensity(layerOctaves, myOctave - 1);

  if (aboveDensity < belowDensity) return 1;
  if (belowDensity < aboveDensity) return -1;
  return 0;
}

/**
 * Calculate an octave spread score for the current arrangement.
 * Higher = better spread (less crowding).
 *
 * @param layerOctaves All layers' center octaves
 * @returns Spread score 0-1
 */
export function spreadScore(layerOctaves: Record<string, number>): number {
  const octaves = Object.values(layerOctaves);
  if (octaves.length < 2) return 1.0;

  const range = Math.max(...octaves) - Math.min(...octaves);
  const ideal = Math.max(3, octaves.length); // at least 3 octaves of spread
  return Math.min(1, range / ideal);
}

/**
 * Get crowding tolerance for a mood (for testing).
 */
export function crowdingTolerance(mood: Mood): number {
  return CROWDING_TOLERANCE[mood];
}
