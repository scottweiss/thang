/**
 * Harmonic series voicing — chords built from overtone relationships.
 *
 * Instead of standard tertian (3rds-based) voicings, this builds chords
 * using intervals derived from the harmonic series: octave (2:1),
 * fifth (3:2), fourth (4:3), major third (5:4), minor seventh (7:4).
 *
 * These "just" voicings sound more resonant and bell-like, suitable
 * for ambient pads and crystalline textures.
 *
 * Applied as an FM ratio suggestion for harmony/drone layers.
 */

import type { Mood } from '../types';

/**
 * Per-mood preference for harmonic series voicings (0 = standard, 1 = all overtone).
 */
const SERIES_PREFERENCE: Record<Mood, number> = {
  trance:    0.15,  // slight — pad shimmer
  avril:     0.25,  // moderate — Romantic resonance
  disco:     0.10,  // minimal
  downtempo: 0.30,  // moderate
  blockhead: 0.10,  // minimal
  lofi:      0.20,  // moderate — warm overtones
  flim:      0.35,  // strong — bell-like
  xtal:      0.50,  // strong — crystalline overtones
  syro:      0.25,  // moderate — IDM FM play
  ambient:   0.55,  // strongest — harmonic series pads,
  plantasia: 0.55,
};

/**
 * Harmonic series intervals as FM ratios.
 * Each ratio corresponds to a harmonic overtone.
 */
const HARMONIC_RATIOS = [
  1.0,    // fundamental
  2.0,    // octave (2nd harmonic)
  3.0,    // octave + fifth (3rd harmonic)
  4.0,    // two octaves (4th harmonic)
  5.0,    // two octaves + major third (5th harmonic)
  6.0,    // two octaves + fifth (6th harmonic)
  7.0,    // two octaves + minor seventh (7th harmonic)
];

/**
 * Select an FM ratio from the harmonic series based on mood and tick.
 *
 * @param tick Current tick
 * @param mood Current mood
 * @returns FM ratio from harmonic series (1-7)
 */
export function harmonicSeriesRatio(tick: number, mood: Mood): number {
  const pref = SERIES_PREFERENCE[mood];
  const hash = ((tick * 2654435761 + 13397) >>> 0) / 4294967296;
  if (hash > pref) return 1.0; // default fundamental ratio
  // Select from harmonic series — prefer lower harmonics
  const idx = Math.floor(hash / pref * 5); // 0-4 range
  return HARMONIC_RATIOS[Math.min(idx, HARMONIC_RATIOS.length - 1)];
}

/**
 * Calculate FM depth for harmonic series voicing.
 * Higher harmonics need less depth to be heard.
 *
 * @param ratio The harmonic ratio
 * @param mood Current mood
 * @returns FM depth multiplier (0.3 - 1.0)
 */
export function harmonicSeriesDepth(ratio: number, mood: Mood): number {
  const pref = SERIES_PREFERENCE[mood];
  // Higher ratios = less depth needed
  const depthReduction = Math.log2(Math.max(1, ratio)) * 0.15;
  return Math.max(0.3, 1.0 - depthReduction) * (0.5 + pref * 0.5);
}

/**
 * Get series preference for a mood (for testing).
 */
export function seriesPreference(mood: Mood): number {
  return SERIES_PREFERENCE[mood];
}
