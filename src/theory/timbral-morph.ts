/**
 * Timbral morphing — FM synthesis parameters evolve within sections.
 *
 * FM index controls harmonic richness: higher values = brighter/harsher,
 * lower values = warmer/simpler. By gradually shifting FM index over
 * section duration, the timbre "opens up" during builds and "closes down"
 * during breakdowns, creating a sense of timbral motion.
 *
 * Applied as a multiplier to existing .fm() values via post-processing.
 * Kept subtle (±15%) to avoid destabilizing the sound design.
 */

import type { Section } from '../types';

interface TimbralShape {
  fmStart: number;   // FM index multiplier at section start
  fmEnd: number;     // FM index multiplier at section end
}

const SECTION_TIMBRE: Record<Section, TimbralShape> = {
  intro:     { fmStart: 0.85, fmEnd: 0.95 },   // gentle opening
  build:     { fmStart: 0.9,  fmEnd: 1.15 },   // brightening
  peak:      { fmStart: 1.1,  fmEnd: 1.05 },   // bright, stable
  breakdown: { fmStart: 1.0,  fmEnd: 0.8 },    // warming down
  groove:    { fmStart: 0.95, fmEnd: 1.0 },     // stable pocket
};

/**
 * Compute FM index multiplier based on section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .fm() values (typically 0.8-1.15)
 */
export function fmMorphMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_TIMBRE[section] ?? SECTION_TIMBRE.groove;
  return shape.fmStart + (shape.fmEnd - shape.fmStart) * p;
}

/**
 * Whether timbral morphing should be applied for this section.
 */
export function shouldApplyTimbralMorph(section: Section): boolean {
  const shape = SECTION_TIMBRE[section];
  return Math.abs(shape.fmEnd - shape.fmStart) > 0.06;
}
