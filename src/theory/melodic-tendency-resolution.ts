/**
 * Melodic tendency resolution — scale degrees have natural resolution targets.
 *
 * In tonal music, certain scale degrees "want" to resolve:
 *   7 → 1 (leading tone to tonic, strongest pull)
 *   4 → 3 (fa to mi)
 *   6 → 5 (la to sol, in minor especially)
 *   2 → 1 (re to do, weaker)
 *
 * Melodies that follow these tendencies at phrase endings sound
 * more resolved and satisfying. This module scores how well a
 * melodic interval follows tendency expectations, providing a
 * gain emphasis for tendency-following motion.
 */

import type { Mood } from '../types';

/**
 * Per-mood tendency strength (higher = more tonal resolution pull).
 */
const TENDENCY_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong — tonal clarity
  avril:     0.65,  // strongest — classical resolution
  disco:     0.40,  // moderate — functional
  downtempo: 0.45,  // moderate
  blockhead: 0.30,  // low — hip-hop is less tonal
  lofi:      0.50,  // moderate — jazz-inflected
  flim:      0.35,  // low-moderate — IDM ambiguity
  xtal:      0.30,  // low — atmospheric
  syro:      0.20,  // lowest — atonal tendency
  ambient:   0.25,  // low — floating,
  plantasia: 0.25,
};

/**
 * Tendency resolution targets: scale degree → target degree.
 * Strength indicates how strong the pull is (0-1).
 */
const TENDENCIES: Array<{ from: number; to: number; strength: number }> = [
  { from: 6, to: 0, strength: 1.0 },   // 7→1 (leading tone, 0-indexed: 6→0)
  { from: 3, to: 2, strength: 0.6 },   // 4→3 (fa→mi, 0-indexed: 3→2)
  { from: 5, to: 4, strength: 0.5 },   // 6→5 (la→sol, 0-indexed: 5→4)
  { from: 1, to: 0, strength: 0.4 },   // 2→1 (re→do, 0-indexed: 1→0)
];

/**
 * Score how well a scale-degree transition follows tendency rules.
 *
 * @param fromDegree Starting scale degree (0-6)
 * @param toDegree Target scale degree (0-6)
 * @param mood Current mood
 * @returns Gain multiplier (0.95 - 1.08)
 */
export function tendencyResolutionGain(
  fromDegree: number,
  toDegree: number,
  mood: Mood
): number {
  const strength = TENDENCY_STRENGTH[mood];
  const from = ((fromDegree % 7) + 7) % 7;
  const to = ((toDegree % 7) + 7) % 7;

  for (const t of TENDENCIES) {
    if (t.from === from && t.to === to) {
      // Following tendency — boost
      return 1.0 + t.strength * strength * 0.12;
    }
    if (t.from === from && t.to !== to) {
      // Active tendency tone but NOT resolving — slight reduction
      return 1.0 - t.strength * strength * 0.04;
    }
  }

  // Non-tendency degree — neutral
  return 1.0;
}

/**
 * Get tendency strength for a mood (for testing).
 */
export function tendencyStrength(mood: Mood): number {
  return TENDENCY_STRENGTH[mood];
}
