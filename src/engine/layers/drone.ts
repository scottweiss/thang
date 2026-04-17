import { Layer } from '../layer';
import { GenerativeState, Mood, NoteName, Section } from '../../types';
import { generateBassPattern, bassFollowsChord, shouldBassApproach, bassApproachNotes } from '../../theory/bass-pattern';
import { suggestBassDirection, shouldApplyContraryMotion } from '../../theory/bass-contrary-motion';
import { shouldUsePedal, getPedalNote, pedalGainCurve, pedalConflictTension } from '../../theory/pedal-point';
import { gainArcMultiplier, shouldApplyGainArc } from '../../theory/gain-arc';
import {
  computeFinalRoom, computeFinalRoomsize,
  applyRoomMultiplier, applyRoomsizeMultiplier,
} from '../post-processing';
import type { PostProcessState } from '../post-processing';
import { resonanceSweepMultiplier, shouldApplyResonanceSweep } from '../../theory/resonance-sweep';
import { anticipationProbability, shouldAnticipate } from '../../theory/harmonic-anticipation';
import { arrivalEmphasis } from '../../theory/arrival-emphasis';
import { tensionOrchestrationGain, shouldApplyTensionOrchestration } from '../../theory/tension-orchestration';
import { sidechainGainPattern, shouldDuckLayer, shouldApplySidechainDuck } from '../../theory/sidechain-duck';
import { ensembleBreathMultiplier, shouldApplyEnsembleBreath } from '../../theory/ensemble-breath';
import { adaptDroneToChord, phraseRepeatCount } from '../../theory/phrase-persistence';
import { getBassStyle, composeBassLine } from '../../theory/bass-composition';

/** Safe multiply — prevents NaN cascade if regex captures non-numeric text */
function safeMul(val: string, mult: number, decimals: number = 4): string {
  const n = parseFloat(val);
  if (isNaN(n) || isNaN(mult)) return val;
  return (n * mult).toFixed(decimals);
}

// Section shapes the drone's presence — subtle in sparse sections, full in peak
const SECTION_GAIN: Record<Section, number> = {
  intro: 0.8, build: 0.85, peak: 1.0, breakdown: 0.7, groove: 0.9,
};
const SECTION_FILTER_MULT: Record<Section, number> = {
  intro: 0.75, build: 0.8, peak: 1.2, breakdown: 0.65, groove: 1.0,
};

export class DroneLayer implements Layer {
  name = 'drone';
  orbit = 0;
  private cachedResult: string | null = null;
  private lastRoot: string = '';
  private phraseRepeatsRemaining = 0;
  private lastMood: Mood | null = null;

  generate(state: GenerativeState): string {
    const needsRegen =
      !this.cachedResult ||
      state.mood !== this.lastMood ||
      state.scaleChanged ||
      (state.chordChanged && this.phraseRepeatsRemaining <= 0);

    if (needsRegen) {
      this.cachedResult = this.buildPatternAndPostProcess(state);
      this.lastRoot = state.currentChord?.root ?? state.scale.root;
      this.lastMood = state.mood;
      this.phraseRepeatsRemaining = phraseRepeatCount(state.mood);
    } else if (state.chordChanged && this.phraseRepeatsRemaining > 0) {
      const newRoot = state.currentChord?.root ?? state.scale.root;
      this.cachedResult = adaptDroneToChord(this.cachedResult!, this.lastRoot, newRoot);
      this.lastRoot = newRoot;
      this.phraseRepeatsRemaining--;
    }

    return this.cachedResult!;
  }

  private buildPatternAndPostProcess(state: GenerativeState): string {
    let result = this.buildPattern(state);

    // CONSOLIDATED: Room + Roomsize (replaces individual spatial-depth + tension-space + ensemble room)
    {
      const ppState: PostProcessState = {
        section: state.section,
        sectionProgress: state.sectionProgress ?? 0,
        tension: { overall: state.tension?.overall ?? 0.5 },
        mood: state.mood,
        activeLayers: state.activeLayers,
      };
      const finalRoom = computeFinalRoom(ppState, this.name);
      result = applyRoomMultiplier(result, finalRoom);
      const finalRoomsize = computeFinalRoomsize(ppState, this.name);
      result = applyRoomsizeMultiplier(result, finalRoomsize);
    }

    // Resonance sweep: filter Q evolves with section
    if (shouldApplyResonanceSweep(state.section) && result.includes('.resonance(')) {
      const resMult = resonanceSweepMultiplier(state.section, state.sectionProgress ?? 0);
      if (Math.abs(resMult - 1.0) >= 0.03) {
        result = result.replace(
          /\.resonance\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.resonance(${safeMul(val, resMult, 0)})`
        );
      }
    }

    // Sidechain ducking: rhythmic gain pump on strong beats
    if (shouldDuckLayer(this.name) && shouldApplySidechainDuck(state.mood, state.section)) {
      const droneSingleGain = result.match(/\.gain\((\d+(?:\.\d+)?)\)/);
      const droneNoteMatch = result.match(/note\("([^"]+)"\)/);
      if (droneSingleGain && droneNoteMatch) {
        const base = parseFloat(droneSingleGain[1]);
        const steps = droneNoteMatch[1].split(' ').length;
        if (steps > 1) {
          const duck = sidechainGainPattern(steps, state.mood, state.section);
          const ducked = duck.map(d => (base * d).toFixed(4)).join(' ');
          result = result.replace(`.gain(${droneSingleGain[1]})`, `.gain("${ducked}")`);
        }
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
            const quoted = gainExpr.match(/^"([^"]+)"$/);
            if (quoted) {
              const scaled = quoted[1].split(' ').map((v: string) => {
                const n = parseFloat(v); return isNaN(n) ? v : (n * arcMult).toFixed(4);
              }).join(' ');
              return `.gain("${scaled}")`;
            }
            return `.gain((${gainExpr}) * ${arcMult.toFixed(4)})`;
          }
        );
      }
    }

    // Arrival emphasis: cadential resolution accent (gain boost)
    if (state.chordHistory.length >= 2) {
      const prev = state.chordHistory[state.chordHistory.length - 2];
      const emphasis = arrivalEmphasis(
        state.currentChord.degree,
        prev.degree,
        prev.quality,
        state.ticksSinceChordChange,
        state.mood
      );
      if (emphasis.gainBoost > 0.01) {
        const emphMult = 1.0 + emphasis.gainBoost;
        result = result.replace(
          /\.gain\(([^)]+)\)/g,
          (_, gainExpr) => {
            const num = parseFloat(gainExpr);
            if (!isNaN(num)) return `.gain(${(num * emphMult).toFixed(4)})`;
            const quoted = gainExpr.match(/^"([^"]+)"$/);
            if (quoted) {
              const scaled = quoted[1].split(' ').map((v: string) => {
                const n = parseFloat(v); return isNaN(n) ? v : (n * emphMult).toFixed(4);
              }).join(' ');
              return `.gain("${scaled}")`;
            }
            return `.gain((${gainExpr}) * ${emphMult.toFixed(4)})`;
          }
        );
      }
    }

    // Harmonic anticipation: blend a ghost note toward the next chord root
    if (state.nextChordHint && shouldAnticipate(state.mood)) {
      const weight = anticipationProbability(
        state.ticksSinceChordChange, 8, state.mood, state.section
      );
      if (weight > 0.1) {
        const nextRoot = state.nextChordHint.root;
        const octave = state.mood === 'xtal' ? 1 : 2;
        // Very quiet ghost of the next root, fading in as chord change approaches
        const ghostGain = (0.04 * weight).toFixed(4);
        const ghost = `note("${nextRoot}${octave}").sound("sine").gain(${ghostGain}).lpf(200).attack(0.1).decay(1).sustain(0.02).release(0.5).orbit(${this.orbit})`;
        result = `stack(\n${result},\n${ghost}\n)`;
      }
    }

    // Section transition fade + tension orchestration + ensemble breath
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
        /\.gain\(([^)]+)\)/g,
        (_, gainExpr) => {
          const num = parseFloat(gainExpr);
          if (!isNaN(num)) return `.gain(${(num * combinedMultiplier).toFixed(4)})`;
          const quoted = gainExpr.match(/^"([^"]+)"$/);
          if (quoted) {
            const scaled = quoted[1].split(' ').map((v: string) => {
              const n = parseFloat(v); return isNaN(n) ? v : (n * combinedMultiplier).toFixed(4);
            }).join(' ');
            return `.gain("${scaled}")`;
          }
          return `.gain((${gainExpr}) * ${combinedMultiplier.toFixed(4)})`;
        }
      );
    }
    return result;
  }

  private buildPattern(state: GenerativeState): string {
    // Use chord root for moods that follow harmonic changes
    let root: NoteName = bassFollowsChord(state.mood)
      ? state.currentChord.root
      : state.scale.root;
    const fifth = state.scale.notes[4] || state.scale.notes[0];

    // Pedal point: hold a sustained note during builds/intros for tension/stability
    const pedalTension = state.tension?.overall ?? 0.5;
    let pedalGainMult = 1.0;
    if (shouldUsePedal(state.section, pedalTension, state.ticksSinceChordChange)) {
      // Get the 5th degree of the scale for dominant pedals
      const scaleNotes = state.scale.notes;
      const fifthDegree = scaleNotes[4] || scaleNotes[0]; // 5th degree, fallback to root
      const pedalNote = getPedalNote(state.section, state.scale.root, fifthDegree);
      const conflict = pedalConflictTension(pedalNote, state.currentChord.notes);
      pedalGainMult = pedalGainCurve(conflict, state.section);
      // Override the root with the pedal note (strip octave since drone adds its own)
      root = pedalNote.replace(/\d+$/, '') as NoteName;
    }
    const mood = state.mood;
    // Bass contrary motion: bias bass direction opposite to melody
    const bassDir = shouldApplyContraryMotion(mood)
      ? suggestBassDirection(state.melodyDirection, mood)
      : undefined;
    const sectionGain = SECTION_GAIN[state.section];
    const sectionFilter = SECTION_FILTER_MULT[state.section];
    const tension = state.tension?.overall ?? 0.5;
    // Intimacy: high intimacy = warmer, closer drone with subtle gain boost
    const intimacy = state.tension?.intimacy ?? 0.5;
    // Tension adds warmth to bass: opens filter slightly, less reverb at peaks
    // pedalGainMult softens when pedal tone clashes with current chord
    const gain = 0.18 * (0.5 + state.params.density * 0.5) * sectionGain * (0.95 + tension * 0.1) * pedalGainMult * (0.9 + intimacy * 0.2);
    const room = (0.5 + state.params.spaciousness * 0.3) * (1.1 - tension * 0.15);
    const brightness = state.params.brightness * sectionFilter * (0.9 + tension * 0.2);

    // FM index evolves slowly with brightness for organic movement
    const fmSweep = `sine.range(${(0.5 + brightness * 0.5).toFixed(1)}, ${(1.5 + brightness * 2).toFixed(1)}).slow(17)`;

    switch (mood) {
      case 'ambient':
        // Evolving FM pad — low harmonicity creates breathy, organ-like texture
        return `note("${root}2")
          .sound("sine")
          .fm(${fmSweep})
          .fmh(2)
          .fmenv("exp")
          .fmdecay(1.5)
          .attack(0.8)
          .decay(2)
          .sustain(0.2)
          .release(1.5)
          .slow(4)
          .gain(${(gain * 0.6).toFixed(3)})
          .lpf(sine.range(${(150 + brightness * 100).toFixed(0)}, ${(300 + brightness * 250).toFixed(0)}).slow(11))
          .pan(sine.range(0.3, 0.7).slow(13))
          .room(${(room * 0.40).toFixed(2)})
          .roomsize(1.8)
          .orbit(${this.orbit})`;

      case 'downtempo': {
        // Acoustic upright bass — walking bass line via bass-composition module
        const dtChordTones = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
        const dtNextRoot = state.nextChordHint?.root ?? null;
        const dtBass = composeBassLine(getBassStyle('downtempo'), root, dtChordTones, dtNextRoot, 4, 2);
        return `note("${dtBass.join(' ')}")
          .sound("gm_acoustic_bass")
          .attack(0.02)
          .decay(0.6)
          .sustain(0.2)
          .release(0.3)
          .slow(3)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 200).toFixed(0)}, ${(600 + brightness * 300).toFixed(0)}).slow(13))
          .pan(sine.range(0.4, 0.6).slow(9))
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1.5)
          .orbit(${this.orbit})`;
      }

      case 'lofi': {
        // Fretless bass — walking bass line via bass-composition module
        const lofiChordTones = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
        const lofiNextRoot = state.nextChordHint?.root ?? null;
        const lofiBass = composeBassLine(getBassStyle('lofi'), root, lofiChordTones, lofiNextRoot, 4, 2);
        return `note("${lofiBass.join(' ')}")
          .sound("gm_fretless_bass")
          .attack(0.01)
          .decay(0.4)
          .sustain(0.2)
          .release(0.2)
          .slow(2)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(400 + brightness * 300).toFixed(0)}, ${(700 + brightness * 300).toFixed(0)}).slow(7))
          .pan(sine.range(0.4, 0.6).slow(19))
          .room(${(room * 0.2).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;
      }

      case 'trance': {
        // Synth bass 1 — punchy, defined sub-bass distinct from string_ensemble harmony
        const tranceBass = generateBassPattern(root, fifth, 'trance', 4, bassDir);
        this.injectApproachNotes(tranceBass, state, root, 2);
        return `note("${tranceBass.join(' ')}")
          .sound("gm_synth_bass_1")
          .attack(0.005)
          .decay(0.15)
          .sustain(0.2)
          .release(0.1)
          .slow(1)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 300).toFixed(0)}, ${(600 + brightness * 300).toFixed(0)}).slow(2))
          .resonance(${(6 + brightness * 4).toFixed(0)})
          .detune(sine.range(-4, 4).slow(3))
          .pan(sine.range(0.35, 0.65).slow(11))
          .room(${(room * 0.2).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;
      }

      case 'avril':
        // Soft root note pedal — very quiet sine, slow attack, intimate
        return `note("${root}2")
          .sound("sine")
          .fm(${(0.3 + brightness * 0.3).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(1)
          .attack(1.5)
          .decay(3)
          .sustain(0.15)
          .release(2)
          .slow(6)
          .gain(${(gain * 0.4).toFixed(3)})
          .lpf(sine.range(${(120 + brightness * 100).toFixed(0)}, ${(250 + brightness * 200).toFixed(0)}).slow(19))
          .pan(sine.range(0.4, 0.6).slow(15))
          .room(${(room * 0.25).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;

      case 'xtal':
        // Deep reverberant sub bass — sine with slow FM sweep
        // SAW 85-92 style: warm, hazy, submerged (but controlled reverb to avoid mud)
        return `note("${root}1")
          .sound("sine")
          .fm(sine.range(${(0.3 + brightness * 0.2).toFixed(1)}, ${(0.8 + brightness * 0.5).toFixed(1)}).slow(23))
          .fmh(1)
          .fmenv("exp")
          .fmdecay(2)
          .attack(1.2)
          .decay(3)
          .sustain(0.25)
          .release(2)
          .slow(8)
          .gain(${(gain * 0.7).toFixed(3)})
          .lpf(sine.range(${(80 + brightness * 60).toFixed(0)}, ${(180 + brightness * 120).toFixed(0)}).slow(19))
          .pan(sine.range(0.4, 0.6).slow(17))
          .room(${(room * 0.45).toFixed(2)})
          .roomsize(1.8)
          .orbit(${this.orbit})`;

      case 'syro': {
        // Synth bass 2 — gritty digital acid bass, IDM character
        const syroBass = generateBassPattern(root, fifth, 'syro', 4, bassDir);
        this.injectApproachNotes(syroBass, state, root, 2);
        return `note("${syroBass.join(' ')}")
          .sound("gm_synth_bass_2")
          .attack(0.003)
          .decay(0.12)
          .sustain(0.15)
          .release(0.05)
          .slow(1)
          .gain(${(gain * 1.0).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 400).toFixed(0)}, ${(800 + brightness * 400).toFixed(0)}).slow(1.5))
          .resonance(${(8 + brightness * 4).toFixed(0)})
          .hpf(30)
          .detune(sine.range(-5, 5).slow(2))
          .pan(sine.range(0.35, 0.65).slow(3))
          .room(${(room * 0.1).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;
      }

      case 'blockhead': {
        // Fingered electric bass — syncopated bass via bass-composition module
        const bhChordTones = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
        const bhNextRoot = state.nextChordHint?.root ?? null;
        const bhBass = composeBassLine(getBassStyle('blockhead'), root, bhChordTones, bhNextRoot, 8, 2);
        return `note("${bhBass.join(' ')}")
          .sound("gm_electric_bass_finger")
          .attack(0.005)
          .decay(0.4)
          .sustain(0.2)
          .release(0.15)
          .slow(1)
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(sine.range(${(400 + brightness * 300).toFixed(0)}, ${(800 + brightness * 300).toFixed(0)}).slow(9))
          .pan(sine.range(0.4, 0.6).slow(7))
          .room(${(room * 0.15).toFixed(2)})
          .roomsize(0.8)
          .orbit(${this.orbit})`;
      }

      case 'flim':
        // Electric bass pick — tight, defined, mechanical precision for Autechre aesthetic
        return `note("${root}2")
          .sound("gm_electric_bass_pick")
          .attack(1.5)
          .decay(3)
          .sustain(0.15)
          .release(2)
          .slow(6)
          .gain(${(gain * 0.35).toFixed(3)})
          .lpf(sine.range(${(100 + brightness * 80).toFixed(0)}, ${(220 + brightness * 180).toFixed(0)}).slow(21))
          .pan(sine.range(0.4, 0.6).slow(23))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1.5)
          .orbit(${this.orbit})`;

      case 'disco': {
        // Funky disco slap bass — GM soundfont, octave jumps, rhythmic
        const discoBass = generateBassPattern(root, fifth, 'disco', 4, bassDir);
        // Expand to 8 steps with rests for rhythmic pattern
        const discoExpanded = [discoBass[0], discoBass[1], discoBass[2], discoBass[3],
                               '~', discoBass[0], `${fifth}${2}`, discoBass[0]];
        this.injectApproachNotes(discoExpanded, state, root, 2);
        return `note("${discoExpanded.join(' ')}")
          .sound("gm_slap_bass_1")
          .attack(0.003)
          .decay(0.2)
          .sustain(0.12)
          .release(0.06)
          .slow(1)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(500 + brightness * 300).toFixed(0)}, ${(900 + brightness * 300).toFixed(0)}).slow(3))
          .hpf(30)
          .pan(sine.range(0.4, 0.6).slow(5))
          .room(${(room * 0.1).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;
      }

      case 'plantasia':
        // Warm sine bass with octave doubling — clean, round, Moog-like.
        // No walking, no punch — just a steady harmonic floor.
        return `note("${root}2")
          .sound("sine")
          .attack(0.4)
          .decay(1.5)
          .sustain(0.5)
          .release(1.8)
          .slow(4)
          .gain(${(gain * 0.85).toFixed(3)})
          .lpf(${(250 + brightness * 300).toFixed(0)})
          .pan(0.5)
          .room(${(room * 0.35).toFixed(2)})
          .roomsize(1.4)
          .orbit(${this.orbit})`;
    }
  }

  /**
   * Replace trailing notes in a bass pattern with chromatic approach notes
   * walking toward the next chord root, if conditions are met.
   */
  private injectApproachNotes(
    pattern: string[],
    state: GenerativeState,
    currentRoot: string,
    octave: number
  ): void {
    if (!state.nextChordHint) return;
    if (!shouldBassApproach(state.mood, state.ticksSinceChordChange, true)) return;

    const nextRoot = state.nextChordHint.root;
    const approach = bassApproachNotes(currentRoot, nextRoot, octave);
    if (approach.length === 0) return;

    // Replace the last N non-rest notes with approach notes
    // Walk backward through pattern to find slots
    let placed = 0;
    for (let i = pattern.length - 1; i >= 0 && placed < approach.length; i--) {
      if (pattern[i] !== '~') {
        pattern[i] = approach[approach.length - 1 - placed];
        placed++;
      }
    }
  }
}
