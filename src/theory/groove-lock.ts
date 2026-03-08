/**
 * Groove lock — periodic rhythmic alignment between layers.
 *
 * In great arrangements, instruments alternate between independence
 * (interlocking) and unity (locking together). When drums, bass, and
 * melody all hit the same beat simultaneously, it creates a visceral
 * "lock" that makes the groove feel tight and intentional.
 *
 * This module identifies positions where the melody has notes and
 * aligns the arp's notes to match on strong beats. The alignment
 * probability increases during groove and peak sections, creating
 * periodic moments of rhythmic convergence.
 *
 * Between lock moments, layers remain independent (via existing
 * rhythmic-counterpoint and call-response), so the texture breathes.
 */

import type { Mood, Section } from '../types';

/**
 * Align arp step positions with melody step positions on strong beats.
 *
 * Where the melody has a note on a strong beat (0, 4, 8, 12 in 16-step),
 * ensure the arp also has a note there (if it doesn't already).
 * Where the melody has a rest on a strong beat, clear the arp there
 * to create synchronized space.
 *
 * @param arpSteps      Arp step array
 * @param melodySteps   Melody step array (from state.layerStepPattern)
 * @param mood          Current mood
 * @param section       Current section
 * @param restToken     Rest marker
 * @returns Modified arp step array with aligned strong beats
 */
export function applyGrooveLock(
  arpSteps: string[],
  melodySteps: string[],
  mood: Mood,
  section: Section,
  restToken: string = '~'
): string[] {
  if (!shouldApplyGrooveLock(mood, section)) return arpSteps;
  if (melodySteps.length === 0) return arpSteps;

  const result = [...arpSteps];
  const lockStrength = grooveLockStrength(mood, section);

  for (let i = 0; i < result.length; i++) {
    // Only lock on strong beats (every 4th position in 16-step grid)
    if (i % 4 !== 0) continue;

    const melIdx = i % melodySteps.length;
    const melodyHasNote = melodySteps[melIdx] !== restToken;

    if (melodyHasNote && result[i] === restToken) {
      // Melody has a note but arp is resting — fill with a note
      // Borrow from the nearest arp note
      if (Math.random() < lockStrength) {
        const nearest = findNearestNote(result, i, restToken);
        if (nearest !== null) {
          result[i] = nearest;
        }
      }
    } else if (!melodyHasNote && result[i] !== restToken) {
      // Melody is resting but arp is playing — clear for synchronized space
      if (Math.random() < lockStrength * 0.5) {
        result[i] = restToken;
      }
    }
  }

  // Ensure at least one note survives
  if (result.every(s => s === restToken)) {
    const firstNote = arpSteps.findIndex(s => s !== restToken);
    if (firstNote >= 0) result[firstNote] = arpSteps[firstNote];
  }

  return result;
}

/**
 * Whether groove lock should be applied.
 */
export function shouldApplyGrooveLock(mood: Mood, section: Section): boolean {
  return Math.random() < grooveLockProbability(mood, section);
}

/**
 * Probability of groove lock being active this cycle.
 */
export function grooveLockProbability(mood: Mood, section: Section): number {
  const base = MOOD_LOCK_PROB[mood];
  const mult = SECTION_LOCK_MULT[section];
  return Math.min(0.6, base * mult);
}

/**
 * How strongly groove lock affects note placement (0-1).
 */
export function grooveLockStrength(mood: Mood, section: Section): number {
  const base = MOOD_LOCK_STRENGTH[mood];
  const mult = section === 'groove' ? 1.2 : section === 'peak' ? 1.0 : 0.7;
  return Math.min(0.8, base * mult);
}

/**
 * Find the nearest non-rest note in the step array.
 */
function findNearestNote(
  steps: string[],
  fromIdx: number,
  restToken: string
): string | null {
  // Search outward from the position
  for (let d = 1; d < steps.length; d++) {
    const before = fromIdx - d;
    const after = fromIdx + d;
    if (before >= 0 && steps[before] !== restToken) return steps[before];
    if (after < steps.length && steps[after] !== restToken) return steps[after];
  }
  return null;
}

/** Per-mood probability of groove lock per cycle */
const MOOD_LOCK_PROB: Record<Mood, number> = {
  disco:     0.50,   // tight funk lock
  blockhead: 0.45,   // boom-bap unity
  trance:    0.40,   // driving lock
  lofi:      0.35,   // lazy lock
  syro:      0.25,   // occasional convergence
  downtempo: 0.30,   // gentle lock
  flim:      0.20,   // delicate moments
  xtal:      0.15,   // rare alignment
  avril:     0.20,   // intimate unity
  ambient:   0.05,   // almost never — layers float
};

/** Section multiplier for groove lock probability */
const SECTION_LOCK_MULT: Record<Section, number> = {
  groove:    1.5,    // strongest lock in groove
  peak:      1.2,    // tight during peaks
  build:     0.8,    // building toward lock
  breakdown: 0.4,    // loose during breakdown
  intro:     0.3,    // establishing — no lock
};

/** Per-mood strength of groove lock alignment */
const MOOD_LOCK_STRENGTH: Record<Mood, number> = {
  disco:     0.65,   // very tight
  blockhead: 0.55,   // tight
  trance:    0.50,   // solid
  lofi:      0.40,   // medium
  downtempo: 0.35,   // gentle
  syro:      0.30,   // subtle
  flim:      0.25,   // delicate
  xtal:      0.20,   // faint
  avril:     0.25,   // intimate
  ambient:   0.10,   // barely there
};
