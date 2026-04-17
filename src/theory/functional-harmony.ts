/**
 * Functional harmony — classify chords by tonal function (T/S/D)
 * and compute harmonic pull toward resolution.
 *
 * In tonal music, chords have three functional roles:
 * - **Tonic (T)**: Home/rest (I, vi, iii)
 * - **Subdominant (S)**: Departure/color (IV, ii, vi sometimes)
 * - **Dominant (D)**: Tension/pull back to tonic (V, vii°)
 *
 * Strong progressions follow: T → S → D → T
 * The "pull" increases as you move through S → D,
 * then releases dramatically on D → T.
 *
 * This module provides:
 * 1. Chord function classification
 * 2. Harmonic pull strength (how much current chord wants resolution)
 * 3. Functional cadence detection (was the progression functional?)
 * 4. Mood-weighted bias toward functional vs. modal movement
 *
 * Used by the generative controller to bias Markov selections
 * toward functionally satisfying progressions.
 */

import type { Mood, ChordQuality } from '../types';

/** Tonal function category */
export type HarmonicFunction = 'tonic' | 'subdominant' | 'dominant';

/**
 * Classify a chord degree by its tonal function.
 * Uses traditional function theory with quality disambiguation.
 *
 * @param degree  Chord degree (0-6, where 0=I, 1=ii, etc.)
 * @param quality Chord quality for disambiguation
 */
export function classifyFunction(
  degree: number,
  quality: ChordQuality
): HarmonicFunction {
  switch (degree) {
    case 0: return 'tonic';      // I — primary tonic
    case 1: return 'subdominant'; // ii — pre-dominant
    case 2: return 'tonic';      // iii — tonic substitute
    case 3: return 'subdominant'; // IV — primary subdominant
    case 4: return 'dominant';    // V — primary dominant
    case 5:
      // vi is ambiguous: tonic substitute OR subdominant (in vi-ii-V-I)
      // When used as a chord tone (min/min7), it's more tonic-adjacent
      // When it's in a dominant-quality context, it leans subdominant
      return quality === 'dom7' ? 'dominant' : 'tonic';
    case 6: return 'dominant';    // vii° — leading-tone dominant
    default: return 'tonic';
  }
}

/**
 * Compute harmonic pull — how strongly the current chord
 * wants to resolve to tonic.
 *
 * Returns 0.0 (no pull, already at rest) to 1.0 (maximum pull,
 * dominant chord with tritone begging for resolution).
 *
 * @param degree  Current chord degree (0-6)
 * @param quality Current chord quality
 */
export function harmonicPull(
  degree: number,
  quality: ChordQuality
): number {
  // V7 → maximum pull (tritone between 3rd and 7th resolves to I)
  if (degree === 4 && (quality === 'dom7' || quality === 'maj7'))
    return 1.0;

  // V (without 7th) → strong pull
  if (degree === 4) return 0.8;

  // vii° → strong pull (leading tone + diminished = urgency)
  if (degree === 6 && quality === 'dim') return 0.85;
  if (degree === 6) return 0.7;

  // Secondary dominants (dom7 on non-V degrees) have moderate pull
  if (quality === 'dom7') return 0.6;

  // ii → moderate pull (pre-dominant, expects V next)
  if (degree === 1) return 0.4;

  // IV → moderate pull (plagal tendency)
  if (degree === 3) return 0.35;

  // vi → mild pull (deceptive resolution target)
  if (degree === 5) return 0.2;

  // iii → minimal pull
  if (degree === 2) return 0.15;

  // I → no pull (already home)
  if (degree === 0) return 0.0;

  return 0.1;
}

/**
 * Score how "functional" a chord transition is.
 * Higher scores for classical function progressions,
 * lower for modal/random movement.
 *
 * Returns 0.0 (non-functional) to 1.0 (perfectly functional).
 *
 * @param prevDegree Previous chord degree
 * @param prevQuality Previous chord quality
 * @param currDegree Current chord degree
 */
export function functionalStrength(
  prevDegree: number,
  prevQuality: ChordQuality,
  currDegree: number
): number {
  const prevFunc = classifyFunction(prevDegree, prevQuality);

  // D → T: the strongest functional motion (resolution)
  if (prevFunc === 'dominant' && currDegree === 0) return 1.0;

  // D → T substitute (V → vi, deceptive but still functional)
  if (prevFunc === 'dominant' && currDegree === 5) return 0.7;

  // S → D: the classic pre-dominant to dominant preparation
  if (prevFunc === 'subdominant' && classifyFunction(currDegree, 'maj') === 'dominant')
    return 0.85;

  // T → S: departure from home — functional and natural
  if (prevFunc === 'tonic' && classifyFunction(currDegree, 'maj') === 'subdominant')
    return 0.6;

  // S → T: plagal cadence (IV → I)
  if (prevFunc === 'subdominant' && currDegree === 0) return 0.5;

  // T → D: skipping S is less common but valid (I → V)
  if (prevFunc === 'tonic' && classifyFunction(currDegree, 'maj') === 'dominant')
    return 0.4;

  // Same function movement (T → T, S → S)
  if (prevFunc === classifyFunction(currDegree, 'maj')) return 0.25;

  // D → S: retrogression — unusual but expressive
  if (prevFunc === 'dominant' && classifyFunction(currDegree, 'maj') === 'subdominant')
    return 0.15;

  return 0.2;
}

/** Per-mood weight for functional vs modal harmony.
 *  1.0 = strongly prefer functional progressions
 *  0.0 = fully modal/free (no functional bias) */
const FUNCTIONAL_WEIGHT: Record<Mood, number> = {
  lofi:      0.50,   // jazz — functional backbone with extensions
  downtempo: 0.45,   // smooth — functional but relaxed
  avril:     0.55,   // intimate — strong V-I pull matters
  flim:      0.35,   // delicate — more modal freedom
  xtal:      0.30,   // dreamy — float between functions
  blockhead: 0.40,   // hip-hop — functional loops
  disco:     0.60,   // funk — strong functional grooves
  trance:    0.65,   // EDM — powerful V-I drops
  syro:      0.25,   // IDM — subvert functional expectations
  ambient:   0.10,   // drone — functions barely matter,
  plantasia: 0.10,
};

/**
 * Get the functional harmony weight for a mood.
 * Used to blend functional bias into chord selection.
 */
export function functionalWeight(mood: Mood): number {
  return FUNCTIONAL_WEIGHT[mood];
}

/**
 * Compute a bias multiplier for a candidate next chord based on
 * functional harmony principles. Multiplier > 1 = functionally favorable,
 * < 1 = functionally weak.
 *
 * @param currentDegree  Current chord degree
 * @param currentQuality Current chord quality
 * @param candidateDegree Candidate next chord degree
 * @param mood           Current mood
 * @returns Multiplier for the candidate's Markov weight (0.5-1.5)
 */
export function functionalBias(
  currentDegree: number,
  currentQuality: ChordQuality,
  candidateDegree: number,
  mood: Mood
): number {
  const weight = FUNCTIONAL_WEIGHT[mood];
  if (weight < 0.05) return 1.0; // no bias for ambient

  const strength = functionalStrength(currentDegree, currentQuality, candidateDegree);

  // Map functional strength to a bias multiplier
  // strength 1.0 → multiplier up to 1.0 + weight*0.5
  // strength 0.0 → multiplier down to 1.0 - weight*0.3
  return 1.0 + weight * (strength - 0.4) * 0.8;
}
