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

    switch (mood) {
      case 'ambient':
        // Slow pad chord, moderate reverb
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
          .room(${room.toFixed(2)})
          .roomsize(4)
          .orbit(${this.orbit})`;

      case 'downtempo':
        // Piano-like FM chords
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
          .room(${room.toFixed(2)})
          .roomsize(3)
          .orbit(${this.orbit})`;

      case 'lofi':
        // Jazzy Rhodes-style — warm FM
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
          .lpf(${(2000 + state.params.brightness * 2000).toFixed(0)})
          .room(${(room * 0.7).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;

      case 'trance':
        // Big supersaw-style pad chords
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sawtooth")
          .attack(0.05)
          .decay(0.3)
          .sustain(0.4)
          .release(0.2)
          .slow(1)
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(${(1000 + state.params.brightness * 3000).toFixed(0)})
          .resonance(4)
          .room(${room.toFixed(2)})
          .roomsize(3)
          .delay(0.2)
          .delaytime(0.25)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;
    }
  }
}
