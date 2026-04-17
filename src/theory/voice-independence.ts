/**
 * Voice independence — rhythmic independence between melody and harmony.
 *
 * Good counterpoint has rhythmically independent lines. When melody
 * plays long notes, harmony should be active, and vice versa. This
 * module measures rhythmic independence between layers and adjusts
 * density to prevent rhythmic unison (which sounds flat/boring).
 *
 * Applied to harmony and arp: when melody rhythm is detected,
 * these layers adjust their density to complement rather than double.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood independence strength.
 * Higher = stronger push for rhythmic independence.
 */
const INDEPENDENCE_STRENGTH: Record<Mood, number> = {
  trance:    0.15,  // mostly locked (four-on-the-floor)
  avril:     0.45,  // classical independence
  disco:     0.25,  // groove lock
  downtempo: 0.35,  // moderate independence
  blockhead: 0.40,  // choppy counterpoint
  lofi:      0.55,  // jazz independence
  flim:      0.50,  // organic independence
  xtal:      0.45,  // floating counterpoint
  syro:      0.30,  // complex independence
  ambient:   0.20,  // gentle independence,
  plantasia: 0.20,
};

/**
 * Calculate how much a supporting layer should adjust density
 * relative to the melody's current pattern.
 *
 * @param melodyPattern Melody step pattern (notes and rests)
 * @param layerPosition Position in this layer's pattern
 * @param mood Current mood
 * @param section Current section
 * @returns Density multiplier (0.3-1.0, lower = thinner when melody is active)
 */
export function independenceDensityMult(
  melodyPattern: string[],
  layerPosition: number,
  mood: Mood,
  section: Section
): number {
  if (melodyPattern.length === 0) return 1.0;

  const strength = INDEPENDENCE_STRENGTH[mood];
  const sectionMult: Record<Section, number> = {
    intro: 0.5, build: 0.8, peak: 0.6, breakdown: 1.3, groove: 1.0,
  };

  // Check if melody is active at this position
  const idx = layerPosition % melodyPattern.length;
  const melodyActive = melodyPattern[idx] !== '~';

  if (melodyActive) {
    // Melody is playing — reduce this layer
    return Math.max(0.3, 1.0 - strength * (sectionMult[section] ?? 1.0));
  }

  // Melody is resting — this layer can be active
  return 1.0;
}

/**
 * Should voice independence be applied?
 */
export function shouldApplyIndependence(mood: Mood): boolean {
  return INDEPENDENCE_STRENGTH[mood] > 0.12;
}

/**
 * Get independence strength for a mood (for testing).
 */
export function independenceStrength(mood: Mood): number {
  return INDEPENDENCE_STRENGTH[mood];
}
