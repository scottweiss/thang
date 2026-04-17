/**
 * Motivic fragmentation — progressively breaking motifs into smaller
 * pieces as tension builds, or expanding fragments into full statements.
 *
 * This is Beethoven's primary development technique ("Grundgestalt"):
 * - A 4-note motif becomes a 2-note fragment during builds
 * - The fragment repeats insistently, creating urgency
 * - At the peak, only the most essential interval remains
 * - During breakdowns, fragments gradually reassemble
 *
 * Schoenberg called this "liquidation" — the progressive elimination
 * of characteristic features until only the essential kernel remains.
 *
 * Application: during builds and peaks, truncate recalled motifs to
 * their most characteristic fragment. During intros and breakdowns,
 * expand fragments with surrounding material.
 */

import type { Mood, Section } from '../types';

/** How much each mood uses fragmentation (0-1) */
const FRAGMENTATION_TENDENCY: Record<Mood, number> = {
  syro:      0.45,  // IDM — deconstructed motifs
  blockhead: 0.35,  // hip-hop — chopped samples aesthetic
  flim:      0.30,  // organic deconstruction
  trance:    0.25,  // buildups use fragmentation
  lofi:      0.22,  // jazz — motivic play
  disco:     0.20,  // build energy
  downtempo: 0.15,  // subtle
  avril:     0.12,  // songwriter — occasional
  xtal:      0.10,  // dreamy — gentle fragmentation
  ambient:   0.05,  // nearly whole phrases,
  plantasia: 0.05,
};

/** Section determines fragmentation direction */
const SECTION_FRAGMENT_RATIO: Record<Section, number> = {
  intro:     0.0,   // full motifs — establishing theme
  build:     0.5,   // progressive fragmentation
  peak:      0.8,   // maximum fragmentation
  breakdown: 0.2,   // reassembly begins
  groove:    0.3,   // moderate fragments
};

/**
 * Determine the fragment length given current context.
 * Returns the number of notes to keep from a motif.
 *
 * @param motifLength  Original motif length
 * @param mood         Current mood
 * @param section      Current section
 * @param tension      Current tension (0-1)
 * @returns Number of notes to keep (at least 1)
 */
export function fragmentLength(
  motifLength: number,
  mood: Mood,
  section: Section,
  tension: number
): number {
  if (motifLength <= 1) return motifLength;

  const tendency = FRAGMENTATION_TENDENCY[mood];
  const sectionRatio = SECTION_FRAGMENT_RATIO[section];

  // Combined fragmentation intensity
  const intensity = tendency * sectionRatio * (0.5 + tension * 0.5);

  // Map intensity to fragment size: 0 = full, 1 = just 1 note
  const ratio = 1.0 - intensity;
  const length = Math.max(1, Math.round(motifLength * ratio));

  return Math.min(length, motifLength);
}

/**
 * Extract the most characteristic fragment from a motif.
 * Prefers the opening (head motif) as it's most recognizable.
 *
 * @param motif   Original note array
 * @param length  Target fragment length
 * @returns Fragment note array
 */
export function extractFragment(motif: string[], length: number): string[] {
  if (length >= motif.length) return [...motif];
  // Head motif is most recognizable
  return motif.slice(0, length);
}

/**
 * Create a repeated fragment pattern to fill a given duration.
 * The fragment repeats with slight variation to avoid monotony.
 *
 * @param fragment     Fragment notes
 * @param targetLength Total pattern length to fill
 * @param vary         Whether to occasionally vary the last note (default true)
 * @returns Repeated pattern with optional variation
 */
export function repeatFragment(
  fragment: string[],
  targetLength: number,
  vary: boolean = true
): string[] {
  if (fragment.length === 0) return new Array(targetLength).fill('~');

  const result: string[] = [];
  let repetitions = 0;

  while (result.length < targetLength) {
    for (let i = 0; i < fragment.length && result.length < targetLength; i++) {
      let note = fragment[i];
      // Every 3rd repetition, add a rest before the fragment for breath
      if (vary && repetitions > 0 && repetitions % 3 === 0 && i === 0) {
        result.push('~');
        if (result.length >= targetLength) break;
      }
      result.push(note);
    }
    repetitions++;
  }

  return result.slice(0, targetLength);
}

/**
 * Whether fragmentation should be applied at this moment.
 */
export function shouldFragment(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = FRAGMENTATION_TENDENCY[mood] * SECTION_FRAGMENT_RATIO[section];
  if (tendency < 0.02) return false;
  const hash = ((tick * 2654435761 + 6997) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get fragmentation tendency for a mood (for testing).
 */
export function fragmentationTendency(mood: Mood): number {
  return FRAGMENTATION_TENDENCY[mood];
}
