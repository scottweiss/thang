import { CachingLayer } from '../caching-layer';
import { GenerativeState, Section } from '../../types';

export class AtmosphereLayer extends CachingLayer {
  name = 'atmosphere';
  orbit = 5;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (this.moodChanged(state)) return true;
    if (state.scaleChanged) return true;
    if (state.sectionChanged) return true;

    // Atmosphere is slow-evolving, regenerate infrequently
    const maxTicks = { ambient: 15, downtempo: 12, lofi: 10, trance: 6 }[state.mood] ?? 12;
    return this.ticksSinceLastGeneration(state) >= maxTicks;
  }

  protected buildPattern(state: GenerativeState): string {
    const mood = state.mood;
    const density = state.params.density;
    const brightness = state.params.brightness;
    const spaciousness = state.params.spaciousness;
    const room = 0.5 + spaciousness * 0.4;
    const section = state.section;

    switch (mood) {
      case 'ambient':
        return this.buildAmbientAtmosphere(density, brightness, room, section);

      case 'downtempo':
        return this.buildDowntempoAtmosphere(density, brightness, room, section);

      case 'lofi':
        return this.buildLofiAtmosphere(density, brightness, room, section);

      case 'trance':
        return this.buildTranceAtmosphere(density, brightness, room, section);
    }
  }

  private buildAmbientAtmosphere(density: number, brightness: number, room: number, section: Section): string {
    // Evolving noise wash — FM index creates breathy texture
    // Section controls the warmth and openness
    const sectionGain = { intro: 0.6, build: 0.8, peak: 1.0, breakdown: 0.7, groove: 0.9 }[section];
    const gain = 0.04 * (0.3 + density * 0.4) * sectionGain;
    // Peak sections open the filter wider
    const lpfBoost = section === 'peak' || section === 'groove' ? 200 : 0;
    const lpf = 300 + brightness * 500 + lpfBoost;

    return `note("C1")
      .sound("sine")
      .fm(${(12 + brightness * 8).toFixed(0)})
      .fmh(0.5)
      .fmenv("exp")
      .fmdecay(2)
      .attack(3)
      .decay(4)
      .sustain(0.3)
      .release(3)
      .slow(7)
      .gain(${gain.toFixed(4)})
      .lpf(sine.range(${(lpf * 0.7).toFixed(0)}, ${lpf.toFixed(0)}).slow(23))
      .pan(sine.range(0.2, 0.8).slow(19))
      .room(${room.toFixed(2)})
      .roomsize(6)
      .orbit(${this.orbit})`;
  }

  private buildDowntempoAtmosphere(density: number, brightness: number, room: number, section: Section): string {
    // Sparse textural pops — wider stereo, section-aware density
    const gain = 0.035 * (0.3 + density * 0.4);
    const popDensity = section === 'peak' || section === 'groove' ? 0.18 : 0.1;

    const crackleSteps: string[] = [];
    for (let i = 0; i < 16; i++) {
      crackleSteps.push(Math.random() < popDensity ? 'hh' : '~');
    }

    return `sound("${crackleSteps.join(' ')}")
      .slow(2)
      .gain(${(gain * 0.5).toFixed(4)})
      .hpf(${(3000 + brightness * 3000).toFixed(0)})
      .lpf(${(8000 + brightness * 4000).toFixed(0)})
      .pan(sine.range(0.15, 0.85).slow(7))
      .delay(0.15)
      .delaytime(0.5)
      .delayfeedback(0.2)
      .room(${(room * 0.4).toFixed(2)})
      .roomsize(2)
      .orbit(${this.orbit})`;
  }

  private buildLofiAtmosphere(density: number, brightness: number, room: number, section: Section): string {
    // Constant vinyl crackle bed — the signature lofi sound
    // Denser than downtempo, always present, section modulates volume
    const sectionGain = { intro: 0.5, build: 0.7, peak: 1.0, breakdown: 0.6, groove: 0.9 }[section];
    const gain = 0.04 * (0.4 + density * 0.3) * sectionGain;

    const crackleSteps: string[] = [];
    for (let i = 0; i < 32; i++) {
      crackleSteps.push(Math.random() < 0.22 ? 'hh' : '~');
    }

    return `sound("${crackleSteps.join(' ')}")
      .slow(2)
      .gain(${gain.toFixed(4)})
      .crush(12)
      .hpf(${(4000 + brightness * 2000).toFixed(0)})
      .lpf(${(7000 + brightness * 3000).toFixed(0)})
      .pan(sine.range(0.3, 0.7).slow(11))
      .room(${(room * 0.3).toFixed(2)})
      .roomsize(1)
      .orbit(${this.orbit})`;
  }

  private buildTranceAtmosphere(density: number, brightness: number, room: number, section: Section): string {
    // Section-aware trance atmosphere:
    // Build: rising noise sweep with opening filter
    // Peak: white noise energy wash
    // Breakdown: quiet, sparse — space to breathe
    const gain = 0.05 * (0.3 + density * 0.5);

    if (section === 'build') {
      // Rising filter sweep — LPF opens over time (via slow sine)
      return `note("C1")
        .sound("sawtooth")
        .fm(${(15 + brightness * 10).toFixed(0)})
        .fmh(0.25)
        .fmenv("exp")
        .fmdecay(1.5)
        .attack(2)
        .decay(2)
        .sustain(0.3)
        .release(0.5)
        .slow(4)
        .gain(${(gain * 0.8).toFixed(4)})
        .lpf(sine.range(${(200 + brightness * 300).toFixed(0)}, ${(1500 + brightness * 2000).toFixed(0)}).slow(8))
        .resonance(10)
        .room(${(room * 0.6).toFixed(2)})
        .roomsize(3)
        .orbit(${this.orbit})`;
    }

    if (section === 'peak' || section === 'groove') {
      // High energy noise wash — open filter, wider
      return `note("C1")
        .sound("sawtooth")
        .fm(${(18 + brightness * 8).toFixed(0)})
        .fmh(0.5)
        .fmenv("exp")
        .fmdecay(1)
        .attack(0.5)
        .decay(1)
        .sustain(0.4)
        .release(0.3)
        .slow(2)
        .gain(${gain.toFixed(4)})
        .lpf(${(800 + brightness * 2000).toFixed(0)})
        .resonance(6)
        .pan(sine.range(0.25, 0.75).slow(5))
        .room(${(room * 0.5).toFixed(2)})
        .roomsize(2)
        .orbit(${this.orbit})`;
    }

    // Intro/breakdown: very quiet, sparse — just a hint of texture
    return `note("C2")
      .sound("sine")
      .fm(${(8 + brightness * 5).toFixed(0)})
      .fmh(0.5)
      .fmenv("exp")
      .fmdecay(2)
      .attack(2)
      .decay(3)
      .sustain(0.15)
      .release(2)
      .slow(6)
      .gain(${(gain * 0.3).toFixed(4)})
      .lpf(${(200 + brightness * 400).toFixed(0)})
      .room(${room.toFixed(2)})
      .roomsize(5)
      .orbit(${this.orbit})`;
  }
}
