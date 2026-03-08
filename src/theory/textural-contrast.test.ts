import { describe, it, expect } from 'vitest';
import {
  layerTexturalRole,
  texturalEnvelopeMultipliers,
  shouldApplyTexturalContrast,
  texturalContrastStrength,
} from './textural-contrast';

const FULL_LAYERS = new Set(['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere']);
const SPARSE_LAYERS = new Set(['drone']);

describe('layerTexturalRole', () => {
  it('assigns default roles', () => {
    expect(layerTexturalRole('drone', 'groove', 'lofi')).toBe('anchor');
    expect(layerTexturalRole('harmony', 'groove', 'lofi')).toBe('sustain');
    expect(layerTexturalRole('melody', 'groove', 'lofi')).toBe('melodic');
    expect(layerTexturalRole('arp', 'groove', 'lofi')).toBe('rhythmic');
    expect(layerTexturalRole('texture', 'groove', 'lofi')).toBe('rhythmic');
    expect(layerTexturalRole('atmosphere', 'groove', 'lofi')).toBe('sustain');
  });

  it('harmony becomes rhythmic at peaks for contrasting moods', () => {
    expect(layerTexturalRole('harmony', 'peak', 'disco')).toBe('rhythmic');
    expect(layerTexturalRole('harmony', 'peak', 'lofi')).toBe('rhythmic');
  });

  it('harmony stays sustain at peaks for ambient', () => {
    expect(layerTexturalRole('harmony', 'peak', 'ambient')).toBe('sustain');
  });

  it('arp becomes melodic in breakdowns', () => {
    expect(layerTexturalRole('arp', 'breakdown', 'lofi')).toBe('melodic');
  });

  it('returns melodic for unknown layers', () => {
    expect(layerTexturalRole('unknown', 'groove', 'lofi')).toBe('melodic');
  });
});

describe('texturalEnvelopeMultipliers', () => {
  it('returns neutral for single layer', () => {
    const mult = texturalEnvelopeMultipliers('melody', 'groove', 'lofi', SPARSE_LAYERS);
    expect(mult.attack).toBe(1.0);
    expect(mult.decay).toBe(1.0);
    expect(mult.sustain).toBe(1.0);
    expect(mult.release).toBe(1.0);
  });

  it('rhythmic layers get shorter envelopes', () => {
    const mult = texturalEnvelopeMultipliers('arp', 'groove', 'disco', FULL_LAYERS);
    expect(mult.attack).toBeLessThan(1.0);
    expect(mult.decay).toBeLessThan(1.0);
    expect(mult.sustain).toBeLessThan(1.0);
  });

  it('sustain layers get longer envelopes', () => {
    const mult = texturalEnvelopeMultipliers('harmony', 'groove', 'disco', FULL_LAYERS);
    expect(mult.attack).toBeGreaterThan(1.0);
    expect(mult.sustain).toBeGreaterThan(1.0);
  });

  it('anchor layers get the longest envelopes', () => {
    const drone = texturalEnvelopeMultipliers('drone', 'groove', 'disco', FULL_LAYERS);
    const harmony = texturalEnvelopeMultipliers('harmony', 'groove', 'disco', FULL_LAYERS);
    expect(drone.attack).toBeGreaterThan(harmony.attack);
  });

  it('higher contrast moods produce more extreme multipliers', () => {
    const syro = texturalEnvelopeMultipliers('arp', 'groove', 'syro', FULL_LAYERS);
    const ambient = texturalEnvelopeMultipliers('arp', 'groove', 'ambient', FULL_LAYERS);
    // Syro should deviate more from 1.0
    expect(Math.abs(syro.decay - 1.0)).toBeGreaterThan(Math.abs(ambient.decay - 1.0));
  });

  it('peak section intensifies contrast', () => {
    const peak = texturalEnvelopeMultipliers('arp', 'peak', 'lofi', FULL_LAYERS);
    const intro = texturalEnvelopeMultipliers('arp', 'intro', 'lofi', FULL_LAYERS);
    expect(Math.abs(peak.decay - 1.0)).toBeGreaterThan(Math.abs(intro.decay - 1.0));
  });
});

describe('shouldApplyTexturalContrast', () => {
  it('returns true for multiple layers and non-ambient mood', () => {
    expect(shouldApplyTexturalContrast('lofi', FULL_LAYERS)).toBe(true);
  });

  it('returns false for single layer', () => {
    expect(shouldApplyTexturalContrast('lofi', SPARSE_LAYERS)).toBe(false);
  });

  it('returns true for ambient with enough layers', () => {
    // ambient has 0.10 strength, which is >= 0.1 threshold
    expect(shouldApplyTexturalContrast('ambient', FULL_LAYERS)).toBe(true);
  });
});

describe('texturalContrastStrength', () => {
  it('syro has highest contrast', () => {
    expect(texturalContrastStrength('syro')).toBe(0.55);
  });

  it('ambient has lowest contrast', () => {
    expect(texturalContrastStrength('ambient')).toBe(0.10);
  });
});
