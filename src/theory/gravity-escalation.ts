/**
 * Gravity escalation — momentum-responsive tendency tone strength.
 *
 * When harmonic momentum is high (chords changing quickly), the
 * pull of tendency tones should strengthen — creating a visceral
 * "magnetic" pull toward resolutions. Slow harmonic rhythm allows
 * more melodic freedom; fast changes demand resolution.
 *
 * Applied as a multiplier to tendency tone weights.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood escalation sensitivity.
 */
const ESCALATION_STRENGTH: Record<Mood, number> = {
  trance:    0.45,  // strong — drives forward
  avril:     0.55,  // strongest — classical resolution pull
  disco:     0.40,  // moderate
  downtempo: 0.35,  // gentle
  blockhead: 0.40,  // moderate
  lofi:      0.50,  // jazz resolution
  flim:      0.35,  // organic
  xtal:      0.30,  // subtle
  syro:      0.25,  // IDM — free melody OK
  ambient:   0.15,  // minimal — floating
};

/**
 * Section multipliers — builds have strongest escalation.
 */
const SECTION_ESCALATION: Record<Section, number> = {
  intro:     0.5,
  build:     1.2,   // strongest pull during builds
  peak:      0.8,   // intense but can breathe
  breakdown: 0.4,   // relaxed
  groove:    1.0,
};

/**
 * Calculate gravity escalation multiplier.
 * Higher momentum = stronger tendency tone pull.
 *
 * @param harmonicMomentum Current harmonic momentum (chord changes per section, ~1-5)
 * @param mood Current mood
 * @param section Current section
 * @returns Tendency tone weight multiplier (1.0 - 2.0)
 */
export function gravityMultiplier(
  harmonicMomentum: number,
  mood: Mood,
  section: Section
): number {
  const strength = ESCALATION_STRENGTH[mood];
  const sectionMult = SECTION_ESCALATION[section] ?? 1.0;

  // Normalize momentum: 2 = normal, 4+ = fast
  const normalizedMomentum = Math.max(0, (harmonicMomentum - 2) / 3);
  const escalation = normalizedMomentum * strength * sectionMult;

  return Math.min(2.0, 1.0 + escalation);
}

/**
 * Should gravity escalation be applied?
 */
export function shouldEscalate(
  harmonicMomentum: number,
  mood: Mood
): boolean {
  return harmonicMomentum > 2.0 && ESCALATION_STRENGTH[mood] > 0.10;
}

/**
 * Get escalation strength for a mood (for testing).
 */
export function escalationStrength(mood: Mood): number {
  return ESCALATION_STRENGTH[mood];
}
