import { Layer } from '../layer';
import { GenerativeState, Section } from '../../types';
import { findSuspensions, pickBestSuspension, suspensionResolutionPair } from '../../theory/suspension';
import { getVoicingRange, applyVoicingSpread } from '../../theory/voicing-spread';
import { findGuideTones } from '../../theory/guide-tones';
import { adjustChordDensity } from '../../theory/harmonic-density';
import { stereoWidth } from '../../theory/stereo-field';
import { generateNudgePattern, shouldApplyMicroTiming } from '../../theory/micro-timing';
import { filterEnvelopeMultiplier, shouldApplyFilterEnvelope } from '../../theory/filter-envelope';
import { roomMultiplier, roomsizeMultiplier, shouldApplySpatialDepth } from '../../theory/spatial-depth';
import { delayWetMultiplier, delayFeedbackMultiplier, shouldApplyDelayEvolution } from '../../theory/delay-evolution';
import { hpfSweepOffset, shouldApplyHpfSweep } from '../../theory/hpf-sweep';
import { gainArcMultiplier, shouldApplyGainArc } from '../../theory/gain-arc';
import { resonanceSweepMultiplier, shouldApplyResonanceSweep } from '../../theory/resonance-sweep';
import { attackMultiplier, decayMultiplier, sustainMultiplier, releaseMultiplier, shouldApplyEnvelopeEvolution } from '../../theory/envelope-evolution';
import { crushOffset, shouldApplyCrushEvolution } from '../../theory/crush-evolution';
import { hpfBandOffset, lpfBandOffset, shouldApplyBandSeparation } from '../../theory/frequency-band';
import { chorusDepth, shouldApplyChorus } from '../../theory/chorus-depth';
import { patternDegrade, shouldApplyDegrade } from '../../theory/pattern-density';
import { densityBalanceDegrade, shouldApplyDensityBalance } from '../../theory/density-balance';
import { tensionBrightnessMultiplier, shouldApplyTensionBrightness } from '../../theory/tension-brightness';
import { tensionSpaceMultiplier, shouldApplyTensionSpace } from '../../theory/tension-space';
import { tensionDelayMultiplier, shouldApplyTensionDelay } from '../../theory/tension-delay';
import { arrivalEmphasis } from '../../theory/arrival-emphasis';
import { shouldUsePlaning, planedVoicing } from '../../theory/harmonic-planing';
import { fmMorphMultiplier, shouldApplyTimbralMorph } from '../../theory/timbral-morph';
import { smoothVoicing } from '../../theory/voice-leading';
import { syncedDelayTime } from '../../theory/delay-sync';
import { shouldAnimateHarmony, animateChordVoicing, voicingsToPattern } from '../../theory/harmonic-animation';
import { tensionOrchestrationGain, shouldApplyTensionOrchestration } from '../../theory/tension-orchestration';
import { tensionFmh, tensionFmIndex, shouldApplyHarmonicColor } from '../../theory/harmonic-color';
import { pickColorTone, shouldConsiderColorTones } from '../../theory/chord-color';
import { applyDrop2, applyDrop3, pickDropVoicing } from '../../theory/drop-voicing';
import { compingPattern, shouldComp } from '../../theory/comping-rhythm';
import { adjustPanRange, shouldApplyStereoPlacement } from '../../theory/stereo-placement';
import { ensembleFmMultiplier, ensembleRoomMultiplier, ensembleDelayMultiplier, shouldApplyEnsembleThinning } from '../../theory/ensemble-thinning';
import { sidechainGainPattern, shouldDuckLayer, shouldApplySidechainDuck } from '../../theory/sidechain-duck';
import { detectResolution, resolutionGlowMultiplier, resolutionGainBoost } from '../../theory/resolution-glow';
import { tensionDecayMultiplier, tensionSustainMultiplier, tensionAttackMultiplier, shouldApplyTensionArticulation } from '../../theory/tension-articulation';
import { ensembleBreathMultiplier, shouldApplyEnsembleBreath } from '../../theory/ensemble-breath';
import { planGuideTonePath, guideToneSmoothnessScore, guideToneWeight } from '../../theory/guide-tone-plan';
import { tensionRegisterShift, applyRegisterShift, registerBrightnessFactor, shouldApplyTensionRegister } from '../../theory/tension-register';
import { extensionImprovesSonority } from '../../theory/vertical-sonority';
import { applySpacingOptimization } from '../../theory/voice-spacing';
import { shouldStartChain, createChainPlan, chainSuspensionOffset, advanceChain, isChainActive } from '../../theory/suspension-chain';
import type { SuspensionChainPlan } from '../../theory/suspension-chain';
import { texturalEnvelopeMultipliers, shouldApplyTexturalContrast } from '../../theory/textural-contrast';
import { shouldApplyAmbiguity, suggestAmbiguousExtensions, ambiguityDarkenFactor } from '../../theory/tonal-ambiguity';
import { accompGravityPull, nextChordBlend, blendVoicings, shouldApplyAccompGravity } from '../../theory/accompaniment-gravity';
import { shouldApplySpectralHarmony, suggestSpectralEnrichment } from '../../theory/spectral-harmony';
import { shouldApplyQuartal, quartalVoicing, quintalVoicing, selectVoicingType, quartalVoiceCount } from '../../theory/quartal-voicing';
import { shouldApplyField, overtoneVoicing, fieldPartials, blendVoicings as blendOvertone } from '../../theory/harmonic-field';
import { shouldApplyVoicingDensity, targetVoiceCount, thinVoicing } from '../../theory/voicing-density';
import { shouldRespace, eliminateCrossings, crossingTolerance } from '../../theory/voice-crossing';
import { shouldBassHold, superpositionStrength } from '../../theory/harmonic-rhythm-layer';
import { shouldAnticipateVoice, anticipationAmount, anticipatedPitch, nearestTarget } from '../../theory/anticipatory-voice';
import { selectApproachType, approachOffset, shouldApplyApproach } from '../../theory/approach-pattern';
import { shouldHoldPedal } from '../../theory/harmonic-pedal-tone';
import { shouldApplyEllipsis, selectOmission, applyEllipsis } from '../../theory/harmonic-ellipsis';

// Section shapes harmony presence — exposed in breakdown, full in peak
const SECTION_GAIN: Record<Section, number> = {
  intro: 0.5, build: 0.8, peak: 1.0, breakdown: 0.65, groove: 0.9,
};
const SECTION_FILTER_MULT: Record<Section, number> = {
  intro: 0.7, build: 0.85, peak: 1.15, breakdown: 0.75, groove: 1.0,
};
const SECTION_ROOM_MULT: Record<Section, number> = {
  intro: 1.3, build: 1.0, peak: 0.85, breakdown: 1.4, groove: 1.0,
};

export class HarmonyLayer implements Layer {
  name = 'harmony';
  orbit = 1;
  private lastVoicing: string[] | null = null;
  private lastRoot: string | null = null;
  private suspensionChain: SuspensionChainPlan | null = null;
  private lastBassNote: string | null = null;
  private ticksSinceBassChange = 0;

  generate(state: GenerativeState): string {
    let result = this.buildPattern(state);

    // Comping rhythm: replace sustained gain with rhythmic chord stabs
    if (shouldComp(state.mood, state.section)) {
      const comp = compingPattern(8, state.mood, state.section);
      // Replace flat gain with per-step gain pattern
      result = result.replace(
        /\.gain\(([0-9.]+)\)/,
        (_, baseGain) => {
          const g = parseFloat(baseGain);
          const gains = comp.map(v => (g * v).toFixed(4)).join(' ');
          return `.gain("${gains}")`;
        }
      );
      // Switch from slow sustain to per-beat articulation
      result = result.replace(/\.slow\([2-9]\d*\)/, '.slow(1)');
    }

    // Dynamic stereo field: modulate pan range for section/tension
    result = this.modulateStereo(result, state);

    // Micro-timing: subtle timing offsets for human feel
    if (shouldApplyMicroTiming(state.mood) && !result.includes('.nudge(')) {
      const nudge = generateNudgePattern(state.mood, state.section, 8, state.tick);
      result = result.replace(/\.orbit\((\d+)\)/, `.nudge("${nudge}").orbit($1)`);
    }

    // Filter envelope: smooth LPF sweep over section duration
    if (shouldApplyFilterEnvelope(state.section)) {
      const mult = filterEnvelopeMultiplier(
        state.section,
        state.sectionProgress ?? 0,
        state.tension?.overall ?? 0.5
      );
      if (mult < 0.98) {
        result = result.replace(
          /\.lpf\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.lpf(${Math.round(parseFloat(val) * mult)})`
        );
      }
    }

    // Tension brightness: LPF tracks real-time tension
    if (shouldApplyTensionBrightness(this.name)) {
      const tbMult = tensionBrightnessMultiplier(state.tension?.overall ?? 0.5, state.mood);
      if (Math.abs(tbMult - 1.0) >= 0.03) {
        result = result.replace(
          /\.lpf\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.lpf(${Math.round(parseFloat(val) * tbMult)})`
        );
      }
    }

    // Tension register brightness: fractional register shift modulates LPF
    if (shouldApplyTensionRegister(state.mood)) {
      const regShift = tensionRegisterShift(state.tension?.overall ?? 0.5, state.mood, this.name);
      const brightMult = registerBrightnessFactor(regShift);
      if (Math.abs(brightMult - 1.0) > 0.01) {
        result = result.replace(
          /\.lpf\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.lpf(${Math.round(parseFloat(val) * brightMult)})`
        );
      }
    }

    // Tonal ambiguity darken: blur key center with darker timbre
    if (shouldApplyAmbiguity(state.mood, state.section, state.tension?.overall ?? 0.5)) {
      const darkFactor = ambiguityDarkenFactor(state.mood, state.section);
      if (darkFactor < 0.98) {
        result = result.replace(
          /\.lpf\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.lpf(${Math.round(parseFloat(val) * darkFactor)})`
        );
      }
    }

    // Resolution glow: brightness surge on harmonic resolutions
    if (state.chordHistory.length >= 1) {
      const prevCh = state.chordHistory[state.chordHistory.length - 1];
      const resType = detectResolution(prevCh.degree, prevCh.quality, state.currentChord.degree);
      if (resType !== 'none') {
        const glowMult = resolutionGlowMultiplier(resType, state.mood, state.ticksSinceChordChange);
        if (glowMult > 1.01) {
          result = result.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * glowMult)})`
          );
        }
      }
    }

    // Resonance sweep: filter Q rises in builds, drops in breakdowns
    if (shouldApplyResonanceSweep(state.section) && result.includes('.resonance(')) {
      const resMult = resonanceSweepMultiplier(state.section, state.sectionProgress ?? 0);
      if (Math.abs(resMult - 1.0) >= 0.03) {
        result = result.replace(
          /\.resonance\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.resonance(${Math.round(parseFloat(val) * resMult)})`
        );
      }
    }

    // Spatial depth: reverb breathes with section progress
    if (shouldApplySpatialDepth(state.section)) {
      const progress = state.sectionProgress ?? 0;
      const tension = state.tension?.overall ?? 0.5;
      const rMult = roomMultiplier(state.section, progress, tension);
      const sMult = roomsizeMultiplier(state.section, progress);
      if (Math.abs(rMult - 1.0) > 0.02) {
        result = result.replace(
          /\.room\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.room(${(parseFloat(val) * rMult).toFixed(2)})`
        );
      }
      if (Math.abs(sMult - 1.0) > 0.02) {
        result = result.replace(
          /\.roomsize\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.roomsize(${(parseFloat(val) * sMult).toFixed(1)})`
        );
      }
    }

    // Tension space: reverb tracks real-time tension
    if (shouldApplyTensionSpace(this.name)) {
      const tsMult = tensionSpaceMultiplier(state.tension?.overall ?? 0.5, state.mood);
      if (Math.abs(tsMult - 1.0) >= 0.03) {
        result = result.replace(
          /\.room\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.room(${(parseFloat(val) * tsMult).toFixed(2)})`
        );
        result = result.replace(
          /\.roomsize\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.roomsize(${(parseFloat(val) * tsMult).toFixed(1)})`
        );
      }
    }

    // Delay sync: replace fixed delay times with tempo-synced values
    if (result.includes('.delaytime(') && state.params.tempo > 0) {
      const synced = syncedDelayTime(state.mood, state.params.tempo);
      result = result.replace(
        /\.delaytime\((\d+(?:\.\d+)?)\)/g,
        () => `.delaytime(${synced.toFixed(4)})`
      );
    }

    // Delay evolution: echo intensity evolves with section
    if (shouldApplyDelayEvolution(state.section) && result.includes('.delay(')) {
      const progress = state.sectionProgress ?? 0;
      const wetMult = delayWetMultiplier(state.section, progress);
      const fbMult = delayFeedbackMultiplier(state.section, progress);
      if (Math.abs(wetMult - 1.0) > 0.02) {
        result = result.replace(
          /\.delay\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.delay(${Math.min(1.0, parseFloat(val) * wetMult).toFixed(2)})`
        );
      }
      if (Math.abs(fbMult - 1.0) > 0.02) {
        result = result.replace(
          /\.delayfeedback\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.delayfeedback(${Math.min(0.85, parseFloat(val) * fbMult).toFixed(2)})`
        );
      }
    }

    // Tension delay: echo feedback tracks real-time tension
    if (shouldApplyTensionDelay(this.name) && result.includes('.delayfeedback(')) {
      const tdMult = tensionDelayMultiplier(state.tension?.overall ?? 0.5, state.mood);
      if (Math.abs(tdMult - 1.0) >= 0.03) {
        result = result.replace(
          /\.delayfeedback\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.delayfeedback(${Math.min(0.85, parseFloat(val) * tdMult).toFixed(2)})`
        );
      }
    }

    // Frequency band separation: tighten HPF/LPF when many layers active
    if (shouldApplyBandSeparation(state.activeLayers)) {
      const hpfOff = hpfBandOffset(this.name, state.activeLayers);
      const lpfOff = lpfBandOffset(this.name, state.activeLayers);
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
    }

    // HPF sweep: build-up tension via rising high-pass filter
    if (shouldApplyHpfSweep(state.section) && result.includes('.hpf(')) {
      const offset = hpfSweepOffset(state.section, state.sectionProgress ?? 0);
      if (offset >= 5) {
        result = result.replace(
          /\.hpf\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.hpf(${Math.round(parseFloat(val) + offset)})`
        );
      }
    }

    // Chorus depth: detuning adds warmth at peaks
    if (shouldApplyChorus('harmony', state.section)) {
      const cents = chorusDepth('harmony', state.section, state.sectionProgress ?? 0);
      if (cents >= 0.5) {
        if (result.includes('.detune(')) {
          result = result.replace(
            /\.detune\(sine\.range\(([^,]+),\s*([^)]+)\)\.slow\(([^)]+)\)\)/,
            (_match, minStr, maxStr, speed) => {
              const min = parseFloat(minStr);
              const max = parseFloat(maxStr);
              const scale = Math.max(1, cents / Math.max(1, Math.abs(max)));
              return `.detune(sine.range(${(min * scale).toFixed(1)}, ${(max * scale).toFixed(1)}).slow(${speed}))`;
            }
          );
        } else if (result.includes('.gain(')) {
          const detuneStr = `.detune(sine.range(${(-cents).toFixed(1)}, ${cents.toFixed(1)}).slow(7))`;
          result = result.replace(/\.gain\(/, `${detuneStr}\n          .gain(`);
        }
      }
    }

    // Crush evolution: bit depth modulates for digital character
    if (shouldApplyCrushEvolution(state.section) && result.includes('.crush(')) {
      const cOffset = crushOffset(state.section, state.sectionProgress ?? 0);
      if (Math.abs(cOffset) >= 0.3) {
        result = result.replace(
          /\.crush\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => {
            const crushed = Math.max(4, Math.min(16, parseFloat(val) + cOffset));
            return `.crush(${Math.round(crushed)})`;
          }
        );
      }
    }

    // Timbral morph: FM index evolves within sections (builds brighten, breakdowns warm)
    if (shouldApplyTimbralMorph(state.section) && result.includes('.fm(')) {
      const fmMult = fmMorphMultiplier(state.section, state.sectionProgress ?? 0);
      if (Math.abs(fmMult - 1.0) > 0.03) {
        result = result.replace(
          /\.fm\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(1)})`
        );
      }
    }

    // Harmonic color: FM parameters respond to tension
    if (shouldApplyHarmonicColor(state.mood)) {
      const tension = state.tension?.overall ?? 0.5;
      if (result.includes('.fmh(')) {
        result = result.replace(
          /\.fmh\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.fmh(${tensionFmh(parseFloat(val), tension, state.mood).toFixed(2)})`
        );
      }
      if (result.includes('.fm(') && !result.includes('.fm(sine')) {
        const fmMult = tensionFmIndex(tension, state.mood);
        if (Math.abs(fmMult - 1.0) > 0.03) {
          result = result.replace(
            /\.fm\((\d+(?:\.\d+)?)\)/g,
            (_match, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(1)})`
          );
        }
      }
    }

    // Envelope evolution: full ADSR evolves with section progress
    if (shouldApplyEnvelopeEvolution(state.section)) {
      const progress = state.sectionProgress ?? 0;
      const aMult = attackMultiplier(state.section, progress);
      const dMult = decayMultiplier(state.section, progress);
      const sMult = sustainMultiplier(state.section, progress);
      const rMult = releaseMultiplier(state.section, progress);
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
    }

    // Tension articulation: note length tracks real-time tension arc
    if (shouldApplyTensionArticulation(state.mood)) {
      const tension = state.tension?.overall ?? 0.5;
      const taMult = tensionAttackMultiplier(tension, state.mood);
      if (Math.abs(taMult - 1.0) > 0.03) {
        result = result.replace(
          /\.attack\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.attack(${(parseFloat(val) * taMult).toFixed(3)})`
        );
      }
      const tdMult = tensionDecayMultiplier(tension, state.mood);
      if (Math.abs(tdMult - 1.0) > 0.03) {
        result = result.replace(
          /\.decay\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.decay(${(parseFloat(val) * tdMult).toFixed(3)})`
        );
      }
      const tsMult = tensionSustainMultiplier(tension, state.mood);
      if (Math.abs(tsMult - 1.0) > 0.03) {
        result = result.replace(
          /\.sustain\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.sustain(${(parseFloat(val) * tsMult).toFixed(4)})`
        );
      }
    }

    // Textural contrast: differentiate ADSR between layers
    if (shouldApplyTexturalContrast(state.mood, state.activeLayers)) {
      const tcMult = texturalEnvelopeMultipliers(this.name, state.section, state.mood, state.activeLayers);
      if (Math.abs(tcMult.attack - 1.0) > 0.02) {
        result = result.replace(
          /\.attack\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.attack(${(parseFloat(val) * tcMult.attack).toFixed(3)})`
        );
      }
      if (Math.abs(tcMult.decay - 1.0) > 0.02) {
        result = result.replace(
          /\.decay\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.decay(${(parseFloat(val) * tcMult.decay).toFixed(3)})`
        );
      }
      if (Math.abs(tcMult.sustain - 1.0) > 0.02) {
        result = result.replace(
          /\.sustain\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.sustain(${(parseFloat(val) * tcMult.sustain).toFixed(4)})`
        );
      }
      if (Math.abs(tcMult.release - 1.0) > 0.02) {
        result = result.replace(
          /\.release\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.release(${(parseFloat(val) * tcMult.release).toFixed(3)})`
        );
      }
    }

    // Sidechain ducking: rhythmic gain pump on strong beats
    if (shouldDuckLayer(this.name) && shouldApplySidechainDuck(state.mood, state.section)) {
      const singleGainMatch = result.match(/\.gain\((\d+(?:\.\d+)?)\)/);
      const noteMatch = result.match(/note\("([^"]+)"\)/);
      if (singleGainMatch && noteMatch) {
        const base = parseFloat(singleGainMatch[1]);
        const steps = noteMatch[1].split(' ').length;
        if (steps > 1) {
          const duck = sidechainGainPattern(steps, state.mood, state.section);
          const ducked = duck.map(d => (base * d).toFixed(4)).join(' ');
          result = result.replace(`.gain(${singleGainMatch[1]})`, `.gain("${ducked}")`);
        }
      }
      const quotedGainMatch = result.match(/\.gain\("([^"]+)"\)/);
      if (quotedGainMatch && !singleGainMatch) {
        const gains = quotedGainMatch[1].split(' ').map(parseFloat);
        if (!gains.some(isNaN)) {
          const duck = sidechainGainPattern(gains.length, state.mood, state.section);
          const ducked = gains.map((g, i) => (g * (duck[i] ?? 1.0)).toFixed(4)).join(' ');
          result = result.replace(`.gain("${quotedGainMatch[1]}")`, `.gain("${ducked}")`);
        }
      }
    }

    // Ensemble thinning: reduce FM/reverb/delay when many layers play
    const layerCount = state.activeLayers.size;
    if (shouldApplyEnsembleThinning(layerCount)) {
      const mood = state.mood;
      const etFmMult = ensembleFmMultiplier(layerCount, mood);
      if (Math.abs(etFmMult - 1.0) > 0.03 && result.includes('.fm(') && !result.includes('.fm(sine')) {
        result = result.replace(
          /\.fm\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.fm(${(parseFloat(val) * etFmMult).toFixed(1)})`
        );
      }
      const etRoomMult = ensembleRoomMultiplier(layerCount, mood);
      if (Math.abs(etRoomMult - 1.0) > 0.03) {
        result = result.replace(
          /\.room\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.room(${(parseFloat(val) * etRoomMult).toFixed(2)})`
        );
      }
      const etDelayMult = ensembleDelayMultiplier(layerCount, mood);
      if (Math.abs(etDelayMult - 1.0) > 0.03) {
        result = result.replace(
          /\.delayfeedback\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.delayfeedback(${Math.min(0.85, parseFloat(val) * etDelayMult).toFixed(2)})`
        );
      }
    }

    // Pattern degradation: section-based + density-based thinning
    if (!result.includes('.degradeBy(')) {
      let degradeAmount = shouldApplyDegrade(this.name, state.section)
        ? patternDegrade(this.name, state.section, state.sectionProgress ?? 0)
        : 0;
      if (shouldApplyDensityBalance(this.name, state.activeLayers)) {
        degradeAmount += densityBalanceDegrade(this.name, state.activeLayers, state.tension?.overall ?? 0.5);
      }
      degradeAmount = Math.min(0.7, degradeAmount);
      if (degradeAmount >= 0.03) {
        result = result.replace(
          /\.orbit\((\d+)\)/,
          `.degradeBy(${degradeAmount.toFixed(2)}).orbit($1)`
        );
      }
    }

    // Gain arc: crescendo/decrescendo within sections
    if (shouldApplyGainArc(state.section)) {
      const arcMult = gainArcMultiplier(state.section, state.sectionProgress ?? 0);
      if (Math.abs(arcMult - 1.0) >= 0.03) {
        result = result.replace(
          /\.gain\(([^)]+)\)/,
          (_, gainExpr) => {
            const num = parseFloat(gainExpr);
            if (!isNaN(num)) return `.gain(${(num * arcMult).toFixed(4)})`;
            return `.gain((${gainExpr}) * ${arcMult.toFixed(4)})`;
          }
        );
      }
    }

    // Arrival emphasis: cadential resolution accent (gain + brightness boost)
    if (state.chordHistory.length >= 2) {
      const prev = state.chordHistory[state.chordHistory.length - 2];
      const emphasis = arrivalEmphasis(
        state.currentChord.degree,
        prev.degree,
        prev.quality,
        state.ticksSinceChordChange,
        state.mood
      );
      if (emphasis.brightnessBoost > 0.01) {
        const bMult = 1.0 + emphasis.brightnessBoost;
        result = result.replace(
          /\.lpf\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.lpf(${Math.round(parseFloat(val) * bMult)})`
        );
      }
      if (emphasis.gainBoost > 0.01) {
        result = result.replace(
          /\.gain\(([^)]+)\)/,
          (_, gainExpr) => {
            const num = parseFloat(gainExpr);
            if (!isNaN(num)) return `.gain(${(num * (1.0 + emphasis.gainBoost)).toFixed(4)})`;
            return `.gain((${gainExpr}) * ${(1.0 + emphasis.gainBoost).toFixed(4)})`;
          }
        );
      }
    }

    let combinedMultiplier = state.layerGainMultipliers[this.name] ?? 1.0;
    if (shouldApplyTensionOrchestration(state.mood)) {
      combinedMultiplier *= tensionOrchestrationGain(
        this.name, state.tension?.overall ?? 0.5, state.mood
      );
    }
    if (shouldApplyEnsembleBreath(state.mood)) {
      combinedMultiplier *= ensembleBreathMultiplier(state.tick, state.mood, state.section);
    }

    if (Math.abs(combinedMultiplier - 1.0) > 0.02) {
      return result.replace(
        /\.gain\(([^)]+)\)/,
        (_, gainExpr) => {
          const num = parseFloat(gainExpr);
          if (!isNaN(num)) return `.gain(${(num * combinedMultiplier).toFixed(4)})`;
          return `.gain((${gainExpr}) * ${combinedMultiplier.toFixed(4)})`;
        }
      );
    }
    return result;
  }

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
        if (applyPlacement) {
          [min, max] = adjustPanRange(min, max, this.name, state.mood);
        }
        return `.pan(sine.range(${min.toFixed(2)}, ${max.toFixed(2)}).slow(${speed}))`;
      }
    );
  }

  private buildPattern(state: GenerativeState): string {
    const chord = state.currentChord;
    const mood = state.mood;
    const sectionGain = SECTION_GAIN[state.section];
    const sectionFilter = SECTION_FILTER_MULT[state.section];
    const sectionRoom = SECTION_ROOM_MULT[state.section];
    const tension = state.tension?.overall ?? 0.5;
    // Tension opens filters (+15%), reduces reverb (-20%), and adds presence
    const gain = 0.23 * (0.5 + state.params.density * 0.5) * sectionGain * (0.9 + tension * 0.15);
    const room = (0.4 + state.params.spaciousness * 0.4) * sectionRoom * (1.1 - tension * 0.2);
    const brightness = state.params.brightness * sectionFilter * (0.85 + tension * 0.3);

    // Harmonic planing: sometimes shift the previous voicing in parallel
    // instead of computing a new voicing (impressionist color)
    let usedPlaning = false;
    if (state.chordChanged && this.lastVoicing && this.lastRoot &&
        this.lastRoot !== chord.root && shouldUsePlaning(mood, state.section)) {
      const planed = planedVoicing(this.lastVoicing, chord.root, this.lastRoot);
      if (planed && planed.length > 0) {
        // Store for next time and use planed voicing
        this.lastVoicing = planed;
        this.lastRoot = chord.root;
        const chordStart = `note("${planed.join(' ')}")`;
        // Skip all the voicing logic below and go straight to sound
        usedPlaning = true;
        return this.buildSoundChain(chordStart, mood, gain, brightness, room);
      }
    }

    // Check for suspension opportunity at chord changes
    let chordNotes = chord.notes;
    let hasSuspension = false;
    let susResolutionVoicings: [string[], string[]] | null = null;
    if (state.chordChanged && state.chordHistory.length > 0) {
      const prevNotes = state.chordHistory[state.chordHistory.length - 1].notes;
      const suspensions = findSuspensions(prevNotes, chordNotes);
      const best = pickBestSuspension(suspensions);
      if (best && Math.random() < 0.4) { // 40% chance to use suspension
        // Create sus → resolve voicing pair for time-split pattern
        const pair = suspensionResolutionPair(chordNotes, best);
        if (pair) {
          susResolutionVoicings = pair;
          chordNotes = pair[0]; // Use suspended voicing for downstream processing
          hasSuspension = true;
        }
      }
    }

    // Quartal/quintal voicing: replace tertial with 4th/5th-stacked chords
    if (!hasSuspension && shouldApplyQuartal(state.tick, mood, state.section)) {
      const voiceType = selectVoicingType(mood, state.tick);
      const voices = quartalVoiceCount(state.section);
      const rootName = chord.root;
      chordNotes = voiceType === 'quartal'
        ? quartalVoicing(rootName, 3, voices)
        : quintalVoicing(rootName, 3, voices);
    }

    // Harmonic field: overtone-series voicings for luminous sonority
    if (!hasSuspension && shouldApplyField(state.tick, mood, state.section)) {
      const partials = fieldPartials(mood, state.section);
      const overtones = overtoneVoicing(chord.root, 3, partials);
      chordNotes = blendOvertone(chordNotes, overtones, 0.4);
    }

    // Harmonic ellipsis: omit a chord tone for sparse/hollow voicing
    if (!hasSuspension && shouldApplyEllipsis(state.tick, mood, state.section, chordNotes.length)) {
      const omitIdx = selectOmission(chord.quality, state.tick, mood);
      if (omitIdx !== null && omitIdx < chordNotes.length) {
        chordNotes = applyEllipsis(chordNotes, omitIdx);
      }
    }

    // Apply voicing spread — wider at peaks, tighter at breakdowns
    const voicingRange = getVoicingRange(state.section, tension);
    const isSusChord = chord.quality === 'sus2' || chord.quality === 'sus4' || hasSuspension;
    if (isSusChord) {
      chordNotes = applyVoicingSpread(chordNotes, voicingRange);
    }

    // Guide tone anticipation — subtly pull inner voice toward next chord
    // Only nudge inner voices (index > 0), never the root
    // Probability scales with guide tone smoothness and mood preference
    if (state.nextChordHint && !hasSuspension) {
      const gtPath = planGuideTonePath(
        chord.root, chord.quality,
        state.nextChordHint.root, state.nextChordHint.quality
      );
      const smoothness = guideToneSmoothnessScore(gtPath);
      const weight = guideToneWeight(mood);
      // Smooth paths get anticipated more often (up to ~40% for lofi with smooth motion)
      const anticipateProb = smoothness * weight * 0.65;
      if (Math.random() < anticipateProb) {
        const guides = findGuideTones(chordNotes, state.nextChordHint.notes);
        if (guides.length > 0) {
          const guide = guides[0];
          const guideIdx = chordNotes.findIndex(n => n === guide.current);
          if (guideIdx > 0 && guide.current !== guide.next) {
            chordNotes = [...chordNotes];
            chordNotes[guideIdx] = guide.next;
          }
        }
      }
    }

    // Suspension chains: cascading suspensions for continuous voice-leading tension
    if (state.chordChanged && !hasSuspension) {
      if (isChainActive(this.suspensionChain)) {
        const offset = chainSuspensionOffset(this.suspensionChain!);
        if (offset && chordNotes.length >= 3) {
          // Apply suspension to the 2nd voice (inner voice, not root or top)
          const susIdx = 1;
          const rootMatch = chordNotes[0].match(/^([A-G](?:b|#)?)(\d+)$/);
          if (rootMatch) {
            const rootMidi = noteNameToMidi(rootMatch[1]);
            const octave = parseInt(rootMatch[2]);
            const susMidi = rootMidi + offset.suspended;
            const susNote = midiToNoteName(susMidi % 12) + (octave + Math.floor(susMidi / 12));
            chordNotes = [...chordNotes];
            chordNotes[susIdx] = susNote;
          }
          advanceChain(this.suspensionChain!);
        }
      } else if (shouldStartChain(mood, state.section, this.suspensionChain)) {
        this.suspensionChain = createChainPlan(mood);
      }
    }

    // Harmonic density: richer chords at peaks, simpler at breakdowns
    chordNotes = adjustChordDensity(chordNotes, state.scale.notes, state.section, tension);

    // Chord color tones: add characteristic color notes (lydian #11, dorian 6, etc.)
    // Gated by vertical sonority analysis — only add if it moves toward target roughness
    if (shouldConsiderColorTones(mood) && !hasSuspension) {
      const topOctave = parseInt((chordNotes[chordNotes.length - 1] || '').replace(/[^\d]/g, '') || '4');
      const colorTone = pickColorTone(chord.root, chord.quality, state.scale.notes, mood, topOctave);
      if (colorTone && !chordNotes.includes(colorTone) &&
          extensionImprovesSonority(chordNotes, colorTone, mood, state.section)) {
        chordNotes = [...chordNotes, colorTone];
      }
    }

    // Tonal ambiguity: add notes that blur the key center (dreamy moods)
    if (shouldApplyAmbiguity(mood, state.section, tension) && !hasSuspension) {
      const ambiguousNotes = suggestAmbiguousExtensions(chordNotes, state.scale.notes);
      if (ambiguousNotes.length > 0) {
        // Add one ambiguous extension in the upper register
        const topOct = parseInt((chordNotes[chordNotes.length - 1] || '').replace(/[^\d]/g, '') || '4');
        const ext = `${ambiguousNotes[0]}${topOct}`;
        if (!chordNotes.includes(ext)) {
          chordNotes = [...chordNotes, ext];
        }
      }
    }

    // Spectral harmony: add overtone-series extensions for luminous voicings
    if (shouldApplySpectralHarmony(state.tick, mood, state.section) && !hasSuspension) {
      const existingPCs = chordNotes.map(n => n.replace(/\d+$/, '')) as import('../../types').NoteName[];
      const spectralNotes = suggestSpectralEnrichment(chord.root, existingPCs, 1);
      if (spectralNotes.length > 0) {
        const topOct = parseInt((chordNotes[chordNotes.length - 1] || '').replace(/[^\d]/g, '') || '4');
        const ext = `${spectralNotes[0]}${topOct}`;
        if (!chordNotes.includes(ext)) {
          chordNotes = [...chordNotes, ext];
        }
      }
    }

    // Smooth voice leading: minimize total voice movement from previous voicing
    if (this.lastVoicing && this.lastVoicing.length > 0 && state.chordChanged) {
      chordNotes = smoothVoicing(this.lastVoicing, chordNotes);
    }

    // Drop voicings: widen chords by dropping inner voices down an octave
    const dropType = pickDropVoicing(mood, state.section, chordNotes.length);
    if (dropType === 'drop2') {
      chordNotes = applyDrop2(chordNotes);
    } else if (dropType === 'drop3') {
      chordNotes = applyDrop3(chordNotes);
    }

    // Voice spacing: ensure good intervallic spacing (wide in bass, close OK in treble)
    chordNotes = applySpacingOptimization(chordNotes, mood);

    // Tension register: shift voicing octave based on real-time tension
    if (shouldApplyTensionRegister(mood)) {
      const regShift = tensionRegisterShift(tension, mood, this.name);
      chordNotes = applyRegisterShift(chordNotes, regShift);
    }

    // Accompaniment gravity: lean toward next chord before it arrives
    if (state.nextChordHint && shouldApplyAccompGravity(mood)) {
      const pull = accompGravityPull(
        state.ticksSinceChordChange, 8, mood, state.section
      );
      if (pull > 0.05) {
        const blend = nextChordBlend(pull);
        chordNotes = blendVoicings(chordNotes, state.nextChordHint.notes, blend);
      }
    }

    // Store voicing for future planing
    this.lastVoicing = [...chordNotes];
    this.lastRoot = chord.root;

    // Use raw notes for sus2/sus4, suspensions, spread voicings, extended chords,
    // or when smooth voice leading was applied (to preserve the optimized voicing)
    const useRawNotes = chord.quality === 'sus2' || chord.quality === 'sus4'
      || hasSuspension || chordNotes.length > chord.notes.length
      || chord.quality === 'add9' || chord.quality === 'min9';

    // Suspension resolution: sus → resolve within one cycle
    if (hasSuspension && susResolutionVoicings) {
      const chordStart = `note("${voicingsToPattern(susResolutionVoicings)}")`;
      return this.buildSoundChain(chordStart, mood, gain, brightness, room);
    }

    // Voicing density: thin chord to target voice count based on tension/section
    if (shouldApplyVoicingDensity(mood)) {
      const voices = targetVoiceCount(mood, state.section, tension);
      chordNotes = thinVoicing(chordNotes, voices);
    }

    // Voice-crossing: eliminate crossings when they exceed mood tolerance
    if (useRawNotes && chordNotes.length >= 3 && crossingTolerance(mood) < 0.5) {
      const NOTE_PC_VC: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const midiPitches = chordNotes.map(n => {
        const name = n.replace(/\d+$/, '');
        const oct = parseInt(n.match(/\d+$/)?.[0] ?? '4');
        return (NOTE_PC_VC[name] ?? 0) + oct * 12;
      });
      if (shouldRespace(midiPitches, mood)) {
        const sorted = eliminateCrossings(midiPitches);
        const pcNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        chordNotes = sorted.map(m => `${pcNames[m % 12]}${Math.floor(m / 12)}`);
      }
    }

    // Harmonic rhythm superposition: bass holds longer than inner voices
    if (useRawNotes && chordNotes.length >= 2 && superpositionStrength(mood) > 0.12) {
      this.ticksSinceBassChange++;
      const bassNote = chordNotes[chordNotes.length - 1]; // lowest note
      if (this.lastBassNote && state.chordChanged &&
          shouldBassHold(mood, state.section, this.ticksSinceBassChange, state.tick)) {
        // Keep previous bass note (pedal effect)
        chordNotes[chordNotes.length - 1] = this.lastBassNote;
      } else if (state.chordChanged) {
        this.lastBassNote = bassNote;
        this.ticksSinceBassChange = 0;
      }
    }

    // Harmonic pedal tone: sustain bass through multiple chord changes
    if (useRawNotes && chordNotes.length >= 2 && this.lastBassNote && state.chordChanged) {
      if (shouldHoldPedal(mood, state.section, this.ticksSinceBassChange, state.tick)) {
        chordNotes[chordNotes.length - 1] = this.lastBassNote;
      }
    }

    // Anticipatory voice leading: inner voices lean toward next chord
    if (useRawNotes && chordNotes.length >= 3 &&
        shouldAnticipateVoice(mood, state.ticksSinceChordChange ?? 99)) {
      const NOTE_PC_AV: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const amount = anticipationAmount(
        state.ticksSinceChordChange ?? 99, mood, state.section
      );
      if (amount > 0.05 && state.chordHistory.length > 0) {
        const prevChordNotes = state.chordHistory[state.chordHistory.length - 1].notes;
        const targetPcs = prevChordNotes
          .map(n => NOTE_PC_AV[n.replace(/\d+$/, '')])
          .filter((pc): pc is number => pc !== undefined);
        const pcNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        // Move inner voices (not first or last) toward targets
        for (let vi = 1; vi < chordNotes.length - 1; vi++) {
          const name = chordNotes[vi].replace(/\d+$/, '');
          const oct = parseInt(chordNotes[vi].match(/\d+$/)?.[0] ?? '4');
          const pc = NOTE_PC_AV[name];
          if (pc === undefined) continue;
          const midi = pc + oct * 12;
          const tpc = nearestTarget(pc, targetPcs);
          const targetMidi = tpc + oct * 12;
          const anticipated = anticipatedPitch(midi, targetMidi, amount);
          if (anticipated !== midi) {
            chordNotes[vi] = `${pcNames[anticipated % 12]}${Math.floor(anticipated / 12)}`;
          }
        }
      }
    }

    // Approach pattern: systematic approach motion before chord changes
    if (useRawNotes && chordNotes.length >= 3 &&
        shouldApplyApproach(mood, state.section) &&
        state.nextChordHint && (state.ticksSinceChordChange ?? 0) >= 2) {
      const NOTE_PC_AP: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const pcNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const nextRootPc = NOTE_PC_AP[state.nextChordHint.root] ?? 0;
      const aType = selectApproachType(mood, state.tick);
      if (aType !== 'direct') {
        // Apply to one inner voice
        for (let vi = 1; vi < Math.min(chordNotes.length - 1, 3); vi++) {
          const name = chordNotes[vi].replace(/\d+$/, '');
          const oct = parseInt(chordNotes[vi].match(/\d+$/)?.[0] ?? '4');
          const pc = NOTE_PC_AP[name];
          if (pc === undefined) continue;
          const dist = nextRootPc - pc;
          const offset = approachOffset(aType, dist);
          if (offset !== 0) {
            const newPc = ((pc + offset) % 12 + 12) % 12;
            chordNotes[vi] = `${pcNames[newPc]}${oct}`;
            break; // only one voice
          }
        }
      }
    }

    // Harmonic animation: inner voices move to neighbor tones within held chords
    // Only applies to raw note voicings with 3+ notes
    if (useRawNotes && chordNotes.length >= 3 &&
        shouldAnimateHarmony(mood, state.section)) {
      const voicings = animateChordVoicing(chordNotes, state.scale.notes, 4);
      const chordStart = `note("${voicingsToPattern(voicings)}")`;
      return this.buildSoundChain(chordStart, mood, gain, brightness, room);
    }

    const chordStart = useRawNotes
      ? `note("${chordNotes.join(' ')}")`
      : `chord("${chord.symbol}").voicing()`;

    return this.buildSoundChain(chordStart, mood, gain, brightness, room);
  }

  private buildSoundChain(chordStart: string, mood: import('../../types').Mood, gain: number, brightness: number, room: number): string {
    switch (mood) {
      case 'ambient':
        // Ethereal glass pad — high harmonicity FM creates bell/shimmer overtones
        // Slowly breathing FM index for organic evolution, long sustain for pad feel
        return `${chordStart}
          .sound("sine")
          .fm(sine.range(${(1 + brightness).toFixed(1)}, ${(2.5 + brightness * 2).toFixed(1)}).slow(19))
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.8)
          .attack(0.3)
          .decay(2)
          .sustain(0.4)
          .release(1.5)
          .slow(4)
          .gain(${(gain * 0.7).toFixed(3)})
          .hpf(220)
          .lpf(sine.range(${(600 + brightness * 400).toFixed(0)}, ${(1200 + brightness * 1200).toFixed(0)}).slow(13))
          .pan(sine.range(0.15, 0.85).slow(11))
          .detune(sine.range(-1, 1).slow(17))
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(3)
          .orbit(${this.orbit})`;

      case 'downtempo':
        // Warm electric piano — GM Rhodes with stereo shimmer
        return `${chordStart}
          .sound("gm_epiano1")
          .attack(0.005)
          .decay(1)
          .sustain(0.08)
          .release(0.5)
          .slow(2)
          .gain(${gain.toFixed(3)})
          .hpf(200)
          .lpf(sine.range(${(1500 + brightness * 1000).toFixed(0)}, ${(3000 + brightness * 2000).toFixed(0)}).slow(7))
          .pan(sine.range(0.3, 0.7).slow(5))
          .room(${room.toFixed(2)})
          .roomsize(3)
          .delay(0.18)
          .delaytime(0.375)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;

      case 'lofi':
        // Lofi Rhodes — GM electric piano with bit crush and tape wobble
        return `${chordStart}
          .sound("gm_epiano1")
          .attack(0.003)
          .decay(0.5)
          .sustain(0.08)
          .release(0.3)
          .slow(2)
          .gain(${(gain * 1.1).toFixed(3)})
          .hpf(250)
          .lpf(${(1200 + brightness * 2500).toFixed(0)})
          .crush(${(12 + brightness * 4).toFixed(0)})
          .detune(sine.range(-3, 3).slow(5))
          .pan(sine.range(0.3, 0.7).slow(7))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(1.5)
          .orbit(${this.orbit})`;

      case 'trance':
        // Massive supersaw — wide detuned sawtooth with pumping filter
        // Higher sustain for wall-of-sound, resonant filter sweep
        return `${chordStart}
          .sound("sawtooth")
          .attack(0.03)
          .decay(0.2)
          .sustain(0.5)
          .release(0.15)
          .slow(1)
          .gain(${(gain * 0.9).toFixed(3)})
          .hpf(250)
          .lpf(sine.range(${(800 + brightness * 1500).toFixed(0)}, ${(2500 + brightness * 4500).toFixed(0)}).slow(3))
          .resonance(${(4 + brightness * 4).toFixed(0)})
          .detune(sine.range(-8, 8).slow(2))
          .pan(sine.range(0.2, 0.8).slow(4))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .delay(0.22)
          .delaytime(0.341)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;

      case 'avril':
        // Intimate piano — GM acoustic piano with heavy reverb and delay
        return `${chordStart}
          .sound("gm_piano")
          .attack(0.005)
          .decay(1.5)
          .sustain(0.04)
          .release(1)
          .slow(3)
          .gain(${(gain * 0.8).toFixed(3)})
          .hpf(220)
          .lpf(sine.range(${(1200 + brightness * 800).toFixed(0)}, ${(2500 + brightness * 1500).toFixed(0)}).slow(11))
          .pan(sine.range(0.3, 0.7).slow(9))
          .room(${(room * 0.7).toFixed(2)})
          .roomsize(2.5)
          .delay(0.25)
          .delaytime(0.5)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;

      case 'xtal':
        // Lush warm pad — very slow attack, wide stereo, moderate reverb
        // SAW 85-92: dreamy, washed-out, nostalgic warmth
        return `${chordStart}
          .sound("sine")
          .fm(sine.range(${(1 + brightness * 0.5).toFixed(1)}, ${(2 + brightness * 1).toFixed(1)}).slow(21))
          .fmh(2)
          .fmenv("exp")
          .fmdecay(1.2)
          .attack(1.2)
          .decay(3)
          .sustain(0.5)
          .release(2)
          .slow(5)
          .gain(${(gain * 0.6).toFixed(3)})
          .hpf(180)
          .lpf(sine.range(${(700 + brightness * 400).toFixed(0)}, ${(1200 + brightness * 1000).toFixed(0)}).slow(17))
          .pan(sine.range(0.1, 0.9).slow(13))
          .detune(sine.range(-2, 2).slow(11))
          .room(${(room * 0.7).toFixed(2)})
          .roomsize(3)
          .delay(0.3)
          .delaytime(0.5)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;

      case 'syro':
        // Glitchy FM bell/pluck — triangle carrier for contrast with sine melody
        return `${chordStart}
          .sound("triangle")
          .fm(${(3 + brightness * 2).toFixed(1)})
          .fmh(5)
          .fmenv("exp")
          .fmdecay(0.03)
          .attack(0.001)
          .decay(0.25)
          .sustain(0.03)
          .release(0.15)
          .slow(1)
          .gain(${(gain * 0.75).toFixed(3)})
          .hpf(200)
          .lpf(${(2500 + brightness * 3000).toFixed(0)})
          .crush(${(8 + brightness * 2).toFixed(0)})
          .pan(sine.range(0.1, 0.9).slow(2))
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1)
          .delay(0.4)
          .delaytime(0.1875)
          .delayfeedback(0.45)
          .orbit(${this.orbit})`;

      case 'blockhead':
        // Warm organ — GM rock organ, cinematic hip-hop feel
        return `${chordStart}
          .sound("gm_rock_organ")
          .attack(0.005)
          .decay(1.0)
          .sustain(0.1)
          .release(0.5)
          .slow(2)
          .gain(${(gain * 0.95).toFixed(3)})
          .hpf(180)
          .lpf(sine.range(${(1200 + brightness * 800).toFixed(0)}, ${(2800 + brightness * 2000).toFixed(0)}).slow(7))
          .pan(sine.range(0.3, 0.7).slow(5))
          .room(${(room * 0.7).toFixed(2)})
          .roomsize(2.5)
          .delay(0.2)
          .delaytime(0.33)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;

      case 'flim':
        // Music box bells — GM celesta, delicate and crystalline
        return `${chordStart}
          .sound("gm_celesta")
          .attack(0.003)
          .decay(1.5)
          .sustain(0.04)
          .release(1.2)
          .slow(4)
          .gain(${(gain * 0.65).toFixed(3)})
          .hpf(250)
          .lpf(${(2000 + brightness * 2500).toFixed(0)})
          .pan(sine.range(0.2, 0.8).slow(9))
          .room(${(room * 0.8).toFixed(2)})
          .roomsize(3)
          .delay(0.3)
          .delaytime(0.5)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;

      case 'disco':
        // Disco Rhodes stabs — GM electric piano, short and funky
        return `${chordStart}
          .sound("gm_epiano1")
          .attack(0.003)
          .decay(0.35)
          .sustain(0.06)
          .release(0.15)
          .slow(1)
          .gain(${(gain * 0.9).toFixed(3)})
          .hpf(250)
          .lpf(${(3000 + brightness * 4000).toFixed(0)})
          .pan(sine.range(0.25, 0.75).slow(4))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1.5)
          .delay(0.15)
          .delaytime(0.25)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;
    }
  }
}

/** Convert note name (no octave) to MIDI pitch class */
function noteNameToMidi(name: string): number {
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let midi = base[name[0]] ?? 0;
  if (name.includes('#')) midi++;
  if (name.includes('b')) midi--;
  return ((midi % 12) + 12) % 12;
}

/** Convert MIDI pitch class to note name */
function midiToNoteName(midi: number): string {
  const names = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  return names[((midi % 12) + 12) % 12];
}
