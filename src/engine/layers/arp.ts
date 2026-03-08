import { CachingLayer } from '../caching-layer';
import { GenerativeState, Section } from '../../types';
import { randomChoice, shuffle } from '../random';

type ArpPattern = 'up' | 'down' | 'updown' | 'broken';

// Section density multipliers — how much of the arp is active per section
const SECTION_DENSITY: Record<Section, number> = {
  intro: 0.3,
  build: 0.7,
  peak: 1.0,
  breakdown: 0.35,
  groove: 0.85,
};

// Rhythmic fill templates — which of 8 or 16 steps get notes
// These create actual rhythmic patterns instead of random placement
const FILL_8_SPARSE = [0, 3, 6];           // dotted rhythm
const FILL_8_MEDIUM = [0, 2, 3, 5, 7];     // syncopated
const FILL_8_DENSE  = [0, 1, 2, 3, 5, 6, 7]; // near-full
const FILL_16_SPARSE = [0, 4, 7, 12];       // 4-on-floor feel
const FILL_16_MEDIUM = [0, 2, 4, 6, 8, 10, 12, 14]; // 8th notes
const FILL_16_DENSE  = [0, 1, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14]; // rolling 16ths with gaps

export class ArpLayer extends CachingLayer {
  name = 'arp';
  orbit = 4;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) return true;
    if (state.chordChanged) return true;
    if (state.scaleChanged) return true;
    if (state.sectionChanged) return true;

    const maxTicks = { downtempo: 10, lofi: 8, trance: 6, avril: 12, xtal: 14, syro: 3, blockhead: 10, flim: 14 }[state.mood] ?? 8;
    return this.ticksSinceLastGeneration(state) >= maxTicks;
  }

  protected buildPattern(state: GenerativeState): string {
    const chord = state.currentChord;
    const mood = state.mood;
    const density = state.params.density;
    const brightness = state.params.brightness;
    const room = 0.4 + state.params.spaciousness * 0.4;
    const sectionMult = SECTION_DENSITY[state.section];

    // Build arp notes from chord tones across octaves
    const baseNotes = chord.notes;

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
        const notes = this.spreadOctaves(baseNotes, 3, 4);
        const pattern = randomChoice<ArpPattern>(['up', 'updown', 'broken']);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.buildFromFill(notes, pattern, 8, fill);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(2.5)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.12)
          .attack(0.002)
          .decay(0.5)
          .sustain(0.03)
          .release(0.4)
          .slow(3)
          .gain(${(0.15 * (0.5 + density * 0.5)).toFixed(3)})
          .hpf(300)
          .lpf(${(2000 + brightness * 3000).toFixed(0)})
          .room(${(room * 0.8).toFixed(2)})
          .roomsize(2)
          .delay(0.3)
          .delaytime(0.33)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;
      }

      case 'lofi': {
        const notes = this.spreadOctaves(baseNotes, 3, 4);
        const pattern = randomChoice<ArpPattern>(['broken', 'updown', 'down']);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.buildFromFill(notes, pattern, 8, fill);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(3.5)
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.08)
          .attack(0.003)
          .decay(0.35)
          .sustain(0.05)
          .release(0.25)
          .slow(2)
          .gain(${(0.14 * (0.5 + density * 0.5)).toFixed(3)})
          .hpf(350)
          .lpf(${(1200 + brightness * 2000).toFixed(0)})
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(1.5)
          .delay(0.25)
          .delaytime(0.375)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;
      }

      case 'trance': {
        const notes = this.spreadOctaves(baseNotes, 3, 5);
        // Section-aware pattern: build uses updown, peak uses up, breakdown sparse
        const trancePattern: ArpPattern = state.section === 'peak' || state.section === 'groove'
          ? randomChoice<ArpPattern>(['up', 'updown'])
          : state.section === 'build'
            ? 'updown'
            : 'broken';
        const fill = this.pickFill16(density * sectionMult);
        const steps = this.buildFromFill(notes, trancePattern, 16, fill);
        return `note("${steps.join(' ')}")
          .sound("sawtooth")
          .attack(0.001)
          .decay(0.12)
          .sustain(0.02)
          .release(0.05)
          .slow(1)
          .gain(${(0.16 * (0.5 + density * 0.5)).toFixed(3)})
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
        // Very sparse broken chord — high FM bell sound, long decay
        // Like occasional piano notes ringing out in an empty room
        const notes = this.spreadOctaves(baseNotes, 4, 5);
        const fill = this.pickFill16(density * sectionMult * 0.2);
        const steps = this.buildFromFill(notes, 'broken', 16, fill);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(5)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.1)
          .attack(0.003)
          .decay(1.5)
          .sustain(0.02)
          .release(1.5)
          .slow(5)
          .gain(${(0.1 * (0.3 + density * 0.4)).toFixed(3)})
          .hpf(250)
          .lpf(${(2000 + brightness * 2500).toFixed(0)})
          .room(${(room * 1.3).toFixed(2)})
          .roomsize(6)
          .delay(0.5)
          .delaytime(0.66)
          .delayfeedback(0.5)
          .orbit(${this.orbit})`;
      }

      case 'xtal': {
        // Very sparse broken arps — high octave bells with massive reverb/delay
        // SAW 85-92: ethereal, floating, distant chimes
        const notes = this.spreadOctaves(baseNotes, 4, 6);
        const fill = this.pickFill16(density * sectionMult * 0.15);
        const steps = this.buildFromFill(notes, 'broken', 16, fill);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(0.8)
          .fmh(5)
          .fmenv("exp")
          .fmdecay(0.8)
          .attack(0.03)
          .decay(2)
          .sustain(0.02)
          .release(2.5)
          .slow(6)
          .gain(${(0.1 * (0.3 + density * 0.3)).toFixed(3)})
          .hpf(300)
          .lpf(${(1800 + brightness * 2000).toFixed(0)})
          .pan(sine.range(0.1, 0.9).slow(11))
          .room(${(room * 1.5).toFixed(2)})
          .roomsize(8)
          .delay(0.55)
          .delaytime(0.75)
          .delayfeedback(0.55)
          .orbit(${this.orbit})`;
      }

      case 'syro': {
        // Dense 16th note arps — acid-style, resonant filter sweep, multiple octaves
        // Syro style: restless, intricate, technical
        const notes = this.spreadOctaves(baseNotes, 2, 5);
        const syroPattern: ArpPattern = state.section === 'peak' || state.section === 'groove'
          ? randomChoice<ArpPattern>(['up', 'updown'])
          : state.section === 'build'
            ? 'updown'
            : randomChoice<ArpPattern>(['broken', 'down']);
        const fill = this.pickFill16(density * sectionMult * 1.2);
        const steps = this.buildFromFill(notes, syroPattern, 16, fill);
        return `note("${steps.join(' ')}")
          .sound("sawtooth")
          .attack(0.001)
          .decay(0.08)
          .sustain(0.02)
          .release(0.03)
          .slow(1)
          .gain(${(0.14 * (0.5 + density * 0.5)).toFixed(3)})
          .hpf(200)
          .lpf(sine.range(${(800 + brightness * 1000).toFixed(0)}, ${(3000 + brightness * 5000).toFixed(0)}).slow(2))
          .resonance(${(12 + brightness * 8).toFixed(0)})
          .pan(sine.range(0.15, 0.85).slow(1.5))
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1)
          .delay(0.3)
          .delaytime(0.125)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;
      }

      case 'blockhead': {
        // Jazzy broken chord comping — spread across mid octaves, warm FM
        // Blockhead style: Rhodes-like comping, jazzy broken chords
        const notes = this.spreadOctaves(baseNotes, 3, 4);
        const pattern = randomChoice<ArpPattern>(['broken', 'updown', 'up']);
        const fill = this.pickFill8(density * sectionMult);
        const steps = this.buildFromFill(notes, pattern, 8, fill);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(2.5)
          .fmh(2)
          .fmenv("exp")
          .fmdecay(0.2)
          .attack(0.003)
          .decay(0.5)
          .sustain(0.04)
          .release(0.35)
          .slow(2)
          .gain(${(0.14 * (0.5 + density * 0.5)).toFixed(3)})
          .hpf(250)
          .lpf(${(1800 + brightness * 2500).toFixed(0)})
          .pan(sine.range(0.3, 0.7).slow(5))
          .room(${(room * 0.7).toFixed(2)})
          .roomsize(2)
          .delay(0.25)
          .delaytime(0.33)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;
      }

      case 'flim': {
        // Intricate delicate arps — high octave, very sparse, crystalline bells
        // Flim style: gentle, sparkling, music-box arpeggios
        const notes = this.spreadOctaves(baseNotes, 4, 6);
        const fill = this.pickFill16(density * sectionMult * 0.2);
        const steps = this.buildFromFill(notes, 'broken', 16, fill);
        return `note("${steps.join(' ')}")
          .sound("sine")
          .fm(2)
          .fmh(5)
          .fmenv("exp")
          .fmdecay(0.06)
          .attack(0.003)
          .decay(1.8)
          .sustain(0.02)
          .release(2)
          .slow(5)
          .gain(${(0.09 * (0.3 + density * 0.4)).toFixed(3)})
          .hpf(300)
          .lpf(${(2200 + brightness * 2500).toFixed(0)})
          .pan(sine.range(0.1, 0.9).slow(11))
          .room(${(room * 1.4).toFixed(2)})
          .roomsize(7)
          .delay(0.5)
          .delaytime(0.66)
          .delayfeedback(0.5)
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

  // Select which 8-step positions get notes based on density
  private pickFill8(effectiveDensity: number): number[] {
    if (effectiveDensity < 0.3) return FILL_8_SPARSE;
    if (effectiveDensity < 0.65) return FILL_8_MEDIUM;
    return FILL_8_DENSE;
  }

  // Select which 16-step positions get notes based on density
  private pickFill16(effectiveDensity: number): number[] {
    if (effectiveDensity < 0.3) return FILL_16_SPARSE;
    if (effectiveDensity < 0.65) return FILL_16_MEDIUM;
    return FILL_16_DENSE;
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
