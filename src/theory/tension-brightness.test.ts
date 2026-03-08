import { describe, it, expect } from 'vitest';
import { tensionBrightnessMultiplier, shouldApplyTensionBrightness } from './tension-brightness';

describe('tensionBrightnessMultiplier', () => {
  it('neutral tension returns ~1.0', () => {
    const mult = tensionBrightnessMultiplier(0.5, 'downtempo');
    expect(mult).toBeCloseTo(1.0, 2);
  });

  it('high tension brightens (multiplier > 1)', () => {
    const mult = tensionBrightnessMultiplier(0.9, 'downtempo');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('low tension darkens (multiplier < 1)', () => {
    const mult = tensionBrightnessMultiplier(0.1, 'downtempo');
    expect(mult).toBeLessThan(1.0);
  });

  it('trance has stronger effect than ambient', () => {
    const trance = tensionBrightnessMultiplier(0.9, 'trance');
    const ambient = tensionBrightnessMultiplier(0.9, 'ambient');
    expect(trance).toBeGreaterThan(ambient);
  });

  it('syro has strongest effect', () => {
    const syro = tensionBrightnessMultiplier(0.9, 'syro');
    expect(syro).toBeGreaterThan(1.2);
  });

  it('avril has minimal effect', () => {
    const avril = tensionBrightnessMultiplier(0.9, 'avril');
    expect(avril).toBeLessThan(1.1);
  });

  it('zero tension produces darkest result', () => {
    const mult = tensionBrightnessMultiplier(0, 'trance');
    expect(mult).toBeLessThan(0.85);
  });

  it('full tension produces brightest result', () => {
    const mult = tensionBrightnessMultiplier(1.0, 'trance');
    expect(mult).toBeGreaterThan(1.2);
  });

  it('all moods stay within reasonable range', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let t = 0; t <= 1; t += 0.25) {
        const mult = tensionBrightnessMultiplier(t, mood);
        expect(mult).toBeGreaterThan(0.6);
        expect(mult).toBeLessThan(1.5);
      }
    }
  });
});

describe('shouldApplyTensionBrightness', () => {
  it('applies to melody', () => {
    expect(shouldApplyTensionBrightness('melody')).toBe(true);
  });

  it('applies to harmony', () => {
    expect(shouldApplyTensionBrightness('harmony')).toBe(true);
  });

  it('applies to arp', () => {
    expect(shouldApplyTensionBrightness('arp')).toBe(true);
  });

  it('does not apply to drone', () => {
    expect(shouldApplyTensionBrightness('drone')).toBe(false);
  });

  it('does not apply to atmosphere', () => {
    expect(shouldApplyTensionBrightness('atmosphere')).toBe(false);
  });
});
