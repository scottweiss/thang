/**
 * Chord-responsive timbre — harmonic quality colors the sound.
 *
 * Different chord qualities evoke different emotional colors:
 * - Minor chords: darker, warmer (lower LPF, softer attack)
 * - Major chords: bright, clear (higher LPF, crisp)
 * - Dominant 7th: bright and tense (high LPF, slight resonance boost)
 * - Suspended: open, airy (wider LPF, less FM)
 * - Diminished: tense, narrow (mid LPF, more FM)
 * - Augmented: unsettled, bright (high LPF, detuned)
 *
 * Applied as multipliers to existing LPF, FM, and resonance values.
 * The effect is subtle — just enough to give each chord its own
 * character without being distracting.
 */

import type { ChordQuality, Mood } from '../types';

export interface ChordTimbreProfile {
  lpfMult: number;      // LPF frequency multiplier (< 1 = darker)
  fmMult: number;       // FM index multiplier (> 1 = more harmonics)
  resonanceMult: number; // Resonance multiplier
  attackMult: number;    // Attack time multiplier (> 1 = softer onset)
}

/**
 * Get the timbre profile for a chord quality.
 */
export function chordTimbreProfile(quality: ChordQuality): ChordTimbreProfile {
  return QUALITY_TIMBRE[quality] ?? QUALITY_TIMBRE.maj;
}

/**
 * LPF multiplier for a chord quality — how bright/dark it should be.
 */
export function chordLpfMultiplier(quality: ChordQuality, mood: Mood): number {
  const profile = chordTimbreProfile(quality);
  const depth = MOOD_TIMBRE_DEPTH[mood];
  // Blend between neutral (1.0) and the chord's color based on mood depth
  return 1.0 + (profile.lpfMult - 1.0) * depth;
}

/**
 * FM index multiplier for a chord quality.
 */
export function chordFmMultiplier(quality: ChordQuality, mood: Mood): number {
  const profile = chordTimbreProfile(quality);
  const depth = MOOD_TIMBRE_DEPTH[mood];
  return 1.0 + (profile.fmMult - 1.0) * depth;
}

/**
 * Whether chord-responsive timbre should be applied.
 */
export function shouldApplyChordTimbre(mood: Mood): boolean {
  return MOOD_TIMBRE_DEPTH[mood] > 0.05;
}

/** Timbre profile per chord quality */
const QUALITY_TIMBRE: Record<ChordQuality, ChordTimbreProfile> = {
  maj:   { lpfMult: 1.05,  fmMult: 0.95,  resonanceMult: 0.95, attackMult: 0.95 },  // bright, clear
  min:   { lpfMult: 0.88,  fmMult: 0.90,  resonanceMult: 1.00, attackMult: 1.08 },  // dark, warm
  maj7:  { lpfMult: 1.08,  fmMult: 1.00,  resonanceMult: 1.05, attackMult: 0.95 },  // lush, open
  min7:  { lpfMult: 0.90,  fmMult: 0.92,  resonanceMult: 1.00, attackMult: 1.05 },  // mellow, smooth
  dom7:  { lpfMult: 1.12,  fmMult: 1.10,  resonanceMult: 1.10, attackMult: 0.90 },  // bright, urgent
  sus2:  { lpfMult: 1.05,  fmMult: 0.85,  resonanceMult: 0.90, attackMult: 1.10 },  // open, pure
  sus4:  { lpfMult: 1.02,  fmMult: 0.88,  resonanceMult: 0.92, attackMult: 1.08 },  // open, yearning
  dim:   { lpfMult: 0.85,  fmMult: 1.15,  resonanceMult: 1.15, attackMult: 0.85 },  // tense, narrow
  aug:   { lpfMult: 1.10,  fmMult: 1.08,  resonanceMult: 1.08, attackMult: 0.92 },  // unsettled, bright
  add9:  { lpfMult: 1.06,  fmMult: 0.95,  resonanceMult: 1.02, attackMult: 1.00 },  // rich, colorful
  min9:  { lpfMult: 0.92,  fmMult: 0.93,  resonanceMult: 1.00, attackMult: 1.05 },  // jazzy, warm
};

/** How strongly chord timbre affects each mood (0 = ignore, 1 = full) */
const MOOD_TIMBRE_DEPTH: Record<Mood, number> = {
  lofi:      0.6,    // jazz-influenced — chord color matters
  downtempo: 0.5,    // nuanced harmonic palette
  avril:     0.5,    // intimate — subtle changes noticeable
  flim:      0.45,   // delicate color shifts
  blockhead: 0.4,    // hip-hop chord character
  xtal:      0.4,    // dreamy color shifts
  disco:     0.35,   // funky chord brightness
  syro:      0.3,    // IDM — some harmonic coloring
  trance:    0.25,   // less important — driving energy dominates
  ambient:   0.2,    // very subtle — sustained tones need less variation,
  plantasia: 0.2,
};
