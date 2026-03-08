import { Layer } from './layer';
import { GenerativeState, Mood } from '../types';
import { stereoWidth } from '../theory/stereo-field';
import { generateNudgePattern, shouldApplyMicroTiming } from '../theory/micro-timing';
import { filterEnvelopeMultiplier, shouldApplyFilterEnvelope } from '../theory/filter-envelope';
import { roomMultiplier, roomsizeMultiplier, shouldApplySpatialDepth } from '../theory/spatial-depth';
import { delayWetMultiplier, delayFeedbackMultiplier, shouldApplyDelayEvolution } from '../theory/delay-evolution';
import { fmMorphMultiplier, shouldApplyTimbralMorph } from '../theory/timbral-morph';
import { hpfSweepOffset, shouldApplyHpfSweep } from '../theory/hpf-sweep';
import { gainArcMultiplier, shouldApplyGainArc } from '../theory/gain-arc';
import { resonanceSweepMultiplier, shouldApplyResonanceSweep } from '../theory/resonance-sweep';
import { attackMultiplier, decayMultiplier, sustainMultiplier, releaseMultiplier, shouldApplyEnvelopeEvolution } from '../theory/envelope-evolution';

export abstract class CachingLayer implements Layer {
  abstract name: string;
  abstract orbit: number;

  private cachedPattern: string | null = null;
  private lastGeneratedAtTick = -1;
  protected lastMood: Mood | null = null;

  generate(state: GenerativeState): string {
    if (!this.cachedPattern || this.shouldRegenerate(state)) {
      this.cachedPattern = this.buildPattern(state);
      this.lastGeneratedAtTick = state.tick;
      this.lastMood = state.mood;
    }

    let result = this.cachedPattern;

    // Dynamic stereo field: modulate pan range based on section/tension
    result = this.modulateStereo(result, state);

    // Micro-timing: add subtle timing offsets for human feel
    result = this.applyMicroTiming(result, state);

    // Filter envelope: smooth LPF sweep over section duration
    result = this.applyFilterEnvelope(result, state);

    // Resonance sweep: filter Q rises in builds, drops in breakdowns
    result = this.applyResonanceSweep(result, state);

    // Spatial depth: reverb breathes with section progress
    result = this.applySpatialDepth(result, state);

    // Delay evolution: echo intensity builds with section
    result = this.applyDelayEvolution(result, state);

    // Timbral morphing: FM index evolves within sections
    result = this.applyTimbralMorph(result, state);

    // HPF sweep: build-up tension via rising high-pass filter
    result = this.applyHpfSweep(result, state);

    // Envelope evolution: attacks tighten in builds, soften in breakdowns
    result = this.applyEnvelopeEvolution(result, state);

    // Gain arc: crescendo/decrescendo within sections
    result = this.applyGainArc(result, state);

    // Apply layer gain multiplier for smooth section transitions
    const multiplier = state.layerGainMultipliers[this.name] ?? 1.0;
    if (multiplier < 1.0) {
      return this.applyGainMultiplier(result, multiplier);
    }
    return result;
  }

  private applyGainMultiplier(pattern: string, multiplier: number): string {
    // Replace .gain(X) with .gain(X * multiplier)
    return pattern.replace(
      /\.gain\(([^)]+)\)/,
      (match, gainExpr) => {
        // If gain is a simple number, multiply it
        const num = parseFloat(gainExpr);
        if (!isNaN(num)) {
          return `.gain(${(num * multiplier).toFixed(4)})`;
        }
        // If gain is a quoted string (velocity pattern), scale each value
        const quotedMatch = gainExpr.match(/^"([^"]+)"$/);
        if (quotedMatch) {
          const scaled = quotedMatch[1].split(' ')
            .map((v: string) => (parseFloat(v) * multiplier).toFixed(4))
            .join(' ');
          return `.gain("${scaled}")`;
        }
        // Otherwise wrap in expression
        return `.gain((${gainExpr}) * ${multiplier.toFixed(4)})`;
      }
    );
  }

  protected abstract buildPattern(state: GenerativeState): string;
  protected abstract shouldRegenerate(state: GenerativeState): boolean;

  protected ticksSinceLastGeneration(state: GenerativeState): number {
    if (this.lastGeneratedAtTick < 0) return Infinity;
    return state.tick - this.lastGeneratedAtTick;
  }

  /**
   * Scale the pan LFO range based on section and tension.
   * Peaks spread wide, intros/breakdowns narrow toward center.
   * Applied every tick so pan evolves smoothly with section changes.
   */
  private modulateStereo(pattern: string, state: GenerativeState): string {
    const width = stereoWidth(state.section, state.tension?.overall ?? 0.5);
    return pattern.replace(
      /\.pan\(sine\.range\(([0-9.]+),\s*([0-9.]+)\)\.slow\(([^)]+)\)\)/,
      (_match, minStr, maxStr, speed) => {
        const moodMin = parseFloat(minStr);
        const moodMax = parseFloat(maxStr);
        const center = (moodMin + moodMax) / 2;
        const halfRange = (moodMax - moodMin) / 2;
        const scaledHalf = halfRange * width;
        const min = Math.max(0, center - scaledHalf).toFixed(2);
        const max = Math.min(1, center + scaledHalf).toFixed(2);
        return `.pan(sine.range(${min}, ${max}).slow(${speed}))`;
      }
    );
  }

  /**
   * Scale LPF values by section-progress-based envelope.
   * Builds gradually open the filter, breakdowns close it.
   */
  private applyFilterEnvelope(pattern: string, state: GenerativeState): string {
    if (!shouldApplyFilterEnvelope(state.section)) return pattern;

    const mult = filterEnvelopeMultiplier(
      state.section,
      state.sectionProgress ?? 0,
      state.tension?.overall ?? 0.5
    );

    // Only modulate if meaningfully different from 1.0
    if (mult > 0.98) return pattern;

    // Scale static .lpf(NUMBER) values
    return pattern.replace(
      /\.lpf\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => `.lpf(${Math.round(parseFloat(val) * mult)})`
    );
  }

  /**
   * Scale .resonance() values by section-progress multiplier.
   * Builds add edge (rising Q), breakdowns soften (falling Q).
   */
  private applyResonanceSweep(pattern: string, state: GenerativeState): string {
    if (!shouldApplyResonanceSweep(state.section)) return pattern;
    if (!pattern.includes('.resonance(')) return pattern;

    const mult = resonanceSweepMultiplier(state.section, state.sectionProgress ?? 0);
    if (Math.abs(mult - 1.0) < 0.03) return pattern;

    return pattern.replace(
      /\.resonance\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => `.resonance(${Math.round(parseFloat(val) * mult)})`
    );
  }

  /**
   * Scale .room() and .roomsize() values by section-progress multipliers.
   * Builds contract space (pressure), breakdowns expand (ethereal).
   */
  private applySpatialDepth(pattern: string, state: GenerativeState): string {
    if (!shouldApplySpatialDepth(state.section)) return pattern;

    const progress = state.sectionProgress ?? 0;
    const tension = state.tension?.overall ?? 0.5;
    const rMult = roomMultiplier(state.section, progress, tension);
    const sMult = roomsizeMultiplier(state.section, progress);

    let result = pattern;

    // Scale static .room(NUMBER) values
    if (Math.abs(rMult - 1.0) > 0.02) {
      result = result.replace(
        /\.room\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.room(${(parseFloat(val) * rMult).toFixed(2)})`
      );
    }

    // Scale static .roomsize(NUMBER) values
    if (Math.abs(sMult - 1.0) > 0.02) {
      result = result.replace(
        /\.roomsize\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.roomsize(${(parseFloat(val) * sMult).toFixed(1)})`
      );
    }

    return result;
  }

  /**
   * Scale .delay() and .delayfeedback() by section-progress multipliers.
   * Builds cascade echoes, breakdowns create vast trails.
   */
  private applyDelayEvolution(pattern: string, state: GenerativeState): string {
    if (!shouldApplyDelayEvolution(state.section)) return pattern;
    // Skip if pattern has no delay
    if (!pattern.includes('.delay(')) return pattern;

    const progress = state.sectionProgress ?? 0;
    const wetMult = delayWetMultiplier(state.section, progress);
    const fbMult = delayFeedbackMultiplier(state.section, progress);

    let result = pattern;

    if (Math.abs(wetMult - 1.0) > 0.02) {
      result = result.replace(
        /\.delay\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => {
          const scaled = Math.min(1.0, parseFloat(val) * wetMult);
          return `.delay(${scaled.toFixed(2)})`;
        }
      );
    }

    if (Math.abs(fbMult - 1.0) > 0.02) {
      result = result.replace(
        /\.delayfeedback\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => {
          // Cap total feedback at 0.85 to prevent runaway echoes
          const scaled = Math.min(0.85, parseFloat(val) * fbMult);
          return `.delayfeedback(${scaled.toFixed(2)})`;
        }
      );
    }

    return result;
  }

  /**
   * Scale .fm() values by section-progress multiplier for timbral evolution.
   * Builds brighten (higher FM index), breakdowns warm (lower FM index).
   */
  private applyTimbralMorph(pattern: string, state: GenerativeState): string {
    if (!shouldApplyTimbralMorph(state.section)) return pattern;
    if (!pattern.includes('.fm(')) return pattern;

    const mult = fmMorphMultiplier(state.section, state.sectionProgress ?? 0);

    if (Math.abs(mult - 1.0) < 0.03) return pattern;

    // Scale static .fm(NUMBER) values — skip .fm() with sine.range or other patterns
    return pattern.replace(
      /\.fm\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => `.fm(${(parseFloat(val) * mult).toFixed(1)})`
    );
  }

  /**
   * Scale full ADSR envelope by section-progress multipliers.
   * Builds get punchier (short decay, low sustain), breakdowns get dreamier (long decay, high sustain).
   */
  private applyEnvelopeEvolution(pattern: string, state: GenerativeState): string {
    if (!shouldApplyEnvelopeEvolution(state.section)) return pattern;

    const progress = state.sectionProgress ?? 0;
    const aMult = attackMultiplier(state.section, progress);
    const dMult = decayMultiplier(state.section, progress);
    const sMult = sustainMultiplier(state.section, progress);
    const rMult = releaseMultiplier(state.section, progress);

    let result = pattern;

    if (Math.abs(aMult - 1.0) > 0.05) {
      result = result.replace(
        /\.attack\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.attack(${(parseFloat(val) * aMult).toFixed(3)})`
      );
    }

    if (Math.abs(dMult - 1.0) > 0.05) {
      result = result.replace(
        /\.decay\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.decay(${(parseFloat(val) * dMult).toFixed(3)})`
      );
    }

    if (Math.abs(sMult - 1.0) > 0.05) {
      result = result.replace(
        /\.sustain\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.sustain(${(parseFloat(val) * sMult).toFixed(4)})`
      );
    }

    if (Math.abs(rMult - 1.0) > 0.05) {
      result = result.replace(
        /\.release\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.release(${(parseFloat(val) * rMult).toFixed(3)})`
      );
    }

    return result;
  }

  /**
   * Scale gain by section-progress arc for natural crescendo/decrescendo.
   * Builds crescendo, breakdowns decrescendo, peaks sustain.
   */
  private applyGainArc(pattern: string, state: GenerativeState): string {
    if (!shouldApplyGainArc(state.section)) return pattern;

    const mult = gainArcMultiplier(state.section, state.sectionProgress ?? 0);
    if (Math.abs(mult - 1.0) < 0.03) return pattern;

    return this.applyGainMultiplier(pattern, mult);
  }

  /**
   * Add HPF offset for build-up sweep tension.
   * Additively raises .hpf(NUMBER) values during builds/breakdowns.
   */
  private applyHpfSweep(pattern: string, state: GenerativeState): string {
    if (!shouldApplyHpfSweep(state.section)) return pattern;
    if (!pattern.includes('.hpf(')) return pattern;

    const offset = hpfSweepOffset(state.section, state.sectionProgress ?? 0);
    if (offset < 5) return pattern;

    return pattern.replace(
      /\.hpf\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => `.hpf(${Math.round(parseFloat(val) + offset)})`
    );
  }

  /**
   * Add micro-timing offsets via .nudge() for humanization.
   * Generates a short cycled nudge pattern based on mood/section.
   * Only applied if the pattern doesn't already have .nudge().
   */
  private applyMicroTiming(pattern: string, state: GenerativeState): string {
    if (!shouldApplyMicroTiming(state.mood)) return pattern;
    // Don't double-apply
    if (pattern.includes('.nudge(')) return pattern;

    const nudge = generateNudgePattern(state.mood, state.section, 8, state.tick);
    // Insert .nudge() before .orbit() (which every layer has at the end)
    return pattern.replace(
      /\.orbit\((\d+)\)/,
      `.nudge("${nudge}").orbit($1)`
    );
  }

  protected moodChanged(state: GenerativeState): boolean {
    return this.lastMood !== null && this.lastMood !== state.mood;
  }
}
