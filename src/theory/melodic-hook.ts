/**
 * Melodic hook repetition discipline.
 *
 * Manages a 4-phase cycle for melodic hooks:
 * - establish: introduce the hook (repeat faithfully)
 * - confirm: repeat again so listeners recognize it
 * - develop: vary the hook (don't repeat exactly)
 * - return: bring back the original for satisfaction
 *
 * This creates the classic pop/electronic pattern of
 * "hear it, know it, miss it, get it back."
 */

import type { Mood } from '../types';

export type HookPhase = 'establish' | 'confirm' | 'develop' | 'return';

const HOOK_LENGTH_BARS: Record<Mood, number> = {
  ambient: 4,
  plantasia: 4,
  downtempo: 4,
  lofi: 4,
  trance: 2,
  avril: 4,
  xtal: 2,
  syro: 2,
  blockhead: 2,
  flim: 4,
  disco: 2,
};

const PHASE_REPS: Record<Mood, number> = {
  ambient: 2,
  plantasia: 2,
  downtempo: 2,
  lofi: 2,
  trance: 4,
  avril: 2,
  xtal: 2,
  syro: 1,
  blockhead: 2,
  flim: 2,
  disco: 4,
};

export class HookManager {
  private storedNotes: string[] | null = null;
  private storedMood: Mood | null = null;

  /**
   * Determine which phase of the hook cycle we're in.
   *
   * Divides the section into a 4-phase repeating cycle.
   * Each phase lasts ceil(totalHookBars / hookLengthBars / 4) repetitions (minimum 1).
   *
   * @param sectionBar     Current bar within the section (0-based)
   * @param totalHookBars  Total bars available for the hook cycle
   * @param hookLengthBars Length of one hook statement in bars
   */
  getPhase(sectionBar: number, totalHookBars: number, hookLengthBars: number): HookPhase {
    const totalReps = totalHookBars / hookLengthBars;
    const repsPerPhase = Math.max(1, Math.ceil(totalReps / 4));
    const hookRepetition = Math.floor(sectionBar / hookLengthBars);
    const cyclePosition = hookRepetition % (repsPerPhase * 4);

    if (cyclePosition < repsPerPhase) return 'establish';
    if (cyclePosition < repsPerPhase * 2) return 'confirm';
    if (cyclePosition < repsPerPhase * 3) return 'develop';
    return 'return';
  }

  /**
   * Whether the hook should be repeated faithfully in this phase.
   * True for establish/confirm/return, false for develop.
   */
  shouldRepeatHook(phase: HookPhase): boolean {
    return phase !== 'develop';
  }

  /** Get mood-specific hook length in bars. */
  getHookLengthBars(mood: Mood): number {
    return HOOK_LENGTH_BARS[mood];
  }

  /** Get mood-specific repetitions per phase. */
  getPhaseReps(mood: Mood): number {
    return PHASE_REPS[mood];
  }

  /** Store a hook's notes (makes a copy). */
  storeHook(notes: string[], mood: Mood): void {
    this.storedNotes = [...notes];
    this.storedMood = mood;
  }

  /** Retrieve stored hook if mood matches, null otherwise. */
  getStoredHook(mood: Mood): string[] | null {
    if (this.storedNotes === null || this.storedMood !== mood) return null;
    return this.storedNotes;
  }

  /** Clear stored hook. */
  clear(): void {
    this.storedNotes = null;
    this.storedMood = null;
  }
}
