import { CachingLayer } from '../caching-layer';
import { GenerativeState } from '../../types';

export class AtmosphereLayer extends CachingLayer {
  name = 'atmosphere';
  orbit = 5;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (this.moodChanged(state)) return true;
    if (state.scaleChanged) return true;

    // Atmosphere is slow-evolving, regenerate infrequently
    const maxTicks = { ambient: 15, downtempo: 12, lofi: 10, trance: 8 }[state.mood] ?? 12;
    return this.ticksSinceLastGeneration(state) >= maxTicks;
  }

  protected buildPattern(state: GenerativeState): string {
    const mood = state.mood;
    const density = state.params.density;
    const brightness = state.params.brightness;
    const spaciousness = state.params.spaciousness;
    const room = 0.5 + spaciousness * 0.4;

    switch (mood) {
      case 'ambient':
        return this.buildAmbientAtmosphere(density, brightness, room);

      case 'downtempo':
        return this.buildDowntempoAtmosphere(density, brightness, room);

      case 'lofi':
        return this.buildLofiAtmosphere(density, brightness, room);

      case 'trance':
        return this.buildTranceAtmosphere(density, brightness, room);
    }
  }

  private buildAmbientAtmosphere(density: number, brightness: number, room: number): string {
    // Slowly evolving noise wash — high FM index creates chaotic/breathy texture
    const gain = 0.04 * (0.3 + density * 0.4);
    const lpf = 300 + brightness * 500;
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
      .lpf(${lpf.toFixed(0)})
      .room(${room.toFixed(2)})
      .roomsize(6)
      .orbit(${this.orbit})`;
  }

  private buildDowntempoAtmosphere(density: number, brightness: number, room: number): string {
    // Two stacked layers: subtle noise bed + sparse vinyl pops
    // Using stack-in-a-string won't work in our architecture, so we create
    // a noise pad texture with rhythmic variation
    const gain = 0.035 * (0.3 + density * 0.4);
    const lpf = 400 + brightness * 600;

    // Build a crackling rhythm pattern — sparse hi-hats as vinyl pops
    const crackleSteps: string[] = [];
    for (let i = 0; i < 16; i++) {
      crackleSteps.push(Math.random() < 0.12 ? 'hh' : '~');
    }

    // Use the crackle pattern with heavy filtering for vinyl character
    return `sound("${crackleSteps.join(' ')}")
      .slow(2)
      .gain(${(gain * 0.5).toFixed(4)})
      .hpf(${(3000 + brightness * 3000).toFixed(0)})
      .lpf(${(8000 + brightness * 4000).toFixed(0)})
      .room(${(room * 0.4).toFixed(2)})
      .roomsize(2)
      .orbit(${this.orbit})`;
  }

  private buildLofiAtmosphere(density: number, brightness: number, room: number): string {
    // Vinyl crackle — the signature lofi sound
    // Dense hi-hat hits with HPF + LPF to sound like vinyl surface noise
    const gain = 0.04 * (0.4 + density * 0.3);

    const crackleSteps: string[] = [];
    for (let i = 0; i < 32; i++) {
      crackleSteps.push(Math.random() < 0.2 ? 'hh' : '~');
    }

    return `sound("${crackleSteps.join(' ')}")
      .slow(2)
      .gain(${gain.toFixed(4)})
      .hpf(${(4000 + brightness * 2000).toFixed(0)})
      .lpf(${(7000 + brightness * 3000).toFixed(0)})
      .room(${(room * 0.3).toFixed(2)})
      .roomsize(1)
      .orbit(${this.orbit})`;
  }

  private buildTranceAtmosphere(density: number, brightness: number, room: number): string {
    // Filtered noise riser/sweep — builds tension
    // High FM index on low note creates noise-like texture
    const gain = 0.05 * (0.3 + density * 0.5);
    const lpf = 200 + brightness * 1500;

    return `note("C1")
      .sound("sawtooth")
      .fm(${(15 + brightness * 10).toFixed(0)})
      .fmh(0.25)
      .fmenv("exp")
      .fmdecay(1.5)
      .attack(1)
      .decay(1.5)
      .sustain(0.2)
      .release(0.5)
      .slow(3)
      .gain(${gain.toFixed(4)})
      .lpf(${lpf.toFixed(0)})
      .resonance(8)
      .room(${(room * 0.6).toFixed(2)})
      .roomsize(3)
      .orbit(${this.orbit})`;
  }
}
