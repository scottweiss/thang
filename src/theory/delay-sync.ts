/**
 * Tempo-synced delay times — musical echo intervals.
 *
 * Fixed delay times create echoes that drift against the beat, making
 * the texture messy. Syncing delay to tempo creates rhythmic echoes
 * that reinforce the groove:
 *
 * - 1/4 note delay: strong rhythmic echo (dance moods)
 * - Dotted 1/8 delay: syncopated bounce (lofi, downtempo)
 * - 1/8 note delay: tight double (trance, syro)
 * - 1/3 note (triplet): swinging echo (blockhead, jazz)
 *
 * CPS (cycles per second) = BPM / 240 for 4-beat cycles
 * One beat = 1 / (CPS * 4) seconds
 */

import type { Mood } from '../types';

export type DelayDivision = '1/4' | '3/16' | '1/8' | '1/6' | '1/3';

/**
 * Convert a rhythmic division to seconds at a given CPS.
 *
 * CPS = cycles per second (one cycle = 4 beats)
 * One beat = 1 / (CPS * 4)
 *
 * @param division  Rhythmic division
 * @param cps       Cycles per second
 * @returns Delay time in seconds
 */
export function divisionToSeconds(division: DelayDivision, cps: number): number {
  if (cps <= 0) return 0.5; // fallback
  const oneBeat = 1 / (cps * 4);

  switch (division) {
    case '1/4': return oneBeat;          // quarter note
    case '3/16': return oneBeat * 0.75;  // dotted eighth
    case '1/8': return oneBeat * 0.5;    // eighth note
    case '1/6': return oneBeat / 1.5;    // triplet quarter
    case '1/3': return oneBeat * (2/3);  // triplet eighth
  }
}

/**
 * Preferred delay division per mood.
 * Multiple options for variety — one is chosen at generation time.
 */
const MOOD_DELAY_DIVISIONS: Record<Mood, DelayDivision[]> = {
  ambient:   ['1/4', '3/16'],           // spacious echoes,
  plantasia: ['1/4', '3/16'],
  downtempo: ['3/16', '1/4'],           // dotted-eighth bounce
  lofi:      ['3/16', '1/6'],           // swing/bounce
  trance:    ['1/8', '1/4'],            // tight rhythmic
  avril:     ['1/4', '3/16'],           // gentle echoes
  xtal:      ['1/4', '3/16'],           // atmospheric
  syro:      ['1/8', '1/6'],            // rapid-fire
  blockhead: ['1/6', '3/16'],           // triplet swing
  flim:      ['1/4', '3/16'],           // delicate echoes
  disco:     ['1/8', '1/4'],            // tight funk
};

/**
 * Get a tempo-synced delay time for a mood.
 *
 * @param mood  Current mood
 * @param cps   Current tempo in CPS
 * @returns Delay time in seconds
 */
export function syncedDelayTime(mood: Mood, cps: number): number {
  const divisions = MOOD_DELAY_DIVISIONS[mood] ?? ['1/4'];
  const division = divisions[Math.floor(Math.random() * divisions.length)];
  return divisionToSeconds(division, cps);
}

/**
 * Get the primary delay division for a mood (deterministic, for display/config).
 */
export function primaryDelayDivision(mood: Mood): DelayDivision {
  return (MOOD_DELAY_DIVISIONS[mood] ?? ['1/4'])[0];
}
