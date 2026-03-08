/**
 * Harmonic rhythm elasticity — chord change rate responds to musical context.
 *
 * Chords change faster when tension is building and slower at rest points.
 * A resolution chord (I, vi) lingers, while a passing chord (V, ii) moves
 * quickly. This creates natural "breathing" in the harmonic rhythm.
 *
 * Applied as a multiplier on chord change timing.
 */

import type { Mood, Section } from '../types';
import type { ChordQuality } from '../types';

/**
 * Per-mood elasticity range (0 = fixed tempo, 1 = dramatic variation).
 */
const ELASTICITY_RANGE: Record<Mood, number> = {
  trance:    0.20,  // low — steady chord pumping
  avril:     0.55,  // high — Romantic rubato harmony
  disco:     0.15,  // low — dance groove consistency
  downtempo: 0.45,  // strong — lazy stretching
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // strong — jazz comping freedom
  flim:      0.40,  // moderate — organic
  xtal:      0.35,  // moderate
  syro:      0.25,  // moderate — IDM precision but some play
  ambient:   0.60,  // strongest — time dissolves
};

/**
 * Section multiplier on elasticity.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // more elastic — establishing
  build:     0.8,   // tighter — driving
  peak:      0.7,   // tightest — locked
  breakdown: 1.3,   // most elastic — breathing
  groove:    1.0,
};

/**
 * Chord quality stability (more stable = hold longer).
 */
const QUALITY_STABILITY: Record<ChordQuality, number> = {
  maj:  1.2,    // stable — home
  min:  1.1,    // fairly stable
  maj7: 1.15,   // warm, stable
  min7: 1.05,   // moderate
  dom7: 0.8,    // unstable — wants to resolve
  sus2: 0.9,    // suspended — ambiguous
  sus4: 0.85,   // suspended — wants to resolve
  dim:  0.7,    // very unstable
  aug:  0.75,   // unstable
  add9: 1.1,    // colorful but stable
  min9: 1.0,    // moderate
};

/**
 * Calculate chord duration multiplier based on quality and context.
 *
 * @param quality Chord quality
 * @param degree Scale degree (1-7)
 * @param mood Current mood
 * @param section Current section
 * @returns Duration multiplier (0.6 - 1.5)
 */
export function chordDurationElasticity(
  quality: ChordQuality,
  degree: number,
  mood: Mood,
  section: Section
): number {
  const elasticity = ELASTICITY_RANGE[mood] * SECTION_MULT[section];
  const stability = QUALITY_STABILITY[quality];
  // Tonic degree (1) gets extra stability
  const degreeFactor = degree === 1 ? 1.1 : degree === 5 ? 0.9 : 1.0;
  const raw = stability * degreeFactor;
  // Blend toward 1.0 by (1 - elasticity)
  return Math.max(0.6, Math.min(1.5, 1.0 + (raw - 1.0) * elasticity));
}

/**
 * Get elasticity range for a mood (for testing).
 */
export function elasticityRange(mood: Mood): number {
  return ELASTICITY_RANGE[mood];
}
