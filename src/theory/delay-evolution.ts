/**
 * Delay evolution — echo parameters that evolve with section progress.
 *
 * Delay is a powerful spatial tool that changes character across sections:
 * - Builds: feedback increases, creating cascading echoes that build intensity
 * - Peaks: shorter delay, moderate feedback — tight rhythmic echoes
 * - Breakdowns: long delay, high feedback — vast spacious trails
 * - Intros: gentle echoes that establish space
 *
 * Applied as multipliers to existing .delay(), .delayfeedback() values.
 */

import type { Section } from '../types';

interface DelayShape {
  wetStart: number;       // .delay() wet multiplier at section start
  wetEnd: number;         // .delay() wet multiplier at section end
  feedbackStart: number;  // .delayfeedback() multiplier at start
  feedbackEnd: number;    // .delayfeedback() multiplier at end
}

const SECTION_DELAY: Record<Section, DelayShape> = {
  intro:     { wetStart: 0.7,  wetEnd: 0.85, feedbackStart: 0.8,  feedbackEnd: 0.9 },
  build:     { wetStart: 0.8,  wetEnd: 1.15, feedbackStart: 0.85, feedbackEnd: 1.2 },   // echoes cascade
  peak:      { wetStart: 0.9,  wetEnd: 0.85, feedbackStart: 0.9,  feedbackEnd: 0.85 },  // tight, controlled
  breakdown: { wetStart: 1.0,  wetEnd: 1.2,  feedbackStart: 1.0,  feedbackEnd: 1.3 },   // vast trails
  groove:    { wetStart: 0.9,  wetEnd: 0.95, feedbackStart: 0.9,  feedbackEnd: 0.95 },  // stable
};

/**
 * Compute delay wet amount multiplier for section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .delay() values
 */
export function delayWetMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_DELAY[section] ?? SECTION_DELAY.groove;
  return shape.wetStart + (shape.wetEnd - shape.wetStart) * p;
}

/**
 * Compute delay feedback multiplier for section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .delayfeedback() values (capped at 1.4x to prevent runaway)
 */
export function delayFeedbackMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_DELAY[section] ?? SECTION_DELAY.groove;
  const mult = shape.feedbackStart + (shape.feedbackEnd - shape.feedbackStart) * p;
  // Safety cap: never let feedback multiplier push values past ~0.85 total
  return Math.min(1.4, mult);
}

/**
 * Whether delay evolution should be applied for this section.
 */
export function shouldApplyDelayEvolution(section: Section): boolean {
  const shape = SECTION_DELAY[section];
  const wetDelta = Math.abs(shape.wetEnd - shape.wetStart);
  const fbDelta = Math.abs(shape.feedbackEnd - shape.feedbackStart);
  return wetDelta > 0.05 || fbDelta > 0.05;
}
