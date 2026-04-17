/**
 * Harmonic density wave — voice count breathes in a wave pattern.
 *
 * Rather than static voice count, the number of active harmony voices
 * should breathe like a slow wave — expanding to rich chords at climaxes
 * and thinning to bare intervals at quiet moments. This creates
 * a sense of harmonic breathing.
 *
 * Applied as gain adjustment based on density wave phase.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood wave amplitude (higher = more density breathing).
 */
const WAVE_AMPLITUDE: Record<Mood, number> = {
  trance:    0.35,  // moderate — steady density
  avril:     0.55,  // high — orchestral breathing
  disco:     0.25,  // low — consistent groove
  downtempo: 0.45,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // high — jazz dynamics
  flim:      0.40,  // moderate
  xtal:      0.55,  // high — crystalline breathing
  syro:      0.20,  // low — consistent density
  ambient:   0.60,  // highest — vast breathing,
  plantasia: 0.60,
};

/**
 * Calculate density wave phase value.
 *
 * @param sectionProgress Progress through section (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Wave value (-1.0 to 1.0, positive = denser)
 */
export function densityWavePhase(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const amplitude = WAVE_AMPLITUDE[mood];
  const progress = Math.max(0, Math.min(1, sectionProgress));

  // Section modifies wave behavior
  let waveFreq = 1.0;
  if (section === 'build') waveFreq = 0.5; // slow build
  else if (section === 'peak') waveFreq = 2.0; // fast breathing
  else if (section === 'breakdown') waveFreq = 0.7; // slow release

  const wave = Math.sin(progress * Math.PI * 2 * waveFreq);
  return wave * amplitude;
}

/**
 * Gain multiplier from density wave.
 *
 * @param sectionProgress Section progress (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.88 - 1.12)
 */
export function densityWaveGain(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const phase = densityWavePhase(sectionProgress, mood, section);
  return Math.max(0.88, Math.min(1.12, 1.0 + phase * 0.2));
}

/**
 * Get wave amplitude for a mood (for testing).
 */
export function waveAmplitude(mood: Mood): number {
  return WAVE_AMPLITUDE[mood];
}
