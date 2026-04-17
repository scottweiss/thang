/**
 * Cadential ornamentation — decorative figures at phrase endings.
 *
 * Classical music ornaments cadences with trills, turns, and mordents.
 * This module decides when and what ornament to apply to melody notes
 * near cadence points, adding sophistication to phrase endings.
 *
 * Applied as note modification at phrase boundaries.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood ornamentation probability at cadences.
 */
const ORNAMENT_PROB: Record<Mood, number> = {
  trance:    0.05,  // rare — clean lines
  avril:     0.50,  // strong — classical tradition
  disco:     0.10,  // rare
  downtempo: 0.25,  // moderate
  blockhead: 0.08,  // rare — hip-hop is direct
  lofi:      0.35,  // moderate — jazz grace notes
  flim:      0.30,  // moderate — Aphex ornamental
  xtal:      0.20,  // moderate
  syro:      0.15,  // occasional — IDM embellishment
  ambient:   0.10,  // rare — clean sustained tones,
  plantasia: 0.10,
};

/**
 * Available ornament types.
 */
export type OrnamentType = 'trill' | 'turn' | 'mordent' | 'appoggiatura';

/**
 * Per-mood ornament type preferences (weights, sum to ~1).
 */
const ORNAMENT_PREFERENCE: Record<Mood, Record<OrnamentType, number>> = {
  trance:    { trill: 0.3, turn: 0.2, mordent: 0.3, appoggiatura: 0.2 },
  avril:     { trill: 0.35, turn: 0.30, mordent: 0.15, appoggiatura: 0.20 },
  disco:     { trill: 0.2, turn: 0.3, mordent: 0.3, appoggiatura: 0.2 },
  downtempo: { trill: 0.2, turn: 0.35, mordent: 0.20, appoggiatura: 0.25 },
  blockhead: { trill: 0.1, turn: 0.2, mordent: 0.4, appoggiatura: 0.3 },
  lofi:      { trill: 0.15, turn: 0.30, mordent: 0.25, appoggiatura: 0.30 },
  flim:      { trill: 0.25, turn: 0.25, mordent: 0.25, appoggiatura: 0.25 },
  xtal:      { trill: 0.20, turn: 0.30, mordent: 0.20, appoggiatura: 0.30 },
  syro:      { trill: 0.30, turn: 0.20, mordent: 0.30, appoggiatura: 0.20 },
  ambient:   { trill: 0.40, turn: 0.25, mordent: 0.15, appoggiatura: 0.20 },
  plantasia: { trill: 0.40, turn: 0.25, mordent: 0.15, appoggiatura: 0.20 },
};

/**
 * Section multiplier on ornament probability.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,
  build:     0.8,
  peak:      1.2,   // ornaments at climactic cadences
  breakdown: 1.0,
  groove:    0.9,
};

/**
 * Should a cadential ornament be applied?
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @param isPhraseEnd Whether this is near a phrase ending
 * @returns Whether to ornament
 */
export function shouldOrnamentCadence(
  tick: number,
  mood: Mood,
  section: Section,
  isPhraseEnd: boolean
): boolean {
  if (!isPhraseEnd) return false;
  const prob = ORNAMENT_PROB[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 7823) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Select which ornament type to use.
 *
 * @param tick Current tick
 * @param mood Current mood
 * @returns Ornament type
 */
export function selectOrnament(tick: number, mood: Mood): OrnamentType {
  const prefs = ORNAMENT_PREFERENCE[mood];
  const hash = ((tick * 1597334677 + 5381) >>> 0) / 4294967296;
  let cumulative = 0;
  for (const [type, weight] of Object.entries(prefs)) {
    cumulative += weight;
    if (hash < cumulative) return type as OrnamentType;
  }
  return 'turn';
}

/**
 * Get ornament probability for a mood (for testing).
 */
export function ornamentProbability(mood: Mood): number {
  return ORNAMENT_PROB[mood];
}
