/**
 * Anacrusis (pickup notes) — melodic phrases that lead into the downbeat.
 *
 * In performed music, phrases rarely start squarely on beat 1. A singer
 * inhales and starts a note or two BEFORE the bar, creating momentum
 * that carries into the downbeat. This is the single biggest difference
 * between music that sounds "programmed" and music that sounds "played."
 *
 * Types of anacrusis:
 * - Single pickup: one note on the last 16th of the previous bar
 * - Double pickup: two notes in the last two 16th positions
 * - Scale approach: stepwise motion leading to the first note of the next phrase
 * - Chord tone approach: leap from a chord tone that resolves to the root
 *
 * The pickup notes should come from the UPCOMING chord/scale, not the
 * current one — they belong to the next musical phrase.
 */

import type { Mood, Section } from '../types';

/**
 * Add anacrusis (pickup notes) to the end of a melody step array.
 * Places 1-2 notes in the last rest positions, approaching the next
 * phrase's tonal center.
 *
 * @param elements      Current step array (notes and rests)
 * @param targetNote    First note of the next phrase or chord root (what we're leading into)
 * @param ladder        Scale notes to choose pickups from
 * @param mood          Current mood (controls probability and style)
 * @param restToken     Rest marker
 * @returns Modified step array with pickup notes at the end
 */
export function addAnacrusis(
  elements: string[],
  targetNote: string,
  ladder: string[],
  mood: Mood,
  restToken: string = '~'
): string[] {
  if (elements.length < 4) return elements;
  if (!shouldAddAnacrusis(mood)) return elements;

  const pickupCount = pickupLength(mood);
  const result = [...elements];

  // Find trailing rests to replace with pickup notes
  let lastNoteIdx = -1;
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] !== restToken) {
      lastNoteIdx = i;
      break;
    }
  }

  // Need at least `pickupCount` rests at the end
  const availableSlots = result.length - 1 - lastNoteIdx;
  if (availableSlots < pickupCount) return elements;

  // Don't place pickups too close to the last note (need a breath gap)
  if (lastNoteIdx >= result.length - pickupCount - 1) return elements;

  // Generate approach notes leading to the target
  const approach = approachNotes(targetNote, ladder, pickupCount);
  if (approach.length === 0) return elements;

  // Place pickup notes in the last positions
  for (let i = 0; i < approach.length; i++) {
    const pos = result.length - approach.length + i;
    result[pos] = approach[i];
  }

  return result;
}

/**
 * Whether anacrusis should be applied for this mood.
 * Probability-gated per mood.
 */
export function shouldAddAnacrusis(mood: Mood): boolean {
  return Math.random() < MOOD_ANACRUSIS_PROB[mood];
}

/**
 * Deterministic probability accessor for testing.
 */
export function anacrusisProb(mood: Mood): number {
  return MOOD_ANACRUSIS_PROB[mood];
}

/**
 * How many pickup notes to use (1 or 2).
 */
export function pickupLength(mood: Mood): number {
  // Energetic moods get double pickups more often
  switch (mood) {
    case 'disco':
    case 'trance':
    case 'syro':
      return Math.random() < 0.5 ? 2 : 1;
    case 'blockhead':
    case 'lofi':
    case 'downtempo':
      return Math.random() < 0.3 ? 2 : 1;
    default:
      return 1;
  }
}

/**
 * Generate approach notes leading to a target note.
 * Uses stepwise motion from the scale, approaching from above or below.
 *
 * @param target     Note to lead into (e.g., "C4")
 * @param ladder     Available scale notes with octaves
 * @param count      How many approach notes (1 or 2)
 * @returns Array of approach notes
 */
export function approachNotes(
  target: string,
  ladder: string[],
  count: number
): string[] {
  const targetPitch = approxPitch(target);
  if (targetPitch < 0) return [];

  // Find closest ladder notes below and above the target
  const below: { note: string; pitch: number }[] = [];
  const above: { note: string; pitch: number }[] = [];

  for (const note of ladder) {
    const p = approxPitch(note);
    if (p < 0) continue;
    const dist = Math.abs(p - targetPitch);
    if (dist === 0) continue; // skip the target itself
    if (dist > 7) continue;   // only nearby notes (within a 5th)

    if (p < targetPitch) below.push({ note, pitch: p });
    else above.push({ note, pitch: p });
  }

  // Sort by distance to target
  below.sort((a, b) => b.pitch - a.pitch); // closest below first
  above.sort((a, b) => a.pitch - b.pitch); // closest above first

  // Approach from below 60% of the time (more natural for melodies)
  const fromBelow = Math.random() < 0.6;
  const source = fromBelow ? below : above;
  const fallback = fromBelow ? above : below;

  const result: string[] = [];
  const pool = source.length > 0 ? source : fallback;
  for (let i = 0; i < count && i < pool.length; i++) {
    result.push(pool[i].note);
  }

  // Reverse if approaching from below (go low→high toward target)
  if (fromBelow) result.reverse();

  return result;
}

function approxPitch(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d+)$/);
  if (!match) return -1;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const letter = base[match[1]] ?? 0;
  const acc = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return (parseInt(match[3]) + 1) * 12 + letter + acc;
}

/** Per-mood probability of anacrusis */
const MOOD_ANACRUSIS_PROB: Record<Mood, number> = {
  disco:     0.55,   // funk thrives on anticipation
  trance:    0.45,   // builds momentum
  syro:      0.40,   // playful pickups
  blockhead: 0.35,   // hip-hop bounce
  lofi:      0.30,   // jazzy lead-ins
  downtempo: 0.25,   // subtle approaches
  flim:      0.30,   // delicate pickups
  xtal:      0.15,   // occasional
  avril:     0.20,   // gentle breath-before-singing
  ambient:   0.05,   // very rare — phrases float,
  plantasia: 0.05,
};
