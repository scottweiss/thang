/**
 * Tendency tones — scale-degree-aware pitch attraction.
 *
 * Certain scale degrees have inherent directional pull:
 * - Leading tone (7̂) → tonic (1̂): strongest attraction in tonal music
 * - Raised 4̂ (lydian #4) → 5̂: upward pull
 * - 4̂ → 3̂: downward resolution (especially after dominant)
 * - ♭6̂ → 5̂: minor mode gravitational pull
 * - 2̂ → 1̂ or 3̂: passing tendency (weaker, bidirectional)
 *
 * These tendencies create melodic inevitability — the sense that certain
 * notes "want" to go somewhere. Higher tension strengthens tendencies
 * (more pull toward resolution), lower tension relaxes them (freer movement).
 */

import type { Mood } from '../types';

export interface TendencyWeight {
  targetIndex: number;   // index in the ladder this note tends toward
  strength: number;      // 0-1 pull strength
  direction: 1 | -1;    // up or down
}

/**
 * Chromatic interval from scale degree to its tendency target.
 * Mapped as [fromDegreeIndex, toDegreeIndex, direction, baseStrength].
 *
 * These are 0-indexed scale degree positions (in a 7-note scale):
 * 0=root, 1=2nd, 2=3rd, 3=4th, 4=5th, 5=6th, 6=7th
 */
const TENDENCY_MAP: [number, number, 1 | -1, number][] = [
  [6, 0, 1, 0.85],   // 7̂ → 1̂ (leading tone resolution — strongest)
  [3, 2, -1, 0.5],   // 4̂ → 3̂ (subdominant settling)
  [1, 0, -1, 0.3],   // 2̂ → 1̂ (supertonic descent — weak)
  [1, 2, 1, 0.25],   // 2̂ → 3̂ (supertonic ascent — weaker)
  [5, 4, -1, 0.4],   // 6̂ → 5̂ (submediant descent)
];

/**
 * Per-mood tendency strength multiplier.
 * Ambient/dreamy moods have weaker tendencies (freer floating).
 * Driving/harmonic moods have stronger (more directed resolution).
 */
const MOOD_TENDENCY: Partial<Record<Mood, number>> = {
  trance:    1.3,
  disco:     1.2,
  syro:      1.1,
  blockhead: 1.0,
  downtempo: 0.9,
  lofi:      0.8,
  flim:      0.7,
  avril:     0.65,
  xtal:      0.5,
  ambient:   0.4,
};

/**
 * Get the tendency strength multiplier for a mood.
 */
export function moodTendencyStrength(mood: Mood): number {
  return MOOD_TENDENCY[mood] ?? 0.8;
}

/**
 * Compute tendency weights for each position in a pitch ladder.
 *
 * Maps scale degree tendencies onto the actual ladder positions.
 * Notes that have a strong tendency toward a nearby target get
 * a boost on that target and a slight suppression on themselves.
 *
 * @param ladderSize    Number of notes in the pitch ladder
 * @param scaleDegrees  Scale degree (0-6) for each ladder position, or null if chromatic
 * @param tension       Current tension level (0-1); higher = stronger pull
 * @param mood          Current mood
 * @returns Array of weight multipliers (1.0 = neutral) for each ladder position
 */
export function tendencyWeights(
  ladderSize: number,
  scaleDegrees: (number | null)[],
  tension: number,
  mood: Mood
): number[] {
  const weights = new Array(ladderSize).fill(1.0);
  if (ladderSize === 0) return weights;

  const moodMult = moodTendencyStrength(mood);
  // Tension scales tendency: 0.5 tension = baseline, 1.0 = 1.5x, 0.0 = 0.5x
  const tensionMult = 0.5 + tension;

  for (const [fromDeg, toDeg, _dir, baseStrength] of TENDENCY_MAP) {
    const strength = baseStrength * moodMult * tensionMult;
    if (strength < 0.05) continue;

    // Find all ladder positions with this scale degree
    for (let i = 0; i < ladderSize; i++) {
      if (scaleDegrees[i] !== fromDeg) continue;

      // Find the nearest target (toDeg) in the ladder
      let bestTarget = -1;
      let bestDist = Infinity;
      for (let j = 0; j < ladderSize; j++) {
        if (scaleDegrees[j] !== toDeg) continue;
        const dist = Math.abs(j - i);
        if (dist < bestDist && dist > 0) {
          bestDist = dist;
          bestTarget = j;
        }
      }

      if (bestTarget >= 0 && bestDist <= 3) {
        // Boost the target — tendency makes it more attractive
        weights[bestTarget] *= (1.0 + strength * 0.6);
        // Slightly suppress the tendency tone itself — it "wants" to leave
        weights[i] *= (1.0 - strength * 0.2);
      }
    }
  }

  return weights;
}

/**
 * Map a pitch ladder to scale degrees.
 *
 * Given the note names in a ladder and the scale's note names,
 * returns the scale degree (0-6) for each ladder note, or null
 * if the note is chromatic (not in the scale).
 */
export function ladderToScaleDegrees(
  ladderNotes: string[],
  scaleNotes: string[]
): (number | null)[] {
  // Strip octave numbers from ladder notes for matching
  return ladderNotes.map(note => {
    const name = note.replace(/\d+$/, '');
    const idx = scaleNotes.indexOf(name);
    return idx >= 0 ? idx : null;
  });
}
