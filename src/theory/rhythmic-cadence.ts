/**
 * Rhythmic cadence — rhythmic patterns that signal phrase endings.
 *
 * Just as harmonic cadences (V→I) and melodic cadences (step to tonic)
 * create closure, rhythmic patterns can signal phrase endings too:
 *
 * - **Agogic accent**: a longer note at the phrase end (long-short-LONG)
 * - **Deceleration**: progressively longer durations approaching the end
 * - **Terminal rest**: silence after the final note creates boundary
 * - **Rhythmic rhyme**: ending matches the rhythmic pattern of the start
 *
 * Without rhythmic cadence, generative melodies sound like they just
 * stop rather than conclude. This module shapes the tail of phrases
 * to create proper rhythmic closure.
 *
 * Application: melody and arp layers apply rhythmic cadence patterns
 * to the last few notes of each phrase, creating a sense of
 * intentional ending rather than arbitrary cutoff.
 */

import type { Mood, Section } from '../types';

export type CadenceType = 'agogic' | 'deceleration' | 'terminal' | 'rhyme';

/** How much each mood uses rhythmic cadence (0-1) */
const CADENCE_TENDENCY: Record<Mood, number> = {
  avril:     0.55,  // songwriter — clear phrasing
  lofi:      0.45,  // jazz — phrase endings matter
  flim:      0.40,  // organic endings
  xtal:      0.35,  // gentle closures
  downtempo: 0.30,  // clear endings
  ambient:   0.25,  // some boundary marking,
  plantasia: 0.25,
  blockhead: 0.20,  // hip-hop — less melodic cadence
  disco:     0.15,  // loops — less phrase-oriented
  syro:      0.12,  // IDM — subverts expectations
  trance:    0.10,  // continuous energy
};

/**
 * Whether to apply rhythmic cadence at this moment.
 */
export function shouldApplyRhythmicCadence(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  // More cadence in intros and breakdowns (phrasing is exposed)
  const sectionMult = section === 'breakdown' ? 1.5
    : section === 'intro' ? 1.3
    : section === 'groove' ? 1.0
    : section === 'build' ? 0.7
    : 0.5;
  const tendency = CADENCE_TENDENCY[mood] * sectionMult;
  const hash = ((tick * 2654435761 + 24571) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Select cadence type based on mood character.
 */
export function selectCadenceType(mood: Mood, tick: number): CadenceType {
  const weights: Record<Mood, Record<CadenceType, number>> = {
    avril:     { agogic: 4, deceleration: 3, terminal: 2, rhyme: 3 },
    lofi:      { agogic: 3, deceleration: 2, terminal: 3, rhyme: 2 },
    flim:      { agogic: 2, deceleration: 3, terminal: 2, rhyme: 1 },
    xtal:      { agogic: 3, deceleration: 3, terminal: 3, rhyme: 1 },
    downtempo: { agogic: 3, deceleration: 2, terminal: 2, rhyme: 1 },
    ambient:   { agogic: 2, deceleration: 3, terminal: 3, rhyme: 1 },
    plantasia: { agogic: 2, deceleration: 3, terminal: 3, rhyme: 1 },
    blockhead: { agogic: 2, deceleration: 1, terminal: 3, rhyme: 2 },
    disco:     { agogic: 2, deceleration: 1, terminal: 2, rhyme: 3 },
    syro:      { agogic: 1, deceleration: 2, terminal: 2, rhyme: 1 },
    trance:    { agogic: 2, deceleration: 1, terminal: 2, rhyme: 1 },
  };

  const w = weights[mood];
  const types: CadenceType[] = ['agogic', 'deceleration', 'terminal', 'rhyme'];
  const total = types.reduce((s, t) => s + w[t], 0);
  const hash = ((tick * 65537 + 9001) >>> 0) % total;
  let cum = 0;
  for (const t of types) {
    cum += w[t];
    if (hash < cum) return t;
  }
  return 'agogic';
}

/**
 * Apply agogic accent: replace the last note's following rest(s)
 * with the note itself, creating a longer final note.
 *
 * Before: [C4, D4, E4, ~, ~, ~]
 * After:  [C4, D4, E4, E4, ~, ~]
 */
export function applyAgogicCadence(steps: string[], depth: number = 1): string[] {
  const result = [...steps];
  // Find last non-rest note
  let lastNoteIdx = -1;
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] !== '~') { lastNoteIdx = i; break; }
  }
  if (lastNoteIdx < 0 || lastNoteIdx >= result.length - 1) return result;

  // Extend the last note into following rests
  const note = result[lastNoteIdx];
  for (let i = 1; i <= depth && (lastNoteIdx + i) < result.length; i++) {
    if (result[lastNoteIdx + i] === '~') {
      result[lastNoteIdx + i] = note;
    } else break;
  }
  return result;
}

/**
 * Apply deceleration: thin out notes approaching the phrase end,
 * creating progressively wider gaps.
 *
 * The last quarter of notes gets sparser spacing.
 */
export function applyDeceleration(steps: string[]): string[] {
  const result = [...steps];
  const noteIndices: number[] = [];
  for (let i = 0; i < result.length; i++) {
    if (result[i] !== '~') noteIndices.push(i);
  }
  if (noteIndices.length < 4) return result;

  // Thin the last third of notes
  const startThinning = Math.floor(noteIndices.length * 0.67);
  for (let i = startThinning; i < noteIndices.length - 1; i++) {
    // Remove every other note in the tail
    if ((i - startThinning) % 2 === 1) {
      result[noteIndices[i]] = '~';
    }
  }
  return result;
}

/**
 * Apply terminal rest: ensure silence after the final note
 * by clearing the last 1-2 positions.
 */
export function applyTerminalRest(steps: string[], restCount: number = 2): string[] {
  const result = [...steps];
  // Clear the last `restCount` positions
  for (let i = Math.max(0, result.length - restCount); i < result.length; i++) {
    result[i] = '~';
  }
  return result;
}

/**
 * Apply rhythmic rhyme: make the ending rhythm mirror the opening.
 * Takes the first N notes' rhythm (note/rest pattern) and applies
 * it to the ending.
 */
export function applyRhythmicRhyme(steps: string[]): string[] {
  if (steps.length < 4) return steps;
  const result = [...steps];
  // Copy rhythm from first 3 steps to last 3
  const rhymeLen = Math.min(3, Math.floor(steps.length / 3));
  const endStart = result.length - rhymeLen;

  // Find available notes at the end to place
  const endNotes: string[] = [];
  for (let i = endStart; i < result.length; i++) {
    if (result[i] !== '~') endNotes.push(result[i]);
  }
  // Clear end section
  for (let i = endStart; i < result.length; i++) result[i] = '~';

  // Mirror start rhythm at end
  let noteIdx = 0;
  for (let i = 0; i < rhymeLen && endStart + i < result.length; i++) {
    if (steps[i] !== '~' && noteIdx < endNotes.length) {
      result[endStart + i] = endNotes[noteIdx++];
    }
  }
  return result;
}

/**
 * Apply the appropriate rhythmic cadence to a phrase.
 */
export function applyRhythmicCadence(
  steps: string[],
  cadenceType: CadenceType
): string[] {
  switch (cadenceType) {
    case 'agogic': return applyAgogicCadence(steps);
    case 'deceleration': return applyDeceleration(steps);
    case 'terminal': return applyTerminalRest(steps);
    case 'rhyme': return applyRhythmicRhyme(steps);
  }
}

/**
 * Get rhythmic cadence tendency for a mood (for testing).
 */
export function rhythmicCadenceTendency(mood: Mood): number {
  return CADENCE_TENDENCY[mood];
}
