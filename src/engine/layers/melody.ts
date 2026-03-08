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
import { sectionContour, contourOffset, contourTargetIndex, contourPull } from '../../theory/melodic-contour';
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

type Contour = 'ascending' | 'descending' | 'arch' | 'valley';

// Section shapes how the melody behaves
const SECTION_MELODY: Record<Section, {
  densityMult: number;  // scales note density
  motifLen: [number, number]; // [options, weights] for motif length
  contourBias: Contour[]; // favored contour shapes
  useCallResponse: boolean; // whether to use call-and-response
}> = {
  intro:     { densityMult: 0.4, motifLen: [2, 3], contourBias: ['ascending', 'arch'], useCallResponse: false },
  build:     { densityMult: 0.7, motifLen: [3, 4], contourBias: ['ascending', 'arch', 'valley'], useCallResponse: true },
  peak:      { densityMult: 1.0, motifLen: [4, 5], contourBias: ['ascending', 'descending', 'arch', 'valley'], useCallResponse: true },
  breakdown: { densityMult: 0.35, motifLen: [2, 3], contourBias: ['descending', 'valley'], useCallResponse: false },
  groove:    { densityMult: 0.85, motifLen: [3, 4], contourBias: ['arch', 'ascending', 'valley'], useCallResponse: true },
};

export class MelodyLayer extends CachingLayer {
  name = 'melody';
  orbit = 2;
  private motifMemory = new MotifMemory();
  private rhythmMemory = new RhythmicMemory();
  /** Last note played (for phrase continuity across regenerations) */
  private lastNoteName: string | null = null;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) {
      this.motifMemory.clear(); // fresh motifs for new mood
      this.rhythmMemory.clear();
      this.lastNoteName = null;
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
    const gain = 0.25 * (0.4 + density * 0.6) * (0.9 + tension * 0.15);

    // Build melodic phrase
    let elements = (mood === 'ambient' || mood === 'xtal')
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

    // Range constraint: keep melody within singable bounds
    if (shouldConstrainRange(mood)) {
      const constrained = constrainRange(elements, mood);
      for (let ri = 0; ri < elements.length; ri++) elements[ri] = constrained[ri];
    }

    // Phrase peak placement: highest note toward golden section for natural arc
    if (shouldPlacePeak(mood)) {
      elements = placePeak(elements, moodPeakPosition(mood));
    }

    // Phrase breathing: insert rests between phrases for natural phrasing
    const breathRate = breathingRate(state.section, tension);
    if (breathRate > 0.05) {
      elements = insertBreaths(elements, breathRate, 4);
    }
    // Safety: ensure no runaway phrases
    elements = ensurePhraseBoundary(elements, 10);

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
    const dynamicGain = rawDynamicGain.split(' ')
      .map((g, i) => (parseFloat(g) * (accents[i] ?? 1.0)).toFixed(4))
      .join(' ');

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
          .pan(sine.range(0.15, 0.85).slow(7))
          .room(${room.toFixed(2)})
          .roomsize(4)
          .delay(0.4)
          .delaytime(0.5)
          .delayfeedback(0.4)
          .orbit(${this.orbit})`;

      case 'downtempo':
        // Triangle lead — cuts through sine harmony, plucky attack
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
          .lpf(${(2500 + brightness * 3500).toFixed(0)})
          .pan(sine.range(0.25, 0.75).slow(5))
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(1.5)
          .delay(0.3)
          .delaytime(0.375)
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
          .slow(2)
          .gain("${dynamicGain}")
          .hpf(500)
          .lpf(${(1800 + brightness * 2500).toFixed(0)})
          .detune(sine.range(-2, 2).slow(3))
          .pan(sine.range(0.35, 0.65).slow(4))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1)
          .delay(0.2)
          .delaytime(0.3)
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
          .delaytime(0.1875)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;

      case 'avril':
        // Triangle bell lead — distinct from sine harmony, gentle pluck
        return `note("${elements.join(' ')}")
          .sound("triangle")
          .fm(0.8)
          .fmh(6)
          .fmenv("exp")
          .fmdecay(0.06)
          .attack(0.001)
          .decay(0.25)
          .sustain(0.02)
          .release(0.3)
          .slow(4)
          .gain("${applyMelodicDynamics(gain * 0.6, elements)}")
          .hpf(300)
          .lpf(${(2000 + brightness * 2500).toFixed(0)})
          .pan(sine.range(0.2, 0.8).slow(7))
          .room(${(room * 1.0).toFixed(2)})
          .roomsize(4)
          .delay(0.45)
          .delaytime(0.5)
          .delayfeedback(0.4)
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
          .slow(5)
          .gain("${applyMelodicDynamics(gain * 0.5, elements)}")
          .hpf(250)
          .lpf(${(1500 + brightness * 1500).toFixed(0)})
          .pan(sine.range(0.1, 0.9).slow(9))
          .room(${(room * 1.3).toFixed(2)})
          .roomsize(7)
          .delay(0.5)
          .delaytime(0.66)
          .delayfeedback(0.5)
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
          .delay(0.35)
          .delaytime(0.125)
          .delayfeedback(0.4)
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
          .slow(2)
          .gain("${applyMelodicDynamics(gain * 0.85, elements)}")
          .hpf(400)
          .lpf(${(2200 + brightness * 2500).toFixed(0)})
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
          .slow(4)
          .gain("${applyMelodicDynamics(gain * 0.6, elements)}")
          .hpf(400)
          .lpf(${(2500 + brightness * 3000).toFixed(0)})
          .pan(sine.range(0.2, 0.8).slow(7))
          .room(${(room * 0.8).toFixed(2)})
          .roomsize(3)
          .delay(0.45)
          .delaytime(0.5)
          .delayfeedback(0.45)
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
      });
      elements[pos] = ladder[idx];
    }
    return elements;
  }

  // Structured phrase with contour, motifs, and chord-tone anchoring
  private buildStructuredPhrase(state: GenerativeState, density: number): string[] {
    const penta = getPentatonicSubset(state.scale);
    const mood = state.mood;
    const section = SECTION_MELODY[state.section];

    // Build a pitch ladder: pentatonic notes across 2 octaves
    const [adjLow, adjHigh] = getAdjustedOctaveRange('melody', state.layerCenterPitches);
    const baseOct = Math.max(adjLow, mood === 'trance' ? 3 : 4);
    const ladder = this.buildLadder(penta, baseOct, baseOct + 1);

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
    const contour = randomChoice(section.contourBias);
    const motifLen = weightedChoice(
      [section.motifLen[0], section.motifLen[1]],
      [3, 2]
    );
    // Motivic development: 40% chance to develop a stored motif, 60% new
    let rawMotif: string[];
    const recalled = this.motifMemory.count > 0 && Math.random() < 0.4
      ? this.motifMemory.recall(state.tick)
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
    } else {
      // Create a new motif via Narmour I-R model
      rawMotif = this.buildMotif(ladder, anchorIdx, motifLen, contour, state.sectionProgress ?? 0, state.section);
      // Store it for future development
      this.motifMemory.store(rawMotif, state.tick);
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
    const effectiveDensity = density * sectionDensity * inverseMult;
    const noteProbability = {
      ambient: effectiveDensity * 0.3,
      downtempo: effectiveDensity * 0.3,
      lofi: effectiveDensity * 0.4,
      trance: effectiveDensity * 0.5,
      avril: effectiveDensity * 0.25,
      xtal: effectiveDensity * 0.2,
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

    // Rhythmic memory: 30% chance to recall a stored rhythm for the first half
    // This creates rhythmic continuity across chord changes
    let mask: boolean[];
    const recalledRhythm = this.rhythmMemory.count > 0 && Math.random() < 0.3
      ? this.rhythmMemory.recall(state.tick, noteProbability)
      : null;
    if (recalledRhythm) {
      // Develop the recalled rhythm and use it as placement mask
      mask = this.rhythmMemory.develop(recalledRhythm, 8);
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

        const ctx: MelodicContext = {
          prevIndex: prevIdx,
          chordIndices: chordIndices,
          direction: dir,
          tension,
          ladderPitches,
          chordPitches,
          scaleDegrees,
          mood: state.mood,
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

    // Harmonic anticipation: pull the last notes toward the next chord's tones
    // This creates forward momentum and smoother harmonic transitions
    if (state.nextChordHint) {
      const nextChordNotes = state.nextChordHint.notes.map(n => n.replace(/\d+$/, ''));
      const nextChordIndices = ladder
        .map((n, i) => ({ n: n.replace(/\d+$/, ''), i }))
        .filter(x => nextChordNotes.includes(x.n))
        .map(x => x.i);

      if (nextChordIndices.length > 0) {
        // Pull the last 2-3 active notes toward next chord tones
        for (let i = elements.length - 1, pulled = 0; i >= 0 && pulled < 2; i--) {
          if (elements[i] !== '~') {
            const currentIdx = ladder.indexOf(elements[i]);
            if (currentIdx >= 0 && !nextChordIndices.includes(currentIdx)) {
              // Find nearest next-chord tone
              let nearest = nextChordIndices[0];
              let nearestDist = Math.abs(currentIdx - nearest);
              for (const nci of nextChordIndices) {
                const d = Math.abs(currentIdx - nci);
                if (d < nearestDist) { nearest = nci; nearestDist = d; }
              }
              // Only pull if within 3 ladder steps (subtle, not jarring)
              if (nearestDist <= 3 && Math.random() < 0.5) {
                elements[i] = ladder[nearest];
              }
            }
            pulled++;
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

  // Build a pitch ladder from pentatonic notes across octaves
  private buildLadder(penta: string[], lowOct: number, highOct: number): string[] {
    const result: string[] = [];
    for (let oct = lowOct; oct <= highOct; oct++) {
      for (const note of penta) {
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
  private buildMotif(ladder: string[], startIdx: number, length: number, _contour: Contour, sectionProgress: number = 0, section: import('../../types').Section = 'groove'): string[] {
    // Apply melodic contour: shift the starting pitch based on section shape
    const shape = sectionContour(section);
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
