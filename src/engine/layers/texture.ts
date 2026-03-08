import { CachingLayer } from '../caching-layer';
import { GenerativeState } from '../../types';
import { randomChoice } from '../random';

export class TextureLayer extends CachingLayer {
  name = 'texture';
  orbit = 3;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) return true;
    if (state.scaleChanged) return true;

    const loopTicks = { downtempo: 8, lofi: 8, trance: 6 }[state.mood] ?? 8;
    if (this.ticksSinceLastGeneration(state) >= loopTicks) return true;

    return false;
  }

  protected buildPattern(state: GenerativeState): string {
    const density = state.params.density;
    const mood = state.mood;
    const gain = 0.3 * density;
    const room = 0.3 + state.params.spaciousness * 0.3;

    switch (mood) {
      case 'ambient':
        return this.buildDrumPattern(
          { bdProb: 0, sdProb: 0, hatProb: density * 0.15, fills: ['hh'] },
          3, gain * 0.4, room, state
        );

      case 'downtempo':
        return this.buildDrumPattern(
          { bdProb: 1, sdProb: 0.65, hatProb: density * 0.3, fills: ['hh', 'cp'] },
          1, gain * 0.8, room, state
        );

      case 'lofi':
        return this.buildDrumPattern(
          { bdProb: 1, sdProb: 0.8, hatProb: density * 0.5, fills: ['hh', 'hh', 'cp'] },
          1, gain, room * 0.7, state
        );

      case 'trance':
        return this.buildTrancePattern(density, gain * 1.2, room * 0.5, state);
    }
  }

  private buildDrumPattern(
    opts: { bdProb: number; sdProb: number; hatProb: number; fills: string[] },
    slowVal: number, gain: number, room: number, state: GenerativeState
  ): string {
    const steps: string[] = [];
    for (let i = 0; i < 16; i++) {
      if ((i === 0 || i === 8) && opts.bdProb > 0) {
        steps.push(Math.random() < opts.bdProb ? 'bd' : '~');
      } else if ((i === 4 || i === 12) && opts.sdProb > 0) {
        steps.push(Math.random() < opts.sdProb ? 'sd' : '~');
      } else if (Math.random() < opts.hatProb) {
        steps.push(randomChoice(opts.fills));
      } else {
        steps.push('~');
      }
    }

    return `sound("${steps.join(' ')}")
      .slow(${slowVal})
      .gain(${gain.toFixed(3)})
      .lpf(${(2500 + state.params.brightness * 3000).toFixed(0)})
      .room(${room.toFixed(2)})
      .roomsize(2)
      .orbit(${this.orbit})`;
  }

  private buildTrancePattern(
    density: number, gain: number, room: number, state: GenerativeState
  ): string {
    const steps: string[] = [];
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) {
        steps.push('bd');
      } else if (i % 4 === 2) {
        steps.push(Math.random() < 0.7 ? 'hh' : 'cp');
      } else if (Math.random() < density * 0.4) {
        steps.push('hh');
      } else {
        steps.push('~');
      }
    }

    return `sound("${steps.join(' ')}")
      .slow(1)
      .gain(${gain.toFixed(3)})
      .lpf(${(3000 + state.params.brightness * 4000).toFixed(0)})
      .room(${room.toFixed(2)})
      .roomsize(1)
      .orbit(${this.orbit})`;
  }
}
