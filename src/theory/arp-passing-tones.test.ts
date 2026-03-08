import { describe, it, expect } from 'vitest';
import {
  addPassingTones,
  shouldAddPassingTones,
  passingToneDensity,
} from './arp-passing-tones';

describe('addPassingTones', () => {
  const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  it('adds scale tones between chord tones', () => {
    const result = addPassingTones(['C4', 'E4', 'G4'], cMajorScale, 'lofi');
    // Should include D4 and/or F4 as passing tones
    expect(result.length).toBeGreaterThan(3);
    // All original chord tones should be present
    expect(result).toContain('C4');
    expect(result).toContain('E4');
    expect(result).toContain('G4');
  });

  it('chord tones come first in each segment', () => {
    const result = addPassingTones(['C4', 'G4'], cMajorScale, 'lofi');
    // C4 should be at index 0
    expect(result[0]).toBe('C4');
    // G4 should be the last element
    expect(result[result.length - 1]).toBe('G4');
  });

  it('returns original notes when pool too small', () => {
    expect(addPassingTones(['C4'], cMajorScale, 'lofi')).toEqual(['C4']);
    expect(addPassingTones([], cMajorScale, 'lofi')).toEqual([]);
  });

  it('trance adds fewer passing tones than lofi', () => {
    const lofi = addPassingTones(['C4', 'E4', 'G4', 'B4'], cMajorScale, 'lofi');
    const trance = addPassingTones(['C4', 'E4', 'G4', 'B4'], cMajorScale, 'trance');
    expect(lofi.length).toBeGreaterThanOrEqual(trance.length);
  });

  it('preserves order (passing tones between chord tones)', () => {
    const result = addPassingTones(['C4', 'G4'], cMajorScale, 'lofi');
    // All passing tones between C4 and G4 should have pitches between them
    const c4Idx = result.indexOf('C4');
    const g4Idx = result.indexOf('G4');
    expect(g4Idx).toBeGreaterThan(c4Idx);
  });

  it('works across octave boundaries', () => {
    const result = addPassingTones(['G4', 'C5'], cMajorScale, 'lofi');
    // Should include A4 and/or B4 as passing tones
    expect(result.length).toBeGreaterThan(2);
  });

  it('handles minor scale', () => {
    const cMinorScale = ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'];
    const result = addPassingTones(['C4', 'Eb4', 'G4'], cMinorScale, 'lofi');
    expect(result.length).toBeGreaterThan(3);
    expect(result).toContain('C4');
    expect(result).toContain('Eb4');
    expect(result).toContain('G4');
  });
});

describe('shouldAddPassingTones', () => {
  it('true for lofi groove', () => {
    expect(shouldAddPassingTones('lofi', 'groove')).toBe(true);
  });

  it('true for trance peak', () => {
    expect(shouldAddPassingTones('trance', 'peak')).toBe(true);
  });

  it('false for trance intro (0.10 * 0.5 = 0.05)', () => {
    expect(shouldAddPassingTones('trance', 'intro')).toBe(false);
  });
});

describe('passingToneDensity', () => {
  it('lofi groove is highest', () => {
    const lofiGroove = passingToneDensity('lofi', 'groove');
    const tranceIntro = passingToneDensity('trance', 'intro');
    expect(lofiGroove).toBeGreaterThan(tranceIntro);
  });

  it('breakdown reduces density', () => {
    const groove = passingToneDensity('downtempo', 'groove');
    const breakdown = passingToneDensity('downtempo', 'breakdown');
    expect(breakdown).toBeLessThan(groove);
  });
});
