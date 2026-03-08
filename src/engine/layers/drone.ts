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

    switch (mood) {
      case 'ambient':
        // Slow sine pad — note lasts ~16s at CPS=0.25
        return `note("${root}2")
          .sound("sine")
          .attack(0.8)
          .decay(2)
          .sustain(0.2)
          .release(1.5)
          .slow(4)
          .gain(${(gain * 0.6).toFixed(3)})
          .lpf(${(200 + state.params.brightness * 300).toFixed(0)})
          .room(${room.toFixed(2)})
          .roomsize(4)
          .orbit(${this.orbit})`;

      case 'downtempo':
        // Warm pad, two notes over ~8s
        return `note("${root}2 ${fifth}2")
          .sound("sawtooth")
          .attack(0.1)
          .decay(0.8)
          .sustain(0.3)
          .release(0.5)
          .slow(3)
          .gain(${gain.toFixed(3)})
          .lpf(${(300 + state.params.brightness * 400).toFixed(0)})
          .resonance(3)
          .room(${room.toFixed(2)})
          .roomsize(3)
          .orbit(${this.orbit})`;

      case 'lofi':
        // Muted warm bass — triangle wave
        return `note("${root}2 ${root}2 ${fifth}1 ${fifth}1")
          .sound("triangle")
          .attack(0.01)
          .decay(0.3)
          .sustain(0.15)
          .release(0.2)
          .slow(2)
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(${(400 + state.params.brightness * 400).toFixed(0)})
          .room(${(room * 0.7).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;

      case 'trance':
        // Pulsing bass — rhythmic energy
        return `note("${root}2 ${root}2 ${fifth}2 ${root}2")
          .sound("sawtooth")
          .attack(0.005)
          .decay(0.15)
          .sustain(0.2)
          .release(0.1)
          .slow(1)
          .gain(${(gain * 1.3).toFixed(3)})
          .lpf(${(500 + state.params.brightness * 800).toFixed(0)})
          .resonance(5)
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;
    }
  }
}
