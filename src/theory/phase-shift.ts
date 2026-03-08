/**
 * Phase shifting — Steve Reich-style gradual pattern offset.
 *
 * In minimalist music, two identical patterns played at slightly
 * different speeds create fascinating emergent rhythms as they
 * drift in and out of alignment. Reich's "Piano Phase" and
 * "Drumming" are canonical examples.
 *
 * Applied to the arp layer: introduces a gradual .late() offset
 * that slowly increases over time, creating evolving interference
 * patterns with the melody. The offset accumulates per tick,
 * eventually wrapping around to return to unison.
 *
 * The phasing cycle creates a natural arc:
 * unison → slight offset → maximum displacement → return to unison
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood tendency for phase shifting.
 * Higher = more likely to enter a phasing passage.
 */
const PHASE_TENDENCY: Record<Mood, number> = {
  xtal:      0.40,  // dreamy phase textures
  syro:      0.35,  // experimental phase patterns
  ambient:   0.30,  // slow phase evolution
  flim:      0.25,  // organic phase drift
  downtempo: 0.15,  // subtle phase movement
  lofi:      0.12,  // occasional phase
  blockhead: 0.08,  // rare but effective
  avril:     0.05,  // minimal phase use
  disco:     0.03,  // barely any — needs steady grid
  trance:    0.02,  // almost never — needs locked rhythm
};

/**
 * Section multipliers for phase shift likelihood.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.5,
  build:     1.2,
  peak:      0.6,   // peak needs tight rhythm
  breakdown: 1.5,   // breakdowns love phasing
  groove:    0.8,
};

/**
 * Should a phase shift passage begin at this tick?
 */
export function shouldApplyPhaseShift(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = PHASE_TENDENCY[mood] * SECTION_MULT[section];
  // Phase passages are rare — only ~5% of qualifying ticks
  const prob = tendency * 0.05;
  const hash = ((tick * 2654435761 + 91007) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Calculate the phase offset (in fractions of a cycle) for a given tick
 * within a phasing passage.
 *
 * @param tick         Current tick
 * @param startTick    When the phase passage began
 * @param cycleLength  How many ticks for a full phase cycle (16-64)
 * @returns Offset 0-1 (fraction of one beat to offset by)
 */
export function phaseOffset(
  tick: number,
  startTick: number,
  cycleLength: number
): number {
  const elapsed = tick - startTick;
  if (elapsed < 0 || cycleLength <= 0) return 0;

  // Sinusoidal phase curve: smooth acceleration and deceleration
  const progress = (elapsed % cycleLength) / cycleLength;
  // Use sine for smooth offset that returns to zero
  return Math.abs(Math.sin(progress * Math.PI));
}

/**
 * Convert phase offset (0-1) to a .late() value in fractions of a cycle.
 * The maximum offset is mood-dependent — more experimental moods
 * allow larger phase displacement.
 *
 * @param offset    Phase offset 0-1
 * @param mood      Current mood
 * @returns Late value (fraction of cycle, typically 0-0.125)
 */
export function phaseToLate(offset: number, mood: Mood): number {
  const maxLate = phaseMaxOffset(mood);
  return offset * maxLate;
}

/**
 * Maximum phase displacement per mood (fraction of a beat).
 * Larger = more dramatic phase effect.
 */
export function phaseMaxOffset(mood: Mood): number {
  switch (mood) {
    case 'syro':      return 0.125;  // up to 1/8 beat offset
    case 'xtal':      return 0.100;
    case 'ambient':   return 0.080;
    case 'flim':      return 0.070;
    case 'downtempo': return 0.050;
    case 'lofi':      return 0.040;
    case 'blockhead': return 0.030;
    case 'avril':     return 0.020;
    case 'disco':     return 0.015;
    case 'trance':    return 0.010;
    default:          return 0.050;
  }
}

/**
 * How many ticks a full phase cycle takes (unison → displaced → unison).
 * Longer cycles = slower, more meditative phasing.
 */
export function phaseCycleLength(mood: Mood): number {
  switch (mood) {
    case 'ambient':   return 48;  // very slow phase
    case 'xtal':      return 40;
    case 'flim':      return 32;
    case 'downtempo': return 28;
    case 'syro':      return 24;
    case 'lofi':      return 24;
    case 'blockhead': return 20;
    case 'avril':     return 16;
    case 'disco':     return 16;
    case 'trance':    return 16;
    default:          return 24;
  }
}

/**
 * Get phase tendency for a mood (for testing).
 */
export function phaseTendency(mood: Mood): number {
  return PHASE_TENDENCY[mood];
}
