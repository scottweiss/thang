import type { Mood } from '../types';

/**
 * Tonal stability decay — as harmony settles on stable chords (tonic,
 * subdominant), FM richness gradually decays toward purity. Unstable
 * chords (dominant, diminished) maintain FM brightness.
 */

const moodDecayRate: Record<Mood, number> = {
  ambient: 0.55,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.30,
  avril: 0.50,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.30,
  flim: 0.40,
  disco: 0.25,
};

/** Stability score: 1 = most stable */
function degreeStability(degree: number): number {
  switch (degree) {
    case 1: return 1.0;
    case 4: return 0.7;
    case 6: return 0.5;
    case 3: return 0.4;
    case 2: return 0.3;
    case 5: return 0.2;
    case 7: return 0.1;
    default: return 0.5;
  }
}

/**
 * FM multiplier that decays on stable chords over time.
 * degree: chord scale degree (1-7)
 * ticksSince: ticks since chord change
 */
export function stabilityDecayFm(
  degree: number,
  ticksSince: number,
  mood: Mood,
): number {
  const rate = moodDecayRate[mood];
  const stability = degreeStability(degree);
  const decay = stability * Math.min(ticksSince * 0.12, 1.0) * rate * 0.08;
  return Math.max(0.92, 1.0 - decay);
}

/** Per-mood decay rate for testing */
export function stabilityRate(mood: Mood): number {
  return moodDecayRate[mood];
}
