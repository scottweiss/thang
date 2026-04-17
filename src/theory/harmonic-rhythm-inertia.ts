import type { Mood, ChordQuality } from '../types';

/**
 * Harmonic rhythm inertia — stable/consonant chords resist being changed,
 * while tense chords encourage faster resolution. Modeled as a gain
 * emphasis that rewards lingering on consonant harmony.
 */

const moodInertia: Record<Mood, number> = {
  ambient: 0.60,
  plantasia: 0.60,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.25,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.15,
  blockhead: 0.30,
  flim: 0.40,
  disco: 0.20,
};

/** Consonance rating per quality: 1 = most consonant */
const qualityConsonance: Record<ChordQuality, number> = {
  maj: 1.0,
  min: 0.85,
  sus2: 0.7,
  sus4: 0.65,
  add9: 0.75,
  maj7: 0.7,
  min7: 0.65,
  min9: 0.6,
  dom7: 0.5,
  dim: 0.3,
  aug: 0.25,
};

/**
 * Gain multiplier rewarding sustained consonant chords.
 * ticksSince: ticks since last chord change
 * Consonant chords sustained longer get a subtle brightness boost.
 */
export function harmonicInertiaGain(
  quality: ChordQuality,
  ticksSince: number,
  mood: Mood,
): number {
  const inertia = moodInertia[mood];
  const consonance = qualityConsonance[quality] ?? 0.5;
  // Sustained consonant chords build a warm glow
  const sustainBonus = Math.min(ticksSince * 0.1, 1.0);
  const boost = consonance * sustainBonus * inertia * 0.04;
  return Math.min(1.04, 1.0 + boost);
}

/** Per-mood inertia for testing */
export function inertiaStrength(mood: Mood): number {
  return moodInertia[mood];
}
