import { Layer } from '../layer';
import { GenerativeState, NoteName, Section } from '../../types';
import { generateBassPattern, bassFollowsChord, shouldBassApproach, bassApproachNotes } from '../../theory/bass-pattern';
import { suggestBassDirection, shouldApplyContraryMotion } from '../../theory/bass-contrary-motion';
import { shouldUsePedal, getPedalNote, pedalGainCurve, pedalConflictTension } from '../../theory/pedal-point';
import { gainArcMultiplier, shouldApplyGainArc } from '../../theory/gain-arc';
import { roomMultiplier, roomsizeMultiplier, shouldApplySpatialDepth } from '../../theory/spatial-depth';
import { resonanceSweepMultiplier, shouldApplyResonanceSweep } from '../../theory/resonance-sweep';
import { anticipationProbability, shouldAnticipate } from '../../theory/harmonic-anticipation';
import { tensionSpaceMultiplier, shouldApplyTensionSpace } from '../../theory/tension-space';
import { arrivalEmphasis } from '../../theory/arrival-emphasis';
import { tensionOrchestrationGain, shouldApplyTensionOrchestration } from '../../theory/tension-orchestration';
import { ensembleFmMultiplier, ensembleRoomMultiplier, ensembleDelayMultiplier, shouldApplyEnsembleThinning } from '../../theory/ensemble-thinning';
import { sidechainGainPattern, shouldDuckLayer, shouldApplySidechainDuck } from '../../theory/sidechain-duck';
import { ensembleBreathMultiplier, shouldApplyEnsembleBreath } from '../../theory/ensemble-breath';

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

  generate(state: GenerativeState): string {
    let result = this.buildPattern(state);

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

    // Resonance sweep: filter Q evolves with section
    if (shouldApplyResonanceSweep(state.section) && result.includes('.resonance(')) {
      const resMult = resonanceSweepMultiplier(state.section, state.sectionProgress ?? 0);
      if (Math.abs(resMult - 1.0) >= 0.03) {
        result = result.replace(
          /\.resonance\((\d+(?:\.\d+)?)\)/g,
          (_match, val) => `.resonance(${Math.round(parseFloat(val) * resMult)})`
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

    // Ensemble thinning: reduce FM/reverb/delay when many layers play
    const etCount = state.activeLayers.size;
    if (shouldApplyEnsembleThinning(etCount)) {
      const etRoomMult = ensembleRoomMultiplier(etCount, state.mood);
      if (Math.abs(etRoomMult - 1.0) > 0.03) {
        result = result.replace(
          /\.room\((\d+(?:\.\d+)?)\)/g,
          (_, val) => `.room(${(parseFloat(val) * etRoomMult).toFixed(2)})`
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
        result = result.replace(
          /\.gain\(([^)]+)\)/g,
          (_, gainExpr) => {
            const num = parseFloat(gainExpr);
            if (!isNaN(num)) return `.gain(${(num * (1.0 + emphasis.gainBoost)).toFixed(4)})`;
            return `.gain((${gainExpr}) * ${(1.0 + emphasis.gainBoost).toFixed(4)})`;
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
    // Tension adds warmth to bass: opens filter slightly, less reverb at peaks
    // pedalGainMult softens when pedal tone clashes with current chord
    const gain = 0.18 * (0.5 + state.params.density * 0.5) * sectionGain * (0.95 + tension * 0.1) * pedalGainMult;
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
          .lpf(sine.range(${(150 + brightness * 150).toFixed(0)}, ${(300 + brightness * 400).toFixed(0)}).slow(11))
          .pan(sine.range(0.3, 0.7).slow(13))
          .room(${(room * 0.55).toFixed(2)})
          .roomsize(2.5)
          .orbit(${this.orbit})`;

      case 'downtempo': {
        // Warm FM bass — harmonicity 1 creates growl, slow FM sweep adds movement
        const dtBass = generateBassPattern(root, fifth, 'downtempo', 2, bassDir);
        this.injectApproachNotes(dtBass, state, root, 2);
        return `note("${dtBass.join(' ')}")
          .sound("sine")
          .fm(${(1 + brightness * 1.5).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.6)
          .attack(0.1)
          .decay(0.8)
          .sustain(0.3)
          .release(0.5)
          .slow(3)
          .gain(${gain.toFixed(3)})
          .lpf(sine.range(${(200 + brightness * 200).toFixed(0)}, ${(450 + brightness * 500).toFixed(0)}).slow(7))
          .resonance(3)
          .pan(sine.range(0.35, 0.65).slow(9))
          .detune(sine.range(-3, 3).slow(5))
          .room(${(room * 0.35).toFixed(2)})
          .roomsize(1.5)
          .orbit(${this.orbit})`;
      }

      case 'lofi': {
        // Warm sub bass — triangle + light FM for subtle tape saturation feel
        const lofiBass = generateBassPattern(root, fifth, 'lofi', 4, bassDir);
        this.injectApproachNotes(lofiBass, state, root, 2);
        return `note("${lofiBass.join(' ')}")
          .sound("triangle")
          .fm(${(0.3 + brightness * 0.5).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.3)
          .attack(0.01)
          .decay(0.3)
          .sustain(0.15)
          .release(0.2)
          .slow(2)
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 200).toFixed(0)}, ${(500 + brightness * 500).toFixed(0)}).slow(5))
          .detune(sine.range(-2, 2).slow(3))
          .pan(sine.range(0.4, 0.6).slow(19))
          .room(${(room * 0.25).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;
      }

      case 'trance': {
        // Acid-tinged pulsing bass — higher FM and resonance for squelch
        const tranceBass = generateBassPattern(root, fifth, 'trance', 4, bassDir);
        this.injectApproachNotes(tranceBass, state, root, 2);
        return `note("${tranceBass.join(' ')}")
          .sound("sawtooth")
          .fm(${(0.5 + brightness * 1).toFixed(1)})
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.15)
          .attack(0.005)
          .decay(0.15)
          .sustain(0.2)
          .release(0.1)
          .slow(1)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 400).toFixed(0)}, ${(700 + brightness * 1000).toFixed(0)}).slow(2))
          .resonance(${(6 + brightness * 4).toFixed(0)})
          .detune(sine.range(-4, 4).slow(3))
          .pan(sine.range(0.35, 0.65).slow(4))
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
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2.5)
          .orbit(${this.orbit})`;

      case 'xtal':
        // Deep reverberant sub bass — sine with slow FM sweep, massive room
        // SAW 85-92 style: warm, hazy, submerged
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
          .slow(5)
          .gain(${(gain * 0.7).toFixed(3)})
          .lpf(sine.range(${(80 + brightness * 60).toFixed(0)}, ${(180 + brightness * 120).toFixed(0)}).slow(19))
          .pan(sine.range(0.4, 0.6).slow(17))
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(2.5)
          .orbit(${this.orbit})`;

      case 'syro': {
        // Acid 303-style bass — sawtooth, resonant but controlled to avoid masking upper layers
        const syroBass = generateBassPattern(root, fifth, 'syro', 4, bassDir);
        this.injectApproachNotes(syroBass, state, root, 2);
        return `note("${syroBass.join(' ')}")
          .sound("sawtooth")
          .fm(${(0.8 + brightness * 0.5).toFixed(1)})
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.08)
          .attack(0.003)
          .decay(0.12)
          .sustain(0.15)
          .release(0.05)
          .slow(1)
          .gain(${(gain * 1.0).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 400).toFixed(0)}, ${(800 + brightness * 1200).toFixed(0)}).slow(1.5))
          .resonance(${(10 + brightness * 5).toFixed(0)})
          .hpf(30)
          .detune(sine.range(-5, 5).slow(2))
          .pan(sine.range(0.35, 0.65).slow(3))
          .room(${(room * 0.1).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;
      }

      case 'blockhead': {
        // Warm sub bass — sine with slight saturation via low FM, solid hip-hop foundation
        const bhBass = generateBassPattern(root, fifth, 'blockhead', 2, bassDir);
        this.injectApproachNotes(bhBass, state, root, 2);
        return `note("${bhBass.join(' ')}")
          .sound("sine")
          .fm(${(0.5 + brightness * 0.4).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.4)
          .attack(0.01)
          .decay(0.5)
          .sustain(0.25)
          .release(0.3)
          .slow(2)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(250 + brightness * 200).toFixed(0)}, ${(500 + brightness * 400).toFixed(0)}).slow(9))
          .pan(sine.range(0.4, 0.6).slow(7))
          .room(${(room * 0.2).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;
      }

      case 'flim':
        // Very soft sine pedal tone — gentle, barely there, slow breathing filter
        return `note("${root}2")
          .sound("sine")
          .fm(${(0.2 + brightness * 0.2).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(1.5)
          .attack(1.5)
          .decay(3)
          .sustain(0.15)
          .release(2)
          .slow(6)
          .gain(${(gain * 0.35).toFixed(3)})
          .lpf(sine.range(${(100 + brightness * 80).toFixed(0)}, ${(220 + brightness * 180).toFixed(0)}).slow(21))
          .pan(sine.range(0.4, 0.6).slow(17))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;

      case 'disco': {
        // Funky disco slap bass — GM soundfont, octave jumps, rhythmic
        const discoBass = generateBassPattern(root, fifth, 'disco', 4, bassDir);
        // Expand to 8 steps with rests for rhythmic pattern
        const discoExpanded = [discoBass[0], discoBass[1], discoBass[2], discoBass[3],
                               '~', discoBass[0], `${fifth}${1}`, discoBass[0]];
        this.injectApproachNotes(discoExpanded, state, root, 2);
        return `note("${discoExpanded.join(' ')}")
          .sound("gm_slap_bass_1")
          .attack(0.003)
          .decay(0.2)
          .sustain(0.12)
          .release(0.06)
          .slow(1)
          .gain(${(gain * 1.3).toFixed(3)})
          .lpf(sine.range(${(600 + brightness * 500).toFixed(0)}, ${(1400 + brightness * 1000).toFixed(0)}).slow(3))
          .hpf(30)
          .pan(sine.range(0.4, 0.6).slow(5))
          .room(${(room * 0.1).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;
      }
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
