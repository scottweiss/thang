/**
 * Formant tracking — vowel-like filter resonances shift with melody.
 *
 * Vocal formants give sound a singing quality. This module maps
 * melodic register to formant-like LPF frequencies, creating
 * vowel-like resonance that shifts as melody moves up and down.
 *
 * Applied as LPF target frequency based on pitch register.
 */

import type { Mood } from '../types';

/**
 * Per-mood formant tracking strength (higher = more vowel-like).
 */
const FORMANT_STRENGTH: Record<Mood, number> = {
  trance:    0.20,  // weak — clean synths
  avril:     0.45,  // strong — vocal quality
  disco:     0.15,  // weak — bright and open
  downtempo: 0.35,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // strong — warm vocal quality
  flim:      0.40,  // moderate — delicate formants
  xtal:      0.45,  // strong — crystalline vowels
  syro:      0.25,  // weak — sharp electronic
  ambient:   0.55,  // strongest — singing pads,
  plantasia: 0.55,
};

/**
 * Formant frequency targets (simplified vowel model).
 * Maps pitch class register to formant-like LPF target.
 */
const FORMANT_TARGETS = [
  800,   // low register — "oh"
  1000,  // low-mid — "ah"
  1200,  // mid — "eh"
  1500,  // mid-high — "ee"
  1800,  // high — "ih"
];

/**
 * Calculate formant-inspired LPF target frequency.
 *
 * @param midiNote Approximate MIDI note number (36-96 range)
 * @param mood Current mood
 * @returns LPF frequency in Hz (500-2500)
 */
export function formantLpf(midiNote: number, mood: Mood): number {
  const strength = FORMANT_STRENGTH[mood];
  // Normalize MIDI range to 0-1
  const normalized = Math.max(0, Math.min(1, (midiNote - 36) / 60));
  // Map to formant index
  const idx = normalized * (FORMANT_TARGETS.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, FORMANT_TARGETS.length - 1);
  const frac = idx - lo;
  // Interpolate between formant targets
  const target = FORMANT_TARGETS[lo] * (1 - frac) + FORMANT_TARGETS[hi] * frac;
  // Blend between neutral (1500Hz) and formant target
  const neutral = 1500;
  return neutral * (1 - strength) + target * strength;
}

/**
 * Calculate LPF multiplier relative to a base frequency.
 *
 * @param midiNote Approximate MIDI note
 * @param baseLpf Current LPF value
 * @param mood Current mood
 * @returns LPF multiplier (0.6 - 1.5)
 */
export function formantLpfMultiplier(
  midiNote: number,
  baseLpf: number,
  mood: Mood
): number {
  const target = formantLpf(midiNote, mood);
  const ratio = target / Math.max(100, baseLpf);
  return Math.max(0.6, Math.min(1.5, ratio));
}

/**
 * Get formant strength for a mood (for testing).
 */
export function formantStrength(mood: Mood): number {
  return FORMANT_STRENGTH[mood];
}
