/**
 * Chord tension quantification — measuring harmonic tension from chord properties.
 *
 * Not all chords at the same scale degree carry equal tension. A V7 chord
 * (dominant seventh with its tritone) is far more tense than a plain IV.
 * A diminished chord creates urgency. A sus4 creates suspension that demands
 * resolution. This module quantifies these harmonic tensions so the system
 * can make better decisions about density, brightness, and resolution timing.
 *
 * Tension sources:
 * - **Degree distance**: chords far from tonic (I) are more tense
 * - **Quality tension**: diminished > dom7 > minor > sus > major
 * - **Tritone content**: the b5 interval is the primary source of harmonic tension
 * - **Resolution tendency**: V and vii° want to resolve to I (high pull)
 */

import type { ChordQuality } from '../types';

/**
 * Inherent tension of each chord quality (0-1).
 * Based on intervallic dissonance and resolution tendency.
 */
const QUALITY_TENSION: Record<ChordQuality, number> = {
  maj: 0.1,
  min: 0.2,
  dim: 0.8,
  aug: 0.7,
  sus2: 0.35,
  sus4: 0.4,
  dom7: 0.6,
  maj7: 0.15,
  min7: 0.25,
};

/**
 * Tension from scale degree position (0-6).
 * I and V are most stable, vii° is most tense.
 */
const DEGREE_TENSION: number[] = [
  0.0,   // I (tonic) — most stable
  0.35,  // ii — pre-dominant, moderate
  0.45,  // iii — mediant, somewhat unstable
  0.2,   // IV — subdominant, fairly stable
  0.5,   // V — dominant, wants to resolve (high but directional)
  0.3,   // vi — submediant, moderate
  0.7,   // vii° — leading tone, very tense
];

/**
 * Compute the harmonic tension of a chord.
 *
 * @param degree   Scale degree (0-6)
 * @param quality  Chord quality
 * @returns Tension value 0-1 (0 = completely resolved, 1 = maximum tension)
 */
export function chordTension(degree: number, quality: ChordQuality): number {
  const degreeTension = DEGREE_TENSION[degree % 7] ?? 0.3;
  const qualityTension = QUALITY_TENSION[quality] ?? 0.3;

  // Weighted combination: quality matters more because it determines the sound
  const raw = degreeTension * 0.4 + qualityTension * 0.6;

  // Special boost for dominant function chords (V, vii°)
  // These have the strongest resolution tendency
  const dominantBoost = (degree === 4 || degree === 6) ? 0.1 : 0;

  return Math.min(1, raw + dominantBoost);
}

/**
 * How strongly a chord wants to resolve to tonic.
 * Higher = more urgency to move to I.
 *
 * @param degree   Scale degree (0-6)
 * @param quality  Chord quality
 * @returns Resolution pull 0-1
 */
export function resolutionPull(degree: number, quality: ChordQuality): number {
  // V and V7 have strongest pull to I
  if (degree === 4) {
    return quality === 'dom7' ? 0.95 : 0.7;
  }
  // vii° resolves strongly to I
  if (degree === 6) {
    return quality === 'dim' ? 0.85 : 0.6;
  }
  // IV has moderate pull (plagal cadence)
  if (degree === 3) return 0.4;
  // ii heads toward V
  if (degree === 1) return 0.3;
  // I has no pull (already home)
  if (degree === 0) return 0.0;

  return 0.2;
}

/**
 * Get tension for the quality name as a string (for external use).
 */
export function qualityTension(quality: ChordQuality): number {
  return QUALITY_TENSION[quality] ?? 0.3;
}
