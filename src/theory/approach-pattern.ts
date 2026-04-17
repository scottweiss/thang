/**
 * Approach pattern — systematic resolution voice movement.
 *
 * When a chord change is imminent, non-chord tones in the current
 * voicing should step toward the nearest chord tone of the next
 * chord. This creates smooth, anticipatory voice movement that
 * makes chord changes feel inevitable rather than abrupt.
 *
 * Different from anticipatory-voice (which handles individual voice
 * leading) — this is about the *pattern* of approach: chromatic,
 * diatonic, or enclosure (above-below-target).
 */

import type { Mood, Section } from '../types';

export type ApproachType = 'chromatic' | 'diatonic' | 'enclosure' | 'direct';

/**
 * Per-mood approach tendency.
 * Higher = more elaborate approach patterns.
 */
const APPROACH_TENDENCY: Record<Mood, number> = {
  trance:    0.15,  // mostly direct
  avril:     0.50,  // classical approach
  disco:     0.30,  // groove approach
  downtempo: 0.35,  // moderate
  blockhead: 0.25,  // choppy, less smooth
  lofi:      0.55,  // jazz approach patterns
  flim:      0.45,  // organic
  xtal:      0.30,  // floating approach
  syro:      0.20,  // complex but angular
  ambient:   0.10,  // barely approaches,
  plantasia: 0.10,
};

/**
 * Select approach type based on mood and context.
 *
 * @param mood Current mood
 * @param tick Current tick for variety
 * @returns Selected approach type
 */
export function selectApproachType(mood: Mood, tick: number): ApproachType {
  const tendency = APPROACH_TENDENCY[mood];
  const hash = ((tick * 2654435761 + 83471) >>> 0) / 4294967296;

  if (hash > tendency + 0.3) return 'direct';
  if (hash > tendency) return 'diatonic';

  // Jazz moods prefer enclosure, others prefer chromatic
  const jazzMoods = ['lofi', 'downtempo', 'flim'];
  if (jazzMoods.includes(mood) && hash < tendency * 0.4) return 'enclosure';

  return 'chromatic';
}

/**
 * Calculate the approach offset in semitones.
 *
 * @param type Approach type
 * @param distanceToTarget Semitones to target (signed)
 * @returns Approach offset to apply
 */
export function approachOffset(type: ApproachType, distanceToTarget: number): number {
  const absDistance = Math.abs(distanceToTarget);
  const direction = distanceToTarget > 0 ? 1 : -1;

  switch (type) {
    case 'chromatic':
      // Step by 1 semitone toward target
      return absDistance > 0 ? direction : 0;
    case 'diatonic':
      // Step by 2 semitones (whole step) toward target
      return absDistance >= 2 ? direction * 2 : direction;
    case 'enclosure':
      // Approach from one semitone above, then below (return above offset)
      return absDistance > 1 ? 1 : 0;
    case 'direct':
      return 0;
  }
}

/**
 * Should approach patterns be applied?
 */
export function shouldApplyApproach(mood: Mood, section: Section): boolean {
  const sectionMult: Record<Section, number> = {
    intro: 0.5, build: 0.8, peak: 0.6, breakdown: 1.2, groove: 1.0,
  };
  return APPROACH_TENDENCY[mood] * (sectionMult[section] ?? 1.0) > 0.12;
}

/**
 * Get approach tendency for a mood (for testing).
 */
export function approachTendency(mood: Mood): number {
  return APPROACH_TENDENCY[mood];
}
