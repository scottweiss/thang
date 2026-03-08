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
import { crushOffset, shouldApplyCrushEvolution } from '../theory/crush-evolution';
import { hpfBandOffset, lpfBandOffset, shouldApplyBandSeparation } from '../theory/frequency-band';
import { evolvedVelocity, applyVelocityEvolution } from '../theory/velocity-evolution';
import { slowMultiplier, shouldApplyRhythmicAcceleration } from '../theory/rhythmic-acceleration';
import { chorusDepth, shouldApplyChorus } from '../theory/chorus-depth';
import { patternDegrade, shouldApplyDegrade } from '../theory/pattern-density';
import { densityBalanceDegrade, shouldApplyDensityBalance } from '../theory/density-balance';
import { tensionBrightnessMultiplier, shouldApplyTensionBrightness } from '../theory/tension-brightness';
import { tensionSpaceMultiplier, shouldApplyTensionSpace } from '../theory/tension-space';
import { tensionDelayMultiplier, shouldApplyTensionDelay } from '../theory/tension-delay';
import { moodAccentProfile, applyAccentProfile } from '../theory/metric-accent';
import { arrivalEmphasis } from '../theory/arrival-emphasis';
import { syncedDelayTime } from '../theory/delay-sync';
import { shouldApplyHemiola, hemiolaType, hemiolaAccentMask, claveAccentMask } from '../theory/hemiola';
import { layerPhaseOffset, shouldApplyPhaseOffset } from '../theory/rhythmic-phase';
import { tensionOrchestrationGain, shouldApplyTensionOrchestration } from '../theory/tension-orchestration';
import { tensionFmh, tensionFmIndex, shouldApplyHarmonicColor } from '../theory/harmonic-color';
import { pitchPanPattern, shouldApplyPitchPan } from '../theory/pitch-pan';
import { chordLpfMultiplier, chordFmMultiplier, shouldApplyChordTimbre } from '../theory/chord-timbre';
import { adjustPanRange, shouldApplyStereoPlacement } from '../theory/stereo-placement';
import { ensembleFmMultiplier, ensembleRoomMultiplier, ensembleDelayMultiplier, shouldApplyEnsembleThinning } from '../theory/ensemble-thinning';
import { sidechainGainPattern, shouldDuckLayer, shouldApplySidechainDuck } from '../theory/sidechain-duck';
import { detectResolution, resolutionGlowMultiplier, resolutionGainBoost } from '../theory/resolution-glow';
import { tensionDecayMultiplier, tensionSustainMultiplier, tensionAttackMultiplier, shouldApplyTensionArticulation } from '../theory/tension-articulation';
import { ensembleBreathMultiplier, shouldApplyEnsembleBreath } from '../theory/ensemble-breath';
import { tensionDisplacementPattern, shouldApplyTensionRhythm } from '../theory/tension-rhythm';
import { tensionRegisterShift, applyRegisterShift, registerBrightnessFactor, shouldApplyTensionRegister } from '../theory/tension-register';

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

    // Pitch-based panning: melody notes pan subtly by register (lower=left, higher=right)
    if (this.name === 'melody' && shouldApplyPitchPan(state.mood)) {
      const melSteps = state.layerStepPattern?.melody;
      if (melSteps && melSteps.length > 0) {
        const panStr = pitchPanPattern(melSteps, state.mood);
        result = result.replace(
          /\.pan\(sine\.range\([^)]+\)\.slow\([^)]+\)\)/,
          `.pan("${panStr}")`
        );
      }
    }

    // Micro-timing: add subtle timing offsets for human feel
    result = this.applyMicroTiming(result, state);

    // Filter envelope: smooth LPF sweep over section duration
    result = this.applyFilterEnvelope(result, state);

    // Tension brightness: LPF tracks real-time tension (stacks on filter envelope)
    result = this.applyTensionBrightness(result, state);

    // Tension register: shift note octaves and LPF brightness based on tension
    result = this.applyTensionRegister(result, state);

    // Resolution glow: brief brightness surge on harmonic resolutions (V→I, etc.)
    if (state.chordHistory.length >= 1) {
      const prevChord = state.chordHistory[state.chordHistory.length - 1];
      const resType = detectResolution(prevChord.degree, prevChord.quality, state.currentChord.degree);
      if (resType !== 'none') {
        const glowMult = resolutionGlowMultiplier(resType, state.mood, state.ticksSinceChordChange);
        if (glowMult > 1.01) {
          result = result.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * glowMult)})`
          );
        }
        const gainMult = resolutionGainBoost(resType, state.mood, state.ticksSinceChordChange);
        if (gainMult > 1.005) {
          result = result.replace(
            /\.gain\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.gain(${(parseFloat(val) * gainMult).toFixed(4)})`
          );
        }
      }
    }

    // Chord-responsive timbre: chord quality colors the LPF and FM
    if (shouldApplyChordTimbre(state.mood)) {
      const quality = state.currentChord.quality;
      const lpfMult = chordLpfMultiplier(quality, state.mood);
      if (Math.abs(lpfMult - 1.0) > 0.02) {
        result = result.replace(
          /\.lpf\((\d+(?:\.\d+)?)\)/,
          (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfMult)})`
        );
      }
      const fmMult = chordFmMultiplier(quality, state.mood);
      if (Math.abs(fmMult - 1.0) > 0.02 && result.includes('.fm(') && !result.includes('.fm(sine')) {
        result = result.replace(
          /\.fm\((\d+(?:\.\d+)?)\)/,
          (_, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(1)})`
        );
      }
    }

    // Frequency band separation: adjust HPF/LPF to avoid layer masking
    result = this.applyBandSeparation(result, state);

    // Resonance sweep: filter Q rises in builds, drops in breakdowns
    result = this.applyResonanceSweep(result, state);

    // Spatial depth: reverb breathes with section progress
    result = this.applySpatialDepth(result, state);

    // Tension space: reverb tracks real-time tension (stacks on spatial depth)
    result = this.applyTensionSpace(result, state);

    // Delay sync: replace fixed delay times with tempo-synced values
    result = this.applyDelaySync(result, state);

    // Delay evolution: echo intensity builds with section
    result = this.applyDelayEvolution(result, state);

    // Tension delay: echo feedback tracks real-time tension
    result = this.applyTensionDelay(result, state);

    // Timbral morphing: FM index evolves within sections
    result = this.applyTimbralMorph(result, state);

    // Harmonic color: FM parameters respond to harmonic tension
    if (shouldApplyHarmonicColor(state.mood)) {
      const tension = state.tension?.overall ?? 0.5;
      // Modulate fmh ratio based on tension
      if (result.includes('.fmh(')) {
        result = result.replace(
          /\.fmh\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.fmh(${tensionFmh(parseFloat(val), tension, state.mood).toFixed(2)})`
        );
      }
      // Modulate FM index based on tension (only static .fm() values, not sine.range)
      if (result.includes('.fm(') && !result.includes('.fm(sine')) {
        const fmMult = tensionFmIndex(tension, state.mood);
        if (Math.abs(fmMult - 1.0) > 0.03) {
          result = result.replace(
            /\.fm\((\d+(?:\.\d+)?)\)/g,
            (_, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(1)})`
          );
        }
      }
    }

    // Chorus depth: detuning adds warmth at peaks, cleans at breakdowns
    result = this.applyChorusDepth(result, state);

    // Crush evolution: bit depth modulates for digital character
    result = this.applyCrushEvolution(result, state);

    // HPF sweep: build-up tension via rising high-pass filter
    result = this.applyHpfSweep(result, state);

    // Envelope evolution: attacks tighten in builds, soften in breakdowns
    result = this.applyEnvelopeEvolution(result, state);

    // Tension articulation: note length tracks real-time tension arc
    result = this.applyTensionArticulation(result, state);

    // Velocity evolution: per-note dynamics morph with section progress
    result = this.applyVelocityEvolution(result, state);

    // Metric accent: mood-specific beat emphasis (backbeat, downbeat, etc.)
    result = this.applyMetricAccent(result, state);

    // Hemiola: cross-rhythm accents (3-over-4 or clave 3+3+2)
    result = this.applyHemiola(result, state);

    // Sidechain ducking: rhythmic gain pump on strong beats (EDM breathing effect)
    result = this.applySidechainDuck(result, state);

    // Rhythmic acceleration: arp/drums speed up in builds, slow in breakdowns
    result = this.applyRhythmicAcceleration(result, state);

    // Ensemble thinning: reduce FM/reverb/delay when many layers play
    result = this.applyEnsembleThinning(result, state);

    // Pattern degradation: thin out notes in sparse sections, fill in at peaks
    result = this.applyPatternDegrade(result, state);

    // Gain arc: crescendo/decrescendo within sections
    result = this.applyGainArc(result, state);

    // Arrival emphasis: cadential resolution accent (gain + brightness boost)
    result = this.applyArrivalEmphasis(result, state);

    // Rhythmic phase offset: shift arp timing for inter-layer phasing
    if (shouldApplyPhaseOffset(this.name, state.mood)) {
      const offset = layerPhaseOffset(this.name, state.mood, state.section);
      if (offset > 0.01) {
        result = result.replace(
          /\.orbit\((\d+)\)/,
          `.late(${offset.toFixed(4)}).orbit($1)`
        );
      }
    }

    // Tension orchestration: dynamic layer balance based on tension
    let combinedMultiplier = state.layerGainMultipliers[this.name] ?? 1.0;
    if (shouldApplyTensionOrchestration(state.mood)) {
      combinedMultiplier *= tensionOrchestrationGain(
        this.name, state.tension?.overall ?? 0.5, state.mood
      );
    }

    // Ensemble breathing: shared phrase-level gain swell across all layers
    if (shouldApplyEnsembleBreath(state.mood)) {
      combinedMultiplier *= ensembleBreathMultiplier(state.tick, state.mood, state.section);
    }

    if (Math.abs(combinedMultiplier - 1.0) > 0.02) {
      return this.applyGainMultiplier(result, combinedMultiplier);
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
    const applyPlacement = shouldApplyStereoPlacement(state.mood);
    return pattern.replace(
      /\.pan\(sine\.range\(([0-9.]+),\s*([0-9.]+)\)\.slow\(([^)]+)\)\)/,
      (_match, minStr, maxStr, speed) => {
        const moodMin = parseFloat(minStr);
        const moodMax = parseFloat(maxStr);
        const center = (moodMin + moodMax) / 2;
        const halfRange = (moodMax - moodMin) / 2;
        const scaledHalf = halfRange * width;
        let min = Math.max(0, center - scaledHalf);
        let max = Math.min(1, center + scaledHalf);
        // Shift pan range to layer's stereo position
        if (applyPlacement) {
          [min, max] = adjustPanRange(min, max, this.name, state.mood);
        }
        return `.pan(sine.range(${min.toFixed(2)}, ${max.toFixed(2)}).slow(${speed}))`;
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
   * Scale LPF by real-time tension for spectral responsiveness.
   * High tension = brighter (filter opens), low tension = darker.
   */
  private applyTensionBrightness(pattern: string, state: GenerativeState): string {
    if (!shouldApplyTensionBrightness(this.name)) return pattern;

    const tension = state.tension?.overall ?? 0.5;
    const mult = tensionBrightnessMultiplier(tension, state.mood);
    if (Math.abs(mult - 1.0) < 0.03) return pattern;

    // Scale static .lpf(NUMBER) values
    return pattern.replace(
      /\.lpf\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => `.lpf(${Math.round(parseFloat(val) * mult)})`
    );
  }

  /**
   * Adjust HPF/LPF values for frequency band separation between layers.
   * When many layers are active, tighten each layer's frequency band
   * to prevent masking (mud).
   */
  private applyBandSeparation(pattern: string, state: GenerativeState): string {
    if (!shouldApplyBandSeparation(state.activeLayers)) return pattern;

    const hpfOff = hpfBandOffset(this.name, state.activeLayers);
    const lpfOff = lpfBandOffset(this.name, state.activeLayers);

    let result = pattern;

    if (hpfOff > 5 && result.includes('.hpf(')) {
      result = result.replace(
        /\.hpf\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.hpf(${Math.round(parseFloat(val) + hpfOff)})`
      );
    }

    if (lpfOff < -50 && result.includes('.lpf(')) {
      result = result.replace(
        /\.lpf\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.lpf(${Math.max(500, Math.round(parseFloat(val) + lpfOff))})`
      );
    }

    return result;
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
   * Scale reverb by real-time tension for spatial responsiveness.
   * High tension = drier (closer), low tension = wetter (distant).
   */
  private applyTensionSpace(pattern: string, state: GenerativeState): string {
    if (!shouldApplyTensionSpace(this.name)) return pattern;

    const tension = state.tension?.overall ?? 0.5;
    const mult = tensionSpaceMultiplier(tension, state.mood);
    if (Math.abs(mult - 1.0) < 0.03) return pattern;

    let result = pattern;
    result = result.replace(
      /\.room\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => `.room(${(parseFloat(val) * mult).toFixed(2)})`
    );
    result = result.replace(
      /\.roomsize\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => `.roomsize(${(parseFloat(val) * mult).toFixed(1)})`
    );
    return result;
  }

  /**
   * Replace hardcoded .delaytime() with tempo-synced values.
   * Creates rhythmic echoes that reinforce the groove.
   */
  private applyDelaySync(pattern: string, state: GenerativeState): string {
    if (!pattern.includes('.delaytime(')) return pattern;
    const cps = state.params.tempo;
    if (cps <= 0) return pattern;

    const synced = syncedDelayTime(state.mood, cps);
    return pattern.replace(
      /\.delaytime\((\d+(?:\.\d+)?)\)/g,
      () => `.delaytime(${synced.toFixed(4)})`
    );
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
   * Scale delay feedback by real-time tension.
   * High tension = denser echoes, low tension = cleaner.
   */
  private applyTensionDelay(pattern: string, state: GenerativeState): string {
    if (!shouldApplyTensionDelay(this.name)) return pattern;
    if (!pattern.includes('.delayfeedback(')) return pattern;

    const tension = state.tension?.overall ?? 0.5;
    const mult = tensionDelayMultiplier(tension, state.mood);
    if (Math.abs(mult - 1.0) < 0.03) return pattern;

    return pattern.replace(
      /\.delayfeedback\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => {
        const scaled = Math.min(0.85, parseFloat(val) * mult);
        return `.delayfeedback(${scaled.toFixed(2)})`;
      }
    );
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
   * Add or modulate .detune() for chorus warmth effect.
   * Peaks get rich detuning, breakdowns clean up.
   */
  private applyChorusDepth(pattern: string, state: GenerativeState): string {
    if (!shouldApplyChorus(this.name, state.section)) return pattern;

    const cents = chorusDepth(this.name, state.section, state.sectionProgress ?? 0);
    if (cents < 0.5) return pattern;

    if (pattern.includes('.detune(')) {
      // Modify existing detune — scale the range
      return pattern.replace(
        /\.detune\(sine\.range\(([^,]+),\s*([^)]+)\)\.slow\(([^)]+)\)\)/,
        (_match, minStr, maxStr, speed) => {
          const min = parseFloat(minStr);
          const max = parseFloat(maxStr);
          const scale = Math.max(1, cents / Math.max(1, Math.abs(max)));
          return `.detune(sine.range(${(min * scale).toFixed(1)}, ${(max * scale).toFixed(1)}).slow(${speed}))`;
        }
      );
    }

    // No existing detune — add a slow LFO detune
    // Insert before .gain() or at the end of the chain
    const detuneStr = `.detune(sine.range(${(-cents).toFixed(1)}, ${cents.toFixed(1)}).slow(7))`;
    if (pattern.includes('.gain(')) {
      return pattern.replace(/\.gain\(/, `${detuneStr}\n      .gain(`);
    }
    return pattern;
  }

  /**
   * Modulate .crush() values by section-progress offset.
   * Builds get grittier (lower bit depth), breakdowns clean up.
   */
  private applyCrushEvolution(pattern: string, state: GenerativeState): string {
    if (!shouldApplyCrushEvolution(state.section)) return pattern;
    if (!pattern.includes('.crush(')) return pattern;

    const offset = crushOffset(state.section, state.sectionProgress ?? 0);
    if (Math.abs(offset) < 0.3) return pattern;

    return pattern.replace(
      /\.crush\((\d+(?:\.\d+)?)\)/g,
      (_match, val) => {
        // Clamp crush to 4-16 range (4 = very gritty, 16 = clean)
        const crushed = Math.max(4, Math.min(16, parseFloat(val) + offset));
        return `.crush(${Math.round(crushed)})`;
      }
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
   * Scale ADSR envelope parameters by real-time tension.
   * High tension → shorter/punchier notes (staccato), low tension → longer/legato.
   * Stacks on top of section-based envelope evolution.
   */
  private applyTensionArticulation(pattern: string, state: GenerativeState): string {
    if (!shouldApplyTensionArticulation(state.mood)) return pattern;

    const tension = state.tension?.overall ?? 0.5;
    let result = pattern;

    const aMult = tensionAttackMultiplier(tension, state.mood);
    if (Math.abs(aMult - 1.0) > 0.03) {
      result = result.replace(
        /\.attack\((\d+(?:\.\d+)?)\)/g,
        (_, val) => `.attack(${(parseFloat(val) * aMult).toFixed(3)})`
      );
    }

    const dMult = tensionDecayMultiplier(tension, state.mood);
    if (Math.abs(dMult - 1.0) > 0.03) {
      result = result.replace(
        /\.decay\((\d+(?:\.\d+)?)\)/g,
        (_, val) => `.decay(${(parseFloat(val) * dMult).toFixed(3)})`
      );
    }

    const sMult = tensionSustainMultiplier(tension, state.mood);
    if (Math.abs(sMult - 1.0) > 0.03) {
      result = result.replace(
        /\.sustain\((\d+(?:\.\d+)?)\)/g,
        (_, val) => `.sustain(${(parseFloat(val) * sMult).toFixed(4)})`
      );
    }

    return result;
  }

  /**
   * Morph per-note velocity patterns with section progress.
   * Builds intensify accents, breakdowns soften them.
   */
  private applyVelocityEvolution(pattern: string, state: GenerativeState): string {
    // Only apply to patterns that have quoted gain patterns (velocity curves)
    const match = pattern.match(/\.gain\("([^"]+)"\)/);
    if (!match) return pattern;

    const progress = state.sectionProgress ?? 0;
    const velocities = evolvedVelocity(
      match[1].split(' ').length,
      state.section,
      progress
    );

    const evolved = applyVelocityEvolution(match[1], velocities);
    return pattern.replace(`.gain("${match[1]}")`, `.gain("${evolved}")`);
  }

  /**
   * Apply mood-specific metric accent pattern to velocity gains.
   * Shapes the rhythmic feel: disco backbeat, trance downbeat, etc.
   */
  private applyMetricAccent(pattern: string, state: GenerativeState): string {
    const match = pattern.match(/\.gain\("([^"]+)"\)/);
    if (!match) return pattern;

    const profile = moodAccentProfile(state.mood);
    if (profile.strength < 0.1) return pattern;

    const gains = match[1].split(' ').map(parseFloat);
    if (gains.some(isNaN)) return pattern;

    const accented = applyAccentProfile(gains, profile);
    const newGain = accented.map(v => v.toFixed(4)).join(' ');
    return pattern.replace(`.gain("${match[1]}")`, `.gain("${newGain}")`);
  }

  /**
   * Apply hemiola cross-rhythm accents (3-over-4 or clave 3+3+2).
   * Adds rhythmic tension by accenting every 3rd beat in 4/4 time.
   */
  private applyHemiola(pattern: string, state: GenerativeState): string {
    if (!shouldApplyHemiola(state.mood, state.section, state.sectionProgress ?? 0)) {
      return pattern;
    }

    const match = pattern.match(/\.gain\("([^"]+)"\)/);
    if (!match) return pattern;

    const gains = match[1].split(' ').map(parseFloat);
    if (gains.some(isNaN)) return pattern;

    const type = hemiolaType(state.mood);
    const mask = type === 'clave'
      ? claveAccentMask(gains.length)
      : hemiolaAccentMask(gains.length, 3);

    const accented = gains.map((g, i) => g * mask[i]);
    const newGain = accented.map(v => v.toFixed(4)).join(' ');
    return pattern.replace(`.gain("${match[1]}")`, `.gain("${newGain}")`);
  }

  /**
   * Modulate .slow() values for rhythmic acceleration/deceleration.
   * Arp and drums speed up during builds, slow during breakdowns.
   * Only modifies the main chain .slow(), not LFO .slow() calls.
   */
  private applyRhythmicAcceleration(pattern: string, state: GenerativeState): string {
    if (!shouldApplyRhythmicAcceleration(this.name, state.section)) return pattern;

    const mult = slowMultiplier(this.name, state.section, state.sectionProgress ?? 0);
    if (Math.abs(mult - 1.0) < 0.04) return pattern;

    // Match .slow(N) on its own line (indented) — NOT inline after .range()
    // Main chain: "      .slow(2)" — starts with whitespace
    // LFO inline: ".range(200, 800).slow(23)" — preceded by )
    return pattern.replace(
      /^(\s+)\.slow\((\d+(?:\.\d+)?)\)/m,
      (_match, indent, val) => {
        const newSlow = Math.max(0.25, parseFloat(val) * mult);
        return `${indent}.slow(${newSlow.toFixed(2)})`;
      }
    );
  }

  /**
   * Apply degradeBy() to thin patterns based on section AND layer density.
   * Combines section-based degradation (sparse intros/breakdowns) with
   * adaptive density balancing (thin secondary layers when mix is crowded).
   */
  private applyPatternDegrade(pattern: string, state: GenerativeState): string {
    if (pattern.includes('.degradeBy(')) return pattern;

    // Section-based degradation
    let amount = shouldApplyDegrade(this.name, state.section)
      ? patternDegrade(this.name, state.section, state.sectionProgress ?? 0)
      : 0;

    // Density-based degradation (additive)
    if (shouldApplyDensityBalance(this.name, state.activeLayers)) {
      amount += densityBalanceDegrade(
        this.name,
        state.activeLayers,
        state.tension?.overall ?? 0.5
      );
    }

    // Clamp total degradation
    amount = Math.min(0.7, amount);
    if (amount < 0.03) return pattern;

    // Insert .degradeBy() before .orbit()
    return pattern.replace(
      /\.orbit\((\d+)\)/,
      `.degradeBy(${amount.toFixed(2)}).orbit($1)`
    );
  }

  /**
   * Apply sidechain-style gain pumping on strong beats.
   * Creates the characteristic EDM "breathing" effect.
   * Only applies to layers that should duck (not melody or texture/drums).
   */
  private applySidechainDuck(pattern: string, state: GenerativeState): string {
    if (!shouldDuckLayer(this.name)) return pattern;
    if (!shouldApplySidechainDuck(state.mood, state.section)) return pattern;

    // Apply to quoted gain patterns (per-step velocity)
    const match = pattern.match(/\.gain\("([^"]+)"\)/);
    if (match) {
      const gains = match[1].split(' ').map(parseFloat);
      if (gains.some(isNaN)) return pattern;
      const duck = sidechainGainPattern(gains.length, state.mood, state.section);
      const ducked = gains.map((g, i) => (g * (duck[i] ?? 1.0)).toFixed(4)).join(' ');
      return pattern.replace(`.gain("${match[1]}")`, `.gain("${ducked}")`);
    }

    // Apply to single gain values — convert to per-step pattern
    const singleMatch = pattern.match(/\.gain\((\d+(?:\.\d+)?)\)/);
    if (singleMatch) {
      const base = parseFloat(singleMatch[1]);
      // Determine step count from note pattern
      const noteMatch = pattern.match(/note\("([^"]+)"\)/);
      if (noteMatch) {
        const steps = noteMatch[1].split(' ').length;
        if (steps > 1) {
          const duck = sidechainGainPattern(steps, state.mood, state.section);
          const ducked = duck.map(d => (base * d).toFixed(4)).join(' ');
          return pattern.replace(`.gain(${singleMatch[1]})`, `.gain("${ducked}")`);
        }
      }
    }

    return pattern;
  }

  /**
   * Scale FM, reverb, and delay based on how many layers are active.
   * More layers → cleaner tones, drier mix. Fewer → richer, more spacious.
   */
  private applyEnsembleThinning(pattern: string, state: GenerativeState): string {
    const count = state.activeLayers.size;
    if (!shouldApplyEnsembleThinning(count)) return pattern;

    let result = pattern;
    const mood = state.mood;

    // FM thinning
    const fmMult = ensembleFmMultiplier(count, mood);
    if (Math.abs(fmMult - 1.0) > 0.03 && result.includes('.fm(') && !result.includes('.fm(sine')) {
      result = result.replace(
        /\.fm\((\d+(?:\.\d+)?)\)/g,
        (_, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(1)})`
      );
    }

    // Room thinning
    const roomMult = ensembleRoomMultiplier(count, mood);
    if (Math.abs(roomMult - 1.0) > 0.03) {
      result = result.replace(
        /\.room\((\d+(?:\.\d+)?)\)/g,
        (_, val) => `.room(${(parseFloat(val) * roomMult).toFixed(2)})`
      );
    }

    // Delay feedback thinning
    const delayMult = ensembleDelayMultiplier(count, mood);
    if (Math.abs(delayMult - 1.0) > 0.03) {
      result = result.replace(
        /\.delayfeedback\((\d+(?:\.\d+)?)\)/g,
        (_, val) => {
          const scaled = Math.min(0.85, parseFloat(val) * delayMult);
          return `.delayfeedback(${scaled.toFixed(2)})`;
        }
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
    const nudgeValues = nudge.split(' ').map(parseFloat);

    // Blend tension-driven displacement into micro-timing
    if (shouldApplyTensionRhythm(state.mood)) {
      const tension = state.tension?.overall ?? 0.5;
      const displacement = tensionDisplacementPattern(nudgeValues.length, tension, state.mood);
      for (let i = 0; i < nudgeValues.length; i++) {
        nudgeValues[i] += displacement[i];
      }
    }

    const blended = nudgeValues.map(v => v.toFixed(4)).join(' ');
    // Insert .nudge() before .orbit() (which every layer has at the end)
    return pattern.replace(
      /\.orbit\((\d+)\)/,
      `.nudge("${blended}").orbit($1)`
    );
  }

  /**
   * Apply cadential arrival emphasis — brief gain and brightness boost
   * when a dominant chord resolves to tonic. Creates satisfying "landing" moments.
   */
  private applyArrivalEmphasis(pattern: string, state: GenerativeState): string {
    // Need previous chord from history
    if (state.chordHistory.length < 2) return pattern;
    const prev = state.chordHistory[state.chordHistory.length - 2];

    const emphasis = arrivalEmphasis(
      state.currentChord.degree,
      prev.degree,
      prev.quality,
      state.ticksSinceChordChange,
      state.mood
    );

    // Skip if no meaningful emphasis
    if (emphasis.gainBoost < 0.01 && emphasis.brightnessBoost < 0.01) return pattern;

    let result = pattern;

    // Brightness boost: open LPF further
    if (emphasis.brightnessBoost > 0.01) {
      const bMult = 1.0 + emphasis.brightnessBoost;
      result = result.replace(
        /\.lpf\((\d+(?:\.\d+)?)\)/g,
        (_match, val) => `.lpf(${Math.round(parseFloat(val) * bMult)})`
      );
    }

    // Gain boost: brief volume swell
    if (emphasis.gainBoost > 0.01) {
      result = this.applyGainMultiplier(result, 1.0 + emphasis.gainBoost);
    }

    return result;
  }

  /**
   * Shift note octaves and LPF brightness based on real-time tension.
   * High tension pushes notes up (brighter register), low tension pushes down (warmer).
   * The fractional part of the shift modulates LPF as a timbral brightness effect.
   */
  private applyTensionRegister(pattern: string, state: GenerativeState): string {
    if (!shouldApplyTensionRegister(state.mood)) return pattern;

    const tension = state.tension?.overall ?? 0.5;
    const shift = tensionRegisterShift(tension, state.mood, this.name);

    // Apply octave shift to notes in the pattern
    const intShift = Math.round(shift);
    if (intShift !== 0) {
      pattern = pattern.replace(
        /note\("([^"]+)"\)/,
        (_, noteStr) => {
          const notes = noteStr.split(' ');
          const shifted = applyRegisterShift(notes, intShift);
          return `note("${shifted.join(' ')}")`;
        }
      );
    }

    // Apply brightness factor from fractional shift to LPF
    const brightnessMult = registerBrightnessFactor(shift);
    if (Math.abs(brightnessMult - 1.0) > 0.01) {
      pattern = pattern.replace(
        /\.lpf\((\d+(?:\.\d+)?)\)/g,
        (_, val) => `.lpf(${Math.round(parseFloat(val) * brightnessMult)})`
      );
    }

    return pattern;
  }

  protected moodChanged(state: GenerativeState): boolean {
    return this.lastMood !== null && this.lastMood !== state.mood;
  }
}
