import { describe, it, expect } from 'vitest';
import {
  pedalDecayMultiplier,
  pedalReverbMultiplier,
  pedalDepth,
} from './sustain-pedal-simulation';

describe('pedalDecayMultiplier', () => {
  it('common tones extend decay', () => {
    const mul = pedalDecayMultiplier([0, 4, 7], [0, 5, 9], 'lofi'); // C shared
    expect(mul).toBeGreaterThan(1.0);
  });

  it('no common tones = no extension', () => {
    const mul = pedalDecayMultiplier([0, 4, 7], [1, 5, 8], 'lofi'); // no common
    // Even with no common tones, still >= 1.0
    expect(mul).toBeGreaterThanOrEqual(1.0);
  });

  it('more common tones = more sustain', () => {
    const one = pedalDecayMultiplier([0, 4, 7], [0, 5, 9], 'lofi'); // 1 common
    const two = pedalDecayMultiplier([0, 4, 7], [0, 4, 9], 'lofi'); // 2 common
    expect(two).toBeGreaterThan(one);
  });

  it('stays in 1.0-1.8 range', () => {
    const mul = pedalDecayMultiplier([0, 4, 7], [0, 4, 7], 'ambient'); // all common
    expect(mul).toBeGreaterThanOrEqual(1.0);
    expect(mul).toBeLessThanOrEqual(1.8);
  });
});

describe('pedalReverbMultiplier', () => {
  it('more common tones = more reverb', () => {
    const one = pedalReverbMultiplier(1, 'lofi');
    const three = pedalReverbMultiplier(3, 'lofi');
    expect(three).toBeGreaterThan(one);
  });

  it('stays in 1.0-1.3 range', () => {
    const mul = pedalReverbMultiplier(5, 'ambient');
    expect(mul).toBeGreaterThanOrEqual(1.0);
    expect(mul).toBeLessThanOrEqual(1.3);
  });
});

describe('pedalDepth', () => {
  it('ambient is highest', () => {
    expect(pedalDepth('ambient')).toBe(0.65);
  });

  it('blockhead is low', () => {
    expect(pedalDepth('blockhead')).toBe(0.15);
  });
});
