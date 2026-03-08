import { Layer } from '../layer';
import { GenerativeState } from '../../types';

export class HarmonyLayer implements Layer {
  name = 'harmony';
  orbit = 1;

  generate(state: GenerativeState): string {
    const chord = state.currentChord;
    const mood = state.mood;
    const gain = 0.35 * (0.5 + state.params.density * 0.5);
    const room = 0.4 + state.params.spaciousness * 0.4;
    const brightness = state.params.brightness;

    switch (mood) {
      case 'ambient':
        // Evolving pad with slow filter sweep and wide stereo
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sine")
          .fm(2)
          .fmh(2)
          .fmenv("exp")
          .fmdecay(0.5)
          .attack(0.2)
          .decay(1.5)
          .sustain(0.15)
          .release(1)
          .slow(4)
          .gain(${(gain * 0.7).toFixed(3)})
          .lpf(sine.range(${(800 + brightness * 500).toFixed(0)}, ${(1500 + brightness * 1500).toFixed(0)}).slow(13))
          .pan(sine.range(0.2, 0.8).slow(11))
          .room(${room.toFixed(2)})
          .roomsize(4)
          .orbit(${this.orbit})`;

      case 'downtempo':
        // Piano-like FM chords with shimmer and stereo
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sine")
          .fm(3)
          .fmh(2)
          .fmenv("exp")
          .fmdecay(0.3)
          .attack(0.005)
          .decay(0.8)
          .sustain(0.1)
          .release(0.4)
          .slow(2)
          .gain(${gain.toFixed(3)})
          .lpf(sine.range(${(1500 + brightness * 1000).toFixed(0)}, ${(3000 + brightness * 2000).toFixed(0)}).slow(7))
          .pan(sine.range(0.3, 0.7).slow(5))
          .detune(sine.range(-1, 1).slow(9))
          .room(${room.toFixed(2)})
          .roomsize(3)
          .delay(0.15)
          .delaytime(0.375)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;

      case 'lofi':
        // Jazzy Rhodes-style with warm wobble and chorus
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sine")
          .fm(4)
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.2)
          .attack(0.003)
          .decay(0.5)
          .sustain(0.1)
          .release(0.3)
          .slow(2)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(1200 + brightness * 800).toFixed(0)}, ${(2500 + brightness * 2000).toFixed(0)}).slow(5))
          .detune(sine.range(-3, 3).slow(4))
          .pan(sine.range(0.3, 0.7).slow(7))
          .room(${(room * 0.7).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;

      case 'trance':
        // Big supersaw pad with filter sweep and wide detune
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sawtooth")
          .attack(0.05)
          .decay(0.3)
          .sustain(0.4)
          .release(0.2)
          .slow(1)
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(sine.range(${(800 + brightness * 1500).toFixed(0)}, ${(2000 + brightness * 4000).toFixed(0)}).slow(3))
          .resonance(5)
          .detune(sine.range(-6, 6).slow(2))
          .pan(sine.range(0.25, 0.75).slow(4))
          .room(${room.toFixed(2)})
          .roomsize(3)
          .delay(0.2)
          .delaytime(0.25)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;
    }
  }
}
