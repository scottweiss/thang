import { CachingLayer } from '../caching-layer';
import { GenerativeState, Section, Mood } from '../../types';
import { randomChoice, shuffle } from '../random';
import { euclideanFillPositions } from '../../theory/euclidean';
import { velocityCurve, VelocityPattern } from '../../theory/groove';
import { getAdjustedOctaveRange } from '../../theory/register';

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
    const density = state.params.density * (0.9 + tension * 0.2);
    const brightness = state.params.brightness * (0.85 + tension * 0.3);
    const room = (0.4 + state.params.spaciousness * 0.4) * (1.1 - tension * 0.2);
    const sectionMult = SECTION_DENSITY[state.section];

    // Build arp notes from chord tones across octaves
    const baseNotes = chord.notes;

    // Register awareness: get adjusted octave range to avoid melody collision
    const [adjLow, adjHigh] = getAdjustedOctaveRange('arp', state.layerCenterPitches);
    state.layerCenterPitches['arp'] = 60; // middle C as default center

    switch (mood) {
      case 'ambient': {
        const notes = this.spreadOctaves(baseNotes, 3, 5);
        const fill = this.pickFill16(density * sectionMult * 0.3);
        const steps = this.buildFromFill(notes, 'up', 16, fill);
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
        const pattern = randomChoice<ArpPattern>(['up', 'updown', 'broken']);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.buildFromFill(notes, pattern, 8, fill);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.04)
          .attack(0.001)
          .decay(0.1)
          .sustain(0.01)
          .release(0.06)
          .slow(3)
          .gain(${(0.16 * (0.5 + density * 0.5)).toFixed(3)})
          .hpf(400)
          .lpf(${(2500 + brightness * 3500).toFixed(0)})
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
        const pattern = randomChoice<ArpPattern>(['broken', 'updown', 'down']);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.buildFromFill(notes, pattern, 8, fill);
        return `note("${steps.join(' ')}")
          .sound("triangle")
          .fm(0.4)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.04)
          .attack(0.001)
          .decay(0.08)
          .sustain(0.01)
          .release(0.05)
          .slow(2)
          .gain(${(0.15 * (0.5 + density * 0.5)).toFixed(3)})
          .hpf(450)
          .lpf(${(1500 + brightness * 2500).toFixed(0)})
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1)
          .delay(0.2)
          .delaytime(0.375)
          .delayfeedback(0.15)
          .orbit(${this.orbit})`;
      }

      case 'trance': {
        const notes = this.spreadOctaves(baseNotes, Math.max(3, adjLow), Math.min(5, adjHigh));
        // Section-aware pattern: build uses updown, peak uses up, breakdown sparse
        const trancePattern: ArpPattern = state.section === 'peak' || state.section === 'groove'
          ? randomChoice<ArpPattern>(['up', 'updown'])
          : state.section === 'build'
            ? 'updown'
            : 'broken';
        const fill = this.pickFill16(density * sectionMult);
        const steps = this.buildFromFill(notes, trancePattern, 16, fill);
        const tranceGain = 0.16 * (0.5 + density * 0.5);
        const tranceVelGain = this.getVelocityGain(tranceGain, 16, mood);
        return `note("${steps.join(' ')}")
          .sound("sawtooth")
          .attack(0.001)
          .decay(0.12)
          .sustain(0.02)
          .release(0.05)
          .slow(1)
          .gain("${tranceVelGain}")
          .hpf(250)
          .lpf(${(2000 + brightness * 6000).toFixed(0)})
          .resonance(5)
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
        const steps = this.buildFromFill(notes, 'broken', 16, fill);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.04)
          .attack(0.001)
          .decay(0.12)
          .sustain(0.01)
          .release(0.08)
          .slow(5)
          .gain(${(0.1 * (0.3 + density * 0.4)).toFixed(3)})
          .hpf(300)
          .lpf(${(2200 + brightness * 2500).toFixed(0)})
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
        const steps = this.buildFromFill(notes, 'broken', 16, fill);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.05)
          .attack(0.001)
          .decay(0.15)
          .sustain(0.01)
          .release(0.1)
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
        const syroPattern: ArpPattern = state.section === 'peak' || state.section === 'groove'
          ? randomChoice<ArpPattern>(['up', 'updown'])
          : state.section === 'build'
            ? 'updown'
            : randomChoice<ArpPattern>(['broken', 'down']);
        const fill = this.pickFill16(density * sectionMult * 1.2);
        const steps = this.buildFromFill(notes, syroPattern, 16, fill);
        const syroGain = 0.12 * (0.5 + density * 0.5);
        const syroVelGain = this.getVelocityGain(syroGain, 16, mood);
        return `note("${steps.join(' ')}")
          .sound("sawtooth")
          .attack(0.001)
          .decay(0.08)
          .sustain(0.02)
          .release(0.03)
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
        const pattern = randomChoice<ArpPattern>(['broken', 'updown', 'up']);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.buildFromFill(notes, pattern, 8, fill);
        const bhGain = 0.15 * (0.5 + density * 0.5);
        const bhVelGain = this.getVelocityGain(bhGain, 8, mood);
        return `note("${steps.join(' ')}")
          .sound("triangle")
          .fm(0.4)
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.04)
          .attack(0.001)
          .decay(0.1)
          .sustain(0.01)
          .release(0.06)
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
        const steps = this.buildFromFill(notes, 'broken', 16, fill);
        return `note("${steps.join(' ')}")
          .sound("square")
          .fm(0.3)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.03)
          .attack(0.001)
          .decay(0.08)
          .sustain(0.01)
          .release(0.05)
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
        const discoPattern: ArpPattern = state.section === 'peak' || state.section === 'groove'
          ? randomChoice<ArpPattern>(['up', 'updown'])
          : state.section === 'build'
            ? 'updown'
            : 'broken';
        const fill = this.pickFill16(density * sectionMult);
        const steps = this.buildFromFill(notes, discoPattern, 16, fill);
        const discoGain = 0.18 * (0.5 + density * 0.5);
        const velGain = this.getVelocityGain(discoGain, 16, mood);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(${(2 + brightness * 1.5).toFixed(1)})
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.04)
          .attack(0.001)
          .decay(0.1)
          .sustain(0.02)
          .release(0.05)
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
    notes: string[], pattern: ArpPattern, length: number, fillPositions: number[]
  ): string[] {
    const sequence = this.getArpSequence(notes, pattern);
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

  // Create the note ordering for different arp patterns
  private getArpSequence(notes: string[], pattern: ArpPattern): string[] {
    switch (pattern) {
      case 'up':
        return notes;
      case 'down':
        return [...notes].reverse();
      case 'updown': {
        if (notes.length <= 2) return notes;
        const mid = notes.slice(1, -1);
        return [...notes, ...mid.reverse()];
      }
      case 'broken': {
        return shuffle(notes);
      }
    }
  }
}
