/**
 * Harmonic anticipation timing — bass/drone arrive at chords slightly early.
 *
 * In natural music, bass instruments often "lead" harmonic changes,
 * arriving at the new chord a fraction of a beat before other instruments.
 * This creates a sense of harmonic pull and forward motion.
 *
 * Applied as negative timing offset for bass/drone layers.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood anticipation amount (in fraction of a beat, negative = early).
 */
const ANTICIPATION_AMOUNT: Record<Mood, number> = {
  trance:    0.02,  // minimal — tight grid
  avril:     0.06,  // moderate — classical leading
  disco:     0.03,  // small — locked groove
  downtempo: 0.08,  // noticeable — relaxed lead
  blockhead: 0.04,  // small — punchy
  lofi:      0.10,  // strongest — jazz anticipation
  flim:      0.07,  // moderate
  xtal:      0.05,  // moderate
  syro:      0.04,  // small
  ambient:   0.12,  // strongest — flowing anticipation
};

/**
 * Section scaling for anticipation.
 */
const SECTION_SCALE: Record<Section, number> = {
  intro: 0.5,      // less anticipation
  build: 1.2,      // more drive
  peak: 0.8,       // tight
  breakdown: 1.4,  // most anticipation
  groove: 1.0,     // normal
};

/**
 * Calculate anticipation offset for a layer.
 *
 * @param layerName Layer identifier
 * @param mood Current mood
 * @param section Current section
 * @returns Timing offset in seconds (negative = early)
 */
export function anticipationOffset(
  layerName: string,
  mood: Mood,
  section: Section
): number {
  // Only bass-register layers anticipate
  if (layerName !== 'drone' && layerName !== 'harmony') return 0;

  const amount = ANTICIPATION_AMOUNT[mood] * SECTION_SCALE[section];

  // Drone leads slightly more than harmony
  const layerScale = layerName === 'drone' ? 1.0 : 0.6;

  return -(amount * layerScale);
}

/**
 * Get anticipation amount for a mood (for testing).
 */
export function anticipationAmount(mood: Mood): number {
  return ANTICIPATION_AMOUNT[mood];
}
