/**
 * Tonal gravity — long-range pull toward the home key.
 *
 * When a piece wanders through different keys and scales (via modal
 * interchange, scale modulation, etc.), there should be a gravitational
 * pull back toward the original key. This creates the satisfying feeling
 * of "coming home" after a harmonic journey.
 *
 * The further the piece has wandered and the longer it's been away,
 * the stronger the pull back. This is the tonal equivalent of a
 * rubber band — stretch it far enough and it snaps back.
 *
 * Integration: biases scale/key selection in modulateScale() toward
 * the home key when the piece has been away too long.
 */

import type { Mood, NoteName, ScaleType } from '../types';

export interface TonalPosition {
  root: string;
  type: string;
  tick: number;
}

export interface HomeKey {
  root: NoteName;
  type: ScaleType;
}

/**
 * Track tonal wandering and compute homeward bias.
 */
export class TonalGravity {
  private homeRoot: NoteName;
  private homeType: ScaleType;
  private history: TonalPosition[] = [];
  private maxHistory = 20;

  constructor(homeRoot: NoteName, homeType: ScaleType) {
    this.homeRoot = homeRoot;
    this.homeType = homeType;
  }

  /**
   * Record the current key position.
   */
  record(root: string, type: string, tick: number): void {
    this.history.push({ root, type, tick });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Compute the homeward bias (0.0 = no pull, 1.0 = strong pull home).
   *
   * Factors:
   * - Distance from home key (semitone distance of current root)
   * - Time away (ticks since last time at home)
   * - Journey diversity (how many different keys visited)
   */
  homewardBias(currentRoot: string, currentType: string): number {
    // If we're already home, no bias needed
    if (currentRoot === this.homeRoot && currentType === this.homeType) return 0;

    const distance = rootDistance(currentRoot, this.homeRoot);
    const distanceFactor = distance / 6; // max = tritone (6 semitones)

    // How many ticks since we were last home?
    let ticksAway = 0;
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].root === this.homeRoot) break;
      ticksAway++;
    }
    const timeFactor = Math.min(1.0, ticksAway / 12); // peaks at 12 ticks away

    // How many unique keys have we visited recently?
    const uniqueKeys = new Set(
      this.history.slice(-8).map(p => `${p.root}:${p.type}`)
    );
    const diversityFactor = Math.min(1.0, (uniqueKeys.size - 1) / 4);

    // Combined bias: weighted average
    return Math.min(1.0,
      distanceFactor * 0.3 + timeFactor * 0.5 + diversityFactor * 0.2
    );
  }

  /**
   * Should the piece return home now?
   * Based on homeward bias and mood sensitivity.
   */
  shouldReturnHome(
    currentRoot: string,
    currentType: string,
    mood: Mood
  ): boolean {
    const bias = this.homewardBias(currentRoot, currentType);
    const threshold = MOOD_GRAVITY_THRESHOLD[mood];
    return bias > threshold;
  }

  /**
   * Get the home key info for resolution.
   */
  getHome(): HomeKey {
    return { root: this.homeRoot, type: this.homeType };
  }

  /**
   * Reset when mood changes (new tonal center).
   */
  reset(homeRoot: NoteName, homeType: ScaleType): void {
    this.homeRoot = homeRoot;
    this.homeType = homeType;
    this.history = [];
  }

  /**
   * Clear history but keep home key.
   */
  clearHistory(): void {
    this.history = [];
  }
}

/**
 * Distance between two roots in semitones (0-6, wrapping at tritone).
 */
export function rootDistance(a: string, b: string): number {
  const pitchA = ROOT_PITCH[a] ?? 0;
  const pitchB = ROOT_PITCH[b] ?? 0;
  const raw = Math.abs(pitchA - pitchB) % 12;
  return Math.min(raw, 12 - raw); // wrap at tritone
}

const ROOT_PITCH: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/** Per-mood threshold for when to return home (lower = more gravitational pull) */
const MOOD_GRAVITY_THRESHOLD: Record<Mood, number> = {
  avril:     0.35,   // intimate — stay close to home
  flim:      0.40,   // delicate — moderate pull
  ambient:   0.50,   // wandering is OK — home is where you make it,
  plantasia: 0.50,
  lofi:      0.40,   // jazzy but grounded
  downtempo: 0.45,   // gentle exploration
  xtal:      0.50,   // dreamy wandering
  blockhead: 0.40,   // grounded in the loop
  disco:     0.35,   // functional — needs clear key center
  trance:    0.30,   // needs strong tonal center for anthemic feel
  syro:      0.60,   // IDM wanders freely
};
