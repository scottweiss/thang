import { describe, it, expect } from 'vitest';
import {
  shouldInsertSilence,
  silenceGainMultiplier,
  layerSilenceOrder,
} from './strategic-silence';

describe('shouldInsertSilence', () => {
  it('build→peak triggers silence (statistical)', () => {
    let triggered = 0;
    const trials = 500;
    for (let i = 0; i < trials; i++) {
      if (shouldInsertSilence('peak', true, 'build')) triggered++;
    }
    // 80% chance — expect roughly 400/500, allow wide margin
    expect(triggered).toBeGreaterThan(300);
    expect(triggered).toBeLessThan(475);
  });

  it('breakdown→build triggers sometimes', () => {
    let triggered = 0;
    const trials = 500;
    for (let i = 0; i < trials; i++) {
      if (shouldInsertSilence('build', true, 'breakdown')) triggered++;
    }
    // 40% chance — expect roughly 200/500
    expect(triggered).toBeGreaterThan(120);
    expect(triggered).toBeLessThan(300);
  });

  it('groove→peak does not trigger', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldInsertSilence('peak', true, 'groove')).toBe(false);
    }
  });

  it('requires sectionChanged to be true', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldInsertSilence('peak', false, 'build')).toBe(false);
    }
  });
});

describe('silenceGainMultiplier', () => {
  it('returns near-zero during silence', () => {
    expect(silenceGainMultiplier(0, 2)).toBe(0.02);
    expect(silenceGainMultiplier(1, 2)).toBe(0.02);
  });

  it('returns 1.0 after silence', () => {
    expect(silenceGainMultiplier(3, 2)).toBe(1.0);
    expect(silenceGainMultiplier(10, 2)).toBe(1.0);
  });

  it('ramps up at boundary', () => {
    expect(silenceGainMultiplier(2, 2)).toBe(0.5);
  });
});

describe('layerSilenceOrder', () => {
  it('texture has lowest priority (drops first)', () => {
    const textureOrder = layerSilenceOrder('texture');
    expect(textureOrder).toBe(0);
    expect(textureOrder).toBeLessThan(layerSilenceOrder('harmony'));
    expect(textureOrder).toBeLessThan(layerSilenceOrder('drone'));
  });

  it('drone has highest priority (drops last)', () => {
    const droneOrder = layerSilenceOrder('drone');
    expect(droneOrder).toBe(3);
    expect(droneOrder).toBeGreaterThan(layerSilenceOrder('texture'));
    expect(droneOrder).toBeGreaterThan(layerSilenceOrder('melody'));
    expect(droneOrder).toBeGreaterThan(layerSilenceOrder('atmosphere'));
  });
});
