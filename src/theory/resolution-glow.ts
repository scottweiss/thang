/**
 * Resolution glow — enhance beautiful harmonic resolutions with
 * a brief brightness surge.
 *
 * When a chord progression reaches a resolution (V→I, ♭II→I, iv→I),
 * the ear expects and craves that release of tension. By briefly
 * opening the filter and adding a gentle gain boost at the moment
 * of resolution, we amplify the emotional payoff.
 *
 * The effect is subtle: a 10-25% filter brightness increase that
 * decays over 2-3 ticks. It's like the musical equivalent of
 * sunlight breaking through clouds — the resolution "glows."
 *
 * This only fires on genuine resolutions (dominant→tonic movement),
 * not on every chord change. The strength depends on how strong
 * the dominant-tonic pull was.
 */

import type { Mood, ChordQuality } from '../types';

/** Resolution type — how strong the resolution is */
export type ResolutionType = 'perfect' | 'strong' | 'mild' | 'none';

/**
 * Detect if the current chord change is a resolution.
 *
 * @param prevDegree    Previous chord degree (0-6)
 * @param prevQuality   Previous chord quality
 * @param currDegree    Current chord degree (0-6)
 * @returns Resolution type
 */
export function detectResolution(
  prevDegree: number,
  prevQuality: ChordQuality,
  currDegree: number
): ResolutionType {
  // Perfect cadence: V(7) → I
  if (prevDegree === 4 && currDegree === 0) {
    return prevQuality === 'dom7' ? 'perfect' : 'strong';
  }

  // ♭II → I (tritone sub resolution)
  // We detect this by quality: if previous was dom7 and we arrived at I
  if (prevQuality === 'dom7' && currDegree === 0) {
    return 'strong';
  }

  // Plagal cadence: IV → I
  if (prevDegree === 3 && currDegree === 0) {
    return 'mild';
  }

  // Deceptive cadence: V → vi (still has resolution quality)
  if (prevDegree === 4 && currDegree === 5) {
    return 'mild';
  }

  // vii° → I
  if (prevDegree === 6 && currDegree === 0) {
    return 'strong';
  }

  // ii → V (half cadence — preparatory, slight glow)
  if (prevDegree === 1 && currDegree === 4) {
    return 'mild';
  }

  return 'none';
}

/** Per-mood glow intensity (0 = no effect, 1 = maximum glow) */
const GLOW_INTENSITY: Record<Mood, number> = {
  lofi:      0.20,   // jazz — savor the resolution
  downtempo: 0.18,   // smooth — gentle warmth
  flim:      0.18,   // delicate — beautiful moments
  avril:     0.22,   // intimate — emotional depth
  xtal:      0.15,   // dreamy — subtle shimmer
  blockhead: 0.12,   // hip-hop — some warmth
  disco:     0.10,   // funk — slight lift
  syro:      0.10,   // IDM — analytical beauty
  trance:    0.15,   // EDM — drop moments
  ambient:   0.08,   // subtle — barely there,
  plantasia: 0.08,
};

/**
 * Compute the glow multiplier for filter brightness at the moment
 * of resolution. Decays over subsequent ticks.
 *
 * @param resType           Resolution type
 * @param mood              Current mood
 * @param ticksSinceChange  Ticks since the chord change (resolution moment)
 * @returns Filter brightness multiplier (1.0 = no effect, >1.0 = brighter)
 */
export function resolutionGlowMultiplier(
  resType: ResolutionType,
  mood: Mood,
  ticksSinceChange: number
): number {
  if (resType === 'none') return 1.0;

  const intensity = GLOW_INTENSITY[mood];

  // Resolution strength determines peak glow
  const peakGlow: Record<ResolutionType, number> = {
    perfect: 1.0,
    strong:  0.7,
    mild:    0.4,
    none:    0.0,
  };

  const peak = intensity * peakGlow[resType];

  // Exponential decay over ticks (glow fades quickly)
  const decay = Math.exp(-ticksSinceChange * 0.8);

  return 1.0 + peak * decay;
}

/**
 * Compute a gain boost for the resolution moment.
 * Smaller than the filter glow — just a gentle swell.
 *
 * @param resType           Resolution type
 * @param mood              Current mood
 * @param ticksSinceChange  Ticks since the chord change
 * @returns Gain multiplier (1.0 = no effect, >1.0 = louder)
 */
export function resolutionGainBoost(
  resType: ResolutionType,
  mood: Mood,
  ticksSinceChange: number
): number {
  if (resType === 'none') return 1.0;

  const intensity = GLOW_INTENSITY[mood] * 0.5; // gain is more subtle than filter

  const peakGain: Record<ResolutionType, number> = {
    perfect: 1.0,
    strong:  0.6,
    mild:    0.3,
    none:    0.0,
  };

  const peak = intensity * peakGain[resType];
  const decay = Math.exp(-ticksSinceChange * 1.0); // faster decay for gain

  return 1.0 + peak * decay;
}

/**
 * Get the glow intensity for a mood (for testing).
 */
export function glowIntensity(mood: Mood): number {
  return GLOW_INTENSITY[mood];
}
