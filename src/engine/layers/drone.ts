import { Layer } from '../layer';
import { GenerativeState } from '../../types';

export class DroneLayer implements Layer {
  name = 'drone';
  orbit = 0;

  generate(state: GenerativeState): string {
    const root = state.scale.root;
    const fifth = state.scale.notes[4] || state.scale.notes[0];
    const mood = state.mood;
    const gain = 0.15 * (0.5 + state.params.density * 0.5);
    const room = 0.5 + state.params.spaciousness * 0.3;
    const brightness = state.params.brightness;

    switch (mood) {
      case 'ambient':
        // Evolving sine pad with slow filter sweep and stereo drift
        return `note("${root}2")
          .sound("sine")
          .attack(0.8)
          .decay(2)
          .sustain(0.2)
          .release(1.5)
          .slow(4)
          .gain(${(gain * 0.6).toFixed(3)})
          .lpf(sine.range(${(150 + brightness * 150).toFixed(0)}, ${(300 + brightness * 400).toFixed(0)}).slow(11))
          .pan(sine.range(0.3, 0.7).slow(13))
          .room(${room.toFixed(2)})
          .roomsize(4)
          .orbit(${this.orbit})`;

      case 'downtempo':
        // Warm detuned pad with filter movement — Boards of Canada warmth
        return `note("${root}2 ${fifth}2")
          .sound("sawtooth")
          .attack(0.1)
          .decay(0.8)
          .sustain(0.3)
          .release(0.5)
          .slow(3)
          .gain(${gain.toFixed(3)})
          .lpf(sine.range(${(200 + brightness * 200).toFixed(0)}, ${(450 + brightness * 500).toFixed(0)}).slow(7))
          .resonance(3)
          .pan(sine.range(0.35, 0.65).slow(9))
          .detune(sine.range(-3, 3).slow(5))
          .room(${room.toFixed(2)})
          .roomsize(3)
          .orbit(${this.orbit})`;

      case 'lofi':
        // Warm bass with subtle vibrato and filter wobble
        return `note("${root}2 ${root}2 ${fifth}1 ${fifth}1")
          .sound("triangle")
          .attack(0.01)
          .decay(0.3)
          .sustain(0.15)
          .release(0.2)
          .slow(2)
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 200).toFixed(0)}, ${(500 + brightness * 500).toFixed(0)}).slow(5))
          .detune(sine.range(-2, 2).slow(3))
          .pan(sine.range(0.4, 0.6).slow(7))
          .room(${(room * 0.7).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;

      case 'trance':
        // Pulsing bass with filter pump and stereo width
        return `note("${root}2 ${root}2 ${fifth}2 ${root}2")
          .sound("sawtooth")
          .attack(0.005)
          .decay(0.15)
          .sustain(0.2)
          .release(0.1)
          .slow(1)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 400).toFixed(0)}, ${(700 + brightness * 1000).toFixed(0)}).slow(2))
          .resonance(6)
          .detune(sine.range(-4, 4).slow(3))
          .pan(sine.range(0.35, 0.65).slow(4))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;
    }
  }
}
