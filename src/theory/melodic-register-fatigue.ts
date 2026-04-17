import type { Mood } from '../types';

/**
 * Melodic register fatigue — spending too many ticks in the same
 * pitch register causes listener fatigue. Gain reduces slightly
 * to encourage register movement.
 */

const moodFatigueRate: Record<Mood, number> = {
  ambient: 0.20,
  plantasia: 0.20,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.25,
  avril: 0.45,
  xtal: 0.40,
  syro: 0.55,
  blockhead: 0.30,
  flim: 0.40,
  disco: 0.25,
};

/**
 * Gain multiplier from register fatigue.
 * ticksInRegister: how many ticks the melody has stayed in the same octave
 * Long stays → slight gain reduction to encourage movement.
 */
export function registerFatigueGain(
  ticksInRegister: number,
  mood: Mood,
): number {
  if (ticksInRegister <= 2) return 1.0;
  const rate = moodFatigueRate[mood];
  const fatigue = Math.min((ticksInRegister - 2) * 0.15, 1.0);
  const reduction = fatigue * rate * 0.04;
  return Math.max(0.96, 1.0 - reduction);
}

/** Per-mood fatigue rate for testing */
export function fatigueRate(mood: Mood): number {
  return moodFatigueRate[mood];
}
