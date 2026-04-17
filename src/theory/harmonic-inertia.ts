/**
 * Harmonic inertia — resistance to chord change based on voicing stability.
 *
 * When a voicing is "settled" (consonant, no tendency tones), the harmony
 * resists change (higher cost). When unresolved suspensions or dissonances
 * are present, harmony "wants" to move (lower cost).
 *
 * This adds friction/anchor behavior to the chord change engine,
 * preventing gratuitous mid-phrase changes and enabling rapid cadential
 * motion at phrase boundaries.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood inertia strength (higher = more resistance to change).
 */
const INERTIA_STRENGTH: Record<Mood, number> = {
  trance:    0.35,  // moderate — regular changes OK
  avril:     0.55,  // strong — classical phrase structure
  disco:     0.30,  // moderate
  downtempo: 0.50,  // strong — lazy
  blockhead: 0.35,  // moderate
  lofi:      0.45,  // strong — jazz hangs on voicings
  flim:      0.40,  // moderate-strong
  xtal:      0.50,  // strong — ambient sustain
  syro:      0.20,  // weak — IDM loves rapid changes
  ambient:   0.60,  // strongest — glacial harmony,
  plantasia: 0.60,
};

/**
 * Section multiplier for inertia.
 * Breakdowns/intros have more inertia (settled), builds have less (movement).
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,
  build:     0.6,
  peak:      0.7,
  breakdown: 1.3,
  groove:    0.9,
};

/**
 * Calculate harmonic inertia — resistance to chord change.
 *
 * @param consonance 0-1 current voicing consonance (higher = more stable)
 * @param ticksOnChord How many ticks spent on current chord
 * @param mood Current mood
 * @param section Current section
 * @returns Inertia value 0-1 (higher = more resistance to change)
 */
export function harmonicInertia(
  consonance: number,
  ticksOnChord: number,
  mood: Mood,
  section: Section
): number {
  const strength = INERTIA_STRENGTH[mood] * SECTION_MULT[section];

  // Base inertia from consonance (stable voicings resist change)
  const stabilityInertia = consonance * 0.6;

  // Time decay: inertia decreases as chord lingers (eventually it must move)
  const timeFactor = Math.max(0, 1.0 - ticksOnChord * 0.15);

  const raw = stabilityInertia * timeFactor * strength;
  return Math.max(0, Math.min(1, raw));
}

/**
 * Calculate change reluctance — multiplier that slows chord change rate.
 * Applied to chord timing: higher reluctance = longer chord duration.
 *
 * @param inertia 0-1 inertia value from harmonicInertia()
 * @param mood Current mood
 * @returns Duration multiplier (1.0 - 1.4, where > 1 = slower changes)
 */
export function changeReluctance(inertia: number, mood: Mood): number {
  const strength = INERTIA_STRENGTH[mood];
  return 1.0 + inertia * strength * 0.7;
}

/**
 * Calculate cadential escape — how easily harmony breaks free at phrase end.
 * Returns a negative inertia modifier that allows rapid cadential motion.
 *
 * @param sectionProgress 0-1 progress through section
 * @param mood Current mood
 * @returns Inertia reduction (0 to -0.5, subtracted from inertia)
 */
export function cadentialEscape(sectionProgress: number, mood: Mood): number {
  // Only near phrase end (last 20%)
  if (sectionProgress < 0.8) return 0;
  const escapeFactor = (sectionProgress - 0.8) / 0.2; // 0→1 over last 20%
  const strength = INERTIA_STRENGTH[mood];
  return -(escapeFactor * strength * 0.5);
}

/**
 * Should harmonic inertia be applied?
 */
export function shouldApplyInertia(mood: Mood, section: Section): boolean {
  return INERTIA_STRENGTH[mood] * SECTION_MULT[section] > 0.15;
}

/**
 * Get inertia strength for a mood (for testing).
 */
export function inertiaStrength(mood: Mood): number {
  return INERTIA_STRENGTH[mood];
}
