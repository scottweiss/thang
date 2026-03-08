import { describe, it, expect } from 'vitest';
import {
  drumToHarmonyResonance,
  drumToHarmonyDecay,
  harmonyToDrumGain,
  shouldApplyCoupling,
  couplingStrength,
} from './layer-feedback-coupling';

describe('drumToHarmonyResonance', () => {
  it('high drum density increases resonance', () => {
    expect(drumToHarmonyResonance(0.8, 'trance')).toBeGreaterThan(1.0);
  });

  it('low drum density decreases resonance', () => {
    expect(drumToHarmonyResonance(0.2, 'trance')).toBeLessThan(1.0);
  });

  it('neutral at 0.5 density', () => {
    expect(drumToHarmonyResonance(0.5, 'trance')).toBe(1.0);
  });

  it('clamped between 0.8 and 1.3', () => {
    expect(drumToHarmonyResonance(1.0, 'disco')).toBeLessThanOrEqual(1.3);
    expect(drumToHarmonyResonance(0.0, 'disco')).toBeGreaterThanOrEqual(0.8);
  });
});

describe('drumToHarmonyDecay', () => {
  it('high drum density shortens decay', () => {
    expect(drumToHarmonyDecay(0.8, 'trance')).toBeLessThan(1.0);
  });

  it('low drum density lengthens decay', () => {
    expect(drumToHarmonyDecay(0.2, 'trance')).toBeGreaterThan(1.0);
  });

  it('clamped between 0.7 and 1.2', () => {
    expect(drumToHarmonyDecay(1.0, 'disco')).toBeGreaterThanOrEqual(0.7);
    expect(drumToHarmonyDecay(0.0, 'disco')).toBeLessThanOrEqual(1.2);
  });
});

describe('harmonyToDrumGain', () => {
  it('richer harmony boosts drums', () => {
    expect(harmonyToDrumGain(5, 'disco')).toBeGreaterThan(1.0);
  });

  it('simple triads = no boost', () => {
    expect(harmonyToDrumGain(3, 'disco')).toBe(1.0);
  });

  it('capped at 1.1', () => {
    expect(harmonyToDrumGain(10, 'disco')).toBeLessThanOrEqual(1.1);
  });
});

describe('shouldApplyCoupling', () => {
  it('trance applies', () => {
    expect(shouldApplyCoupling('trance')).toBe(true);
  });

  it('ambient barely applies', () => {
    expect(shouldApplyCoupling('ambient')).toBe(true);
  });
});

describe('couplingStrength', () => {
  it('disco is strongest', () => {
    expect(couplingStrength('disco')).toBe(0.55);
  });

  it('ambient is weakest', () => {
    expect(couplingStrength('ambient')).toBe(0.10);
  });
});
