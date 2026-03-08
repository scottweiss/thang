/**
 * Tension memory — tracks where tension has been over time to create
 * longer-form dramatic arcs.
 *
 * Without memory, the system just follows section rules mechanically.
 * With memory, it can recognize "we've been high-energy for a while,
 * time to rest" or "we've been quiet, time to build."
 *
 * This creates the kind of macro-form that makes 10+ minute generative
 * pieces feel like composed music with intentional dramatic arcs.
 */

export class TensionMemory {
  /** Recent tension values, oldest first. */
  private history: number[] = [];
  private maxHistory = 30; // remember ~60 seconds at 2s ticks

  /** Record current tension (0-1). */
  record(tension: number): void {
    this.history.push(tension);
    if (this.history.length > this.maxHistory) {
      this.history.splice(0, this.history.length - this.maxHistory);
    }
  }

  /**
   * Average tension over the most recent `windowSize` values.
   * Returns 0.5 if no history.
   */
  recentAverage(windowSize = 10): number {
    if (this.history.length === 0) return 0.5;
    const window = this.history.slice(-windowSize);
    return window.reduce((sum, v) => sum + v, 0) / window.length;
  }

  /**
   * Trend of tension: positive = rising, negative = falling.
   * Compares the average of the last 5 values to the previous 5.
   * Normalized to [-1, 1].  Returns 0 if not enough history.
   */
  trend(): number {
    if (this.history.length < 2) return 0;

    const recent = this.history.slice(-5);
    const previous = this.history.slice(-10, -5);

    if (previous.length === 0) return 0;

    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
    const prevAvg = previous.reduce((s, v) => s + v, 0) / previous.length;

    // Difference is at most 1.0 (full range), so this is already in [-1,1]
    const diff = recentAvg - prevAvg;
    return Math.max(-1, Math.min(1, diff));
  }

  /**
   * Suggest a tension modification based on history.
   *
   * - Sustained high tension → pull back (-0.15)
   * - Sustained low tension  → push forward (+0.15)
   * - Stagnant plateau       → nudge away from current level (±0.1)
   * - Otherwise              → 0 (let the system evolve naturally)
   */
  suggestModification(): number {
    if (this.history.length < 2) return 0;

    const avg = this.recentAverage(15);
    const t = this.trend();

    // Sustained high — time to calm down
    if (avg > 0.7 && t > -0.1) return -0.15;

    // Sustained low — time to build
    if (avg < 0.3 && t < 0.1) return 0.15;

    // Stagnant — break the monotony
    if (this.isStagnant()) {
      return avg >= 0.5 ? -0.1 : 0.1;
    }

    return 0;
  }

  /**
   * Whether tension has been in a plateau (unchanging).
   * True when the standard deviation of the last 10 values is below threshold.
   */
  isStagnant(threshold = 0.05): boolean {
    if (this.history.length < 2) return false;

    const window = this.history.slice(-10);
    const mean = window.reduce((s, v) => s + v, 0) / window.length;
    const variance =
      window.reduce((s, v) => s + (v - mean) ** 2, 0) / window.length;
    const stddev = Math.sqrt(variance);

    return stddev < threshold;
  }

  /** Clear all history (e.g., on mood change). */
  clear(): void {
    this.history = [];
  }
}
