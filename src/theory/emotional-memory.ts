/**
 * Emotional memory — remembering and recalling peak musical moments.
 *
 * Great compositions create narrative by bringing back key moments:
 * a melody that appeared at a tension peak returns during breakdown,
 * a chord that resolved beautifully is revisited at the end.
 *
 * This module tracks "emotional landmarks" — moments where tension
 * reached extremes, where significant harmonic resolutions occurred,
 * or where section transitions happened. Later, it biases the system
 * toward recalling elements from those peak moments.
 *
 * This creates musical déjà vu: the listener subconsciously recognizes
 * returning elements, creating a sense of narrative arc and closure.
 */

import type { Mood, Section, ChordState } from '../types';

/** A snapshot of a musically significant moment */
export interface EmotionalLandmark {
  tick: number;
  section: Section;
  tension: number;
  chord: { root: string; quality: string; degree: number };
  /** What made this moment significant */
  type: 'tension_peak' | 'resolution' | 'section_arrival' | 'harmonic_surprise';
  /** Emotional weight — how significant this moment was (0-1) */
  weight: number;
}

/** How much each mood values emotional recall (0-1) */
const RECALL_AFFINITY: Record<Mood, number> = {
  ambient:   0.45,   // dreamlike recall, déjà vu
  xtal:      0.50,   // nostalgic — loves callbacks
  avril:     0.55,   // singer-songwriter — narrative arcs
  downtempo: 0.40,   // moderate narrative
  flim:      0.35,   // organic, some recall
  lofi:      0.40,   // jazz — thematic development
  blockhead: 0.30,   // sample-based — some repetition
  syro:      0.25,   // IDM — forward-looking
  disco:     0.20,   // groove-oriented, less narrative
  trance:    0.15,   // progression-oriented, less narrative
};

/** Maximum landmarks to store (prevents unbounded memory) */
const MAX_LANDMARKS = 20;

/**
 * Manages a collection of emotional landmarks and provides
 * recall biases for musical decisions.
 */
export class EmotionalMemoryBank {
  private landmarks: EmotionalLandmark[] = [];

  /** Number of stored landmarks */
  get count(): number {
    return this.landmarks.length;
  }

  /** Store a new emotional landmark */
  store(landmark: EmotionalLandmark): void {
    this.landmarks.push(landmark);
    // Keep only the most significant landmarks
    if (this.landmarks.length > MAX_LANDMARKS) {
      // Sort by weight and keep the top ones
      this.landmarks.sort((a, b) => b.weight - a.weight);
      this.landmarks = this.landmarks.slice(0, MAX_LANDMARKS);
    }
  }

  /** Clear all landmarks (e.g., on mood change) */
  clear(): void {
    this.landmarks = [];
  }

  /**
   * Find the most emotionally significant chord from memory.
   * Useful for biasing chord selection toward previously meaningful chords.
   *
   * @param currentSection  Current section (breakdowns/intros prefer recall)
   * @param mood            Current mood
   * @returns The chord from the most weighted landmark, or null
   */
  recallChord(currentSection: Section, mood: Mood): EmotionalLandmark | null {
    if (this.landmarks.length === 0) return null;

    const affinity = RECALL_AFFINITY[mood];
    // Sections that favor recall
    const sectionMult: Record<Section, number> = {
      intro: 0.5,     // beginning — not much to recall yet
      build: 0.8,     // building on past
      peak: 0.6,      // creating new peaks
      breakdown: 1.5,  // maximum recall — nostalgic dissolution
      groove: 1.0,    // neutral
    };

    const effectiveAffinity = affinity * (sectionMult[currentSection] ?? 1.0);

    // Deterministic selection: pick the highest-weighted landmark
    // that matches the recall criteria
    const candidates = this.landmarks
      .filter(l => l.weight * effectiveAffinity > 0.15)
      .sort((a, b) => b.weight - a.weight);

    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * Score how well a candidate chord matches emotional memory.
   * Returns a bias multiplier (1.0 = no bias, >1.0 = favor this chord).
   *
   * @param candidateRoot    Root of the candidate chord
   * @param candidateDegree  Scale degree of the candidate chord
   * @param mood             Current mood
   * @param section          Current section
   */
  chordRecallBias(
    candidateRoot: string,
    candidateDegree: number,
    mood: Mood,
    section: Section
  ): number {
    const recalled = this.recallChord(section, mood);
    if (!recalled) return 1.0;

    // Exact root match: strong recall
    if (recalled.chord.root === candidateRoot) {
      return 1.0 + recalled.weight * RECALL_AFFINITY[mood] * 0.5;
    }

    // Same degree: moderate recall (functionally similar)
    if (recalled.chord.degree === candidateDegree) {
      return 1.0 + recalled.weight * RECALL_AFFINITY[mood] * 0.3;
    }

    return 1.0;
  }
}

/**
 * Determine if the current musical moment is emotionally significant
 * enough to store as a landmark.
 *
 * @param tension          Current tension level (0-1)
 * @param prevTension      Previous tension level (0-1)
 * @param sectionChanged   Whether we just transitioned sections
 * @param chordChanged     Whether the chord just changed
 * @param harmonicSurprise Whether the chord was unexpected (far from predicted)
 */
export function isEmotionalLandmark(
  tension: number,
  prevTension: number,
  sectionChanged: boolean,
  chordChanged: boolean,
  harmonicSurprise: boolean
): { isLandmark: boolean; type: EmotionalLandmark['type']; weight: number } {
  // Tension peak: crossed above 0.8 or had a sudden spike
  if (tension > 0.8 && tension > prevTension + 0.15) {
    return { isLandmark: true, type: 'tension_peak', weight: tension };
  }

  // Resolution: tension dropped significantly (catharsis moment)
  if (chordChanged && prevTension > 0.6 && tension < prevTension - 0.2) {
    return { isLandmark: true, type: 'resolution', weight: prevTension - tension };
  }

  // Section arrival: first moments of a new section
  if (sectionChanged) {
    return { isLandmark: true, type: 'section_arrival', weight: 0.5 };
  }

  // Harmonic surprise: unexpected chord
  if (harmonicSurprise && chordChanged) {
    return { isLandmark: true, type: 'harmonic_surprise', weight: 0.6 };
  }

  return { isLandmark: false, type: 'tension_peak', weight: 0 };
}

/**
 * Get the recall affinity for a mood (for testing).
 */
export function recallAffinity(mood: Mood): number {
  return RECALL_AFFINITY[mood];
}
