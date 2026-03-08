/**
 * Resolution-aware harmonic rhythm — chords that "want" to resolve do so faster.
 *
 * A V7 chord creates urgency; it shouldn't linger. A tonic chord is stable
 * and can sustain comfortably. This module converts resolution pull into
 * a timing multiplier that makes the evolution manager schedule chord changes
 * at musically appropriate rates.
 *
 * The effect is subtle but important: it creates the natural ebb and flow
 * of harmonic rhythm where tension chords push forward and resolution
 * chords breathe.
 */

import type { ChordQuality, Mood } from '../types';
import { resolutionPull } from './chord-tension';

/**
 * How much resolution pull affects chord duration.
 * Higher = more dramatic timing differences between stable/tense chords.
 * Energetic moods get stronger effect (faster resolution of tension).
 */
const MOOD_SENSITIVITY: Record<Mood, number> = {
  ambient: 0.15,     // very subtle — ambient should flow naturally
  downtempo: 0.25,
  lofi: 0.2,
  trance: 0.4,       // strong — tension resolves fast in trance
  avril: 0.1,        // minimal — avril breathes slowly
  xtal: 0.15,
  syro: 0.45,        // strongest — syro is restless
  blockhead: 0.3,
  flim: 0.2,
  disco: 0.35,       // strong — disco needs drive
};

/**
 * Compute a timing multiplier based on resolution pull.
 *
 * High resolution pull → multiplier < 1.0 (chord changes sooner)
 * Low resolution pull → multiplier > 1.0 (chord sustains longer)
 *
 * @param degree   Current chord degree (0-6)
 * @param quality  Current chord quality
 * @param mood     Current mood (determines sensitivity)
 * @returns Timing multiplier (typically 0.6 - 1.3)
 */
export function resolutionTimingMultiplier(
  degree: number,
  quality: ChordQuality,
  mood: Mood
): number {
  const pull = resolutionPull(degree, quality);
  const sensitivity = MOOD_SENSITIVITY[mood] ?? 0.25;

  // Map pull (0-1) to multiplier:
  // pull=0 (no urgency, e.g. tonic) → 1 + sensitivity (sustain longer)
  // pull=0.5 (moderate) → ~1.0 (neutral)
  // pull=1.0 (maximum urgency) → 1 - sensitivity (resolve faster)
  // Using a centered linear mapping: mult = 1 + sensitivity * (0.5 - pull)
  const multiplier = 1 + sensitivity * (0.5 - pull);

  // Clamp to reasonable range
  return Math.max(0.5, Math.min(1.5, multiplier));
}

/**
 * Whether the resolution timing effect is significant enough to apply.
 * Avoids unnecessary computation for near-neutral values.
 */
export function shouldApplyResolutionTiming(
  degree: number,
  quality: ChordQuality,
  mood: Mood
): boolean {
  const mult = resolutionTimingMultiplier(degree, quality, mood);
  return Math.abs(mult - 1.0) > 0.04;
}
