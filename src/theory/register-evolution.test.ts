import { describe, it, expect } from 'vitest';
import { registerShift, registerTarget, shouldShiftRegister } from './register-evolution';

describe('registerShift', () => {
  it('build at progress 0 returns baseOctave', () => {
    expect(registerShift('build', 0, 4)).toBe(4);
  });

  it('build at progress 1 returns baseOctave + 1', () => {
    expect(registerShift('build', 1, 4)).toBe(5);
  });

  it('breakdown descends', () => {
    const start = registerShift('breakdown', 0, 4);
    const end = registerShift('breakdown', 1, 4);
    expect(start).toBeGreaterThan(end);
  });

  it('clamped to valid range', () => {
    // Very high base octave should be clamped to 6
    expect(registerShift('peak', 0, 6)).toBe(6);
    // Very low base octave during breakdown descent should be clamped to 2
    expect(registerShift('breakdown', 1, 2)).toBe(2);
  });
});

describe('registerTarget', () => {
  it('build climbs over progress', () => {
    const early = registerTarget('build', 0.1, 0.5);
    const late = registerTarget('build', 0.9, 0.5);
    expect(late).toBeGreaterThan(early);
  });

  it('peak is high', () => {
    const peakNote = registerTarget('peak', 0.5, 0.5);
    const grooveNote = registerTarget('groove', 0.5, 0.5);
    expect(peakNote).toBeGreaterThan(grooveNote);
  });

  it('clamped to [36, 84]', () => {
    // Breakdown at end with progress 1 → 72 - 18 = 54, within range
    // but with extreme values the clamp should still hold
    const low = registerTarget('breakdown', 1, 0);
    expect(low).toBeGreaterThanOrEqual(36);
    expect(low).toBeLessThanOrEqual(84);

    const high = registerTarget('peak', 0, 1);
    expect(high).toBeGreaterThanOrEqual(36);
    expect(high).toBeLessThanOrEqual(84);
  });
});

describe('shouldShiftRegister', () => {
  it('trance returns true', () => {
    expect(shouldShiftRegister('trance')).toBe(true);
  });

  it('ambient returns false', () => {
    expect(shouldShiftRegister('ambient')).toBe(false);
  });
});
