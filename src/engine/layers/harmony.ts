import { Layer } from '../layer';
import { GenerativeState, Section } from '../../types';
import { findSuspensions, pickBestSuspension } from '../../theory/suspension';
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

  generate(state: GenerativeState): string {
    let result = this.buildPattern(state);

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

    const multiplier = state.layerGainMultipliers[this.name] ?? 1.0;
    if (multiplier < 1.0) {
      return result.replace(
        /\.gain\(([^)]+)\)/,
        (_, gainExpr) => {
          const num = parseFloat(gainExpr);
          if (!isNaN(num)) return `.gain(${(num * multiplier).toFixed(4)})`;
          return `.gain((${gainExpr}) * ${multiplier.toFixed(4)})`;
        }
      );
    }
    return result;
  }

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

  private buildPattern(state: GenerativeState): string {
    const chord = state.currentChord;
    const mood = state.mood;
    const sectionGain = SECTION_GAIN[state.section];
    const sectionFilter = SECTION_FILTER_MULT[state.section];
    const sectionRoom = SECTION_ROOM_MULT[state.section];
    const tension = state.tension?.overall ?? 0.5;
    // Tension opens filters (+15%), reduces reverb (-20%), and adds presence
    const gain = 0.28 * (0.5 + state.params.density * 0.5) * sectionGain * (0.9 + tension * 0.15);
    const room = (0.4 + state.params.spaciousness * 0.4) * sectionRoom * (1.1 - tension * 0.2);
    const brightness = state.params.brightness * sectionFilter * (0.85 + tension * 0.3);

    // Check for suspension opportunity at chord changes
    let chordNotes = chord.notes;
    let hasSuspension = false;
    if (state.chordChanged && state.chordHistory.length > 0) {
      const prevNotes = state.chordHistory[state.chordHistory.length - 1].notes;
      const suspensions = findSuspensions(prevNotes, chordNotes);
      const best = pickBestSuspension(suspensions);
      if (best && Math.random() < 0.4) { // 40% chance to use suspension
        // Replace the resolution target note with the suspended note in the first half
        // This means the chord starts with the suspended note, then resolves
        const resolveIdx = chordNotes.indexOf(best.resolution);
        if (resolveIdx >= 0) {
          // Create a modified chord with the suspension
          chordNotes = [...chordNotes];
          chordNotes[resolveIdx] = best.suspended;
          hasSuspension = true;
        }
      }
    }

    // Apply voicing spread — wider at peaks, tighter at breakdowns
    const voicingRange = getVoicingRange(state.section, tension);
    const isSusChord = chord.quality === 'sus2' || chord.quality === 'sus4' || hasSuspension;
    if (isSusChord) {
      chordNotes = applyVoicingSpread(chordNotes, voicingRange);
    }

    // Guide tone anticipation — subtly pull inner voice toward next chord
    if (state.nextChordHint && !hasSuspension && Math.random() < 0.25) {
      const guides = findGuideTones(chordNotes, state.nextChordHint.notes);
      if (guides.length > 0) {
        const guide = guides[0]; // use strongest guide tone connection
        // Find the matching note in our voicing and nudge it
        const guideIdx = chordNotes.findIndex(n => n === guide.current);
        if (guideIdx >= 0 && guide.current !== guide.next) {
          // Replace with the target guide tone — creates anticipation
          chordNotes = [...chordNotes];
          chordNotes[guideIdx] = guide.next;
        }
      }
    }

    // Harmonic density: richer chords at peaks, simpler at breakdowns
    chordNotes = adjustChordDensity(chordNotes, state.scale.notes, state.section, tension);

    // Use raw notes for sus2/sus4, suspensions, spread voicings, or extended chords
    // Strudel's voicing() handles its own inversions
    const useRawNotes = chord.quality === 'sus2' || chord.quality === 'sus4' || hasSuspension || chordNotes.length > chord.notes.length;
    const chordStart = useRawNotes
      ? `note("${chordNotes.join(' ')}")`
      : `chord("${chord.symbol}").voicing()`;

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
          .lpf(sine.range(${(600 + brightness * 400).toFixed(0)}, ${(1200 + brightness * 1200).toFixed(0)}).slow(13))
          .pan(sine.range(0.15, 0.85).slow(11))
          .detune(sine.range(-1, 1).slow(17))
          .room(${room.toFixed(2)})
          .roomsize(5)
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
        // Lofi Rhodes — GM electric piano with bit crush for tape warmth
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
          .hpf(120)
          .lpf(sine.range(${(800 + brightness * 1500).toFixed(0)}, ${(2500 + brightness * 4500).toFixed(0)}).slow(3))
          .resonance(${(4 + brightness * 4).toFixed(0)})
          .detune(sine.range(-8, 8).slow(2))
          .pan(sine.range(0.2, 0.8).slow(4))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .delay(0.22)
          .delaytime(0.25)
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
          .hpf(180)
          .lpf(sine.range(${(1200 + brightness * 800).toFixed(0)}, ${(2500 + brightness * 1500).toFixed(0)}).slow(11))
          .pan(sine.range(0.3, 0.7).slow(9))
          .room(${(room * 1.1).toFixed(2)})
          .roomsize(4)
          .delay(0.3)
          .delaytime(0.5)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;

      case 'xtal':
        // Lush warm pad — very slow attack, wide stereo, heavy reverb
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
          .lpf(sine.range(${(500 + brightness * 300).toFixed(0)}, ${(900 + brightness * 800).toFixed(0)}).slow(17))
          .pan(sine.range(0.1, 0.9).slow(13))
          .detune(sine.range(-2, 2).slow(11))
          .room(${(room * 1.3).toFixed(2)})
          .roomsize(7)
          .delay(0.35)
          .delaytime(0.66)
          .delayfeedback(0.4)
          .orbit(${this.orbit})`;

      case 'syro':
        // Glitchy FM bell/pluck — sits below melody, above drone
        return `${chordStart}
          .sound("sine")
          .fm(${(4 + brightness * 3).toFixed(1)})
          .fmh(7)
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
          .room(${(room * 1.2).toFixed(2)})
          .roomsize(5)
          .delay(0.4)
          .delaytime(0.5)
          .delayfeedback(0.45)
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
