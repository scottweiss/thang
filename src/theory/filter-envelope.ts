/**
 * Filter envelope — smooth LPF/HPF sweeps over section duration.
 *
 * Instead of jumping between fixed filter values per section, this module
 * provides a multiplier that sweeps smoothly as the section progresses.
 * During builds, the filter gradually opens. During breakdowns, it closes.
 * This creates the characteristic "rising sweep" of electronic music builds
 * and the "closing down" effect of breakdowns.
 *
 * The multiplier is applied to existing LPF values via post-processing.
 */

import type { Section } from '../types';

/**
 * Filter sweep shape for each section.
 * start: multiplier at beginning of section
 * end: multiplier at end of section
 * curve: 'linear' | 'exp' | 'log' — shape of the sweep
 */
interface SweepShape {
  start: number;
  end: number;
  curve: 'linear' | 'exp' | 'log';
}

const SECTION_SWEEPS: Record<Section, SweepShape> = {
  intro:     { start: 0.6,  end: 0.85, curve: 'log' },      // gradually opens
  build:     { start: 0.65, end: 1.0,  curve: 'exp' },      // accelerating open
  peak:      { start: 1.0,  end: 1.0,  curve: 'linear' },   // fully open, stable
  breakdown: { start: 0.95, end: 0.55, curve: 'exp' },      // closing down
  groove:    { start: 0.9,  end: 0.95, curve: 'linear' },   // stable, slightly open
};

/**
 * Compute the filter multiplier for the current position within a section.
 *
 * @param section   Current musical section
 * @param progress  0-1 how far through the section (0 = start, 1 = end)
 * @param tension   0-1 overall tension (higher tension opens filter slightly)
 * @returns Filter multiplier (0-1) to apply to LPF values
 */
export function filterEnvelopeMultiplier(
  section: Section,
  progress: number,
  tension: number
): number {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const clampedTension = Math.max(0, Math.min(1, tension));
  const sweep = SECTION_SWEEPS[section] ?? SECTION_SWEEPS.groove;

  let t: number;
  switch (sweep.curve) {
    case 'exp':
      // Exponential: slow start, fast finish (good for builds)
      t = clampedProgress * clampedProgress;
      break;
    case 'log':
      // Logarithmic: fast start, slow finish (good for intros)
      t = Math.sqrt(clampedProgress);
      break;
    case 'linear':
    default:
      t = clampedProgress;
      break;
  }

  const base = sweep.start + (sweep.end - sweep.start) * t;

  // Tension pushes the filter open slightly (up to +0.1)
  return Math.min(1.0, base + clampedTension * 0.1);
}

/**
 * Whether filter envelope should be applied for a given section.
 * Peak sections are already fully open, so no sweep needed.
 */
export function shouldApplyFilterEnvelope(section: Section): boolean {
  const sweep = SECTION_SWEEPS[section];
  // Skip if the section is fully static (start ≈ end)
  return Math.abs(sweep.start - sweep.end) > 0.05;
}
