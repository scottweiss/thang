/**
 * Predictive EQ — look-ahead LPF adjustment before chord changes.
 *
 * Rather than reactively adjusting frequency separation after a chord
 * change, this module preemptively adjusts the LPF when we know a
 * chord change is imminent. If the next chord has more bass content,
 * start carving space early. If it's brighter, start opening up.
 *
 * Applied as LPF multiplier based on next chord prediction.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood predictive EQ strength.
 */
const PREDICTIVE_STRENGTH: Record<Mood, number> = {
  trance:    0.20,  // moderate — keep energy
  avril:     0.45,  // strong — classical preparation
  disco:     0.25,  // moderate
  downtempo: 0.40,  // smooth preparation
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // smoothest — jazz anticipation
  flim:      0.40,  // organic
  xtal:      0.35,  // ambient
  syro:      0.25,  // IDM
  ambient:   0.45,  // smooth,
  plantasia: 0.45,
};

/**
 * Estimate relative brightness of a chord by its quality.
 * Higher = brighter, lower = darker.
 */
function qualityBrightness(quality: string): number {
  const map: Record<string, number> = {
    'maj':  0.5,
    'min':  0.3,
    'maj7': 0.7,
    'min7': 0.4,
    'dom7': 0.6,
    'sus2': 0.5,
    'sus4': 0.4,
    'dim':  0.2,
    'aug':  0.8,
    'add9': 0.7,
    'min9': 0.5,
  };
  return map[quality] ?? 0.5;
}

/**
 * Calculate predictive LPF multiplier.
 * Adjusts current LPF to prepare for the upcoming chord's character.
 *
 * @param currentQuality Current chord quality
 * @param nextQuality Next chord quality
 * @param ticksUntilChange Estimated ticks before change (lower = more urgent)
 * @param mood Current mood
 * @returns LPF multiplier (0.9 - 1.1)
 */
export function predictiveLpfMultiplier(
  currentQuality: string,
  nextQuality: string,
  ticksUntilChange: number,
  mood: Mood
): number {
  const strength = PREDICTIVE_STRENGTH[mood];
  const currentBright = qualityBrightness(currentQuality);
  const nextBright = qualityBrightness(nextQuality);
  const diff = nextBright - currentBright;

  // Urgency: closer to change = stronger adjustment
  const urgency = Math.max(0, 1.0 - ticksUntilChange * 0.3);

  const adjustment = diff * strength * urgency * 0.2;
  return Math.max(0.9, Math.min(1.1, 1.0 + adjustment));
}

/**
 * Should predictive EQ be applied?
 */
export function shouldApplyPredictiveEq(
  mood: Mood,
  hasNextChordHint: boolean,
  ticksUntilChange: number
): boolean {
  return hasNextChordHint && ticksUntilChange <= 3 && PREDICTIVE_STRENGTH[mood] > 0.15;
}

/**
 * Get predictive strength for a mood (for testing).
 */
export function predictiveStrength(mood: Mood): number {
  return PREDICTIVE_STRENGTH[mood];
}
