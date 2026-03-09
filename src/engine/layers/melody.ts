import { CachingLayer } from '../caching-layer';
import { GenerativeState, Section } from '../../types';
import { getPentatonicSubset } from '../../theory/scales';
import { randomChoice, weightedChoice } from '../random';
import { noteIndex } from '../../theory/scales';
import { buildNarmourPhrase, applyChordToneGravity } from '../../theory/narmour';
import { phraseDensityMask } from '../../theory/phrase';
import { MotifMemory } from '../../theory/motif-memory';
import { getAdjustedOctaveRange } from '../../theory/register';
import { applyMelodicDynamics } from '../../theory/melodic-dynamics';
import { addOrnaments } from '../../theory/ornamentation';
import { generateSequence, flattenSequence, sequenceDirection, shouldUseSequence } from '../../theory/melodic-sequence';
import { registerShift, shouldShiftRegister } from '../../theory/register-evolution';
import { insertBreaths, breathingRate, ensurePhraseBoundary } from '../../theory/phrase-breathing';
import { contourOffset, contourTargetIndex, contourPull } from '../../theory/melodic-contour';
import { selectVariedContour } from '../../theory/contour-variety';
import { detectDirection } from '../../theory/contrapuntal-motion';
import { selectMelodicNote, inferDirection as inferMelodicDirection } from '../../theory/melodic-gravity';
import type { MelodicContext } from '../../theory/melodic-gravity';
import { noteToPitch } from '../../theory/intervallic-consonance';
import { RhythmicMemory } from '../../theory/rhythmic-memory';
import { ladderToScaleDegrees } from '../../theory/tendency-tones';
import { applyBlueNotes } from '../../theory/blue-notes';
import { shouldTransformMotif, sectionTransform, applyTransform } from '../../theory/motivic-transform';
import { applyShuffle, applyHalftime, moodFeel, feelIntensity, shouldApplyFeel } from '../../theory/rhythmic-feel';
import { phraseGainAccents } from '../../theory/phrase-articulation';
import { densityContour, shouldApplyDensityContour } from '../../theory/density-contour';
import { placePeak, moodPeakPosition, shouldPlacePeak } from '../../theory/phrase-peak';
import { inverseDensityMultiplier, shouldApplyInverseDensity } from '../../theory/inverse-density';
import { applyCadenceGesture } from '../../theory/cadence-gesture';
import { addOctaveDoublings } from '../../theory/octave-doubling';
import { constrainRange, shouldConstrainRange } from '../../theory/range-constraint';
import { addAnacrusis } from '../../theory/anacrusis';
import { contourGainMultipliers, shouldApplyContourDynamics } from '../../theory/contour-dynamics';
import { anchorBias, melodicAnchorStrength } from '../../theory/melodic-anchor';
import { gravityPlacementWeights, rhythmicGravityStrength } from '../../theory/rhythmic-gravity';
import { elisionTendency } from '../../theory/phrase-elision';
import { anticipationProbability, anticipationTones, anticipationBias, shouldAnticipate } from '../../theory/harmonic-anticipation';
import { gestureDensityMult, gesturePitchBias } from '../../theory/gestural-archetype';
import { generateTimbreMap, shouldApplyKFM, applyTimbreToFM } from '../../theory/klangfarbenmelodie';
import { shouldFragment, fragmentLength, extractFragment, repeatFragment } from '../../theory/motivic-fragmentation';
import { shouldApplyAugDim, applyRhythmicTransform } from '../../theory/rhythmic-augmentation';
import { shouldApplyCompound, createCompoundMelody, compoundSeparation, compoundPattern } from '../../theory/compound-melody';
import { shouldApplyRhythmicCadence, selectCadenceType, applyRhythmicCadence } from '../../theory/rhythmic-cadence';
import { tessituraGainMap } from '../../theory/tessitura';
import { detectInertiaDirection, inertiaBias, inertiaStrength } from '../../theory/melodic-inertia';
import { applyMetricConsonance } from '../../theory/metric-consonance';
import { applyRhythmicResolution } from '../../theory/rhythmic-resolution';
import { registerCeiling, registerFloor, constrainToRegister } from '../../theory/registral-climax';
import { shouldApplyEconomy, pitchVocabularySize, selectCorePitches, constrainToVocabulary } from '../../theory/melodic-economy';
import { buildGravityMap, gravityScore, pitchGravityStrength } from '../../theory/pitch-gravity-well';
import { classifyGesture, shouldInjectSurprise, shouldInjectStability, suggestGesture, type GestureType } from '../../theory/gestural-entropy';
import { anticipationDelay, violationTendency } from '../../theory/temporal-expectancy';
import { intervalVariety, suggestIntervalBias, biasOffset, varietyAppetite } from '../../theory/intervallic-variety';
import { selectTargetTone, targetPull, biasTowardTarget, shouldApplyTargeting } from '../../theory/melodic-target';
import { directionBias, biasInterval, shouldApplyBrightnessBias } from '../../theory/brightness-bias';
import { generateCell, applyCell, cellAdherence, shouldApplyRhythmicMotif } from '../../theory/rhythmic-motif';
import { dynamicAccents, shouldApplyDynamicAccent } from '../../theory/dynamic-accent';
import { isBreathMark, breathMarkGain, shouldApplyBreathMarks } from '../../theory/phrase-breath-mark';
import { arcRegisterOffset, arcSemitoneShift, shouldApplyMelodicArc } from '../../theory/melodic-arc';
import { detectSequence, suggestSequenceContinuation, shouldDetectSequence } from '../../theory/melodic-sequence-detection';
import { weightGainMultiplier, shouldApplyRhythmicWeight } from '../../theory/rhythmic-weight';
import { shouldPrepare, suggestPreparation, isDissonantAgainstChord } from '../../theory/harmonic-preparation';

type Contour = 'ascending' | 'descending' | 'arch' | 'valley';

// Section shapes how the melody behaves
const SECTION_MELODY: Record<Section, {
  densityMult: number;  // scales note density
  motifLen: [number, number]; // [options, weights] for motif length
  contourBias: Contour[]; // favored contour shapes
  useCallResponse: boolean; // whether to use call-and-response
}> = {
  intro:     { densityMult: 0.4, motifLen: [3, 4], contourBias: ['ascending', 'arch'], useCallResponse: false },
  build:     { densityMult: 0.7, motifLen: [4, 6], contourBias: ['ascending', 'arch', 'valley'], useCallResponse: true },
  peak:      { densityMult: 1.0, motifLen: [5, 7], contourBias: ['ascending', 'descending', 'arch', 'valley'], useCallResponse: true },
  breakdown: { densityMult: 0.35, motifLen: [3, 4], contourBias: ['descending', 'valley'], useCallResponse: false },
  groove:    { densityMult: 0.85, motifLen: [4, 6], contourBias: ['arch', 'ascending', 'valley'], useCallResponse: true },
};

export class MelodyLayer extends CachingLayer {
  name = 'melody';
  orbit = 2;
  private motifMemory = new MotifMemory();
  private rhythmMemory = new RhythmicMemory();
  /** Recent contour shapes for variety tracking (most recent first) */
  private recentContours: import('../../theory/melodic-contour').ContourShape[] = [];
  /** Last note played (for phrase continuity across regenerations) */
  private lastNoteName: string | null = null;
  /** Gestural entropy tracking */
  private gestureHistory: GestureType[] = [];
  /** Intervallic variety tracking */
  private recentIntervals: number[] = [];

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) {
      this.motifMemory.clear(); // fresh motifs for new mood
      this.rhythmMemory.clear();
      this.recentContours = [];
      this.lastNoteName = null;
      this.gestureHistory = [];
      this.recentIntervals = [];
      return true;
    }
    if (state.chordChanged) return true;
    if (state.scaleChanged) return true;
    if (state.sectionChanged) return true;

    const maxTicks = { downtempo: 10, lofi: 8, trance: 6, avril: 12, xtal: 14, syro: 4, blockhead: 10, flim: 12, disco: 6 }[state.mood] ?? 8;
    if (this.ticksSinceLastGeneration(state) >= maxTicks) return true;

    return false;
  }

  protected buildPattern(state: GenerativeState): string {
    const mood = state.mood;
    const density = state.params.density;
    const tension = state.tension?.overall ?? 0.5;
    // Tension brightens melody, reduces reverb wash, adds presence
    const room = (0.5 + state.params.spaciousness * 0.4) * (1.15 - tension * 0.25);
    const brightness = state.params.brightness * (0.85 + tension * 0.3);
    const gain = 0.30 * (0.4 + density * 0.6) * (0.9 + tension * 0.15);

    // Build melodic phrase
    let elements = mood === 'ambient'
      ? this.buildAmbientPhrase(state, density)
      : this.buildStructuredPhrase(state, density);

    // Blue note inflections for ambient/xtal (structured phrases handle this internally)
    if (mood === 'ambient' || mood === 'xtal') {
      elements = applyBlueNotes(elements, state.scale.notes, mood, state.tension?.overall ?? 0.5);
    }

    // Register evolution: shift melody register during builds/breakdowns
    if (shouldShiftRegister(mood)) {
      const progress = state.sectionProgress ?? 0;
      const shift = registerShift(state.section, progress, 4) - 4; // delta from base octave 4
      if (shift !== 0) {
        elements = elements.map(e => {
          if (e === '~') return e;
          // Shift octave number in note name
          const match = e.match(/^([A-Gb#]+)(\d)$/);
          if (!match) return e;
          const newOct = Math.max(2, Math.min(6, parseInt(match[2]) + shift));
          return `${match[1]}${newOct}`;
        });
      }
    }

    // Melodic arc: macro register trajectory across sections
    if (shouldApplyMelodicArc(mood)) {
      const arcOffset = arcRegisterOffset(state.sectionProgress ?? 0, mood, state.section);
      const shift = arcSemitoneShift(arcOffset);
      if (shift !== 0) {
        const pcNamesArc = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const NOTE_PC_ARC: Record<string, number> = {
          'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
          'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
          'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
        };
        elements = elements.map(e => {
          if (e === '~') return e;
          const n = e.replace(/\d+$/, '');
          const oct = parseInt(e.match(/\d+$/)?.[0] ?? '4');
          const pc = NOTE_PC_ARC[n];
          if (pc === undefined) return e;
          const midi = Math.max(36, Math.min(84, pc + oct * 12 + shift));
          return `${pcNamesArc[midi % 12]}${Math.floor(midi / 12)}`;
        });
      }
    }

    // Range constraint: keep melody within singable bounds
    if (shouldConstrainRange(mood)) {
      const constrained = constrainRange(elements, mood);
      for (let ri = 0; ri < elements.length; ri++) elements[ri] = constrained[ri];
    }

    // Registral climax: constrain register based on section/tension
    // Reserves highest notes for peak moments
    {
      const secProg = state.sectionProgress ?? 0;
      const ceiling = registerCeiling(mood, state.section, secProg, tension);
      const floor = registerFloor(mood, state.section);
      elements = elements.map(n => constrainToRegister(n, floor, ceiling));
    }

    // Metric consonance: chord tones on strong beats, passing tones on weak
    elements = applyMetricConsonance(
      elements, state.currentChord.notes, state.scale.notes, mood
    );

    // Melodic economy: constrain to core pitch vocabulary for focused, memorable melodies
    if (shouldApplyEconomy(mood, state.section)) {
      const vocabSize = pitchVocabularySize(state.scale.notes.length, mood, state.section);
      const corePitches = selectCorePitches(state.scale.notes, vocabSize, state.scale.root);
      elements = constrainToVocabulary(elements, corePitches);
    }

    // Pitch gravity well: bias notes toward tonic/chord tone attractors
    if (pitchGravityStrength(mood) > 0.1) {
      const NOTE_PC: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const rootPc = NOTE_PC[state.scale.root] ?? 0;
      const chordPcs = state.currentChord.notes
        .map(n => NOTE_PC[n.replace(/\d+$/, '')])
        .filter((pc): pc is number => pc !== undefined);
      const gMap = buildGravityMap(chordPcs, rootPc, mood, state.section);
      // On weak beats, if a note has low gravity score, swap to nearest chord tone
      for (let i = 0; i < elements.length; i++) {
        if (elements[i] === '~') continue;
        const name = elements[i].replace(/\d+$/, '');
        const pc = NOTE_PC[name];
        if (pc === undefined) continue;
        const score = gravityScore(pc, gMap);
        // Only intervene on weak positions with low gravity
        const isWeak = i % 4 !== 0;
        if (isWeak && score < 0.15) {
          // Snap to nearest chord tone
          const octave = elements[i].match(/\d+$/)?.[0] ?? '4';
          const chordNames = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
          if (chordNames.length > 0) {
            let nearest = chordNames[0];
            let minDist = 12;
            for (const cn of chordNames) {
              const cnPc = NOTE_PC[cn] ?? 0;
              const dist = Math.min(Math.abs(pc - cnPc), 12 - Math.abs(pc - cnPc));
              if (dist < minDist) { minDist = dist; nearest = cn; }
            }
            elements[i] = `${nearest}${octave}`;
          }
        }
      }
    }

    // Gestural entropy: track gesture types and bias toward target entropy
    {
      const NOTE_PC_GE: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      // Classify gestures from current phrase
      const pitches: number[] = [];
      for (const e of elements) {
        if (e === '~') continue;
        const n = e.replace(/\d+$/, '');
        const oct = parseInt(e.match(/\d+$/)?.[0] ?? '4');
        const pc = NOTE_PC_GE[n];
        if (pc !== undefined) pitches.push(pc + oct * 12);
      }
      for (let pi = 1; pi < pitches.length; pi++) {
        const interval = pitches[pi] - pitches[pi - 1];
        this.gestureHistory.push(classifyGesture(interval));
      }
      // Keep history at 16 entries max
      if (this.gestureHistory.length > 16) {
        this.gestureHistory = this.gestureHistory.slice(-16);
      }
      // Apply entropy bias to last note in phrase
      if (this.gestureHistory.length >= 4 && elements.length >= 3) {
        const lastNoteIdx = elements.length - 1 - [...elements].reverse().findIndex(e => e !== '~');
        if (lastNoteIdx >= 1 && lastNoteIdx < elements.length && elements[lastNoteIdx] !== '~') {
          if (shouldInjectSurprise(this.gestureHistory, mood, state.section)) {
            // Make last note a leap instead of step (add 5 semitones)
            const match = elements[lastNoteIdx].match(/^([A-Gb#]+)(\d+)$/);
            if (match) {
              const pc = NOTE_PC_GE[match[1]] ?? 0;
              const oct = parseInt(match[2]);
              const newMidi = Math.max(36, Math.min(84, pc + oct * 12 + 5));
              const newPc = newMidi % 12;
              const newOct = Math.floor(newMidi / 12);
              const pcNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
              elements[lastNoteIdx] = `${pcNames[newPc]}${newOct}`;
            }
          } else if (shouldInjectStability(this.gestureHistory, mood, state.section)) {
            // Repeat the previous note for stability
            const prevNoteIdx = lastNoteIdx - 1 - [...elements.slice(0, lastNoteIdx)].reverse().findIndex(e => e !== '~');
            if (prevNoteIdx >= 0 && prevNoteIdx < lastNoteIdx && elements[prevNoteIdx] !== '~') {
              elements[lastNoteIdx] = elements[prevNoteIdx];
            }
          }
        }
      }
    }

    // Intervallic variety: track intervals and bias toward diversity
    {
      const NOTE_PC_IV: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const midiNotes: number[] = [];
      for (const e of elements) {
        if (e === '~') continue;
        const n = e.replace(/\d+$/, '');
        const oct = parseInt(e.match(/\d+$/)?.[0] ?? '4');
        const pc = NOTE_PC_IV[n];
        if (pc !== undefined) midiNotes.push(pc + oct * 12);
      }
      for (let mi = 1; mi < midiNotes.length; mi++) {
        this.recentIntervals.push(Math.abs(midiNotes[mi] - midiNotes[mi - 1]));
      }
      if (this.recentIntervals.length > 12) {
        this.recentIntervals = this.recentIntervals.slice(-12);
      }
      if (this.recentIntervals.length >= 4 && varietyAppetite(mood) > 0.15) {
        const bias = suggestIntervalBias(this.recentIntervals, mood);
        if (bias !== 'any' && midiNotes.length >= 2) {
          // Apply bias to last note
          const lastNoteIdx = elements.length - 1 - [...elements].reverse().findIndex(e => e !== '~');
          if (lastNoteIdx >= 0 && lastNoteIdx < elements.length && elements[lastNoteIdx] !== '~') {
            const prevMidi = midiNotes.length >= 2 ? midiNotes[midiNotes.length - 2] : 60;
            const currMidi = midiNotes[midiNotes.length - 1];
            const interval = currMidi - prevMidi;
            const offset = biasOffset(bias, interval);
            if (offset !== 0) {
              const newMidi = Math.max(36, Math.min(84, currMidi + offset));
              const pcNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
              elements[lastNoteIdx] = `${pcNames[newMidi % 12]}${Math.floor(newMidi / 12)}`;
            }
          }
        }
      }
    }

    // Melodic sequence detection: reinforce naturally emerging sequences
    if (shouldDetectSequence(mood)) {
      const NOTE_PC_SD: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const seqMidis: number[] = [];
      for (const e of elements) {
        if (e === '~') continue;
        const n = e.replace(/\d+$/, '');
        const oct = parseInt(e.match(/\d+$/)?.[0] ?? '4');
        const pc = NOTE_PC_SD[n];
        if (pc !== undefined) seqMidis.push(pc + oct * 12);
      }
      if (seqMidis.length >= 6) for (let fLen = 3; fLen >= 2; fLen--) {
        const interval = detectSequence(seqMidis, fLen);
        if (interval !== null && interval !== 0) {
          const suggestion = suggestSequenceContinuation(seqMidis, fLen, interval);
          if (suggestion !== null && suggestion >= 36 && suggestion <= 84) {
            // Bias the last note toward the sequence continuation
            const lastNoteIdx = elements.length - 1 - [...elements].reverse().findIndex(e => e !== '~');
            if (lastNoteIdx >= 0 && lastNoteIdx < elements.length && elements[lastNoteIdx] !== '~') {
              const pcNamesSeq = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
              elements[lastNoteIdx] = `${pcNamesSeq[suggestion % 12]}${Math.floor(suggestion / 12)}`;
            }
            break;
          }
        }
      }
    }

    // Melodic target: bias phrase endings toward target chord tones
    if (shouldApplyTargeting(mood)) {
      const NOTE_PC_MT: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const pcNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const target = selectTargetTone(state.currentChord.notes, mood, state.section, state.tick);
      const targetName = target.replace(/\d+$/, '');
      const targetOct = parseInt(target.match(/\d+$/)?.[0] ?? '4');
      const targetMidi = (NOTE_PC_MT[targetName] ?? 0) + targetOct * 12;
      const noteCount = elements.filter(e => e !== '~').length;
      let noteIdx = 0;
      for (let i = 0; i < elements.length; i++) {
        if (elements[i] === '~') continue;
        const phrasePos = noteCount > 1 ? noteIdx / (noteCount - 1) : 0;
        const pull = targetPull(phrasePos, mood);
        if (pull > 0.05) {
          const n = elements[i].replace(/\d+$/, '');
          const oct = parseInt(elements[i].match(/\d+$/)?.[0] ?? '4');
          const currMidi = (NOTE_PC_MT[n] ?? 0) + oct * 12;
          const newMidi = biasTowardTarget(currMidi, targetMidi, pull);
          elements[i] = `${pcNames[newMidi % 12]}${Math.floor(newMidi / 12)}`;
        }
        noteIdx++;
      }
    }

    // Harmonic preparation: prepare dissonant notes by inserting consonant predecessors
    if (state.nextChordHint && shouldPrepare(state.tick, mood, state.section)) {
      const NOTE_PC_HP: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const pcNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const nextChordMidis = state.nextChordHint.notes.map(n => {
        const name = n.replace(/\d+$/, '');
        const oct = parseInt(n.match(/\d+$/)?.[0] ?? '4');
        return (NOTE_PC_HP[name] ?? 0) + oct * 12;
      });
      const currentChordMidis = state.currentChord.notes.map(n => {
        const name = n.replace(/\d+$/, '');
        const oct = parseInt(n.match(/\d+$/)?.[0] ?? '4');
        return (NOTE_PC_HP[name] ?? 0) + oct * 12;
      });
      const scaleMidis = state.scale.notes.map((n, i) => (NOTE_PC_HP[n] ?? 0) + 48 + (i > 6 ? 12 : 0));

      // Check last non-rest note: if it'll be dissonant against next chord, prepare it
      for (let i = elements.length - 1; i >= 1; i--) {
        if (elements[i] === '~') continue;
        const n = elements[i].replace(/\d+$/, '');
        const oct = parseInt(elements[i].match(/\d+$/)?.[0] ?? '4');
        const midi = (NOTE_PC_HP[n] ?? 0) + oct * 12;
        if (isDissonantAgainstChord(midi, nextChordMidis)) {
          const prep = suggestPreparation(midi, currentChordMidis, scaleMidis);
          if (prep !== null && i > 0 && elements[i - 1] === '~') {
            elements[i - 1] = `${pcNames[prep % 12]}${Math.floor(prep / 12)}`;
          }
        }
        break; // only check the last note
      }
    }

    // Brightness bias: nudge intervals toward ascending/opening motion for joy
    if (shouldApplyBrightnessBias(mood, state.section)) {
      const NOTE_PC_BB: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const pcNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const bias = directionBias(mood, state.section);
      if (Math.abs(bias) > 0.05) {
        let prevMidi = -1;
        for (let i = 0; i < elements.length; i++) {
          if (elements[i] === '~') continue;
          const n = elements[i].replace(/\d+$/, '');
          const oct = parseInt(elements[i].match(/\d+$/)?.[0] ?? '4');
          const currMidi = (NOTE_PC_BB[n] ?? 0) + oct * 12;
          if (prevMidi >= 0) {
            const interval = currMidi - prevMidi;
            const biased = biasInterval(interval, bias);
            if (biased !== interval) {
              const newMidi = Math.max(36, Math.min(84, prevMidi + biased));
              elements[i] = `${pcNames[newMidi % 12]}${Math.floor(newMidi / 12)}`;
            }
          }
          // Update prevMidi from element (may have been modified)
          const n2 = elements[i].replace(/\d+$/, '');
          const oct2 = parseInt(elements[i].match(/\d+$/)?.[0] ?? '4');
          prevMidi = (NOTE_PC_BB[n2] ?? 0) + oct2 * 12;
        }
      }
    }

    // Compound melody: split into interleaved register streams for implied polyphony
    if (shouldApplyCompound(state.tick, mood, state.section)) {
      const sep = compoundSeparation(mood, state.section);
      const pat = compoundPattern(mood, state.tick);
      elements = createCompoundMelody(elements, sep, pat);
    }

    // Phrase peak placement: highest note toward golden section for natural arc
    if (shouldPlacePeak(mood)) {
      elements = placePeak(elements, moodPeakPosition(mood));
    }

    // Phrase breathing: insert rests between phrases for natural phrasing
    // Phrase elision reduces breathing for continuous flow (mood-dependent)
    const rawBreathRate = breathingRate(state.section, tension);
    const breathRate = rawBreathRate * (1.0 - elisionTendency(mood) * 0.5);
    if (breathRate > 0.05) {
      elements = insertBreaths(elements, breathRate, 4);
    }
    // Safety: ensure no runaway phrases
    elements = ensurePhraseBoundary(elements, 10);

    // Anacrusis: pickup notes leading into the next phrase
    // Fills trailing rests with approach notes toward the next chord's root
    if (state.nextChordHint) {
      const targetRoot = state.nextChordHint.root;
      const scaleNotes = state.scale.notes;
      // Build a ladder of scale notes across octaves 3-5 for approach note selection
      const anacLadder: string[] = [];
      for (let oct = 3; oct <= 5; oct++) {
        for (const n of scaleNotes) anacLadder.push(`${n}${oct}`);
      }
      elements = addAnacrusis(elements, `${targetRoot}4`, anacLadder, mood);
    }

    // Rhythmic cadence: shape phrase endings for closure (agogic, deceleration, terminal, rhyme)
    if (shouldApplyRhythmicCadence(state.tick, mood, state.section)) {
      const cadType = selectCadenceType(mood, state.tick);
      elements = applyRhythmicCadence(elements, cadType);
    }

    // Rhythmic resolution: complex rhythms simplify near phrase endings
    elements = applyRhythmicResolution(elements, state.sectionProgress ?? 0, mood);

    // Rhythmic feel: shuffle or halftime transformation based on mood + section
    if (shouldApplyFeel(mood)) {
      const feel = moodFeel(mood, state.section);
      const intensity = feelIntensity(mood, state.section);
      if (feel === 'shuffle') {
        elements = applyShuffle(elements, intensity, '~');
      } else if (feel === 'halftime') {
        elements = applyHalftime(elements, intensity, '~');
      }
    }

    // Rhythmic augmentation/diminution: stretch during intros/breakdowns, compress during builds
    if (shouldApplyAugDim(state.tick, mood, state.section)) {
      elements = applyRhythmicTransform(elements, state.section, elements.length);
    }

    // Rhythmic motif: apply mood-characteristic rhythmic cell for groove identity
    if (shouldApplyRhythmicMotif(mood, state.section)) {
      const cell = generateCell(mood, Math.floor(state.tick / 8));
      elements = applyCell(elements, cell, cellAdherence(mood), state.tick);
    }

    // Report phrase density, step pattern, and active motif for cross-layer coordination
    state.layerPhraseDensity[this.name] = elements.filter(e => e !== '~').length / Math.max(1, elements.length);
    state.layerStepPattern[this.name] = elements;
    // Share the active melodic notes (non-rests) for arp thematic unity
    state.activeMotif = elements.filter(e => e !== '~');
    // Share melody direction for contrapuntal motion in arp
    state.melodyDirection = detectDirection(elements);

    // Store last note for phrase continuity across regenerations
    for (let i = elements.length - 1; i >= 0; i--) {
      if (elements[i] !== '~') {
        this.lastNoteName = elements[i];
        break;
      }
    }

    // Per-note velocity dynamics — metric accent, contour accent, phrase taper
    const rawDynamicGain = applyMelodicDynamics(gain, elements);
    // Phrase-position accents: first notes crisp, middle legato, last notes taper
    const accents = phraseGainAccents(elements, mood);
    // Contour dynamics: ascending passages crescendo, descending diminuendo
    const contour = shouldApplyContourDynamics(mood)
      ? contourGainMultipliers(elements, mood)
      : null;
    // Tessitura energy: high notes get effort/brightness, low notes get warmth
    const tessMap = tessituraGainMap(elements, 'C3', 'C6', mood);
    // Dynamic accent: emphasis on leap arrivals, peak notes, re-entries
    const dynAccent = shouldApplyDynamicAccent(mood)
      ? dynamicAccents(elements, mood)
      : null;
    // Breath mark: gain dip before phrase entries
    const breathGain = shouldApplyBreathMarks(mood)
      ? breathMarkGain(mood, state.section)
      : 1.0;
    // Rhythmic weight: metric position affects gain
    const applyWeight = shouldApplyRhythmicWeight(mood);
    const dynamicGain = rawDynamicGain.split(' ')
      .map((g, i) => {
        let v = parseFloat(g) * (accents[i] ?? 1.0);
        if (contour) v *= contour[i] ?? 1.0;
        v *= tessMap[i] ?? 1.0;
        if (dynAccent) v *= dynAccent[i] ?? 1.0;
        if (breathGain < 0.99 && isBreathMark(elements, i)) v *= breathGain;
        if (applyWeight) v *= weightGainMultiplier(i, elements.length, mood);
        return v.toFixed(4);
      })
      .join(' ');

    const pattern = this.buildMoodPattern(mood, elements, gain, dynamicGain, brightness, room, state);

    // Klangfarbenmelodie: per-note FM timbral variation for pointillistic color
    let finalPattern = pattern;
    if (shouldApplyKFM(mood, state.section)) {
      const noteCount = elements.filter(e => e !== '~').length;
      const kfmMap = generateTimbreMap(noteCount, mood, state.section, state.tick);
      // Extract base FM value and create per-note FM pattern
      const fmMatch = finalPattern.match(/\.fm\((\d+(?:\.\d+)?)\)/);
      if (fmMatch) {
        const baseFM = parseFloat(fmMatch[1]);
        const fmValues = kfmMap.map(s => applyTimbreToFM(baseFM, s).toFixed(2)).join(' ');
        finalPattern = finalPattern.replace(/\.fm\(\d+(?:\.\d+)?\)/, `.fm("${fmValues}")`);
      }
    }

    // Temporal expectancy: micro-timing nudge for anticipation/delay
    if (violationTendency(mood) > 0.1) {
      const delay = anticipationDelay([], mood, state.section, state.tick);
      if (delay > 0.01) {
        finalPattern = finalPattern.replace(
          /\.orbit\((\d+)\)/,
          (m) => `.late(${delay.toFixed(4)})${m}`
        );
      }
    }

    return finalPattern;
  }

  private buildMoodPattern(
    mood: string, elements: string[], gain: number,
    dynamicGain: string, brightness: number, room: number,
    state: GenerativeState
  ): string {
    switch (mood) {
      case 'ambient':
        // Triangle to distinguish from sine/4 harmony
        return `note("${elements.join(' ')}")
          .sound("triangle")
          .fm(0.8)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.2)
          .attack(0.01)
          .decay(0.6)
          .sustain(0.03)
          .release(0.4)
          .slow(5)
          .gain("${applyMelodicDynamics(gain * 0.7, elements)}")
          .hpf(250)
          .lpf(${(2000 + brightness * 2500).toFixed(0)})
          .pan(sine.range(0.15, 0.85).slow(7))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .delay(0.3)
          .delaytime(0.5)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;

      case 'downtempo':
        // Triangle lead — cuts through sine harmony, plucky attack
        // LPF base 3000 ensures melody stays brighter than harmony sweep ceiling
        return `note("${elements.join(' ')}")
          .sound("triangle")
          .fm(0.8)
          .fmh(5)
          .fmenv("exp")
          .fmdecay(0.08)
          .attack(0.001)
          .decay(0.25)
          .sustain(0.02)
          .release(0.15)
          .slow(3)
          .gain("${dynamicGain}")
          .hpf(350)
          .lpf(${(3000 + brightness * 3500).toFixed(0)})
          .pan(sine.range(0.25, 0.75).slow(5))
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(1.5)
          .delay(0.3)
          .delaytime(0.334)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;

      case 'lofi':
        // Square pluck — retro/chiptune edge, distinct from triangle harmony
        return `note("${elements.join(' ')}")
          .sound("square")
          .fm(0.5)
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.06)
          .attack(0.001)
          .decay(0.2)
          .sustain(0.02)
          .release(0.12)
          .slow(3)
          .gain("${dynamicGain}")
          .hpf(500)
          .lpf(${(1800 + brightness * 2500).toFixed(0)})
          .detune(sine.range(-2, 2).slow(3))
          .pan(sine.range(0.35, 0.65).slow(4))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1)
          .delay(0.2)
          .delaytime(0.357)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;

      case 'trance':
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(2)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.1)
          .attack(0.001)
          .decay(0.2)
          .sustain(0.05)
          .release(0.1)
          .slow(1)
          .gain("${dynamicGain}")
          .hpf(300)
          .lpf(${(3000 + brightness * 5000).toFixed(0)})
          .pan(sine.range(0.2, 0.8).slow(3))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1.5)
          .delay(0.3)
          .delaytime(0.341)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;

      case 'avril':
        // Piano melody — same instrument as harmony for solo piano feel (Avril 14th)
        // Higher register + shorter decay distinguishes melody from harmony pads
        return `note("${elements.join(' ')}")
          .sound("gm_piano")
          .attack(0.003)
          .decay(0.4)
          .sustain(0.03)
          .release(0.5)
          .slow(4)
          .gain("${applyMelodicDynamics(gain * 0.85, elements)}")
          .hpf(300)
          .lpf(${(2500 + brightness * 3000).toFixed(0)})
          .pan(sine.range(0.25, 0.75).slow(7))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(2)
          .delay(0.3)
          .delaytime(0.462)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;

      case 'xtal':
        // Triangle floating tones — distinct from sine harmony, hazy and nostalgic
        return `note("${elements.join(' ')}")
          .sound("triangle")
          .fm(0.5)
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.3)
          .attack(0.01)
          .decay(0.8)
          .sustain(0.03)
          .release(0.6)
          .slow(4)
          .gain("${applyMelodicDynamics(gain * 0.65, elements)}")
          .hpf(250)
          .lpf(${(1500 + brightness * 1500).toFixed(0)})
          .detune(sine.range(-1.5, 1.5).slow(7))
          .pan(sine.range(0.1, 0.9).slow(9))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(2)
          .delay(0.3)
          .delaytime(0.428)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;

      case 'syro':
        // Fast intricate FM plucks — sits above arp in frequency
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(${(3 + brightness * 2).toFixed(1)})
          .fmh(5)
          .fmenv("exp")
          .fmdecay(0.05)
          .attack(0.001)
          .decay(0.15)
          .sustain(0.02)
          .release(0.08)
          .slow(1)
          .gain("${applyMelodicDynamics(gain * 0.8, elements)}")
          .hpf(600)
          .lpf(${(3000 + brightness * 4000).toFixed(0)})
          .crush(${(10 + brightness * 3).toFixed(0)})
          .pan(sine.range(0.15, 0.85).slow(1.5))
          .room(${(room * 0.25).toFixed(2)})
          .roomsize(1)
          .delay(0.3)
          .delaytime(0.144)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;

      case 'blockhead':
        // Sawtooth lead — buzzy, cuts through square harmony, jazzy phrasing
        return `note("${elements.join(' ')}")
          .sound("sawtooth")
          .fm(0.5)
          .fmh(5)
          .fmenv("exp")
          .fmdecay(0.06)
          .attack(0.001)
          .decay(0.3)
          .sustain(0.03)
          .release(0.2)
          .slow(3)
          .gain("${applyMelodicDynamics(gain * 0.85, elements)}")
          .hpf(400)
          .lpf(${(2800 + brightness * 3000).toFixed(0)})
          .pan(sine.range(0.3, 0.7).slow(5))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(1.5)
          .delay(0.25)
          .delaytime(0.33)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;

      case 'flim':
        // Triangle pluck — distinct from sine harmony bells, shorter envelope
        return `note("${elements.join(' ')}")
          .sound("triangle")
          .fm(0.6)
          .fmh(7)
          .fmenv("exp")
          .fmdecay(0.04)
          .attack(0.001)
          .decay(0.15)
          .sustain(0.01)
          .release(0.1)
          .slow(3)
          .gain("${applyMelodicDynamics(gain * 0.75, elements)}")
          .hpf(400)
          .lpf(${(3200 + brightness * 3500).toFixed(0)})
          .pan(sine.range(0.2, 0.8).slow(7))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1.5)
          .delay(0.25)
          .delaytime(0.469)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;

      case 'disco':
        // Bright disco lead — triangle, funky and bright, cuts through square harmony
        return `note("${elements.join(' ')}")
          .sound("triangle")
          .fm(0.8)
          .fmh(5)
          .fmenv("exp")
          .fmdecay(0.06)
          .attack(0.001)
          .decay(0.2)
          .sustain(0.03)
          .release(0.1)
          .slow(1)
          .gain("${applyMelodicDynamics(gain * 0.95, elements)}")
          .hpf(500)
          .lpf(${(3500 + brightness * 4000).toFixed(0)})
          .pan(sine.range(0.3, 0.7).slow(3))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1.5)
          .delay(0.2)
          .delaytime(0.25)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;

      default:
        return `note("${elements.join(' ')}").sound("sine").fm(1).gain(${gain.toFixed(4)}).slow(2).orbit(${this.orbit})`;
    }
  }

  // Ambient uses gravity-weighted notes for coherent floating phrases
  private buildAmbientPhrase(state: GenerativeState, density: number): string[] {
    const penta = getPentatonicSubset(state.scale);
    const tension = state.tension?.overall ?? 0.3;

    // Build a sparse ladder across 2 octaves
    const ladder: string[] = [];
    for (let oct = 4; oct <= 5; oct++) {
      for (const note of penta) {
        ladder.push(`${note}${oct}`);
      }
    }

    // Chord tone indices for gravity
    const chordNames = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
    const chordIndices = ladder
      .map((n, i) => ({ n: n.replace(/\d+$/, ''), i }))
      .filter(x => chordNames.includes(x.n))
      .map(x => x.i);

    // Pitch arrays for consonance-aware selection
    const ladderPitches = ladder.map(noteToPitch);
    const chordPitches = state.currentChord.notes.map(noteToPitch);
    const scaleDegrees = ladderToScaleDegrees(ladder, state.scale.notes);

    const elements: string[] = [];
    // Phrase continuity: start from where we left off
    let prevIdx = this.lastNoteName ? ladder.indexOf(this.lastNoteName) : -1;
    for (let i = 0; i < 16; i++) {
      if (Math.random() < density * 0.15) {
        const ctx: MelodicContext = {
          prevIndex: prevIdx,
          chordIndices,
          direction: 0, // ambient has no strong direction
          tension,
          ladderPitches,
          chordPitches,
          scaleDegrees,
          mood: state.mood,
          chordDegree: state.currentChord.degree,
          chordQuality: state.currentChord.quality,
          scaleType: state.scale.type,
        };
        const idx = selectMelodicNote(ladder.length, ctx);
        elements.push(ladder[idx]);
        prevIdx = idx;
      } else {
        elements.push('~');
      }
    }
    // Guarantee at least one note
    if (!elements.some(e => e !== '~')) {
      const pos = Math.floor(Math.random() * 16);
      const idx = selectMelodicNote(ladder.length, {
        prevIndex: -1, chordIndices, direction: 0, tension,
        ladderPitches, chordPitches, scaleDegrees, mood: state.mood,
        chordDegree: state.currentChord.degree, chordQuality: state.currentChord.quality,
        scaleType: state.scale.type,
      });
      elements[pos] = ladder[idx];
    }
    return elements;
  }

  // Structured phrase with contour, motifs, and chord-tone anchoring
  private buildStructuredPhrase(state: GenerativeState, density: number): string[] {
    const mood = state.mood;
    // Use full diatonic scale for moods that need harmonic tension (leading tones, 4ths),
    // keep pentatonic for ethereal/dreamy moods where safety sounds better
    const useDiatonic = mood === 'trance' || mood === 'syro' || mood === 'blockhead'
      || mood === 'disco' || mood === 'downtempo' || mood === 'lofi';
    const scaleNotes = useDiatonic ? state.scale.notes : getPentatonicSubset(state.scale);
    const section = SECTION_MELODY[state.section];

    // Build a pitch ladder across 2 octaves
    const [adjLow, adjHigh] = getAdjustedOctaveRange('melody', state.layerCenterPitches);
    const baseOct = Math.max(adjLow, mood === 'trance' ? 3 : 4);
    const ladder = this.buildLadder(scaleNotes, baseOct, baseOct + 1);

    // Store center pitch for register coordination
    state.layerCenterPitches['melody'] = (baseOct + 1) * 12;

    // Find chord tones in the ladder for anchoring
    const chordNotes = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
    const chordIndices = ladder
      .map((n, i) => ({ n: n.replace(/\d+$/, ''), i }))
      .filter(x => chordNotes.includes(x.n))
      .map(x => x.i);

    // Pitch arrays for consonance-aware gravity
    const ladderPitches = ladder.map(noteToPitch);
    const chordPitches = state.currentChord.notes.map(noteToPitch);
    const scaleDegrees = ladderToScaleDegrees(ladder, state.scale.notes);

    // Phrase continuity: prefer starting near where we left off
    // Find nearest chord tone to the previous note for smooth connection
    let continuityIdx = -1;
    if (this.lastNoteName) {
      const lastIdx = ladder.indexOf(this.lastNoteName);
      if (lastIdx >= 0 && chordIndices.length > 0) {
        // Find the chord tone nearest to the last note
        let bestDist = Infinity;
        for (const ci of chordIndices) {
          const d = Math.abs(ci - lastIdx);
          if (d < bestDist) { bestDist = d; continuityIdx = ci; }
        }
      }
    }

    const anchorIdx = continuityIdx >= 0
      ? continuityIdx
      : chordIndices.length > 0
      ? randomChoice(chordIndices)
      : Math.floor(ladder.length / 2);

    // Section shapes motif: length and contour bias
    // Gestural archetype biases contour toward rising or falling shapes
    const pitchBias = gesturePitchBias(state.section, mood, state.tension?.overall ?? 0.5, state.tick);
    let contourPool = section.contourBias;
    if (pitchBias > 0.3) {
      // Favor ascending shapes
      contourPool = contourPool.filter(c => c === 'ascending' || c === 'arch');
      if (contourPool.length === 0) contourPool = ['ascending', 'arch'];
    } else if (pitchBias < -0.3) {
      // Favor descending shapes
      contourPool = contourPool.filter(c => c === 'descending' || c === 'valley');
      if (contourPool.length === 0) contourPool = ['descending', 'valley'];
    }
    const contour = randomChoice(contourPool);
    const motifLen = weightedChoice(
      [section.motifLen[0], section.motifLen[1]],
      [3, 2]
    );
    // Motivic development: 40% chance to develop a stored motif, 60% new
    // Cross-section recall: breakdowns/peaks prefer motifs from earlier sections
    let rawMotif: string[];
    const recalled = this.motifMemory.count > 0 && Math.random() < 0.4
      ? (state.sectionChanged
          ? this.motifMemory.recallCrossSection(state.tick, state.section)
          : this.motifMemory.recall(state.tick))
      : null;

    if (recalled) {
      // Section-aware motivic transformation: use the right development
      // technique for the musical moment (builds augment, peaks diminish, etc.)
      if (shouldTransformMotif(state.mood, state.section)) {
        const indices = recalled.notes.map(n => ladder.indexOf(n)).filter(i => i >= 0);
        if (indices.length >= 2) {
          const transform = sectionTransform(state.section, state.sectionProgress ?? 0);
          const transformed = applyTransform(indices, transform, ladder.length);
          rawMotif = transformed
            .map(i => i < 0 ? '~' : ladder[Math.max(0, Math.min(ladder.length - 1, i))])
            .filter(n => n !== undefined);
        } else {
          rawMotif = this.motifMemory.develop(recalled, ladder);
        }
      } else {
        // Random development (existing behavior)
        rawMotif = this.motifMemory.develop(recalled, ladder);
      }

      // After developing a recalled motif, optionally create a melodic sequence
      // (motif repeated at shifting pitch levels for momentum and direction)
      if (shouldUseSequence(state.section, rawMotif.length)) {
        const { stepSize, repetitions } = sequenceDirection(state.section, state.tension?.overall ?? 0.5);
        const sequences = generateSequence(rawMotif, ladder, repetitions, stepSize);
        const sequencedPhrase = flattenSequence(sequences, 1);
        // Truncate to fit the pattern — sequences can be longer than the target
        rawMotif = sequencedPhrase.slice(0, 16);
      }
      // Motivic fragmentation: during builds/peaks, truncate to essential kernel
      if (shouldFragment(state.tick, mood, state.section)) {
        const fragLen = fragmentLength(rawMotif.length, mood, state.section, state.tension?.overall ?? 0.5);
        if (fragLen < rawMotif.length) {
          const fragment = extractFragment(rawMotif, fragLen);
          rawMotif = repeatFragment(fragment, rawMotif.length, true);
        }
      }
    } else {
      // Create a new motif via Narmour I-R model
      rawMotif = this.buildMotif(ladder, anchorIdx, motifLen, contour, state.sectionProgress ?? 0, state.section, state.mood);
      // Store it for future development (tagged with section for cross-section recall)
      this.motifMemory.store(rawMotif, state.tick, state.section);
    }

    // Apply chord-tone gravity: pull ending notes toward chord tones for resolution
    const motif = chordIndices.length > 0
      ? applyChordToneGravity(
          rawMotif.map(n => ladder.indexOf(n)),
          chordIndices,
          ladder.length,
          section.useCallResponse ? 2 : 1  // Stronger pull during call-response sections
        ).map(i => ladder[Math.max(0, Math.min(ladder.length - 1, i))])
      : rawMotif;

    // Melodic anchor: bias first and last notes toward structural anchors
    if (melodicAnchorStrength(mood) >= 0.1 && motif.length >= 2) {
      const scaleNotes = state.scale.notes;
      // Try to replace first note with nearest anchor
      const firstBias = anchorBias(motif[0], scaleNotes, mood, true);
      if (firstBias > 1.2 && Math.random() < (firstBias - 1.0)) {
        // Already an anchor — keep it
      } else if (firstBias <= 1.0) {
        // Not an anchor — find nearest anchor in ladder
        for (let d = 1; d <= 3; d++) {
          const firstIdx = ladder.indexOf(motif[0]);
          if (firstIdx < 0) break;
          for (const offset of [d, -d]) {
            const candidateIdx = firstIdx + offset;
            if (candidateIdx >= 0 && candidateIdx < ladder.length) {
              const candidate = ladder[candidateIdx];
              if (anchorBias(candidate, scaleNotes, mood, true) > 1.2 &&
                  Math.random() < melodicAnchorStrength(mood)) {
                motif[0] = candidate;
                break;
              }
            }
          }
          if (anchorBias(motif[0], scaleNotes, mood, true) > 1.2) break;
        }
      }
      // Try to replace last note with nearest anchor (phrase ending resolution)
      const lastIdx = ladder.indexOf(motif[motif.length - 1]);
      if (lastIdx >= 0 && anchorBias(motif[motif.length - 1], scaleNotes, mood, true) <= 1.0) {
        for (let d = 1; d <= 2; d++) {
          let found = false;
          for (const offset of [d, -d]) {
            const candidateIdx = lastIdx + offset;
            if (candidateIdx >= 0 && candidateIdx < ladder.length) {
              const candidate = ladder[candidateIdx];
              if (anchorBias(candidate, scaleNotes, mood, true) > 1.2 &&
                  Math.random() < melodicAnchorStrength(mood) * 1.2) {
                motif[motif.length - 1] = candidate;
                found = true;
                break;
              }
            }
          }
          if (found) break;
        }
      }
    }

    const noteCount = 16;
    const elements: string[] = new Array(noteCount).fill('~');

    // Section density with internal contour — density evolves within sections
    const progress = state.sectionProgress ?? 0;
    const sectionDensity = shouldApplyDensityContour(progress)
      ? densityContour(state.section, progress, section.densityMult)
      : section.densityMult;
    // Inverse density: more melody when chord holds, less on chord changes
    const inverseMult = shouldApplyInverseDensity(mood)
      ? inverseDensityMultiplier(state.ticksSinceChordChange, mood)
      : 1.0;
    // Gestural archetype: modulate density based on emotional gesture
    const gestureDMult = gestureDensityMult(state.section, mood, state.tension?.overall ?? 0.5, state.tick);
    const effectiveDensity = density * sectionDensity * inverseMult * gestureDMult;
    const noteProbability = {
      ambient: effectiveDensity * 0.3,
      downtempo: effectiveDensity * 0.3,
      lofi: effectiveDensity * 0.4,
      trance: effectiveDensity * 0.5,
      avril: effectiveDensity * 0.4,
      xtal: effectiveDensity * 0.3,
      syro: effectiveDensity * 0.55,
      blockhead: effectiveDensity * 0.35,
      flim: effectiveDensity * 0.3,
      disco: effectiveDensity * 0.45,
    }[mood];

    // Breathiness: gentle moods get more space between phrases
    const breathiness = {
      ambient: 0.8, downtempo: 0.5, lofi: 0.5,
      trance: 0.2, avril: 0.7, xtal: 0.8,
      syro: 0.15, blockhead: 0.4, flim: 0.7, disco: 0.25,
    }[mood];

    // Rhythmic gravity: bias note placement toward metrically strong positions
    const gravityWeights = rhythmicGravityStrength(mood) >= 0.1
      ? gravityPlacementWeights(8, mood, noteProbability)
      : null;

    // Rhythmic memory: 30% chance to recall a stored rhythm for the first half
    // This creates rhythmic continuity across chord changes
    let mask: boolean[];
    const recalledRhythm = this.rhythmMemory.count > 0 && Math.random() < 0.3
      ? this.rhythmMemory.recall(state.tick, noteProbability)
      : null;
    if (recalledRhythm) {
      // Develop the recalled rhythm and use it as placement mask
      mask = this.rhythmMemory.develop(recalledRhythm, 8);
    } else if (gravityWeights) {
      // Gravity-weighted density mask: each step has its own probability
      mask = gravityWeights.map(w => Math.random() < w);
      // Ensure at least one note
      if (!mask.some(v => v)) mask[0] = true;
    } else {
      // Fresh density mask
      mask = phraseDensityMask(8, noteProbability, breathiness);
    }

    // Place motif notes at phrase-masked positions in first half
    let motifIdx = 0;
    for (let i = 0; i < 8; i++) {
      if (mask[i] && motifIdx < motif.length) {
        elements[i] = motif[motifIdx++];
      }
    }
    // Fill remaining masked positions with gravity-weighted ladder notes
    // (context-aware selection instead of random)
    const tension = state.tension?.overall ?? 0.5;
    for (let i = 0; i < 8; i++) {
      if (mask[i] && elements[i] === '~') {
        // Find the previous non-rest note for context
        let prevIdx = -1;
        for (let j = i - 1; j >= 0; j--) {
          if (elements[j] !== '~') {
            prevIdx = ladder.indexOf(elements[j]);
            break;
          }
        }
        // Infer direction from recent notes
        const recentIndices = elements.slice(0, i)
          .filter(e => e !== '~')
          .map(e => ladder.indexOf(e))
          .filter(idx => idx >= 0);
        const dir = inferMelodicDirection(recentIndices);

        // Melodic inertia: amplify direction to maintain momentum
        const recentNotes = elements.slice(Math.max(0, i - 3), i).filter(e => e !== '~');
        const inertiaDir = detectInertiaDirection(recentNotes);
        const inertiaAmp = inertiaStrength(state.mood);
        const amplifiedDir = inertiaDir === 'ascending'
          ? dir + inertiaAmp * 0.5
          : inertiaDir === 'descending'
          ? dir - inertiaAmp * 0.5
          : dir;

        const ctx: MelodicContext = {
          prevIndex: prevIdx,
          chordIndices: chordIndices,
          direction: amplifiedDir,
          tension,
          ladderPitches,
          chordPitches,
          scaleDegrees,
          mood: state.mood,
          chordDegree: state.currentChord.degree,
          chordQuality: state.currentChord.quality,
          scaleType: state.scale.type,
        };
        const selectedIdx = selectMelodicNote(ladder.length, ctx);
        elements[i] = ladder[selectedIdx];
      }
    }

    // Call-and-response in second half (only during build/peak/groove)
    if (section.useCallResponse) {
      const variation = this.varyMotif(motif, ladder);
      const mask2 = phraseDensityMask(8, noteProbability, breathiness);
      let varIdx = 0;
      for (let i = 0; i < 8; i++) {
        if (mask2[i] && varIdx < variation.length) {
          elements[i + 8] = variation[varIdx++];
        }
      }
    }

    // Harmonic anticipation: pull ending notes toward next chord's tones
    // Uses mood/section-aware probability for forward momentum
    if (state.nextChordHint && shouldAnticipate(mood)) {
      const antProb = anticipationProbability(
        state.ticksSinceChordChange, 8, mood, state.section
      );
      if (antProb > 0) {
        const antTones = anticipationTones(state.currentChord, state.nextChordHint);
        if (antTones.length > 0) {
          const nextChordIndices = ladder
            .map((n, i) => ({ n: n.replace(/\d+$/, ''), i }))
            .filter(x => antTones.includes(x.n))
            .map(x => x.i);

          for (let i = elements.length - 1, pulled = 0; i >= 0 && pulled < 2; i--) {
            if (elements[i] !== '~') {
              const bias = anticipationBias(elements[i], antTones, antProb);
              if (bias > 1.0 && nextChordIndices.length > 0) {
                // Already an anticipation tone — keep it
              } else if (nextChordIndices.length > 0) {
                const currentIdx = ladder.indexOf(elements[i]);
                if (currentIdx >= 0) {
                  let nearest = nextChordIndices[0];
                  let nearestDist = Math.abs(currentIdx - nearest);
                  for (const nci of nextChordIndices) {
                    const d = Math.abs(currentIdx - nci);
                    if (d < nearestDist) { nearest = nci; nearestDist = d; }
                  }
                  if (nearestDist <= 3 && Math.random() < antProb) {
                    elements[i] = ladder[nearest];
                  }
                }
              }
              pulled++;
            }
          }
        }
      }
    }

    // Cadential gestures: phrase endings resolve to chord tones
    if (chordIndices.length > 0) {
      const cadenced = applyCadenceGesture(elements, ladder, chordIndices, mood);
      for (let ci = 0; ci < elements.length; ci++) elements[ci] = cadenced[ci];
    }

    // Store the rhythm for future recall (before ornaments change the pattern)
    this.rhythmMemory.store(elements, state.tick);

    // Add ornamental approach notes (mood and tension dependent)
    const ornamented = addOrnaments(elements, ladder, mood, state.tension?.overall ?? 0.5);

    // Blue note inflections: chromatic color from parallel modes
    const blued = applyBlueNotes(ornamented, state.scale.notes, mood, state.tension?.overall ?? 0.5);

    // Octave doubling: reinforce key notes at high energy for power
    return addOctaveDoublings(blued, tension, state.section, mood);
  }

  // Build a pitch ladder from scale notes across octaves
  private buildLadder(scaleNotes: string[], lowOct: number, highOct: number): string[] {
    const result: string[] = [];
    for (let oct = lowOct; oct <= highOct; oct++) {
      for (const note of scaleNotes) {
        result.push(`${note}${oct}`);
      }
    }
    // Sort by pitch
    result.sort((a, b) => {
      const aNote = a.replace(/\d+$/, '');
      const aOct = parseInt(a.replace(/[^\d]/g, ''));
      const bNote = b.replace(/\d+$/, '');
      const bOct = parseInt(b.replace(/[^\d]/g, ''));
      return (aOct * 12 + noteIndex(aNote as any)) - (bOct * 12 + noteIndex(bNote as any));
    });
    return result;
  }

  // Build a motif using Narmour implication-realization model
  // Small steps continue naturally, leaps resolve — cognitive melody theory
  // Contour bias shifts the starting point toward the section's melodic shape
  private buildMotif(ladder: string[], startIdx: number, length: number, _contour: Contour, sectionProgress: number = 0, section: import('../../types').Section = 'groove', mood: import('../../types').Mood = 'lofi'): string[] {
    // Apply melodic contour with variety: avoid repeating the same shape
    const shape = selectVariedContour(section, mood, this.recentContours);
    this.recentContours.unshift(shape);
    if (this.recentContours.length > 6) this.recentContours.pop();
    const offset = contourOffset(shape, sectionProgress);
    const pull = contourPull(shape, sectionProgress);

    // Bias the start index toward the contour target
    const targetIdx = contourTargetIndex(ladder, startIdx, offset);
    const biasedStart = Math.round(startIdx + (targetIdx - startIdx) * pull);
    const clampedStart = Math.max(0, Math.min(ladder.length - 1, biasedStart));

    const indices = buildNarmourPhrase(ladder.length, clampedStart, length);
    return indices.map(i => ladder[i]);
  }

  // Create a variation of a motif (transpose, invert, or reorder)
  private varyMotif(motif: string[], ladder: string[]): string[] {
    const variation = Math.random();

    if (variation < 0.35) {
      // Transpose up or down by 1-2 steps
      const shift = randomChoice([-2, -1, 1, 2]);
      return motif.map(note => {
        const idx = ladder.indexOf(note);
        if (idx < 0) return note;
        const newIdx = Math.max(0, Math.min(ladder.length - 1, idx + shift));
        return ladder[newIdx];
      });
    } else if (variation < 0.6) {
      // Invert (reverse the direction)
      return [...motif].reverse();
    } else if (variation < 0.8) {
      // Slight variation — change one note
      const result = [...motif];
      const changeIdx = Math.floor(Math.random() * result.length);
      const origIdx = ladder.indexOf(result[changeIdx]);
      if (origIdx >= 0) {
        const step = randomChoice([-1, 1, -2, 2]);
        const newIdx = Math.max(0, Math.min(ladder.length - 1, origIdx + step));
        result[changeIdx] = ladder[newIdx];
      }
      return result;
    } else {
      // Repeat the original (exact repetition is also musical)
      return [...motif];
    }
  }

  // Place a motif into time slots, returning position/note pairs
  private placeMotif(
    motif: string[], startSlot: number, endSlot: number, _totalNotes: number
  ): { pos: number; note: string }[] {
    const result: { pos: number; note: string }[] = [];
    const slotRange = endSlot - startSlot + 1;

    // Space the motif notes across the available slots
    for (let i = 0; i < motif.length; i++) {
      const pos = startSlot + Math.floor((i / motif.length) * slotRange);
      // Add slight random offset for human feel (±1 step)
      const offset = Math.random() < 0.3 ? randomChoice([-1, 1]) : 0;
      const finalPos = Math.max(startSlot, Math.min(endSlot, pos + offset));
      result.push({ pos: finalPos, note: motif[i] });
    }

    return result;
  }
}
