import { Layer } from '../layer';
import { GenerativeState, Section } from '../../types';

// Section shapes the drone's presence — subtle in sparse sections, full in peak
const SECTION_GAIN: Record<Section, number> = {
  intro: 0.6, build: 0.85, peak: 1.0, breakdown: 0.7, groove: 0.9,
};
const SECTION_FILTER_MULT: Record<Section, number> = {
  intro: 0.6, build: 0.8, peak: 1.2, breakdown: 0.65, groove: 1.0,
};

export class DroneLayer implements Layer {
  name = 'drone';
  orbit = 0;

  generate(state: GenerativeState): string {
    const root = state.scale.root;
    const fifth = state.scale.notes[4] || state.scale.notes[0];
    const mood = state.mood;
    const sectionGain = SECTION_GAIN[state.section];
    const sectionFilter = SECTION_FILTER_MULT[state.section];
    const gain = 0.15 * (0.5 + state.params.density * 0.5) * sectionGain;
    const room = 0.5 + state.params.spaciousness * 0.3;
    const brightness = state.params.brightness * sectionFilter;

    // FM index evolves slowly with brightness for organic movement
    const fmSweep = `sine.range(${(0.5 + brightness * 0.5).toFixed(1)}, ${(1.5 + brightness * 2).toFixed(1)}).slow(17)`;

    switch (mood) {
      case 'ambient':
        // Evolving FM pad — low harmonicity creates breathy, organ-like texture
        return `note("${root}2")
          .sound("sine")
          .fm(${fmSweep})
          .fmh(2)
          .fmenv("exp")
          .fmdecay(1.5)
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
        // Warm FM bass — harmonicity 1 creates growl, slow FM sweep adds movement
        return `note("${root}2 ${fifth}2")
          .sound("sine")
          .fm(${(1 + brightness * 1.5).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.6)
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
        // Warm sub bass — triangle + light FM for subtle tape saturation feel
        return `note("${root}2 ${root}2 ${fifth}1 ${fifth}1")
          .sound("triangle")
          .fm(${(0.3 + brightness * 0.5).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.3)
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
        // Acid-tinged pulsing bass — higher FM and resonance for squelch
        return `note("${root}2 ${root}2 ${fifth}2 ${root}2")
          .sound("sawtooth")
          .fm(${(0.5 + brightness * 1).toFixed(1)})
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.15)
          .attack(0.005)
          .decay(0.15)
          .sustain(0.2)
          .release(0.1)
          .slow(1)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(300 + brightness * 400).toFixed(0)}, ${(700 + brightness * 1000).toFixed(0)}).slow(2))
          .resonance(${(6 + brightness * 4).toFixed(0)})
          .detune(sine.range(-4, 4).slow(3))
          .pan(sine.range(0.35, 0.65).slow(4))
          .room(${(room * 0.5).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;

      case 'avril':
        // Soft root note pedal — very quiet sine, slow attack, intimate
        return `note("${root}2")
          .sound("sine")
          .fm(${(0.3 + brightness * 0.3).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(1)
          .attack(1.5)
          .decay(3)
          .sustain(0.15)
          .release(2)
          .slow(6)
          .gain(${(gain * 0.4).toFixed(3)})
          .lpf(sine.range(${(120 + brightness * 100).toFixed(0)}, ${(250 + brightness * 200).toFixed(0)}).slow(19))
          .pan(sine.range(0.4, 0.6).slow(15))
          .room(${(room * 1.2).toFixed(2)})
          .roomsize(5)
          .orbit(${this.orbit})`;

      case 'xtal':
        // Deep reverberant sub bass — sine with slow FM sweep, massive room
        // SAW 85-92 style: warm, hazy, submerged
        return `note("${root}1")
          .sound("sine")
          .fm(sine.range(${(0.3 + brightness * 0.2).toFixed(1)}, ${(0.8 + brightness * 0.5).toFixed(1)}).slow(23))
          .fmh(1)
          .fmenv("exp")
          .fmdecay(2)
          .attack(1.2)
          .decay(3)
          .sustain(0.25)
          .release(2)
          .slow(5)
          .gain(${(gain * 0.7).toFixed(3)})
          .lpf(sine.range(${(80 + brightness * 60).toFixed(0)}, ${(180 + brightness * 120).toFixed(0)}).slow(19))
          .pan(sine.range(0.4, 0.6).slow(17))
          .room(${(room * 1.4).toFixed(2)})
          .roomsize(8)
          .orbit(${this.orbit})`;

      case 'syro':
        // Acid 303-style bass — sawtooth with high resonance, fast filter sweep
        // Short decay, squelchy, aggressive
        return `note("${root}2 ${root}2 ${fifth}2 ${root}2")
          .sound("sawtooth")
          .fm(${(0.8 + brightness * 0.5).toFixed(1)})
          .fmh(0.5)
          .fmenv("exp")
          .fmdecay(0.08)
          .attack(0.003)
          .decay(0.12)
          .sustain(0.15)
          .release(0.05)
          .slow(1)
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(sine.range(${(400 + brightness * 600).toFixed(0)}, ${(1200 + brightness * 2000).toFixed(0)}).slow(1.5))
          .resonance(${(20 + brightness * 8).toFixed(0)})
          .hpf(30)
          .detune(sine.range(-5, 5).slow(2))
          .pan(sine.range(0.35, 0.65).slow(3))
          .room(${(room * 0.3).toFixed(2)})
          .roomsize(1)
          .orbit(${this.orbit})`;

      case 'blockhead':
        // Warm sub bass — sine with slight saturation via low FM, solid hip-hop foundation
        return `note("${root}2 ${fifth}1")
          .sound("sine")
          .fm(${(0.5 + brightness * 0.4).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(0.4)
          .attack(0.01)
          .decay(0.5)
          .sustain(0.25)
          .release(0.3)
          .slow(2)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(sine.range(${(250 + brightness * 200).toFixed(0)}, ${(500 + brightness * 400).toFixed(0)}).slow(9))
          .pan(sine.range(0.4, 0.6).slow(7))
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;

      case 'flim':
        // Very soft sine pedal tone — gentle, barely there, slow breathing filter
        return `note("${root}2")
          .sound("sine")
          .fm(${(0.2 + brightness * 0.2).toFixed(1)})
          .fmh(1)
          .fmenv("exp")
          .fmdecay(1.5)
          .attack(1.5)
          .decay(3)
          .sustain(0.15)
          .release(2)
          .slow(6)
          .gain(${(gain * 0.35).toFixed(3)})
          .lpf(sine.range(${(100 + brightness * 80).toFixed(0)}, ${(220 + brightness * 180).toFixed(0)}).slow(21))
          .pan(sine.range(0.4, 0.6).slow(17))
          .room(${(room * 1.3).toFixed(2)})
          .roomsize(6)
          .orbit(${this.orbit})`;
    }
  }
}
