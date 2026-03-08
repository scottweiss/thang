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
import { generateArpSequence, moodArpStyles, ArpStyle } from '../../theory/arp-pattern';

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
    const sectionMult = SECTION_DENSITY[state.section];
    const section = state.section;

    // Build arp notes from chord tones across octaves
    let baseNotes = chord.notes;

    // Thematic unity: occasionally blend melody motif notes into arp's note pool
    // Creates callbacks to the melody's material — feels composed rather than random
    if (state.activeMotif && state.activeMotif.length >= 2 &&
        (section === 'build' || section === 'peak' || section === 'groove') &&
        Math.random() < 0.2) {
      // Take 1-2 notes from the motif to enrich the arp palette
      const motifSample = state.activeMotif.slice(0, Math.min(2, state.activeMotif.length));
      baseNotes = [...chord.notes, ...motifSample];
    }

    // Register awareness: get adjusted octave range to avoid melody collision
    const [adjLow, adjHigh] = getAdjustedOctaveRange('arp', state.layerCenterPitches);
    state.layerCenterPitches['arp'] = 60; // middle C as default center

    switch (mood) {
      case 'ambient': {
        const notes = this.spreadOctaves(baseNotes, 3, 5);
        const fill = this.pickFill16(density * sectionMult * 0.3);
        const steps = this.applyDisplacement(this.buildFromFill(notes, 'up', 16, fill), state);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(0.5)
          .fmh(5)
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
        const notes = this.spreadOctaves(baseNotes, 3, 4);
        const pattern = randomChoice(moodArpStyles(mood, section));
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
        const notes = this.spreadOctaves(baseNotes, 3, 4);
        const pattern = randomChoice(moodArpStyles(mood, section));
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
        const notes = this.spreadOctaves(baseNotes, Math.max(3, adjLow), Math.min(5, adjHigh));
        const trancePattern = randomChoice(moodArpStyles(mood, section));
        const fill = this.pickFill16(density * sectionMult);
        const steps = this.applyDisplacement(this.buildFromFill(notes, trancePattern, 16, fill), state);
        const tranceGain = 0.16 * (0.5 + density * 0.5);
        const tranceVelGain = this.getVelocityGain(tranceGain, 16, mood);
        return `note("${steps.join(' ')}")
          .sound("sawtooth")
          ${articulationToStrudel(sectionArticulation(section, tension, 0.12))}
          .slow(1)
          .gain("${tranceVelGain}")
          .hpf(250)
          .lpf(${(2000 + brightness * 6000).toFixed(0)})
          .resonance(5)
          .pan(sine.range(0.3, 0.7).slow(3))
          .room(${(room * 0.4).toFixed(2)})
          .roomsize(1.5)
          .delay(0.35)
          .delaytime(0.1875)
          .delayfeedback(0.4)
          .orbit(${this.orbit})`;
      }

      case 'avril': {
        // Square pip — tiny gentle clicks, distinct from triangle melody
        const notes = this.spreadOctaves(baseNotes, 4, 5);
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
        const notes = this.spreadOctaves(baseNotes, 4, 6);
        const fill = this.pickFill16(density * sectionMult * 0.15);
        const steps = this.applyDisplacement(this.buildFromFill(notes, 'broken', 16, fill), state);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.05)
          ${articulationToStrudel(sectionArticulation(section, tension, 0.15))}
          .slow(6)
          .gain(${(0.1 * (0.3 + density * 0.3)).toFixed(3)})
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
        const notes = this.spreadOctaves(baseNotes, Math.max(2, adjLow), Math.min(5, adjHigh));
        const syroPattern = randomChoice(moodArpStyles(mood, section));
        const fill = this.pickFill16(density * sectionMult * 1.2);
        const steps = this.applyDisplacement(this.buildFromFill(notes, syroPattern, 16, fill), state);
        const syroGain = 0.12 * (0.5 + density * 0.5);
        const syroVelGain = this.getVelocityGain(syroGain, 16, mood);
        return `note("${steps.join(' ')}")
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
        const notes = this.spreadOctaves(baseNotes, 3, 4);
        const pattern = randomChoice(moodArpStyles(mood, section));
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.applyDisplacement(this.buildFromFill(notes, pattern, 8, fill), state);
        const bhGain = 0.15 * (0.5 + density * 0.5);
        const bhVelGain = this.getVelocityGain(bhGain, 8, mood);
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
        const notes = this.spreadOctaves(baseNotes, 4, 6);
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
        const notes = this.spreadOctaves(baseNotes, Math.max(3, adjLow), Math.min(5, adjHigh));
        const discoPattern = randomChoice(moodArpStyles(mood, section));
        const fill = this.pickFill16(density * sectionMult);
        const steps = this.applyDisplacement(this.buildFromFill(notes, discoPattern, 16, fill), state);
        const discoGain = 0.18 * (0.5 + density * 0.5);
        const velGain = this.getVelocityGain(discoGain, 16, mood);
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
  private getVelocityGain(baseGain: number, steps: number, mood: Mood): string {
    const pattern = MOOD_VELOCITY[mood];
    const curve = velocityCurve(steps, pattern);
    return curve.map(v => (baseGain * v).toFixed(4)).join(' ');
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
    return result;
  }

}
