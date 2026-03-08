/**
 * Rhythmic memory — pattern persistence for temporal coherence.
 *
 * Melody is two things: PITCH and RHYTHM. The motif memory tracks pitch
 * sequences, but equally important is the rhythmic pattern — which beats
 * have notes and which have rests. A catchy rhythm makes a melody
 * recognizable even when the pitches change entirely.
 *
 * This module stores rhythmic patterns (boolean masks of note/rest)
 * and recalls them for reuse. When the melody generates a new phrase
 * over a new chord, it can use a familiar rhythm with fresh pitches.
 * The listener recognizes the groove even as the harmony moves.
 *
 * Development techniques for rhythm:
 * - **Exact recall**: same rhythm, different pitches
 * - **Displacement**: shift the pattern forward/backward by 1-2 steps
 * - **Augmentation**: stretch (every other beat) or compress (double-time)
 * - **Complementation**: fill the rests, rest the notes (rhythmic inversion)
 */

export interface StoredRhythm {
  /** Boolean mask: true = note, false = rest */
  pattern: boolean[];
  /** Density (fraction of true values) for matching */
  density: number;
  /** When it was stored */
  createdAtTick: number;
  /** How many times recalled */
  useCount: number;
}

export class RhythmicMemory {
  private rhythms: StoredRhythm[] = [];
  private maxRhythms = 4;

  /**
   * Store a rhythmic pattern extracted from a phrase.
   *
   * @param elements Array of note strings where '~' = rest
   * @param tick     Current tick for aging
   */
  store(elements: string[], tick: number): void {
    const pattern = elements.map(e => e !== '~');
    const density = pattern.filter(Boolean).length / pattern.length;

    // Don't store patterns that are too sparse or too dense
    if (density < 0.15 || density > 0.85) return;
    // Don't store trivially short patterns
    if (pattern.length < 4) return;

    // Don't store duplicates (same pattern)
    const key = pattern.map(b => b ? '1' : '0').join('');
    if (this.rhythms.some(r => r.pattern.map(b => b ? '1' : '0').join('') === key)) return;

    this.rhythms.push({ pattern: [...pattern], density, createdAtTick: tick, useCount: 0 });

    // Evict least useful
    while (this.rhythms.length > this.maxRhythms) {
      let worstIdx = 0;
      let worstScore = Infinity;
      for (let i = 0; i < this.rhythms.length; i++) {
        const age = tick - this.rhythms[i].createdAtTick;
        const score = this.rhythms[i].useCount * 10 - age;
        if (score < worstScore) {
          worstScore = score;
          worstIdx = i;
        }
      }
      this.rhythms.splice(worstIdx, 1);
    }
  }

  /**
   * Recall a rhythm for reuse. Optionally filter by target density.
   *
   * @param tick          Current tick
   * @param targetDensity Optional density to match (±0.2)
   * @returns A rhythm pattern or null if memory is empty
   */
  recall(tick: number, targetDensity?: number): StoredRhythm | null {
    if (this.rhythms.length === 0) return null;

    let candidates = this.rhythms;

    // Filter by density if specified
    if (targetDensity !== undefined) {
      const filtered = this.rhythms.filter(
        r => Math.abs(r.density - targetDensity) < 0.2
      );
      if (filtered.length > 0) candidates = filtered;
    }

    // 70% most recent, 30% random older
    const idx = (Math.random() < 0.7 || candidates.length === 1)
      ? candidates.length - 1
      : Math.floor(Math.random() * (candidates.length - 1));

    const rhythm = candidates[idx];
    rhythm.useCount++;
    return rhythm;
  }

  /**
   * Develop a stored rhythm using a transformation technique.
   *
   * @param rhythm   The stored rhythm to develop
   * @param length   Target length for the output
   * @returns Transformed boolean mask
   */
  develop(rhythm: StoredRhythm, length: number): boolean[] {
    const technique = Math.random();

    if (technique < 0.3) {
      // Exact recall — same rhythm, just trim/pad to length
      return this.fitToLength(rhythm.pattern, length);
    }

    if (technique < 0.55) {
      // Displacement — shift forward or backward by 1-2 positions
      return this.displace(rhythm.pattern, length);
    }

    if (technique < 0.75) {
      // Augmentation — stretch to double time (every other beat)
      return this.augment(rhythm.pattern, length);
    }

    // Complementation — invert notes and rests
    return this.complement(rhythm.pattern, length);
  }

  /** Trim or pad a pattern to target length */
  private fitToLength(pattern: boolean[], length: number): boolean[] {
    if (pattern.length === length) return [...pattern];
    if (pattern.length > length) return pattern.slice(0, length);
    // Pad by repeating
    const result: boolean[] = [];
    for (let i = 0; i < length; i++) {
      result.push(pattern[i % pattern.length]);
    }
    return result;
  }

  /** Shift pattern by 1-2 positions (wrapping) */
  private displace(pattern: boolean[], length: number): boolean[] {
    const shift = Math.random() < 0.5 ? 1 : 2;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const fitted = this.fitToLength(pattern, length);
    const result = new Array(length).fill(false);
    for (let i = 0; i < length; i++) {
      const srcIdx = ((i - shift * dir) % length + length) % length;
      result[i] = fitted[srcIdx];
    }
    return result;
  }

  /** Stretch pattern — note on every other beat */
  private augment(pattern: boolean[], length: number): boolean[] {
    const result = new Array(length).fill(false);
    for (let i = 0; i < pattern.length && i * 2 < length; i++) {
      result[i * 2] = pattern[i];
    }
    return result;
  }

  /** Invert: notes become rests, rests become notes */
  private complement(pattern: boolean[], length: number): boolean[] {
    const fitted = this.fitToLength(pattern, length);
    return fitted.map(b => !b);
  }

  /** Clear memory (e.g., on mood change) */
  clear(): void {
    this.rhythms = [];
  }

  /** Current stored count */
  get count(): number {
    return this.rhythms.length;
  }
}

/**
 * Extract a rhythmic pattern from a phrase (note elements).
 */
export function extractRhythm(elements: string[]): boolean[] {
  return elements.map(e => e !== '~');
}
