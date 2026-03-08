import { describe, it, expect } from 'vitest';
import {
  tonicTriadPCs,
  nearestTriadTone,
  generateTVoice,
  selectPosition,
  shouldApplyTintinnabuli,
  tintinnabuliTendency,
} from './tintinnabuli';

describe('tonicTriadPCs', () => {
  it('C major = [0, 4, 7]', () => {
    expect(tonicTriadPCs('C', 'maj')).toEqual([0, 4, 7]);
  });

  it('A minor = [9, 0, 4]', () => {
    const pcs = tonicTriadPCs('A', 'min');
    expect(pcs[0]).toBe(9);  // A
    expect(pcs[1]).toBe(0);  // C
    expect(pcs[2]).toBe(4);  // E
  });

  it('G major = [7, 11, 2]', () => {
    const pcs = tonicTriadPCs('G', 'maj');
    expect(pcs[0]).toBe(7);
    expect(pcs[1]).toBe(11);
    expect(pcs[2]).toBe(2);
  });
});

describe('nearestTriadTone', () => {
  const cMajor = [0, 4, 7]; // C, E, G

  it('finds nearest triad tone above D4', () => {
    const result = nearestTriadTone('D4', cMajor, '1sup');
    // D4 = MIDI ~52, nearest C triad above: E4 (MIDI 52)
    expect(result).toBe('E4');
  });

  it('finds nearest triad tone below D4', () => {
    const result = nearestTriadTone('D4', cMajor, '1inf');
    // Nearest C triad below D4: C4
    expect(result).toBe('C4');
  });

  it('preserves rests', () => {
    expect(nearestTriadTone('~', cMajor, '1sup')).toBe('~');
  });

  it('handles 2nd position superior', () => {
    const result = nearestTriadTone('D4', cMajor, '2sup');
    // 1st above: E4, 2nd above: G4
    expect(result).toBe('G4');
  });
});

describe('generateTVoice', () => {
  it('generates T-voice for each M-voice note', () => {
    const mVoice = ['C4', 'D4', 'E4', 'F4'];
    const tVoice = generateTVoice(mVoice, 'C', 'maj', '1sup');
    expect(tVoice).toHaveLength(4);
    // Each note should be a triad tone (C, E, or G)
    for (const note of tVoice) {
      const name = note.replace(/\d+$/, '');
      expect(['C', 'E', 'G']).toContain(name);
    }
  });

  it('preserves rests in T-voice', () => {
    const tVoice = generateTVoice(['C4', '~', 'E4'], 'C', 'maj');
    expect(tVoice[1]).toBe('~');
  });

  it('works with minor triads', () => {
    const tVoice = generateTVoice(['A3', 'B3', 'C4'], 'A', 'min', '1sup');
    expect(tVoice).toHaveLength(3);
    // A minor triad: A, C, E
    for (const note of tVoice) {
      if (note === '~') continue;
      const name = note.replace(/\d+$/, '');
      expect(['A', 'C', 'E']).toContain(name);
    }
  });
});

describe('selectPosition', () => {
  it('is deterministic', () => {
    const a = selectPosition('xtal', 'breakdown', 42);
    const b = selectPosition('xtal', 'breakdown', 42);
    expect(a).toBe(b);
  });

  it('returns valid position type', () => {
    const result = selectPosition('ambient', 'groove', 100);
    expect(['1sup', '1inf', '2sup', '2inf']).toContain(result);
  });
});

describe('shouldApplyTintinnabuli', () => {
  it('is deterministic', () => {
    const a = shouldApplyTintinnabuli(42, 'xtal', 'breakdown');
    const b = shouldApplyTintinnabuli(42, 'xtal', 'breakdown');
    expect(a).toBe(b);
  });

  it('breakdown has more tintinnabuli than peak', () => {
    const breakdownCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyTintinnabuli(i, 'xtal', 'breakdown')
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyTintinnabuli(i, 'xtal', 'peak')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThan(peakCount);
  });
});

describe('tintinnabuliTendency', () => {
  it('xtal has highest', () => {
    expect(tintinnabuliTendency('xtal')).toBe(0.35);
  });

  it('trance has lowest', () => {
    expect(tintinnabuliTendency('trance')).toBe(0.02);
  });
});
