/**
 * Spatial depth — dynamic reverb that breathes with section structure.
 *
 * Reverb is more than an effect; it's the perceived "room" the music lives in.
 * During builds, the space contracts (creates pressure and anticipation).
 * At peaks, it expands dramatically (the "drop" opens into a cathedral).
 * Breakdowns are vast and ethereal. Intros start intimate, then grow.
 *
 * Applied as a multiplier to existing .room() and .roomsize() values.
 */

import type { Section } from '../types';

interface SpaceShape {
  roomStart: number;     // room wet multiplier at section start
  roomEnd: number;       // room wet multiplier at section end
  sizeStart: number;     // roomsize multiplier at section start
  sizeEnd: number;       // roomsize multiplier at section end
}

const SECTION_SPACE: Record<Section, SpaceShape> = {
  intro:     { roomStart: 0.7,  roomEnd: 0.9,  sizeStart: 0.8,  sizeEnd: 1.0 },
  build:     { roomStart: 0.9,  roomEnd: 0.6,  sizeStart: 1.0,  sizeEnd: 0.7 },  // contracts
  peak:      { roomStart: 0.85, roomEnd: 0.95, sizeStart: 0.9,  sizeEnd: 1.0 },  // opens wide
  breakdown: { roomStart: 1.0,  roomEnd: 1.1,  sizeStart: 1.1,  sizeEnd: 1.3 },  // vast, ethereal
  groove:    { roomStart: 0.85, roomEnd: 0.9,  sizeStart: 0.9,  sizeEnd: 0.95 }, // stable, comfortable
};

/**
 * Compute room wet amount multiplier for section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @param tension   0-1 tension level (higher tension dries reverb slightly)
 * @returns Multiplier for .room() values
 */
export function roomMultiplier(
  section: Section,
  progress: number,
  tension: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const t = Math.max(0, Math.min(1, tension));
  const shape = SECTION_SPACE[section] ?? SECTION_SPACE.groove;

  const base = shape.roomStart + (shape.roomEnd - shape.roomStart) * p;
  // Higher tension dries the reverb slightly (clarity at climactic moments)
  return Math.max(0.3, base - t * 0.1);
}

/**
 * Compute roomsize multiplier for section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .roomsize() values
 */
export function roomsizeMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_SPACE[section] ?? SECTION_SPACE.groove;

  return shape.sizeStart + (shape.sizeEnd - shape.sizeStart) * p;
}

/**
 * Whether spatial depth modulation should be applied for this section.
 * Sections with minimal change skip the processing.
 */
export function shouldApplySpatialDepth(section: Section): boolean {
  const shape = SECTION_SPACE[section];
  const roomDelta = Math.abs(shape.roomEnd - shape.roomStart);
  const sizeDelta = Math.abs(shape.sizeEnd - shape.sizeStart);
  return roomDelta > 0.05 || sizeDelta > 0.05;
}
