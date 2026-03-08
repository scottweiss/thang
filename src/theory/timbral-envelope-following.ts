/**
 * Timbral envelope following — FM depth follows amplitude envelope.
 *
 * In acoustic instruments, timbre brightens during the attack phase
 * and darkens during decay. This module simulates that natural
 * relationship by modulating FM depth based on where in the
 * note's lifecycle we are.
 *
 * Applied as FM multiplier correlated with envelope phase.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood envelope tracking (higher = stronger FM-envelope correlation).
 */
const ENVELOPE_TRACKING: Record<Mood, number> = {
  trance:    0.35,  // moderate — synthy
  avril:     0.55,  // high — acoustic feel
  disco:     0.30,  // moderate
  downtempo: 0.50,  // high — organic
  blockhead: 0.40,  // moderate
  lofi:      0.45,  // moderate — warm
  flim:      0.50,  // high — delicate
  xtal:      0.55,  // high — crystalline attack
  syro:      0.25,  // low — synthetic
  ambient:   0.60,  // highest — natural timbre
};

/**
 * FM multiplier based on envelope phase.
 *
 * @param envelopePhase 0.0 = attack peak, 1.0 = end of decay
 * @param mood Current mood
 * @returns FM multiplier (0.7 - 1.3)
 */
export function envelopeFmMultiplier(
  envelopePhase: number,
  mood: Mood
): number {
  const tracking = ENVELOPE_TRACKING[mood];
  const phase = Math.max(0, Math.min(1, envelopePhase));

  // Attack phase (0-0.2) = bright (high FM)
  // Sustain (0.2-0.7) = normal
  // Decay (0.7-1.0) = dark (low FM)
  let brightness: number;
  if (phase < 0.2) {
    brightness = 1.0 + (1 - phase / 0.2) * 0.3; // 1.3 at attack
  } else if (phase < 0.7) {
    brightness = 1.0; // normal during sustain
  } else {
    brightness = 1.0 - ((phase - 0.7) / 0.3) * 0.3; // darken to 0.7
  }

  // Scale by tracking strength
  const deviation = (brightness - 1.0) * tracking;
  return Math.max(0.7, Math.min(1.3, 1.0 + deviation));
}

/**
 * Get envelope tracking for a mood (for testing).
 */
export function envelopeTracking(mood: Mood): number {
  return ENVELOPE_TRACKING[mood];
}
