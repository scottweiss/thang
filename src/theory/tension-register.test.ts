import { describe, it, expect } from 'vitest';
import {
  tensionRegisterShift,
  applyRegisterShift,
  registerBrightnessFactor,
  shouldApplyTensionRegister,
  tensionRegisterSensitivity,
} from './tension-register';

describe('tensionRegisterShift', () => {
  it('returns 0 at neutral tension (0.5)', () => {
    expect(tensionRegisterShift(0.5, 'trance', 'harmony')).toBe(0);
  });

  it('returns positive at high tension', () => {
    expect(tensionRegisterShift(1.0, 'trance', 'harmony')).toBeGreaterThan(0);
  });

  it('returns negative at low tension', () => {
    expect(tensionRegisterShift(0.0, 'trance', 'harmony')).toBeLessThan(0);
  });

  it('scales by mood sensitivity', () => {
    const trance = tensionRegisterShift(1.0, 'trance', 'harmony');
    const ambient = tensionRegisterShift(1.0, 'ambient', 'harmony');
    expect(trance).toBeGreaterThan(ambient);
  });

  it('scales by layer weight', () => {
    const harmony = tensionRegisterShift(1.0, 'lofi', 'harmony');
    const drone = tensionRegisterShift(1.0, 'lofi', 'drone');
    expect(harmony).toBeGreaterThan(drone);
  });

  it('clamps tension to 0-1', () => {
    const over = tensionRegisterShift(2.0, 'lofi', 'melody');
    const one = tensionRegisterShift(1.0, 'lofi', 'melody');
    expect(over).toBe(one);

    const under = tensionRegisterShift(-1.0, 'lofi', 'melody');
    const zero = tensionRegisterShift(0.0, 'lofi', 'melody');
    expect(under).toBe(zero);
  });

  it('uses default weight for unknown layer', () => {
    const shift = tensionRegisterShift(1.0, 'lofi', 'unknown');
    expect(shift).toBeGreaterThan(0);
  });
});

describe('applyRegisterShift', () => {
  it('shifts notes up by 1 octave', () => {
    expect(applyRegisterShift(['C3', 'E3', 'G3'], 1)).toEqual(['C4', 'E4', 'G4']);
  });

  it('shifts notes down by 1 octave', () => {
    expect(applyRegisterShift(['C4', 'E4', 'G4'], -1)).toEqual(['C3', 'E3', 'G3']);
  });

  it('returns same notes for zero shift', () => {
    const notes = ['C4', 'E4', 'G4'];
    expect(applyRegisterShift(notes, 0)).toBe(notes);
  });

  it('rounds fractional shift', () => {
    expect(applyRegisterShift(['C3'], 0.6)).toEqual(['C4']);
    expect(applyRegisterShift(['C3'], 0.4)).toEqual(['C3']);
  });

  it('clamps octave to 1-7', () => {
    expect(applyRegisterShift(['C7'], 2)).toEqual(['C7']);
    expect(applyRegisterShift(['C1'], -2)).toEqual(['C1']);
  });

  it('handles sharps and flats', () => {
    expect(applyRegisterShift(['Bb3', 'F#4'], 1)).toEqual(['Bb4', 'F#5']);
  });

  it('passes through non-note strings', () => {
    expect(applyRegisterShift(['~', 'C4'], 1)).toEqual(['~', 'C5']);
  });
});

describe('registerBrightnessFactor', () => {
  it('returns 1.0 for integer shift', () => {
    expect(registerBrightnessFactor(1.0)).toBe(1.0);
    expect(registerBrightnessFactor(0.0)).toBe(1.0);
    expect(registerBrightnessFactor(-1.0)).toBe(1.0);
  });

  it('returns > 1.0 for positive fractional', () => {
    expect(registerBrightnessFactor(0.3)).toBeGreaterThan(1.0);
  });

  it('returns < 1.0 for negative fractional', () => {
    expect(registerBrightnessFactor(-0.3)).toBeLessThan(1.0);
  });

  it('stays within 0.9-1.1 range', () => {
    for (let s = -1; s <= 1; s += 0.1) {
      const f = registerBrightnessFactor(s);
      expect(f).toBeGreaterThanOrEqual(0.85);
      expect(f).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('shouldApplyTensionRegister', () => {
  it('returns true for high-sensitivity moods', () => {
    expect(shouldApplyTensionRegister('trance')).toBe(true);
    expect(shouldApplyTensionRegister('disco')).toBe(true);
    expect(shouldApplyTensionRegister('lofi')).toBe(true);
  });

  it('returns false for ambient (below threshold)', () => {
    expect(shouldApplyTensionRegister('ambient')).toBe(false);
  });
});

describe('tensionRegisterSensitivity', () => {
  it('returns correct values for each mood', () => {
    expect(tensionRegisterSensitivity('trance')).toBe(0.50);
    expect(tensionRegisterSensitivity('ambient')).toBe(0.05);
    expect(tensionRegisterSensitivity('lofi')).toBe(0.25);
  });
});
