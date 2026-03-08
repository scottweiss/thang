/**
 * Motivic memory for thematic continuity.
 *
 * Instead of generating completely new melodies every cycle, this module
 * stores and develops motifs over time. A motif can be:
 * - Repeated exactly (immediate recognition)
 * - Transposed (same shape, different pitch)
 * - Inverted (mirror image)
 * - Augmented/diminished (same notes, different rhythm)
 * - Fragmented (use just the beginning or end)
 * - Extended (add notes to an existing motif)
 *
 * This creates the kind of thematic development that makes music
 * feel like it's "going somewhere" rather than being random.
 */

export interface StoredMotif {
  notes: string[];       // the original note sequence
  createdAtTick: number; // when it was first created
  useCount: number;      // how many times it's been used
}

export class MotifMemory {
  private motifs: StoredMotif[] = [];
  private maxMotifs = 4;  // remember up to 4 motifs

  /**
   * Store a new motif. If memory is full, drop the oldest/least-used.
   */
  store(notes: string[], tick: number): void {
    // Don't store very short motifs
    if (notes.length < 2) return;

    // Don't store duplicates
    const key = notes.join(',');
    if (this.motifs.some(m => m.notes.join(',') === key)) return;

    this.motifs.push({ notes: [...notes], createdAtTick: tick, useCount: 0 });

    // Evict oldest/least-used if over capacity
    while (this.motifs.length > this.maxMotifs) {
      let worstIdx = 0;
      let worstScore = Infinity;
      for (let i = 0; i < this.motifs.length; i++) {
        // Score: higher is better (more recent + more used)
        const age = tick - this.motifs[i].createdAtTick;
        const score = this.motifs[i].useCount * 10 - age;
        if (score < worstScore) {
          worstScore = score;
          worstIdx = i;
        }
      }
      this.motifs.splice(worstIdx, 1);
    }
  }

  /**
   * Recall a motif for development. Returns null if memory is empty.
   * Favors recently-used motifs (thematic continuity) but occasionally
   * recalls older ones (callback/return).
   */
  recall(tick: number): StoredMotif | null {
    if (this.motifs.length === 0) return null;

    // 70% chance to use most recent, 30% chance for older
    if (Math.random() < 0.7 || this.motifs.length === 1) {
      const motif = this.motifs[this.motifs.length - 1];
      motif.useCount++;
      return motif;
    }

    // Pick a random older motif
    const idx = Math.floor(Math.random() * (this.motifs.length - 1));
    const motif = this.motifs[idx];
    motif.useCount++;
    return motif;
  }

  /**
   * Develop a stored motif using one of several techniques.
   *
   * @param motif   The motif to develop
   * @param ladder  Available pitches in order
   * @returns New note sequence based on the motif
   */
  develop(motif: StoredMotif, ladder: string[]): string[] {
    const technique = Math.random();

    if (technique < 0.2) {
      // Exact repetition (recognition)
      return [...motif.notes];
    }

    if (technique < 0.45) {
      // Transposition: shift all notes up or down
      return this.transpose(motif.notes, ladder, Math.random() < 0.5 ? 1 : -1);
    }

    if (technique < 0.6) {
      // Inversion: reverse the direction of intervals
      return this.invert(motif.notes, ladder);
    }

    if (technique < 0.75) {
      // Fragmentation: use first or last half
      const half = Math.ceil(motif.notes.length / 2);
      return Math.random() < 0.5
        ? motif.notes.slice(0, half)
        : motif.notes.slice(-half);
    }

    if (technique < 0.9) {
      // Extension: add a note to the end
      return this.extend(motif.notes, ladder);
    }

    // Retrograde: play backwards
    return [...motif.notes].reverse();
  }

  /** Transpose all notes by `steps` positions in the ladder */
  private transpose(notes: string[], ladder: string[], steps: number): string[] {
    return notes.map(note => {
      const idx = ladder.indexOf(note);
      if (idx < 0) return note;
      const newIdx = Math.max(0, Math.min(ladder.length - 1, idx + steps));
      return ladder[newIdx];
    });
  }

  /** Invert intervals: if original goes up 2, inversion goes down 2 */
  private invert(notes: string[], ladder: string[]): string[] {
    if (notes.length < 2) return [...notes];

    const indices = notes.map(n => ladder.indexOf(n)).filter(i => i >= 0);
    if (indices.length < 2) return [...notes];

    const result = [indices[0]];
    for (let i = 1; i < indices.length; i++) {
      const interval = indices[i] - indices[i - 1];
      const inverted = result[i - 1] - interval;
      result.push(Math.max(0, Math.min(ladder.length - 1, inverted)));
    }

    return result.map(i => ladder[i]);
  }

  /** Add one note to the end following the last interval's direction */
  private extend(notes: string[], ladder: string[]): string[] {
    if (notes.length < 2) return [...notes];

    const indices = notes.map(n => ladder.indexOf(n)).filter(i => i >= 0);
    if (indices.length < 2) return [...notes];

    const lastInterval = indices[indices.length - 1] - indices[indices.length - 2];
    const step = lastInterval === 0
      ? (Math.random() < 0.5 ? 1 : -1)
      : Math.sign(lastInterval);
    const newIdx = Math.max(0, Math.min(
      ladder.length - 1,
      indices[indices.length - 1] + step
    ));

    return [...notes, ladder[newIdx]];
  }

  /** Clear all stored motifs (e.g., on mood change) */
  clear(): void {
    this.motifs = [];
  }

  /** Get current motif count */
  get count(): number {
    return this.motifs.length;
  }
}
