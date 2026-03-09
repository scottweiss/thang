import { GenerativeState, Mood, Section } from '../types';
import { densityEnvelope } from '../theory/density-envelope';
import { harmonicMomentumMultiplier } from '../theory/harmonic-momentum';
import { resolutionTimingMultiplier } from '../theory/resolution-timing';
import { selectHarmonicRhythm, harmonicRhythmMultiplier, shouldApplyHarmonicRhythm } from '../theory/harmonic-rhythm-pattern';
import { gravityDurationMultiplier, shouldApplyHarmonicGravity } from '../theory/harmonic-gravity';

// Chord change timing per mood (seconds) — faster harmonic rhythm for energetic moods
const CHORD_TIMING: Record<Mood, [number, number]> = {
  ambient: [25, 80],
  downtempo: [15, 45],
  lofi: [12, 35],
  trance: [8, 24],
  avril: [20, 60],
  xtal: [18, 50],
  syro: [6, 20],
  blockhead: [12, 40],
  flim: [15, 45],
  disco: [10, 30],
};

// Scale modulation timing per mood — trance modulates often, ambient/avril stay put
const SCALE_TIMING: Record<Mood, [number, number]> = {
  ambient: [180, 400],
  downtempo: [120, 280],
  lofi: [100, 240],
  trance: [80, 180],
  avril: [200, 450],
  xtal: [150, 350],
  syro: [70, 160],
  blockhead: [100, 250],
  flim: [120, 300],
  disco: [90, 200],
};

export class EvolutionManager {
  private nextChordChange: number;
  private nextScaleChange: number;
  /** Chord change counter for harmonic rhythm patterning */
  private chordChangeIndex = 0;

  constructor() {
    const timing = CHORD_TIMING.downtempo;
    this.nextChordChange = this.randomBetween(timing[0], timing[1]);
    const scaleTiming = SCALE_TIMING.downtempo;
    this.nextScaleChange = this.randomBetween(scaleTiming[0], scaleTiming[1]);
  }

  evolve(state: GenerativeState, dt: number): { chordChange: boolean; scaleChange: boolean } {
    state.elapsed += dt;

    // Spaciousness is now steered by section manager toward section targets.
    // No random drift here — it would fight against section targeting.

    // Apply density breathing envelope — modulates density on multiple timescales
    const densityMod = densityEnvelope(state.elapsed, state.lastChordChange, state.params.tempo);
    state.params.density = Math.max(0.1, Math.min(1.0, state.params.density * densityMod));

    const timeSinceChord = state.elapsed - state.lastChordChange;
    const timeSinceScale = state.elapsed - state.lastScaleChange;

    let chordChange = false;
    let scaleChange = false;

    if (timeSinceChord >= this.nextChordChange) {
      chordChange = true;
      // Don't reset timer here — controller will call commitChordChange()
      // only when the chord actually advances (inertia may block it).
      // This ensures blocked changes retry next tick instead of
      // waiting another full timer cycle.
    }

    if (timeSinceScale >= this.nextScaleChange) {
      // Prefer modulating during breakdowns (natural resting point) —
      // defer by up to 30s if we're not in breakdown or build
      if (state.section === 'breakdown' || state.section === 'build' ||
          timeSinceScale >= this.nextScaleChange + 30) {
        scaleChange = true;
        state.lastScaleChange = state.elapsed;
        const scaleTiming = SCALE_TIMING[state.mood];
        this.nextScaleChange = this.randomBetween(scaleTiming[0], scaleTiming[1]);
      }
    }

    return { chordChange, scaleChange };
  }

  /**
   * Called by the controller when a chord change actually commits
   * (i.e. not blocked by inertia). Resets the timer for next change.
   */
  commitChordChange(state: GenerativeState): void {
    state.lastChordChange = state.elapsed;
    this.chordChangeIndex++;
    const timing = this.getEffectiveChordTiming(state.mood, state.section, state.tension?.overall, state.sectionProgress ?? 0, state.currentChord.degree, state.currentChord.quality);
    this.nextChordChange = this.randomBetween(timing[0], timing[1]);
  }

  resetTimings(mood: Mood): void {
    const timing = CHORD_TIMING[mood];
    this.nextChordChange = this.randomBetween(timing[0], timing[1]);
    const scaleTiming = SCALE_TIMING[mood];
    this.nextScaleChange = this.randomBetween(scaleTiming[0], scaleTiming[1]);
  }

  /**
   * Section-sensitive harmonic rhythm with tension modulation.
   * Chord changes accelerate during builds/peaks, slow during breakdowns.
   * High harmonic tension also speeds up changes (creates momentum).
   */
  private getEffectiveChordTiming(mood: Mood, section: Section, tension?: number, sectionProgress?: number, chordDegree?: number, chordQuality?: import('../types').ChordQuality): [number, number] {
    const base = CHORD_TIMING[mood];
    const multiplier: Record<Section, number> = {
      intro: 1.5,      // slow changes, establish tonality
      build: 0.7,      // accelerating changes build momentum
      peak: 0.5,       // fastest changes, maximum energy
      breakdown: 2.0,  // slow down, let chords breathe
      groove: 0.8,     // moderately fast, keep interest
    };
    const m = multiplier[section];
    // Tension speeds up harmonic rhythm: high tension = 0.8x, low = 1.1x
    const tensionMod = tension !== undefined ? (1.1 - tension * 0.3) : 1.0;
    // Harmonic momentum: section progress shapes chord change rate
    const momentumMod = harmonicMomentumMultiplier(section, sectionProgress ?? 0);
    // Resolution pull: chords wanting to resolve change faster
    const resMod = (chordDegree !== undefined && chordQuality)
      ? resolutionTimingMultiplier(chordDegree, chordQuality, mood)
      : 1.0;
    // Harmonic rhythm pattern: quick-quick-slow, long-short, accelerando, etc.
    const rhythmMod = shouldApplyHarmonicRhythm(mood)
      ? harmonicRhythmMultiplier(selectHarmonicRhythm(section, mood, this.chordChangeIndex), this.chordChangeIndex, mood)
      : 1.0;
    // Harmonic gravity: heavier chords (I, V) sustain longer, lighter chords pass quickly
    const gravMod = (chordDegree !== undefined && shouldApplyHarmonicGravity(mood))
      ? gravityDurationMultiplier(chordDegree, mood, section)
      : 1.0;
    const combined = m * tensionMod * momentumMod * resMod * rhythmMod * gravMod;
    return [base[0] * combined, base[1] * combined];
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
