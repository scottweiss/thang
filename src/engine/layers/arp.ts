import { CachingLayer } from '../caching-layer';
import { GenerativeState, Section, Mood } from '../../types';
import { randomChoice } from '../random';
import { euclideanFillPositions } from '../../theory/euclidean';
import { velocityCurve, VelocityPattern } from '../../theory/groove';
import { getAdjustedOctaveRange } from '../../theory/register';
import { displaceSteps, syncopate, moodDisplacement } from '../../theory/rhythmic-displacement';
import { sectionArticulation, articulationToStrudel } from '../../theory/articulation';
import { complementaryDensity, callResponseAmount } from '../../theory/call-response';
import { generateComplementaryRhythm, counterpointDensity } from '../../theory/rhythmic-counterpoint';
import { generateArpSequence, moodArpStyles, biasStyleForMotion, ArpStyle } from '../../theory/arp-pattern';
import { suggestCounterDirection } from '../../theory/contrapuntal-motion';
import { shouldUseIsorhythm, moodTalea, isorhythmicPattern, isorhythmToStrudel } from '../../theory/isorhythm';
import { complementWeights, weightLadder, selectComplement, shouldApplyComplement, complementStrength } from '../../theory/pitch-complement';
import { applyShuffle, applyHalftime, moodFeel, feelIntensity, shouldApplyFeel } from '../../theory/rhythmic-feel';
import { applyRegisterSpread, shouldApplyRegisterSpread } from '../../theory/register-spread';
import { densityContour, shouldApplyDensityContour } from '../../theory/density-contour';
import { smoothArpStart } from '../../theory/arp-voice-leading';
import { shouldApplyHemiola, applyHemiolaToGain } from '../../theory/hemiola';
import { applyGrooveLock } from '../../theory/groove-lock';
import { addPassingTones, shouldAddPassingTones } from '../../theory/arp-passing-tones';
import { contourGainMultipliers, shouldApplyContourDynamics } from '../../theory/contour-dynamics';
import { shouldApplyPolyrhythm, selectGrouping, polyrhythmAccentMask } from '../../theory/polyrhythm';
import { shouldArpAnticipate, blendNextChordTones } from '../../theory/arp-anticipation';
import { shouldEchoMotif, transposeMotif, selectEchoInterval } from '../../theory/imitative-echo';
import { arpRegisterOffset, shouldApplyRegisterComplement } from '../../theory/register-complement';
import { shouldExchangeVoices, selectExchangeNotes } from '../../theory/voice-exchange';
import { suggestPitchClassAdditions } from '../../theory/pitch-class-set';
import { shouldApplyResultant, resultantGainMask } from '../../theory/resultant-rhythm';

type ArpPattern = 'up' | 'down' | 'updown' | 'broken';

// Mood-specific velocity accent patterns
const MOOD_VELOCITY: Record<Mood, VelocityPattern> = {
  ambient: 'flat',
  downtempo: 'accent14',
  lofi: 'accent1',
  trance: 'accent14',
  avril: 'flat',
  xtal: 'flat',
  syro: 'accent14',
  blockhead: 'accent14',
  flim: 'accent1',
  disco: 'accent14',
};

// Section density multipliers — how much of the arp is active per section
const SECTION_DENSITY: Record<Section, number> = {
  intro: 0.3,
  build: 0.7,
  peak: 1.0,
  breakdown: 0.35,
  groove: 0.85,
};

export class ArpLayer extends CachingLayer {
  name = 'arp';
  orbit = 4;
  private lastPlayedNote: string | null = null;
  private echoCounter = 0;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) return true;
    if (state.chordChanged) return true;
    if (state.scaleChanged) return true;
    if (state.sectionChanged) return true;

    const maxTicks = { downtempo: 10, lofi: 8, trance: 6, avril: 12, xtal: 14, syro: 3, blockhead: 10, flim: 14, disco: 6 }[state.mood] ?? 8;
    return this.ticksSinceLastGeneration(state) >= maxTicks;
  }

  protected buildPattern(state: GenerativeState): string {
    const chord = state.currentChord;
    const mood = state.mood;
    const tension = state.tension?.overall ?? 0.5;
    // Tension increases arp activity and brightness, dries out reverb
    const rawDensity = state.params.density * (0.9 + tension * 0.2);
    // Call-and-response: thin out when melody is busy
    const crAmount = callResponseAmount(mood);
    const melodyDensity = state.layerPhraseDensity?.melody ?? 0.5;
    const density = complementaryDensity(melodyDensity, rawDensity, crAmount);
    const brightness = state.params.brightness * (0.85 + tension * 0.3);
    const room = (0.4 + state.params.spaciousness * 0.4) * (1.1 - tension * 0.2);
    const progress = state.sectionProgress ?? 0;
    const sectionMult = shouldApplyDensityContour(progress)
      ? densityContour(state.section, progress, SECTION_DENSITY[state.section])
      : SECTION_DENSITY[state.section];
    const section = state.section;
    this.lastMood = mood;

    // Build arp notes from chord tones across octaves
    let baseNotes = chord.notes;

    // Imitative echo: transpose melody motif and use as arp base (canonic imitation)
    if (state.activeMotif && state.activeMotif.length >= 3 &&
        shouldEchoMotif(mood, section)) {
      const interval = selectEchoInterval(mood, this.echoCounter++);
      const echoed = transposeMotif(state.activeMotif, state.scale.notes, interval);
      const validEchoed = echoed.filter(n => n !== '~' && n.match(/^[A-G]/));
      if (validEchoed.length >= 2) {
        baseNotes = [...chord.notes, ...validEchoed.slice(0, 3)];
      }
    }

    // Thematic unity: occasionally blend melody motif notes into arp's note pool
    // Creates callbacks to the melody's material — feels composed rather than random
    if (state.activeMotif && state.activeMotif.length >= 2 &&
        (section === 'build' || section === 'peak' || section === 'groove') &&
        Math.random() < 0.2) {
      // Take 1-2 notes from the motif to enrich the arp palette
      const motifSample = state.activeMotif.slice(0, Math.min(2, state.activeMotif.length));
      baseNotes = [...chord.notes, ...motifSample];
    }

    // Voice exchange: borrow specific melody pitches for counterpoint richness
    if (state.activeMotif && state.activeMotif.length >= 2 &&
        shouldExchangeVoices(state.tick, mood, section)) {
      const exchanged = selectExchangeNotes(
        state.activeMotif, baseNotes, chord.notes, 1
      );
      if (exchanged.length > 0) {
        baseNotes = [...baseNotes, ...exchanged];
      }
    }

    // Pitch complementarity: enrich arp with scale notes the melody ISN'T playing
    // Fills harmonic gaps rather than doubling — richer overall texture
    if (shouldApplyComplement(mood) && state.activeMotif && state.activeMotif.length > 0) {
      const str = complementStrength(mood);
      const weights = complementWeights(state.activeMotif, state.scale.notes, chord.notes.map(n => n.replace(/\d+$/, '')), str);
      // Add 1-2 complementary scale notes weighted by what melody isn't playing
      const ladder = state.scale.notes;
      const w = weightLadder(ladder, weights);
      const extra: string[] = [];
      const tries = Math.min(2, ladder.length);
      for (let i = 0; i < tries; i++) {
        const idx = selectComplement(ladder, w);
        if (idx < ladder.length && !extra.includes(ladder[idx])) {
          extra.push(ladder[idx]);
        }
      }
      if (extra.length > 0) {
        baseNotes = [...baseNotes, ...extra];
      }
    }

    // Pitch-class set enrichment: add mood-appropriate interval color
    if (section !== 'intro' && Math.random() < 0.25) {
      const NOTE_PC: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const PC_NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
      const existingPCs = baseNotes
        .map(n => NOTE_PC[n.replace(/\d+$/, '')])
        .filter((pc): pc is number => pc !== undefined);
      const additions = suggestPitchClassAdditions(existingPCs, mood, 1);
      if (additions.length > 0) {
        baseNotes = [...baseNotes, PC_NOTE[additions[0]]];
      }
    }

    // Harmonic anticipation: blend next-chord tones before the change
    if (state.nextChordHint &&
        shouldArpAnticipate(mood, state.ticksSinceChordChange, true)) {
      baseNotes = blendNextChordTones(baseNotes, state.nextChordHint.notes, mood);
    }

    // Register awareness: get adjusted octave range to avoid melody collision
    let [adjLow, adjHigh] = getAdjustedOctaveRange('arp', state.layerCenterPitches);
    state.layerCenterPitches['arp'] = 60; // middle C as default center

    // Register complementarity: shift arp octave opposite to melody register
    if (shouldApplyRegisterComplement(mood) && state.activeMotif && state.activeMotif.length > 0) {
      const regOffset = arpRegisterOffset(state.activeMotif, mood);
      if (regOffset !== 0) {
        adjLow = Math.max(1, adjLow + regOffset);
        adjHigh = Math.max(adjLow, adjHigh + regOffset);
      }
    }

    // Contrapuntal motion: bias arp style based on melody's direction
    const counterDir = state.melodyDirection
      ? suggestCounterDirection(state.melodyDirection, mood, section)
      : undefined;

    switch (mood) {
      case 'ambient': {
        const notes = this.spreadWithDynamics(baseNotes, 3, 5, state);
        const fill = this.pickFill16(density * sectionMult * 0.3);
        const steps = this.applyDisplacement(this.buildFromFill(notes, 'up', 16, fill), state);
        return `note("${steps.join(' ')}")
          .sound("triangle")
          .fm(0.4)
          .fmh(6)
          .fmenv("exp")
          .fmdecay(0.6)
          .attack(0.05)
          .decay(1.5)
          .sustain(0.02)
          .release(2)
          .slow(5)
          .gain(${(0.12 * (0.4 + density * 0.4)).toFixed(3)})
          .pan(sine.range(0.3, 0.7).slow(11))
          .room(${room.toFixed(2)})
          .roomsize(5)
          .delay(0.5)
          .delaytime(0.66)
          .delayfeedback(0.5)
          .orbit(${this.orbit})`;
      }

      case 'downtempo': {
        // Square tick — rhythmic clicks distinct from triangle melody
        const notes = this.spreadWithDynamics(baseNotes, 3, 4, state);
        const pattern = this.pickStyle(mood, section, counterDir);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.applyDisplacement(this.buildFromFill(notes, pattern, 8, fill), state);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.04)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.1))}
          .slow(3)
          .gain(${(0.16 * (0.5 + density * 0.5)).toFixed(3)})
          .hpf(400)
          .lpf(${(2500 + brightness * 3500).toFixed(0)})
          .pan(sine.range(0.35, 0.65).slow(7))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1)
          .delay(0.3)
          .delaytime(0.33)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;
      }

      case 'lofi': {
        // Triangle pluck — warm tick, distinct from square melody
        const notes = this.spreadWithDynamics(baseNotes, 3, 4, state);
        const pattern = this.pickStyle(mood, section, counterDir);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.applyDisplacement(this.buildFromFill(notes, pattern, 8, fill), state);
        return `note("${steps.join(' ')}")
          .sound("triangle")
          .fm(0.4)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.04)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.08))}
          .slow(2)
          .gain(${(0.15 * (0.5 + density * 0.5)).toFixed(3)})
          .hpf(450)
          .lpf(${(1500 + brightness * 2500).toFixed(0)})
          .pan(sine.range(0.35, 0.65).slow(5))
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1)
          .delay(0.2)
          .delaytime(0.375)
          .delayfeedback(0.15)
          .orbit(${this.orbit})`;
      }

      case 'trance': {
        const notes = this.spreadWithDynamics(baseNotes, Math.max(3, adjLow), Math.min(5, adjHigh), state);
        const trancePattern = this.pickStyle(mood, section, counterDir);
        const fill = this.pickFill16(density * sectionMult);
        const steps = this.applyDisplacement(this.buildFromFill(notes, trancePattern, 16, fill), state);
        const tranceGain = 0.16 * (0.5 + density * 0.5);
        const tranceVelGain = this.getVelocityGain(tranceGain, 16, mood, section, progress, steps);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.03)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.12))}
          .slow(1)
          .gain("${tranceVelGain}")
          .hpf(250)
          .lpf(${(2000 + brightness * 6000).toFixed(0)})
          .resonance(${(8 + brightness * 6).toFixed(0)})
          .pan(sine.range(0.3, 0.7).slow(3))
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1)
          .delay(0.35)
          .delaytime(0.1875)
          .delayfeedback(0.4)
          .orbit(${this.orbit})`;
      }

      case 'avril': {
        // Square pip — tiny gentle clicks, distinct from triangle melody
        const notes = this.spreadWithDynamics(baseNotes, 4, 5, state);
        const fill = this.pickFill16(density * sectionMult * 0.2);
        const steps = this.applyDisplacement(this.buildFromFill(notes, 'broken', 16, fill), state);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.04)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.12))}
          .slow(5)
          .gain(${(0.1 * (0.3 + density * 0.4)).toFixed(3)})
          .hpf(300)
          .lpf(${(2200 + brightness * 2500).toFixed(0)})
          .pan(sine.range(0.35, 0.65).slow(9))
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(3)
          .delay(0.5)
          .delaytime(0.66)
          .delayfeedback(0.45)
          .orbit(${this.orbit})`;
      }

      case 'xtal': {
        // Square chime pips — tiny clicks distinct from triangle melody and sine harmony
        const notes = this.spreadWithDynamics(baseNotes, 4, 6, state);
        const xtalGain = 0.1 * (0.3 + density * 0.3);

        // Isorhythmic phasing: talea + color cycle independently for evolving patterns
        const isoXtal = shouldUseIsorhythm(mood, section, state.sectionProgress ?? 0)
          ? this.buildIsorhythmic(notes, 16, xtalGain)
          : null;

        let xtalSteps: string[];
        let xtalGainStr: string;
        if (isoXtal) {
          xtalSteps = this.applyDisplacement(isoXtal.steps, state);
          xtalGainStr = isoXtal.gainStr;
        } else {
          const fill = this.pickFill16(density * sectionMult * 0.15);
          xtalSteps = this.applyDisplacement(this.buildFromFill(notes, 'broken', 16, fill), state);
          xtalGainStr = new Array(16).fill(xtalGain.toFixed(4)).join(' ');
        }

        return `note("${xtalSteps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.05)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.15))}
          .slow(6)
          .gain("${xtalGainStr}")
          .hpf(300)
          .lpf(${(1800 + brightness * 2000).toFixed(0)})
          .pan(sine.range(0.1, 0.9).slow(11))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .delay(0.35)
          .delaytime(0.5)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;
      }

      case 'syro': {
        // Dense 16th note arps — acid-style, resonant filter sweep, multiple octaves
        // Syro style: restless, intricate, technical
        const notes = this.spreadWithDynamics(baseNotes, Math.max(2, adjLow), Math.min(5, adjHigh), state);
        const syroGain = 0.12 * (0.5 + density * 0.5);

        // Isorhythmic phasing: IDM-style evolving patterns from phase offset
        const isoSyro = shouldUseIsorhythm(mood, section, state.sectionProgress ?? 0)
          ? this.buildIsorhythmic(notes, 16, syroGain)
          : null;

        let syroSteps: string[];
        let syroVelGain: string;
        if (isoSyro) {
          syroSteps = this.applyDisplacement(isoSyro.steps, state);
          syroVelGain = isoSyro.gainStr;
        } else {
          const syroPattern = this.pickStyle(mood, section, counterDir);
          const fill = this.pickFill16(density * sectionMult * 1.2);
          syroSteps = this.applyDisplacement(this.buildFromFill(notes, syroPattern, 16, fill), state);
          syroVelGain = this.getVelocityGain(syroGain, 16, mood, section, progress, syroSteps);
        }

        return `note("${syroSteps.join(' ')}")
          .sound("sawtooth")
          ${articulationToStrudel(sectionArticulation(section, tension, 0.08))}
          .slow(1)
          .gain("${syroVelGain}")
          .hpf(400)
          .lpf(sine.range(${(1000 + brightness * 800).toFixed(0)}, ${(2500 + brightness * 3000).toFixed(0)}).slow(2))
          .resonance(${(10 + brightness * 5).toFixed(0)})
          .pan(sine.range(0.15, 0.85).slow(1.5))
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1)
          .delay(0.3)
          .delaytime(0.125)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;
      }

      case 'blockhead': {
        // Triangle tick — percussive, distinct from sawtooth melody and square harmony
        const notes = this.spreadWithDynamics(baseNotes, 3, 4, state);
        const pattern = this.pickStyle(mood, section, counterDir);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.applyDisplacement(this.buildFromFill(notes, pattern, 8, fill), state);
        const bhGain = 0.15 * (0.5 + density * 0.5);
        const bhVelGain = this.getVelocityGain(bhGain, 8, mood, section, progress, steps);
        return `note("${steps.join(' ')}")
          .sound("triangle")
          .fm(0.4)
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.04)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.1))}
          .slow(2)
          .gain("${bhVelGain}")
          .hpf(350)
          .lpf(${(2000 + brightness * 3000).toFixed(0)})
          .pan(sine.range(0.3, 0.7).slow(5))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1)
          .delay(0.2)
          .delaytime(0.33)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;
      }

      case 'flim': {
        // Square click — tiny percussive pips, distinct from triangle melody
        const notes = this.spreadWithDynamics(baseNotes, 4, 6, state);
        const fill = this.pickFill16(density * sectionMult * 0.2);
        const steps = this.applyDisplacement(this.buildFromFill(notes, 'broken', 16, fill), state);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.03)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.08))}
          .slow(5)
          .gain(${(0.1 * (0.3 + density * 0.4)).toFixed(3)})
          .hpf(400)
          .lpf(${(2500 + brightness * 3000).toFixed(0)})
          .pan(sine.range(0.1, 0.9).slow(11))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .delay(0.4)
          .delaytime(0.66)
          .delayfeedback(0.4)
          .orbit(${this.orbit})`;
      }

      case 'disco': {
        // Bubbly disco arp — sine with high FM, fast 16th notes, funky
        const notes = this.spreadWithDynamics(baseNotes, Math.max(3, adjLow), Math.min(5, adjHigh), state);
        const discoPattern = this.pickStyle(mood, section, counterDir);
        const fill = this.pickFill16(density * sectionMult);
        const steps = this.applyDisplacement(this.buildFromFill(notes, discoPattern, 16, fill), state);
        const discoGain = 0.18 * (0.5 + density * 0.5);
        const velGain = this.getVelocityGain(discoGain, 16, mood, section, progress, steps);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(${(2 + brightness * 1.5).toFixed(1)})
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.04)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.1))}
          .slow(1)
          .gain("${velGain}")
          .hpf(500)
          .lpf(${(3000 + brightness * 4000).toFixed(0)})
          .pan(sine.range(0.25, 0.75).slow(3))
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1)
          .delay(0.25)
          .delaytime(0.125)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;
      }
    }
  }

  // Pick arp style with contrapuntal bias
  private pickStyle(mood: Mood, section: Section, counterDir?: 'ascending' | 'descending' | 'static'): ArpStyle {
    let styles = moodArpStyles(mood, section);
    if (counterDir) {
      styles = biasStyleForMotion(styles, counterDir);
    }
    return randomChoice(styles);
  }

  // Spread chord notes with register dynamics and voice leading applied
  private spreadWithDynamics(
    notes: string[], lowOct: number, highOct: number, state: GenerativeState
  ): string[] {
    if (shouldApplyRegisterSpread(state.mood)) {
      const tension = state.tension?.overall ?? 0.5;
      [lowOct, highOct] = applyRegisterSpread(
        lowOct, highOct, this.name, tension, state.section, state.mood
      );
    }
    let spread = this.spreadOctaves(notes, lowOct, highOct);
    // Add scale-tone passing tones for melodic arp lines
    if (shouldAddPassingTones(state.mood, state.section)) {
      spread = addPassingTones(spread, state.scale.notes, state.mood);
    }
    // Smooth voice leading: start from the note nearest to last played
    if (this.lastPlayedNote && state.chordChanged) {
      spread = smoothArpStart(spread, this.lastPlayedNote);
    }
    return spread;
  }

  // Spread chord notes across multiple octaves
  private spreadOctaves(notes: string[], lowOct: number, highOct: number): string[] {
    // Extract note names without octave
    const noteNames = notes.map(n => n.replace(/\d+$/, ''));
    const result: string[] = [];
    for (let oct = lowOct; oct <= highOct; oct++) {
      for (const name of noteNames) {
        result.push(`${name}${oct}`);
      }
    }
    return result;
  }

  // Generate Euclidean fill positions for 8-step patterns
  private pickFill8(effectiveDensity: number): number[] {
    const pulses = Math.max(1, Math.round(effectiveDensity * 7));
    return euclideanFillPositions(pulses, 8);
  }

  // Generate Euclidean fill positions for 16-step patterns
  private pickFill16(effectiveDensity: number): number[] {
    const pulses = Math.max(1, Math.round(effectiveDensity * 14));
    return euclideanFillPositions(pulses, 16);
  }

  // Build steps using rhythmic fill positions instead of random
  private buildFromFill(
    notes: string[], pattern: ArpPattern | ArpStyle, length: number, fillPositions: number[]
  ): string[] {
    // Use the new interval-based arp patterns
    const sequence = generateArpSequence(notes, pattern as ArpStyle, notes.length);
    const steps: string[] = new Array(length).fill('~');
    let hasNote = false;

    for (const pos of fillPositions) {
      if (pos < length) {
        steps[pos] = sequence[pos % sequence.length];
        hasNote = true;
      }
    }

    if (!hasNote) {
      steps[0] = sequence[0];
    }

    return steps;
  }

  /** Generate a velocity-weighted gain pattern string for Strudel */
  private getVelocityGain(
    baseGain: number, steps: number, mood: Mood,
    section?: Section, progress?: number,
    noteSteps?: string[]
  ): string {
    const pattern = MOOD_VELOCITY[mood];
    const curve = velocityCurve(steps, pattern);
    let gains = curve.map(v => baseGain * v);

    // Hemiola: cross-rhythm accents (3-over-4 or 3+3+2 clave)
    if (section !== undefined && progress !== undefined &&
        shouldApplyHemiola(mood, section, progress)) {
      gains = applyHemiolaToGain(gains, mood);
    }

    // Contour dynamics: ascending passages crescendo, descending diminuendo
    if (noteSteps && shouldApplyContourDynamics(mood)) {
      const contour = contourGainMultipliers(noteSteps, mood);
      for (let i = 0; i < gains.length && i < contour.length; i++) {
        gains[i] *= contour[i];
      }
    }

    // Polyrhythm: cross-rhythm accent pattern (3/5/7 over 4)
    if (section !== undefined && shouldApplyPolyrhythm(mood, section, 'arp')) {
      const grouping = selectGrouping(mood);
      const polyMask = polyrhythmAccentMask(grouping, steps, 0.5);
      for (let i = 0; i < gains.length && i < polyMask.length; i++) {
        gains[i] *= polyMask[i];
      }
    }

    return gains.map(v => v.toFixed(4)).join(' ');
  }

  /**
   * Build isorhythmic note and gain patterns from chord tones.
   * Talea (rhythm) and color (pitch) cycle independently, creating
   * constantly evolving patterns from simple ingredients.
   */
  private buildIsorhythmic(
    notes: string[], length: number, baseGain: number
  ): { steps: string[]; gainStr: string } | null {
    const talea = moodTalea(this.lastMood ?? 'ambient');
    const color = notes.length > 0 ? notes : ['~'];
    const pattern = isorhythmicPattern(color, talea, length);
    if (pattern.length === 0) return null;

    const { noteStr, gainStr: rawGains } = isorhythmToStrudel(pattern);
    const steps = noteStr.split(' ');

    // Scale gains by baseGain
    const scaledGains = rawGains.split(' ')
      .map(g => (parseFloat(g) * baseGain).toFixed(4))
      .join(' ');

    return { steps, gainStr: scaledGains };
  }

  /** Apply rhythmic displacement, syncopation, and counterpoint for groove */
  private applyDisplacement(steps: string[], state: GenerativeState): string[] {
    const displacement = moodDisplacement(state.mood);
    let result = steps;
    if (displacement > 0) {
      result = displaceSteps(result, '~', displacement);
    }
    // Apply syncopation based on rhythmic tension
    const syncopationAmount = (state.tension?.rhythmic ?? 0.5) * 0.4;
    if (syncopationAmount > 0.1) {
      result = syncopate(result, '~', syncopationAmount, 4);
    }
    // Rhythmic counterpoint: silence arp where melody plays, for interlocking texture
    const melodySteps = state.layerStepPattern?.melody;
    if (melodySteps && melodySteps.length > 0) {
      const strictness = counterpointDensity(state.section, state.tension?.overall ?? 0.5);
      if (strictness > 0.1) {
        const mask = generateComplementaryRhythm(melodySteps, result.length, 1.0 - strictness);
        const filtered = result.map((step, i) => {
          if (step === '~') return '~';
          return mask[i] ? step : (Math.random() < strictness ? '~' : step);
        });
        // Ensure at least one note survives
        const hasNote = filtered.some(s => s !== '~');
        if (!hasNote) {
          const firstNote = steps.findIndex(s => s !== '~');
          if (firstNote >= 0) filtered[firstNote] = steps[firstNote];
        }
        result = filtered;
      }
    }

    // Groove lock: align arp strong beats with melody for rhythmic unity
    if (melodySteps && melodySteps.length > 0) {
      result = applyGrooveLock(result, melodySteps, state.mood, state.section);
    }

    // Track last played note for voice leading across chord changes
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i] !== '~') {
        this.lastPlayedNote = result[i];
        break;
      }
    }

    // Rhythmic feel: shuffle or halftime transformation based on mood + section
    if (shouldApplyFeel(state.mood)) {
      const feel = moodFeel(state.mood, state.section);
      const intensity = feelIntensity(state.mood, state.section);
      if (feel === 'shuffle') {
        result = applyShuffle(result, intensity, '~');
      } else if (feel === 'halftime') {
        result = applyHalftime(result, intensity, '~');
      }
    }

    return result;
  }

}
