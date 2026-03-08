/**
 * Tonal magnetism — pitch-space attractors over multi-bar spans.
 *
 * Certain pitch regions act as gravitational attractors, pulling
 * melodies toward them over time. The attractor usually centers on
 * the chord root but drifts toward the 3rd or 5th during peaks,
 * creating long-range melodic coherence.
 *
 * Applied as a pitch bias in melody note selection.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood magnetic strength (higher = stronger pull toward attractor).
 */
const MAGNETIC_STRENGTH: Record<Mood, number> = {
  trance:    0.80,  // hypnotic tonic lock
  avril:     0.50,  // classical wandering
  disco:     0.68,  // groove center
  downtempo: 0.65,  // modal gravitation
  blockhead: 0.72,  // root-centric
  lofi:      0.55,  // loose jazz
  flim:      0.58,  // organic flow
  xtal:      0.60,  // floating but centered
  syro:      0.35,  // weak — IDM loves dissonance
  ambient:   0.70,  // strong tonic pull
};

/**
 * Section multiplier on magnetic pull.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.0,   // strong pull — establishing key
  build:     0.7,   // looser — exploring
  peak:      0.6,   // loosest — expressive freedom
  breakdown: 0.9,   // returning home
  groove:    0.8,   // moderate
};

/**
 * Calculate magnetic pull toward the attractor pitch.
 * Returns a bias value for note selection.
 *
 * @param candidatePc Candidate pitch class (0-11)
 * @param attractorPc Attractor pitch class (0-11, usually chord root)
 * @param mood Current mood
 * @param section Current section
 * @returns Bias multiplier (0.5 - 2.0, where > 1 = attracted)
 */
export function magneticPull(
  candidatePc: number,
  attractorPc: number,
  mood: Mood,
  section: Section
): number {
  const strength = MAGNETIC_STRENGTH[mood] * SECTION_MULT[section];

  // Pitch-class distance (0-6, wrapping at octave)
  const rawDist = Math.abs(candidatePc - attractorPc);
  const dist = Math.min(rawDist, 12 - rawDist);

  // Closer = stronger attraction (inverse square-ish)
  if (dist === 0) return 1.0 + strength * 1.0;
  const pull = 1.0 + strength * (1.0 / (dist * dist)) * 0.5;
  return Math.max(0.5, Math.min(2.0, pull));
}

/**
 * Determine the current attractor pitch class.
 * Usually chord root, but drifts to 3rd/5th at peaks.
 *
 * @param chordRoot Root pitch class (0-11)
 * @param chordThird Third pitch class (0-11)
 * @param chordFifth Fifth pitch class (0-11)
 * @param section Current section
 * @param sectionProgress 0-1
 * @returns Attractor pitch class (0-11)
 */
export function attractorPitch(
  chordRoot: number,
  chordThird: number,
  chordFifth: number,
  section: Section,
  sectionProgress: number
): number {
  // At peaks with high progress, drift toward the 5th
  if (section === 'peak' && sectionProgress > 0.6) return chordFifth;
  // During builds approaching climax, lean toward the 3rd
  if (section === 'build' && sectionProgress > 0.7) return chordThird;
  // Default: root is the attractor
  return chordRoot;
}

/**
 * Get repeller pitch classes (pitches the system avoids).
 *
 * @param attractorPc Attractor pitch class
 * @returns Array of pitch classes to avoid (tritone away, etc.)
 */
export function repellerPitches(attractorPc: number): number[] {
  // Tritone and minor 2nd away are repellers
  return [(attractorPc + 6) % 12, (attractorPc + 1) % 12, (attractorPc + 11) % 12];
}

/**
 * Should tonal magnetism be applied?
 */
export function shouldApplyMagnetism(mood: Mood, section: Section): boolean {
  return MAGNETIC_STRENGTH[mood] * SECTION_MULT[section] > 0.25;
}

/**
 * Get magnetic strength for a mood (for testing).
 */
export function magneticStrength(mood: Mood): number {
  return MAGNETIC_STRENGTH[mood];
}
