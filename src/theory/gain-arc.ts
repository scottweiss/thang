/**
 * Gain arc — dynamic gain curves shaped by section progress.
 *
 * Musical dynamics are fundamental: builds crescendo (grow louder),
 * breakdowns decrescendo (fade), peaks sustain energy. Without this,
 * sections feel static even when other parameters evolve.
 *
 * Applied as a multiplier to existing gain values via post-processing.
 * Kept subtle (±25%) to complement rather than overpower the mix.
 */

import type { Section } from '../types';

interface GainArcShape {
  startMult: number;  // gain multiplier at section start
  endMult: number;    // gain multiplier at section end
  curve: 'linear' | 'ease-in' | 'ease-out';
}

const SECTION_GAIN_ARC: Record<Section, GainArcShape> = {
  intro:     { startMult: 0.75, endMult: 0.95, curve: 'ease-out' },    // gentle fade-in
  build:     { startMult: 0.8,  endMult: 1.0,  curve: 'ease-in' },     // crescendo
  peak:      { startMult: 1.0,  endMult: 0.95, curve: 'linear' },      // sustain, slight taper
  breakdown: { startMult: 1.0,  endMult: 0.75, curve: 'ease-out' },    // decrescendo
  groove:    { startMult: 0.95, endMult: 1.0,  curve: 'linear' },      // stable, slight swell
};

/**
 * Compute gain multiplier based on section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for gain values (typically 0.75-1.0)
 */
export function gainArcMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_GAIN_ARC[section] ?? SECTION_GAIN_ARC.groove;

  let t: number;
  switch (shape.curve) {
    case 'ease-in':
      // Slow start, accelerating — crescendo feels natural
      t = p * p;
      break;
    case 'ease-out':
      // Fast start, decelerating — decrescendo lingers
      t = 1 - (1 - p) * (1 - p);
      break;
    default:
      t = p;
  }

  return shape.startMult + (shape.endMult - shape.startMult) * t;
}

/**
 * Whether gain arc should be applied for this section.
 * Only sections with meaningful gain change benefit.
 */
export function shouldApplyGainArc(section: Section): boolean {
  const shape = SECTION_GAIN_ARC[section];
  return Math.abs(shape.endMult - shape.startMult) > 0.06;
}
