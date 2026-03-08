/**
 * Motivic saturation — increasing motif presence as tension builds.
 *
 * In classical development sections, a composer will fragment the
 * main theme and scatter those fragments across more and more voices,
 * building toward a climax where the motif dominates the texture.
 * Beethoven's 5th is the canonical example: the da-da-da-DUM motif
 * gradually saturates every instrument and register.
 *
 * Applied here: as tension or section progress increases, more layers
 * incorporate fragments of the active motif into their note pools.
 * The saturation level determines:
 * - How many notes from the motif appear in each layer
 * - How prominently they're placed (strong beats vs weak beats)
 * - Whether fragments are exact or transposed
 *
 * Low saturation: only melody carries the motif
 * Medium saturation: arp echoes fragments
 * High saturation: harmony, drone, and arp all reference the motif
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood appetite for motivic saturation.
 * Higher = more saturation at peak tension.
 */
const SATURATION_TENDENCY: Record<Mood, number> = {
  trance:    0.55,  // anthemic builds love saturation
  avril:     0.50,  // dramatic — themes should recur
  disco:     0.40,  // hook-driven
  blockhead: 0.35,  // sample-based repetition
  downtempo: 0.30,  // moderate thematic density
  flim:      0.25,  // organic development
  lofi:      0.20,  // subtle references
  xtal:      0.15,  // dreamy — less thematic insistence
  syro:      0.10,  // constantly mutating — resists saturation
  ambient:   0.05,  // almost no thematic insistence
};

/**
 * Section multipliers for saturation level.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.2,   // low — motif is just being introduced
  build:     1.3,   // building toward saturation
  peak:      1.8,   // maximum saturation
  breakdown: 0.5,   // release — let the motif breathe
  groove:    1.0,   // moderate presence
};

/**
 * Calculate the current motivic saturation level (0-1).
 * This combines mood tendency, section, section progress, and tension.
 *
 * @returns 0 = no saturation (motif only in melody)
 *          1 = full saturation (motif fragments everywhere)
 */
export function saturationLevel(
  mood: Mood,
  section: Section,
  sectionProgress: number,
  tension: number
): number {
  const base = SATURATION_TENDENCY[mood] * SECTION_MULT[section];

  // Progressive build: saturation increases through the section
  const progressMult = 0.5 + sectionProgress * 0.5;

  // Tension amplifies saturation
  const tensionMult = 0.6 + tension * 0.8;

  return Math.min(1.0, base * progressMult * tensionMult);
}

/**
 * How many motif notes should be injected into a non-melody layer's note pool.
 *
 * @param level         Saturation level (0-1)
 * @param motifLength   Number of notes in the active motif
 * @returns Number of motif notes to inject (0 to motifLength)
 */
export function motifInjectionCount(level: number, motifLength: number): number {
  if (level < 0.1 || motifLength === 0) return 0;
  // At full saturation, inject up to 60% of the motif
  const maxInject = Math.ceil(motifLength * 0.6);
  return Math.min(maxInject, Math.max(1, Math.round(level * maxInject)));
}

/**
 * Select which motif notes to inject based on saturation level.
 * At low saturation: just the first note (the "head" of the motif).
 * At medium: first and peak notes.
 * At high: spread across the motif.
 *
 * @param motif    The active motif notes
 * @param count    Number of notes to select
 * @param tick     Current tick (for deterministic variation)
 * @returns Selected motif note strings
 */
export function selectMotifFragment(
  motif: string[],
  count: number,
  tick: number
): string[] {
  if (count === 0 || motif.length === 0) return [];

  const validNotes = motif.filter(n => n !== '~' && /^[A-G]/.test(n));
  if (validNotes.length === 0) return [];

  const result: string[] = [];
  const clamped = Math.min(count, validNotes.length);

  if (clamped === 1) {
    // Just the head motif note
    return [validNotes[0]];
  }

  // Spread selection across the motif
  const step = validNotes.length / clamped;
  for (let i = 0; i < clamped; i++) {
    const idx = Math.floor(i * step + ((tick * 7) % step)) % validNotes.length;
    const note = validNotes[idx];
    if (!result.includes(note)) {
      result.push(note);
    }
  }

  // Fill any remaining slots
  for (let i = 0; result.length < clamped && i < validNotes.length; i++) {
    if (!result.includes(validNotes[i])) {
      result.push(validNotes[i]);
    }
  }

  return result;
}

/**
 * Which layers should receive motif injection at a given saturation level.
 * Returns a set of layer names that should incorporate motif fragments.
 */
export function saturatedLayers(level: number): string[] {
  if (level < 0.15) return [];           // too low — melody only
  if (level < 0.35) return ['arp'];      // arp starts echoing
  return ['arp', 'harmony'];             // max — drone/atmosphere use sustained tones, not rhythmic patterns
}

/**
 * Should motif saturation be applied at this tick?
 * Uses deterministic hash to avoid applying every single tick.
 */
export function shouldApplySaturation(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = SATURATION_TENDENCY[mood] * SECTION_MULT[section];
  const prob = tendency * 0.3; // apply ~30% of tendency-weighted ticks
  const hash = ((tick * 2654435761 + 83021) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Get saturation tendency for a mood (for testing).
 */
export function saturationTendency(mood: Mood): number {
  return SATURATION_TENDENCY[mood];
}
