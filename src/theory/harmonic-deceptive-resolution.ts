import type { Mood, Section } from '../types';

/**
 * Harmonic deceptive resolution color — when a dominant chord
 * resolves to something other than the expected tonic (e.g. V→vi),
 * apply LPF warmth to cushion the unexpected resolution.
 */

const deceptiveDepth: Record<Mood, number> = {
  ambient: 0.45,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.25,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.30,
  blockhead: 0.20,
  flim: 0.45,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.7,
  build: 0.9,
  peak: 1.0,
  breakdown: 1.2,
  groove: 0.8,
};

/**
 * Returns an LPF multiplier that warms deceptive resolutions.
 * V→vi (prevDeg=5, curDeg=6) gets the most warmth.
 * V→IV and V→ii also qualify as deceptive.
 *
 * @param prevDegree - previous chord degree (1-7)
 * @param curDegree - current chord degree (1-7)
 * @param mood - current mood
 * @param section - current section
 * @returns LPF multiplier in [0.92, 1.0] (lower = warmer)
 */
export function deceptiveResolutionLpf(
  prevDegree: number,
  curDegree: number,
  mood: Mood,
  section: Section
): number {
  // Only applies when previous chord was dominant (V)
  if (prevDegree !== 5) return 1.0;
  // Normal resolution to I is not deceptive
  if (curDegree === 1) return 1.0;

  const depth = deceptiveDepth[mood] * sectionMultiplier[section];

  // V→vi is the classic deceptive cadence
  if (curDegree === 6) return 1.0 - 0.08 * depth;
  // V→IV is backdoor/deceptive-ish
  if (curDegree === 4) return 1.0 - 0.06 * depth;
  // V→ii or V→iii are also unexpected
  if (curDegree === 2 || curDegree === 3) return 1.0 - 0.04 * depth;

  return 1.0;
}

export function deceptiveDepthValue(mood: Mood): number {
  return deceptiveDepth[mood];
}
