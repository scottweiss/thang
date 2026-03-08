import { describe, it, expect } from 'vitest';
import { tensionSpaceMultiplier, shouldApplyTensionSpace } from './tension-space';

describe('tensionSpaceMultiplier', () => {
  it('neutral tension returns ~1.0', () => {
    expect(tensionSpaceMultiplier(0.5, 'downtempo')).toBeCloseTo(1.0, 2);
  });

  it('high tension dries out (multiplier < 1)', () => {
    expect(tensionSpaceMultiplier(0.9, 'downtempo')).toBeLessThan(1.0);
  });

  it('low tension adds space (multiplier > 1)', () => {
    expect(tensionSpaceMultiplier(0.1, 'downtempo')).toBeGreaterThan(1.0);
  });

  it('inverts tension-brightness relationship', () => {
    // High tension = dry (less reverb) but bright (more filter)
    const highTension = tensionSpaceMultiplier(0.9, 'trance');
    const lowTension = tensionSpaceMultiplier(0.1, 'trance');
    expect(highTension).toBeLessThan(lowTension);
  });

  it('trance has strong spatial compression at peaks', () => {
    const mult = tensionSpaceMultiplier(1.0, 'trance');
    expect(mult).toBeLessThan(0.8);
  });

  it('avril stays spacious even at high tension', () => {
    const mult = tensionSpaceMultiplier(0.9, 'avril');
    expect(mult).toBeGreaterThan(0.85);
  });

  it('syro compresses most dramatically', () => {
    const syro = tensionSpaceMultiplier(1.0, 'syro');
    const ambient = tensionSpaceMultiplier(1.0, 'ambient');
    expect(syro).toBeLessThan(ambient);
  });

  it('all moods stay within clamped range', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let t = 0; t <= 1; t += 0.25) {
        const mult = tensionSpaceMultiplier(t, mood);
        expect(mult).toBeGreaterThanOrEqual(0.5);
        expect(mult).toBeLessThanOrEqual(1.5);
      }
    }
  });
});

describe('shouldApplyTensionSpace', () => {
  it('applies to drone', () => {
    expect(shouldApplyTensionSpace('drone')).toBe(true);
  });

  it('applies to melody', () => {
    expect(shouldApplyTensionSpace('melody')).toBe(true);
  });

  it('applies to arp', () => {
    expect(shouldApplyTensionSpace('arp')).toBe(true);
  });

  it('does not apply to atmosphere', () => {
    expect(shouldApplyTensionSpace('atmosphere')).toBe(false);
  });
});
