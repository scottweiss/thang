import { describe, it, expect } from 'vitest';
import {
  characteristicToneWeight,
  coloringStrength,
  getCharacteristicTones,
} from './modal-coloring';

describe('characteristicToneWeight', () => {
  it('boosts M3 in C major', () => {
    // E (4) is M3 above C (0) — characteristic of major
    expect(characteristicToneWeight(4, 0, 'major', 'lofi')).toBeGreaterThan(1.0);
  });

  it('no boost for non-characteristic tone', () => {
    // D (2) is M2 above C — not a characteristic tone of major
    expect(characteristicToneWeight(2, 0, 'major', 'lofi')).toBe(1.0);
  });

  it('boosts m3 in dorian', () => {
    // Eb (3) is m3 above C — characteristic of dorian
    expect(characteristicToneWeight(3, 0, 'dorian', 'lofi')).toBeGreaterThan(1.0);
  });

  it('boosts M6 in dorian', () => {
    // A (9) is M6 above C — the signature dorian tone
    expect(characteristicToneWeight(9, 0, 'dorian', 'lofi')).toBeGreaterThan(1.0);
  });

  it('lofi boost > trance boost', () => {
    const lofi = characteristicToneWeight(4, 0, 'major', 'lofi');
    const trance = characteristicToneWeight(4, 0, 'major', 'trance');
    expect(lofi).toBeGreaterThan(trance);
  });

  it('works with non-zero root', () => {
    // G major: root=7, M3=B=11 (7+4=11)
    expect(characteristicToneWeight(11, 7, 'major', 'lofi')).toBeGreaterThan(1.0);
  });

  it('weight never exceeds 2.0', () => {
    const w = characteristicToneWeight(4, 0, 'major', 'lofi');
    expect(w).toBeLessThanOrEqual(2.0);
  });

  it('falls back to major for unknown scale', () => {
    expect(characteristicToneWeight(4, 0, 'unknown', 'lofi')).toBeGreaterThan(1.0);
  });
});

describe('coloringStrength', () => {
  it('lofi is highest', () => {
    expect(coloringStrength('lofi')).toBe(0.55);
  });

  it('disco is lowest', () => {
    expect(coloringStrength('disco')).toBe(0.15);
  });
});

describe('getCharacteristicTones', () => {
  it('dorian has m3 and M6', () => {
    expect(getCharacteristicTones('dorian')).toEqual([3, 9]);
  });

  it('phrygian has m2 and m3', () => {
    expect(getCharacteristicTones('phrygian')).toEqual([1, 3]);
  });
});
