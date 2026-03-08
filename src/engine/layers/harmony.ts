import { Layer } from '../layer';
import { GenerativeState } from '../../types';

export class HarmonyLayer implements Layer {
  name = 'harmony';
  orbit = 1;

  generate(state: GenerativeState): string {
    const chord = state.currentChord;
    const mood = state.mood;
    const gain = 0.28 * (0.5 + state.params.density * 0.5);
    const room = 0.4 + state.params.spaciousness * 0.4;
    const brightness = state.params.brightness;

    switch (mood) {
      case 'ambient':
        // Ethereal glass pad — high harmonicity FM creates bell/shimmer overtones
        // Slowly breathing FM index for organic evolution, long sustain for pad feel
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sine")
          .fm(sine.range(${(1 + brightness).toFixed(1)}, ${(2.5 + brightness * 2).toFixed(1)}).slow(19))
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.8)
          .attack(0.3)
          .decay(2)
          .sustain(0.4)
          .release(1.5)
          .slow(4)
          .gain(${(gain * 0.7).toFixed(3)})
          .lpf(sine.range(${(600 + brightness * 400).toFixed(0)}, ${(1200 + brightness * 1200).toFixed(0)}).slow(13))
          .pan(sine.range(0.15, 0.85).slow(11))
          .detune(sine.range(-1, 1).slow(17))
          .room(${room.toFixed(2)})
          .roomsize(5)
          .orbit(${this.orbit})`;

      case 'downtempo':
        // Warm electric piano — mid-harmonicity FM with bell-like decay
        // Percussive attack with singing sustain, stereo shimmer via delay
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sine")
          .fm(${(2.5 + brightness * 1).toFixed(1)})
          .fmh(2)
          .fmenv("exp")
          .fmdecay(0.45)
          .attack(0.005)
          .decay(1)
          .sustain(0.08)
          .release(0.5)
          .slow(2)
          .gain(${gain.toFixed(3)})
          .hpf(200)
          .lpf(sine.range(${(1500 + brightness * 1000).toFixed(0)}, ${(3000 + brightness * 2000).toFixed(0)}).slow(7))
          .pan(sine.range(0.3, 0.7).slow(5))
          .detune(sine.range(-1.5, 1.5).slow(9))
          .room(${room.toFixed(2)})
          .roomsize(3)
          .delay(0.18)
          .delaytime(0.375)
          .delayfeedback(0.25)
          .orbit(${this.orbit})`;

      case 'lofi':
        // Vintage Rhodes — fundamental FM ratio for warmth, bit crush for tape feel
        // Short decay for comping rhythm, chorus detune for width
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sine")
          .fm(${(3 + brightness * 1.5).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.15)
          .attack(0.003)
          .decay(0.4)
          .sustain(0.08)
          .release(0.25)
          .slow(2)
          .gain(${(gain * 1.1).toFixed(3)})
          .hpf(250)
          .lpf(${(1200 + brightness * 2500).toFixed(0)})
          .crush(${(12 + brightness * 4).toFixed(0)})
          .detune(sine.range(-4, 4).slow(3))
          .pan(sine.range(0.3, 0.7).slow(7))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(1.5)
          .orbit(${this.orbit})`;

      case 'trance':
        // Massive supersaw — wide detuned sawtooth with pumping filter
        // Higher sustain for wall-of-sound, resonant filter sweep
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sawtooth")
          .attack(0.03)
          .decay(0.2)
          .sustain(0.5)
          .release(0.15)
          .slow(1)
          .gain(${(gain * 0.9).toFixed(3)})
          .hpf(120)
          .lpf(sine.range(${(800 + brightness * 1500).toFixed(0)}, ${(2500 + brightness * 4500).toFixed(0)}).slow(3))
          .resonance(${(4 + brightness * 4).toFixed(0)})
          .detune(sine.range(-8, 8).slow(2))
          .pan(sine.range(0.2, 0.8).slow(4))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .delay(0.22)
          .delaytime(0.25)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;

      case 'avril':
        // Prepared piano — sine with bell-like percussive FM attack
        // This is the KEY sound: intimate, warm, Avril 14th character
        return `chord("${chord.symbol}")
          .voicing()
          .sound("sine")
          .fm(5)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.08)
          .attack(0.005)
          .decay(1.2)
          .sustain(0.06)
          .release(1)
          .slow(3)
          .gain(${(gain * 0.8).toFixed(3)})
          .hpf(180)
          .lpf(sine.range(${(1200 + brightness * 800).toFixed(0)}, ${(2500 + brightness * 1500).toFixed(0)}).slow(11))
          .pan(sine.range(0.3, 0.7).slow(9))
          .room(${(room * 1.1).toFixed(2)})
          .roomsize(4)
          .delay(0.3)
          .delaytime(0.5)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;
    }
  }
}
