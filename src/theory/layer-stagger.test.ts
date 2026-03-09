import { describe, it, expect } from 'vitest';
import { layerFadeInRate, layerFadeOutRate } from './layer-stagger';

describe('layerFadeInRate', () => {
  it('texture (drums) enters fastest', () => {
    const texture = layerFadeInRate('texture');
    const melody = layerFadeInRate('melody');
    const harmony = layerFadeInRate('harmony');
    expect(texture).toBeGreaterThan(harmony);
    expect(texture).toBeGreaterThan(melody);
  });

  it('drone enters before harmony', () => {
    expect(layerFadeInRate('drone')).toBeGreaterThan(layerFadeInRate('harmony'));
  });

  it('melody enters last', () => {
    const layers = ['texture', 'drone', 'atmosphere', 'harmony', 'arp', 'melody'];
    const rates = layers.map(l => layerFadeInRate(l));
    const melodyRate = layerFadeInRate('melody');
    expect(melodyRate).toBe(Math.min(...rates));
  });

  it('all rates are positive and <= 1', () => {
    const layers = ['texture', 'drone', 'atmosphere', 'harmony', 'arp', 'melody'];
    for (const layer of layers) {
      const rate = layerFadeInRate(layer);
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });

  it('unknown layers get default rate', () => {
    expect(layerFadeInRate('unknown')).toBe(0.33);
  });

  it('stagger creates meaningful delay', () => {
    // texture reaches 1.0 in ceil(1/0.5) = 2 ticks
    // melody reaches 1.0 in ceil(1/0.22) = 5 ticks
    // That's a 3-tick (~6 second) stagger — musically meaningful
    const textureTicks = Math.ceil(1 / layerFadeInRate('texture'));
    const melodyTicks = Math.ceil(1 / layerFadeInRate('melody'));
    expect(melodyTicks - textureTicks).toBeGreaterThanOrEqual(2);
  });
});

describe('layerFadeOutRate', () => {
  it('melody exits fastest (reverse of entry stagger)', () => {
    const melody = layerFadeOutRate('melody');
    const texture = layerFadeOutRate('texture');
    const harmony = layerFadeOutRate('harmony');
    expect(melody).toBeGreaterThan(harmony);
    expect(melody).toBeGreaterThan(texture);
  });

  it('texture (drums) exits last — holds the groove', () => {
    const layers = ['texture', 'drone', 'atmosphere', 'harmony', 'arp', 'melody'];
    const rates = layers.map(l => layerFadeOutRate(l));
    const textureRate = layerFadeOutRate('texture');
    expect(textureRate).toBe(Math.min(...rates));
  });

  it('all rates are positive and <= 1', () => {
    const layers = ['texture', 'drone', 'atmosphere', 'harmony', 'arp', 'melody'];
    for (const layer of layers) {
      const rate = layerFadeOutRate(layer);
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });

  it('stagger creates meaningful exit delay', () => {
    // melody exits in ceil(1/0.55) = 2 ticks
    // texture exits in ceil(1/0.25) = 4 ticks
    // That's a 2-tick (~4 second) stagger
    const melodyTicks = Math.ceil(1 / layerFadeOutRate('melody'));
    const textureTicks = Math.ceil(1 / layerFadeOutRate('texture'));
    expect(textureTicks - melodyTicks).toBeGreaterThanOrEqual(1);
  });
});
