/**
 * Rhythmic feel transformation — convert straight patterns to grooves.
 *
 * Beyond micro-timing (nudge), feel transformations change WHERE notes
 * are placed in the grid:
 *
 * - Straight: even subdivisions (1-e-&-a, 1-e-&-a)
 * - Shuffle: remove "e" and "a" subdivisions, creating a bouncy feel
 * - Half-time: only emphasize beats 1 and 3, creating spaciousness
 * - Double-time: add notes between existing ones for urgency
 *
 * These are applied to the step array before it becomes Strudel code,
 * creating authentic rhythmic feels rather than quantized-with-nudge.
 */

import type { Mood, Section } from '../types';

export type Feel = 'straight' | 'shuffle' | 'halftime' | 'doubletime';

/**
 * Apply shuffle feel: thin out "e" and "a" subdivisions (indices 1,3 in each beat).
 * In a 16-step pattern, beats are at 0,4,8,12 and "&"s at 2,6,10,14.
 * "e"s at 1,5,9,13 and "a"s at 3,7,11,15 are candidates for removal.
 *
 * @param steps      Step array
 * @param intensity  0-1: how aggressively to remove subdivisions
 * @param restToken  Rest marker
 * @returns Modified step array
 */
export function applyShuffle(
  steps: string[],
  intensity: number,
  restToken: string = '~'
): string[] {
  if (steps.length < 4) return [...steps];

  const result = [...steps];
  const beatSize = steps.length >= 16 ? 4 : 2;

  for (let i = 0; i < result.length; i++) {
    if (result[i] === restToken) continue;

    const posInBeat = i % beatSize;
    // "e" positions (1) and "a" positions (3) in 16th note grid
    if (beatSize === 4 && (posInBeat === 1 || posInBeat === 3)) {
      if (Math.random() < intensity) {
        result[i] = restToken;
      }
    }
    // In 8th note grid, odd positions are weak
    if (beatSize === 2 && posInBeat === 1) {
      if (Math.random() < intensity * 0.5) {
        result[i] = restToken;
      }
    }
  }

  return result;
}

/**
 * Apply half-time feel: thin beats 2 and 4 (backbeats), emphasize 1 and 3.
 * Creates a spacious, "head-nodding" feel.
 */
export function applyHalftime(
  steps: string[],
  intensity: number,
  restToken: string = '~'
): string[] {
  if (steps.length < 8) return [...steps];

  const result = [...steps];
  const beatSize = steps.length >= 16 ? 4 : 2;

  for (let i = 0; i < result.length; i++) {
    if (result[i] === restToken) continue;

    const beat = Math.floor(i / beatSize);
    // Thin out beats 1 and 3 (0-indexed) — the "backbeats" in half-time
    if (beat % 2 === 1) {
      if (Math.random() < intensity * 0.6) {
        result[i] = restToken;
      }
    }
  }

  return result;
}

/**
 * Get the rhythmic feel for a mood + section combination.
 */
export function moodFeel(mood: Mood, section: Section): Feel {
  // Some moods have characteristic feels
  const base = MOOD_FEEL[mood];

  // Section can override: breakdowns go halftime, builds go straight
  if (section === 'breakdown' && base !== 'shuffle') return 'halftime';
  if (section === 'build' && base === 'halftime') return 'straight';

  return base;
}

/**
 * Get the intensity of feel transformation.
 * Higher = more aggressive transformation.
 */
export function feelIntensity(mood: Mood, section: Section): number {
  const base = MOOD_FEEL_INTENSITY[mood];
  const sectionMult = SECTION_FEEL_MULT[section];
  return Math.min(0.8, base * sectionMult);
}

/**
 * Should rhythmic feel transformation be applied?
 */
export function shouldApplyFeel(mood: Mood): boolean {
  return MOOD_FEEL[mood] !== 'straight' || MOOD_FEEL_INTENSITY[mood] > 0.1;
}

const MOOD_FEEL: Record<Mood, Feel> = {
  lofi:      'shuffle',    // classic shuffle feel
  blockhead: 'shuffle',    // hip-hop bounce
  downtempo: 'halftime',   // spacious
  flim:      'straight',   // precise IDM
  avril:     'straight',   // clean, intimate
  xtal:      'halftime',   // dreamy half-time
  syro:      'straight',   // precise, complex
  trance:    'straight',   // driving, on-grid
  disco:     'straight',   // funky but straight 16ths
  ambient:   'halftime',   // very spacious
};

const MOOD_FEEL_INTENSITY: Record<Mood, number> = {
  lofi:      0.5,    // moderate shuffle
  blockhead: 0.6,    // heavy shuffle
  downtempo: 0.4,    // moderate halftime
  flim:      0.1,    // minimal
  avril:     0.1,    // minimal
  xtal:      0.3,    // light halftime
  syro:      0.1,    // minimal
  trance:    0.0,    // none
  disco:     0.1,    // minimal
  ambient:   0.5,    // strong halftime
};

const SECTION_FEEL_MULT: Record<Section, number> = {
  intro:     0.7,    // moderate
  build:     0.5,    // less — straightening for momentum
  peak:      0.4,    // least — full energy
  breakdown: 1.3,    // most — spacious
  groove:    1.0,    // full feel
};
