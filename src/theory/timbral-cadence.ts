/**
 * Timbral cadence — FM synthesis parameters resolve at cadence points.
 *
 * Just as harmony resolves from dissonance to consonance (V→I),
 * timbre should resolve from complex to pure at cadence points.
 * At tension peaks, FM index and inharmonic ratios create rich,
 * complex timbres. At resolution points, they settle to purer,
 * simpler tones.
 *
 * This creates a satisfying "exhale" in the sound itself:
 * - High tension: high FM index, non-integer fmh ratios, bright LPF
 * - Resolution: low FM index, integer ratios (1, 2, 3), warm LPF
 *
 * Applied as multipliers to existing FM/filter parameters.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sensitivity to timbral cadence.
 * Higher = more dramatic timbral contrast between tension and resolution.
 */
const TIMBRAL_CADENCE_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // dramatic timbral drops
  avril:     0.45,  // expressive timbre
  disco:     0.40,  // filter sweeps are core
  downtempo: 0.35,  // moderate timbral movement
  blockhead: 0.30,  // some timbral variation
  lofi:      0.25,  // subtle warmth shifts
  flim:      0.20,  // organic timbral flow
  xtal:      0.15,  // dreamy — less timbral structure
  syro:      0.10,  // IDM — timbral chaos is intentional
  ambient:   0.08,  // barely any timbral cadence,
  plantasia: 0.08,
};

/**
 * Calculate FM index multiplier based on tension and resolution state.
 * Higher tension = higher FM index (more harmonics).
 * At resolution points = lower FM index (purer tone).
 *
 * @param tension          Current tension (0-1)
 * @param isResolution     Whether current chord is a resolution (V→I, etc.)
 * @param mood             Current mood
 * @returns FM index multiplier (0.3 - 2.0)
 */
export function fmIndexMultiplier(
  tension: number,
  isResolution: boolean,
  mood: Mood
): number {
  const strength = TIMBRAL_CADENCE_STRENGTH[mood];

  // Base: tension maps linearly to FM index
  const tensionMult = 0.7 + tension * 0.6;

  if (isResolution) {
    // Drop FM index at resolution — purer tone
    return tensionMult * (1.0 - strength * 0.5);
  }

  // Non-resolution: tension drives complexity
  return tensionMult * (1.0 + strength * tension * 0.3);
}

/**
 * Calculate FM harmonic ratio bias.
 * At high tension: allow non-integer ratios (inharmonic).
 * At resolution: prefer integer ratios (harmonic series).
 *
 * @param currentFmh       Current fmh value
 * @param tension          Current tension (0-1)
 * @param isResolution     Whether at resolution point
 * @param mood             Current mood
 * @returns Adjusted fmh value
 */
export function harmonicRatioBias(
  currentFmh: number,
  tension: number,
  isResolution: boolean,
  mood: Mood
): number {
  const strength = TIMBRAL_CADENCE_STRENGTH[mood];

  if (isResolution && strength > 0.1) {
    // Snap toward nearest integer ratio
    const nearest = Math.round(currentFmh);
    const pullStrength = strength * 0.6;
    return currentFmh + (nearest - currentFmh) * pullStrength;
  }

  // At high tension, allow slight detuning from integer ratios
  if (tension > 0.7 && strength > 0.15) {
    const detune = (tension - 0.7) * strength * 0.3;
    // Add slight inharmonicity
    return currentFmh + detune * (currentFmh > 1 ? 0.1 : -0.1);
  }

  return currentFmh;
}

/**
 * Calculate LPF adjustment for timbral cadence.
 * Resolution = warmer (lower LPF), tension = brighter (higher LPF).
 *
 * @param baseLpf      Base LPF frequency
 * @param tension      Current tension (0-1)
 * @param isResolution Whether at resolution
 * @param mood         Current mood
 * @returns Adjusted LPF frequency
 */
export function cadentialLpf(
  baseLpf: number,
  tension: number,
  isResolution: boolean,
  mood: Mood
): number {
  const strength = TIMBRAL_CADENCE_STRENGTH[mood];

  if (isResolution) {
    // Warm down at resolution
    return baseLpf * (1.0 - strength * 0.25);
  }

  // Brighten with tension
  return baseLpf * (1.0 + tension * strength * 0.2);
}

/**
 * Detect if the current chord is likely a resolution.
 * Simple heuristic: degree 1 after degree 5 or 7.
 */
export function isResolutionChord(
  currentDegree: number,
  prevDegree: number | null
): boolean {
  if (prevDegree === null) return false;
  // V→I or vii→I
  return currentDegree === 1 && (prevDegree === 5 || prevDegree === 7);
}

/**
 * Get timbral cadence strength for a mood (for testing).
 */
export function timbralCadenceStrength(mood: Mood): number {
  return TIMBRAL_CADENCE_STRENGTH[mood];
}
