/**
 * Grand pause (GP) — dramatic coordinated silence across all layers.
 *
 * The grand pause is one of music's most powerful devices: a moment
 * where EVERYTHING stops simultaneously. The sudden absence of sound
 * creates maximum tension and anticipation. When music resumes, the
 * impact is enormous.
 *
 * Famous uses:
 * - Beethoven's 5th Symphony, 1st movement — mid-phrase silence
 * - Haydn's "Surprise" Symphony — silence before the fortissimo chord
 * - EDM build drops — silence before the bass drops
 *
 * Application: at strategic moments (build→peak transitions,
 * phrase boundaries), ALL layers go silent for a brief moment.
 * The section manager coordinates this by setting a GP flag that
 * all layers check. The silence lasts 1-2 ticks (~2-4 seconds)
 * and the resumption is at full intensity for maximum contrast.
 *
 * A fermata is similar but affects only one voice — it holds a
 * single note longer than written. We implement both.
 */

import type { Mood, Section } from '../types';

/** How much each mood uses grand pauses (0-1) */
const GP_TENDENCY: Record<Mood, number> = {
  trance:    0.12,  // EDM drop silence
  syro:      0.10,  // IDM surprise
  blockhead: 0.08,  // dramatic hip-hop
  disco:     0.07,  // disco break
  avril:     0.06,  // songwriter drama
  xtal:      0.05,  // gentle surprise
  flim:      0.04,  // subtle
  downtempo: 0.04,  // subtle
  lofi:      0.03,  // jazz — rare
  ambient:   0.01,  // almost never — continuous texture
};

/** Sections where GP is most impactful */
const SECTION_GP_MULT: Record<Section, number> = {
  intro:     0.0,   // never in intro (nothing to contrast with)
  build:     2.5,   // right before drop = maximum impact
  peak:      0.3,   // too much energy to stop
  breakdown: 1.5,   // dramatic pause before rebuilding
  groove:    0.8,   // occasional surprise
};

/**
 * Whether a grand pause should occur at this tick.
 * GP is rare by design — too many pauses loses the effect.
 *
 * Additional constraint: GP only at the END of a section
 * (last 20% of progress) for musical logic.
 */
export function shouldGrandPause(
  tick: number,
  mood: Mood,
  section: Section,
  sectionProgress: number
): boolean {
  // Only trigger in the last 20% of a section
  if (sectionProgress < 0.8) return false;

  const tendency = GP_TENDENCY[mood] * (SECTION_GP_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 27449) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Duration of grand pause in ticks.
 * Shorter pauses for fast moods, longer for dramatic moods.
 */
export function gpDuration(mood: Mood): number {
  const durations: Record<Mood, number> = {
    trance:    1,    // quick — one tick of silence
    syro:      1,    // quick
    disco:     1,    // quick
    blockhead: 1,    // one dramatic beat
    avril:     2,    // held breath
    xtal:      2,    // suspended moment
    flim:      2,    // gentle pause
    downtempo: 2,    // spacious
    lofi:      1,    // brief
    ambient:   2,    // long breath
  };
  return durations[mood];
}

/**
 * Whether a fermata (single-voice held note) should occur.
 * More common than GP, affects individual layers.
 */
export function shouldFermata(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency: Record<Mood, number> = {
    avril:     0.15,
    xtal:      0.12,
    ambient:   0.10,
    flim:      0.10,
    lofi:      0.08,
    downtempo: 0.06,
    blockhead: 0.04,
    syro:      0.03,
    disco:     0.02,
    trance:    0.02,
  };

  // Fermatas work best at phrase boundaries (breakdowns, intros)
  const sectionMult = section === 'breakdown' ? 1.5
    : section === 'intro' ? 1.2
    : section === 'groove' ? 0.8
    : 0.4;

  const prob = tendency[mood] * sectionMult;
  const hash = ((tick * 2654435761 + 30011) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Apply fermata to a step array: extend a note by replacing
 * following rests with the held note.
 *
 * @param steps     Step array
 * @param holdIdx   Index of the note to hold
 * @param duration  How many extra steps to hold
 * @returns Modified step array
 */
export function applyFermata(
  steps: string[],
  holdIdx: number,
  duration: number = 2
): string[] {
  if (holdIdx < 0 || holdIdx >= steps.length) return steps;
  if (steps[holdIdx] === '~') return steps;

  const result = [...steps];
  const note = result[holdIdx];
  for (let i = 1; i <= duration && (holdIdx + i) < result.length; i++) {
    if (result[holdIdx + i] === '~') {
      result[holdIdx + i] = note;
    } else break; // don't overwrite existing notes
  }
  return result;
}

/**
 * Select the best note to hold for a fermata.
 * Prefers notes on strong beats (positions 0, 4, 8, 12) or
 * the last non-rest note in the phrase.
 */
export function selectFermataNote(steps: string[]): number {
  // Prefer strong-beat notes
  const strongBeats = [0, 4, 8, 12];
  for (const pos of strongBeats) {
    if (pos < steps.length && steps[pos] !== '~') return pos;
  }
  // Fallback: first non-rest
  return steps.findIndex(s => s !== '~');
}

/**
 * Get GP tendency for a mood (for testing).
 */
export function gpTendency(mood: Mood): number {
  return GP_TENDENCY[mood];
}
