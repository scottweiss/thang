/**
 * Harmonic journey — macro-level key center modulation planning.
 *
 * Most generative music stays in one key forever, which creates a static
 * harmonic landscape. Real compositions modulate: verse in C major,
 * bridge in A minor (relative), chorus in G (dominant area), etc.
 *
 * This module plans subtle key area migrations across sections:
 * - Intro: establish home key (I)
 * - Build: drift toward dominant area (V) or relative minor (vi)
 * - Peak: arrive at contrasting key area (IV, V, or vi)
 * - Breakdown: pivot back via shared chords (ii = vi of IV, etc.)
 * - Groove: settle back home
 *
 * The "modulation" is gentle — not a full key change, but a bias
 * toward degrees that emphasize a target key area. This creates
 * the feeling of harmonic journey without jarring key shifts.
 *
 * Different moods travel different distances:
 * - Jazz moods (lofi): wide journeys (ii-V regions, tritone subs)
 * - Ambient/xtal: barely move (modal color shifts only)
 * - Trance: dramatic lifts (semitone modulations at peaks)
 */

import type { Mood, Section } from '../types';

/** Key area relative to home key, expressed as scale degree offset */
export type KeyArea = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Target key area per section — where should harmony gravitate? */
const SECTION_KEY_TARGETS: Record<Section, KeyArea[]> = {
  intro:     [0],          // home
  build:     [4, 5],       // dominant(V) or submediant(vi) area
  peak:      [3, 4],       // subdominant(IV) or dominant(V)
  breakdown: [5, 0],       // relative minor(vi) or home
  groove:    [0],          // home
};

/** How far each mood is willing to modulate (0 = never, 1 = max) */
const JOURNEY_APPETITE: Record<Mood, number> = {
  lofi:      0.55,   // jazz loves key area shifts
  downtempo: 0.40,   // smooth modulations
  avril:     0.45,   // singer-songwriter key changes
  flim:      0.35,   // gentle IDM key drift
  disco:     0.50,   // disco modulations are classic
  blockhead: 0.40,   // hip-hop sample-style key shifts
  syro:      0.45,   // IDM chromaticism
  trance:    0.30,   // trance lifts (dramatic but rare)
  xtal:      0.20,   // dreamy, stays close to home
  ambient:   0.10,   // barely modulates
};

/** Pivot degrees — chords that work in both the current and target key area */
const PIVOT_DEGREES: Record<number, number[]> = {
  // Target key area offset → degrees that pivot naturally
  0: [0, 1, 2, 3, 4, 5],   // home — everything works
  1: [4, 1],                // Neapolitan area — V, ii
  2: [1, 4, 5],             // ii area — ii, V, vi
  3: [0, 3, 5],             // IV area — I=V/IV, IV, vi
  4: [4, 1, 6],             // V area — V, ii, vii
  5: [5, 2, 0],             // vi area — vi, iii, I
  6: [6, 2, 4],             // vii area — vii, iii, V
};

/**
 * Get the target key area for the current section and mood.
 * Returns a scale degree offset (0=home, 4=dominant area, etc.)
 *
 * @param section   Current section
 * @param mood      Current mood
 * @param tick      Current tick (for deterministic variation)
 * @returns Target key area as scale degree offset
 */
export function targetKeyArea(section: Section, mood: Mood, tick: number): KeyArea {
  const appetite = JOURNEY_APPETITE[mood];

  // Low appetite moods stay home
  if (appetite < 0.15) return 0;

  const targets = SECTION_KEY_TARGETS[section];
  if (targets.length === 1) return targets[0];

  // Choose between targets based on tick and appetite
  // Higher appetite → more likely to pick the more distant target
  const idx = ((tick * 7 + 13) % 100) / 100 < appetite ? 1 : 0;
  return targets[Math.min(idx, targets.length - 1)];
}

/**
 * Compute a bias multiplier for a candidate chord degree
 * based on how well it serves the target key area.
 *
 * Degrees that are pivot chords (work in both home and target) get boosted.
 * Degrees that clash with the target get slightly penalized.
 *
 * @param candidateDegree  Candidate chord's scale degree (0-6)
 * @param targetArea       Target key area (from targetKeyArea())
 * @param mood             Current mood
 * @returns Multiplier for the candidate's Markov weight (0.7-1.4)
 */
export function journeyBias(
  candidateDegree: number,
  targetArea: KeyArea,
  mood: Mood
): number {
  // No bias when targeting home
  if (targetArea === 0) return 1.0;

  const appetite = JOURNEY_APPETITE[mood];
  const pivots = PIVOT_DEGREES[targetArea] ?? [];

  // Pivot chords get boosted — they bridge current and target areas
  if (pivots.includes(candidateDegree)) {
    return 1.0 + appetite * 0.7;  // up to ~1.4 for high appetite
  }

  // The target degree itself gets a moderate boost
  if (candidateDegree === targetArea) {
    return 1.0 + appetite * 0.5;
  }

  // Non-pivot, non-target degrees get mild penalty
  return 1.0 - appetite * 0.2;
}

/**
 * Whether a section transition should trigger a key area shift.
 * Not every section change modulates — it depends on mood appetite
 * and which sections are transitioning.
 *
 * @param fromSection  Section we're leaving
 * @param toSection    Section we're entering
 * @param mood         Current mood
 * @returns true if modulation bias should be applied
 */
export function shouldModulate(
  fromSection: Section,
  toSection: Section,
  mood: Mood
): boolean {
  const appetite = JOURNEY_APPETITE[mood];
  if (appetite < 0.15) return false;

  // Always modulate on build→peak (the "lift")
  if (fromSection === 'build' && toSection === 'peak') return true;

  // breakdown→groove is the "return home" — always modulate back
  if (fromSection === 'breakdown' && toSection === 'groove') return true;

  // Other transitions: proportional to appetite
  return appetite > 0.30;
}

/**
 * Get the journey appetite for a mood (for testing).
 */
export function journeyAppetite(mood: Mood): number {
  return JOURNEY_APPETITE[mood];
}

/**
 * Get pivot degrees for a target key area (for testing).
 */
export function getPivotDegrees(targetArea: KeyArea): number[] {
  return PIVOT_DEGREES[targetArea] ?? [];
}
