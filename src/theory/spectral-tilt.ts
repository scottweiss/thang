/**
 * Spectral tilt — global brightness curve across sections.
 *
 * Builds should get progressively brighter (more high-frequency energy),
 * breakdowns should darken. This creates a natural loudness-brightness
 * coupling that makes section changes feel physically different.
 *
 * Applied as LPF/HPF multipliers to all layers.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood tilt sensitivity (how much brightness changes with section).
 */
const TILT_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong tilt — builds are bright
  avril:     0.40,  // moderate classical shape
  disco:     0.50,  // strong — disco builds sparkle
  downtempo: 0.35,  // gentle
  blockhead: 0.45,  // punchy brightness
  lofi:      0.30,  // warm — less tilt
  flim:      0.35,  // organic
  xtal:      0.25,  // subtle — already ambient-bright
  syro:      0.40,  // moderate IDM tilt
  ambient:   0.20,  // minimal — stays dark/warm,
  plantasia: 0.20,
};

/**
 * Section brightness targets (0 = darkest, 1 = brightest).
 */
const SECTION_BRIGHTNESS: Record<Section, number> = {
  intro:     0.3,
  build:     0.7,
  peak:      1.0,
  breakdown: 0.2,
  groove:    0.6,
};

/**
 * Calculate LPF multiplier from spectral tilt.
 * > 1.0 means brighter (raise LPF), < 1.0 means darker (lower LPF).
 *
 * @param sectionProgress 0-1 progress through section
 * @param mood Current mood
 * @param section Current section
 * @returns LPF multiplier (0.7 - 1.3)
 */
export function spectralTiltLpf(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const strength = TILT_STRENGTH[mood];
  const target = SECTION_BRIGHTNESS[section];

  // Interpolate brightness with section progress
  // Builds get brighter as they progress, breakdowns get darker
  const progressBias = section === 'build' || section === 'peak'
    ? sectionProgress * 0.3   // brighten as section progresses
    : -sectionProgress * 0.2; // darken as section progresses

  const tilt = (target + progressBias - 0.5) * strength;
  return Math.max(0.7, Math.min(1.3, 1.0 + tilt));
}

/**
 * Calculate HPF multiplier from spectral tilt.
 * > 1.0 means thinner bass (raise HPF), < 1.0 means fuller bass.
 *
 * @param sectionProgress 0-1 progress through section
 * @param mood Current mood
 * @param section Current section
 * @returns HPF multiplier (0.7 - 1.3)
 */
export function spectralTiltHpf(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const strength = TILT_STRENGTH[mood];
  const target = SECTION_BRIGHTNESS[section];

  // Inverse of LPF: bright sections raise HPF slightly (tighter bass)
  const tilt = (target - 0.5) * strength * 0.5;
  return Math.max(0.7, Math.min(1.3, 1.0 + tilt));
}

/**
 * Should spectral tilt be applied?
 */
export function shouldApplySpectralTilt(mood: Mood): boolean {
  return TILT_STRENGTH[mood] > 0.15;
}

/**
 * Get tilt strength for a mood (for testing).
 */
export function tiltStrength(mood: Mood): number {
  return TILT_STRENGTH[mood];
}
