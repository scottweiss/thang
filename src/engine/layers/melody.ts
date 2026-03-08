import { CachingLayer } from '../caching-layer';
import { GenerativeState } from '../../types';
import { getPentatonicSubset } from '../../theory/scales';
import { randomChoice, weightedChoice } from '../random';

export class MelodyLayer extends CachingLayer {
  name = 'melody';
  orbit = 2;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) return true;
    if (state.chordChanged) return true;
    if (state.scaleChanged) return true;

    const maxTicks = { downtempo: 10, lofi: 8, trance: 6 }[state.mood] ?? 8;
    if (this.ticksSinceLastGeneration(state) >= maxTicks) return true;

    return false;
  }

  protected buildPattern(state: GenerativeState): string {
    const penta = getPentatonicSubset(state.scale);
    const density = state.params.density;
    const mood = state.mood;
    const room = 0.5 + state.params.spaciousness * 0.4;

    const noteProbability = {
      ambient: density * 0.15,
      downtempo: density * 0.25,
      lofi: density * 0.35,
      trance: density * 0.45,
    }[mood];

    const elements: string[] = [];
    for (let i = 0; i < 16; i++) {
      if (Math.random() < noteProbability) {
        const note = randomChoice(penta);
        const octave = mood === 'trance'
          ? weightedChoice([3, 4, 5], [1, 3, 3])
          : weightedChoice([4, 5], [3, 2]);
        elements.push(`${note}${octave}`);
      } else {
        elements.push('~');
      }
    }

    const gain = 0.25 * (0.4 + density * 0.6);

    switch (mood) {
      case 'ambient':
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(1.5)
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.3)
          .attack(0.01)
          .decay(0.8)
          .sustain(0.05)
          .release(0.5)
          .slow(5)
          .gain(${(gain * 0.7).toFixed(3)})
          .room(${room.toFixed(2)})
          .roomsize(4)
          .delay(0.4)
          .delaytime(0.5)
          .delayfeedback(0.4)
          .orbit(${this.orbit})`;

      case 'downtempo':
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(2)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.15)
          .attack(0.002)
          .decay(0.4)
          .sustain(0.05)
          .release(0.3)
          .slow(3)
          .gain(${gain.toFixed(3)})
          .room(${room.toFixed(2)})
          .roomsize(3)
          .delay(0.3)
          .delaytime(0.375)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;

      case 'lofi':
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(3)
          .fmh(2)
          .fmenv("exp")
          .fmdecay(0.1)
          .attack(0.003)
          .decay(0.3)
          .sustain(0.05)
          .release(0.2)
          .slow(2)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(${(1500 + state.params.brightness * 2000).toFixed(0)})
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(2)
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
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(${(3000 + state.params.brightness * 5000).toFixed(0)})
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(2)
          .delay(0.3)
          .delaytime(0.1875)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;
    }
  }
}
