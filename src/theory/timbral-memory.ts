/**
 * Timbral memory — remember effective FM settings and reuse them.
 *
 * When a particular combination of fmh/fm/oscillator sounds good
 * for a mood/section, store it for later recall. This creates
 * timbral continuity — the piece "remembers" its sound palette
 * and returns to familiar textures, creating a signature sound.
 *
 * Stored per mood, recalled when returning to similar contexts.
 */

import type { Mood, Section } from '../types';

/** Stored timbral snapshot. */
export interface TimbralSnapshot {
  fmh: number;
  fm: number;
  lpf: number;
  section: Section;
  tick: number;
}

/**
 * Per-mood tendency to recall timbral memories.
 * Higher = more likely to reuse familiar timbres.
 */
const RECALL_TENDENCY: Record<Mood, number> = {
  trance:    0.55,  // strong timbral identity
  avril:     0.45,  // moderate
  disco:     0.40,  // groove-consistent
  downtempo: 0.35,  // moderate
  blockhead: 0.30,  // some variety
  lofi:      0.25,  // jazz — always exploring
  flim:      0.30,  // organic
  xtal:      0.20,  // floating, varied
  syro:      0.10,  // maximum timbral exploration
  ambient:   0.35,  // meditative consistency
};

/**
 * Simple timbral memory bank.
 */
export class TimbralMemoryBank {
  private memories: Map<string, TimbralSnapshot[]> = new Map();
  private maxPerKey = 8;

  /**
   * Store a timbral snapshot.
   *
   * @param mood Current mood
   * @param layer Layer name
   * @param snapshot Timbre parameters
   */
  store(mood: Mood, layer: string, snapshot: TimbralSnapshot): void {
    const key = `${mood}-${layer}`;
    const existing = this.memories.get(key) ?? [];
    existing.push(snapshot);
    if (existing.length > this.maxPerKey) {
      existing.shift(); // remove oldest
    }
    this.memories.set(key, existing);
  }

  /**
   * Recall a timbral snapshot for a mood/layer combination.
   * Prefers snapshots from similar sections.
   *
   * @param mood Current mood
   * @param layer Layer name
   * @param section Current section
   * @returns Recalled snapshot or null
   */
  recall(mood: Mood, layer: string, section: Section): TimbralSnapshot | null {
    const key = `${mood}-${layer}`;
    const existing = this.memories.get(key);
    if (!existing || existing.length === 0) return null;

    // Prefer same-section snapshots
    const sameSection = existing.filter(s => s.section === section);
    if (sameSection.length > 0) {
      return sameSection[sameSection.length - 1]; // most recent
    }

    return existing[existing.length - 1]; // most recent overall
  }

  /**
   * Should we recall a timbral memory?
   *
   * @param mood Current mood
   * @param tick Current tick for determinism
   * @returns Whether to recall
   */
  shouldRecall(mood: Mood, tick: number): boolean {
    const tendency = RECALL_TENDENCY[mood];
    const hash = ((tick * 2654435761 + 91813) >>> 0) / 4294967296;
    return hash < tendency;
  }

  /**
   * Clear all memories.
   */
  clear(): void {
    this.memories.clear();
  }

  /**
   * Get memory count for a mood/layer.
   */
  count(mood: Mood, layer: string): number {
    return this.memories.get(`${mood}-${layer}`)?.length ?? 0;
  }
}

/**
 * Blend recalled timbre with current values.
 *
 * @param current Current fmh value
 * @param recalled Recalled fmh value
 * @param mood Current mood
 * @returns Blended value
 */
export function blendTimbre(current: number, recalled: number, mood: Mood): number {
  const tendency = RECALL_TENDENCY[mood];
  return current * (1 - tendency) + recalled * tendency;
}

/**
 * Get recall tendency for a mood (for testing).
 */
export function recallTendency(mood: Mood): number {
  return RECALL_TENDENCY[mood];
}
