/**
 * Timbral variety — prevent sonic monotony across sections.
 *
 * A common problem in generative music: it starts interesting but
 * becomes fatiguing because the timbre never changes. Live musicians
 * naturally vary their touch, articulation, and tone color as a piece
 * evolves. This module ensures each section sounds distinctly different
 * by modulating FM depth, filter character, and envelope shape.
 *
 * Each section gets a "timbral fingerprint" — a set of multipliers
 * that shift the sound character. Transitions between sections
 * create perceptible sonic evolution even when the notes/chords
 * stay in similar territory.
 */

import type { Mood, Section } from '../types';

/** Timbral fingerprint: multipliers for sound parameters */
export interface TimbralFingerprint {
  fmDepthMult: number;      // FM modulation depth (0.5-1.5)
  fmRatioMult: number;      // FM harmonic ratio shift (0.8-1.2)
  attackMult: number;        // Attack time (0.5-2.0)
  filterBrightness: number;  // LPF multiplier (0.8-1.2)
  reverbCharacter: number;   // Room size multiplier (0.7-1.4)
}

/** Section → timbral fingerprint */
const SECTION_TIMBRES: Record<Section, TimbralFingerprint> = {
  intro: {
    fmDepthMult: 0.7,       // gentle, less FM
    fmRatioMult: 1.0,       // neutral ratios
    attackMult: 1.5,         // softer attacks
    filterBrightness: 0.85,  // darker
    reverbCharacter: 1.3,    // spacious
  },
  build: {
    fmDepthMult: 1.1,       // increasing FM energy
    fmRatioMult: 1.1,       // slightly higher harmonics
    attackMult: 0.8,         // snappier attacks
    filterBrightness: 1.05,  // opening up
    reverbCharacter: 0.9,    // tightening space
  },
  peak: {
    fmDepthMult: 1.4,       // maximum FM richness
    fmRatioMult: 1.15,      // bright, complex
    attackMult: 0.6,         // snappy, percussive
    filterBrightness: 1.15,  // brightest
    reverbCharacter: 0.75,   // tight, close
  },
  breakdown: {
    fmDepthMult: 0.6,       // stripped back
    fmRatioMult: 0.9,       // simpler harmonics
    attackMult: 1.8,         // very soft attacks
    filterBrightness: 0.80,  // darkest
    reverbCharacter: 1.4,    // most spacious
  },
  groove: {
    fmDepthMult: 1.0,       // neutral
    fmRatioMult: 1.0,       // neutral
    attackMult: 1.0,         // neutral
    filterBrightness: 1.0,   // neutral
    reverbCharacter: 1.0,    // neutral
  },
};

/** How strongly each mood responds to timbral variety (0-1) */
const VARIETY_STRENGTH: Record<Mood, number> = {
  syro:      0.60,   // IDM — timbral change is the point
  flim:      0.50,   // organic IDM — texture matters
  blockhead: 0.45,   // hip-hop — sample variety
  lofi:      0.40,   // jazz — subtle color shifts
  downtempo: 0.35,   // moderate variety
  avril:     0.30,   // singer-songwriter — some color
  disco:     0.30,   // funk — some variation
  xtal:      0.25,   // dreamy — subtle shifts
  ambient:   0.20,   // slow evolution,
  plantasia: 0.20,
  trance:    0.15,   // consistent energy preferred
};

/**
 * Get the timbral fingerprint for the current section, scaled by mood.
 * Returns multipliers that should be applied to FM, filter, and envelope.
 *
 * @param section  Current section
 * @param mood     Current mood
 * @returns TimbralFingerprint with mood-scaled values
 */
export function sectionTimbre(
  section: Section,
  mood: Mood
): TimbralFingerprint {
  const base = SECTION_TIMBRES[section];
  const strength = VARIETY_STRENGTH[mood];

  // Blend between neutral (groove) and the section's character
  return {
    fmDepthMult: 1.0 + (base.fmDepthMult - 1.0) * strength,
    fmRatioMult: 1.0 + (base.fmRatioMult - 1.0) * strength,
    attackMult: 1.0 + (base.attackMult - 1.0) * strength,
    filterBrightness: 1.0 + (base.filterBrightness - 1.0) * strength,
    reverbCharacter: 1.0 + (base.reverbCharacter - 1.0) * strength,
  };
}

/**
 * Interpolate between two fingerprints based on section progress.
 * Useful for smooth timbral transitions during section changes.
 *
 * @param from      Starting fingerprint
 * @param to        Target fingerprint
 * @param progress  Interpolation factor (0 = from, 1 = to)
 */
export function interpolateTimbre(
  from: TimbralFingerprint,
  to: TimbralFingerprint,
  progress: number
): TimbralFingerprint {
  const t = Math.max(0, Math.min(1, progress));
  return {
    fmDepthMult: from.fmDepthMult + (to.fmDepthMult - from.fmDepthMult) * t,
    fmRatioMult: from.fmRatioMult + (to.fmRatioMult - from.fmRatioMult) * t,
    attackMult: from.attackMult + (to.attackMult - from.attackMult) * t,
    filterBrightness: from.filterBrightness + (to.filterBrightness - from.filterBrightness) * t,
    reverbCharacter: from.reverbCharacter + (to.reverbCharacter - from.reverbCharacter) * t,
  };
}

/**
 * Whether timbral variety should be applied.
 */
export function shouldApplyTimbralVariety(mood: Mood): boolean {
  return VARIETY_STRENGTH[mood] >= 0.10;
}

/**
 * Get variety strength for a mood (for testing).
 */
export function timbralVarietyStrength(mood: Mood): number {
  return VARIETY_STRENGTH[mood];
}
