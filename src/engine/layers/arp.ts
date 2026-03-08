import { CachingLayer } from '../caching-layer';
import { GenerativeState } from '../../types';
import { randomChoice, shuffle } from '../random';

type ArpPattern = 'up' | 'down' | 'updown' | 'broken';

export class ArpLayer extends CachingLayer {
  name = 'arp';
  orbit = 4;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) return true;
    if (state.chordChanged) return true;
    if (state.scaleChanged) return true;

    const maxTicks = { downtempo: 10, lofi: 8, trance: 6 }[state.mood] ?? 8;
    return this.ticksSinceLastGeneration(state) >= maxTicks;
  }

  protected buildPattern(state: GenerativeState): string {
    const chord = state.currentChord;
    const mood = state.mood;
    const density = state.params.density;
    const brightness = state.params.brightness;
    const room = 0.4 + state.params.spaciousness * 0.4;

    // Build arp notes from chord tones across octaves
    const baseNotes = chord.notes; // e.g. ["C3", "Eb3", "G3", "Bb3"]

    switch (mood) {
      case 'ambient': {
        // Very sparse — single notes from chord with long gaps
        const notes = this.spreadOctaves(baseNotes, 3, 5);
        const steps = this.buildArpSteps(notes, 'up', 16, density * 0.12);
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
        // Gentle broken chord — piano-like
        const notes = this.spreadOctaves(baseNotes, 3, 4);
        const pattern = randomChoice<ArpPattern>(['up', 'updown', 'broken']);
        const steps = this.buildArpSteps(notes, pattern, 8, density * 0.4);
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
          .lpf(${(2000 + brightness * 3000).toFixed(0)})
          .room(${room.toFixed(2)})
          .roomsize(3)
          .delay(0.3)
          .delaytime(0.33)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;
      }

      case 'lofi': {
        // Jazzy broken chord — warm, slightly syncopated
        const notes = this.spreadOctaves(baseNotes, 3, 4);
        const pattern = randomChoice<ArpPattern>(['broken', 'updown', 'down']);
        const steps = this.buildArpSteps(notes, pattern, 8, density * 0.45);
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
          .lpf(${(1200 + brightness * 2000).toFixed(0)})
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(2)
          .delay(0.25)
          .delaytime(0.375)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;
      }

      case 'trance': {
        // Classic trance arp — fast, bright, 2-3 octave spread
        const notes = this.spreadOctaves(baseNotes, 3, 5);
        const steps = this.buildArpSteps(notes, 'up', 16, density * 0.7);
        return `note("${steps.join(' ')}")
          .sound("sawtooth")
          .attack(0.001)
          .decay(0.12)
          .sustain(0.02)
          .release(0.05)
          .slow(1)
          .gain(${(0.18 * (0.5 + density * 0.5)).toFixed(3)})
          .lpf(${(2000 + brightness * 6000).toFixed(0)})
          .resonance(5)
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .delay(0.35)
          .delaytime(0.1875)
          .delayfeedback(0.4)
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

  // Build a sequence of arp steps with rests
  private buildArpSteps(
    notes: string[], pattern: ArpPattern, length: number, fillProb: number
  ): string[] {
    const sequence = this.getArpSequence(notes, pattern);
    const steps: string[] = [];
    let hasNote = false;

    for (let i = 0; i < length; i++) {
      if (Math.random() < fillProb) {
        steps.push(sequence[i % sequence.length]);
        hasNote = true;
      } else {
        steps.push('~');
      }
    }

    // Ensure at least one note
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
