import type { Mood, Section } from '../types';

/**
 * Chord voicing register — brightness/gain adjusts based on where
 * the voicing sits in pitch space. Low voicings get warmth (less FM),
 * high voicings get clarity (more FM). Models how acoustic instruments
 * project differently across registers.
 */

const moodSensitivity: Record<Mood, number> = {
  ambient: 0.50,
  downtempo: 0.40,
  lofi: 0.55,
  trance: 0.30,
  avril: 0.60,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.35,
  flim: 0.45,
  disco: 0.25,
};

/**
 * FM multiplier based on average voicing pitch.
 * avgMidi: average MIDI note of the voicing (e.g., 55-75 range)
 * Center reference: 64 (E4). Above → brighter FM, below → darker.
 */
export function voicingRegisterFm(
  avgMidi: number,
  mood: Mood,
): number {
  const sensitivity = moodSensitivity[mood];
  const center = 64;
  const deviation = (avgMidi - center) / 12; // in octaves
  // Higher register → slight FM boost, lower → reduction
  const adjustment = deviation * sensitivity * 0.08;
  return Math.max(0.90, Math.min(1.10, 1.0 + adjustment));
}

/** Per-mood sensitivity for testing */
export function registerSensitivity(mood: Mood): number {
  return moodSensitivity[mood];
}
