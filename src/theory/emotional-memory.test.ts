import { describe, it, expect } from 'vitest';
import {
  EmotionalMemoryBank,
  isEmotionalLandmark,
  recallAffinity,
} from './emotional-memory';
import type { EmotionalLandmark } from './emotional-memory';

describe('EmotionalMemoryBank', () => {
  it('starts empty', () => {
    const bank = new EmotionalMemoryBank();
    expect(bank.count).toBe(0);
  });

  it('stores landmarks', () => {
    const bank = new EmotionalMemoryBank();
    bank.store({
      tick: 10,
      section: 'peak',
      tension: 0.9,
      chord: { root: 'C', quality: 'maj', degree: 1 },
      type: 'tension_peak',
      weight: 0.9,
    });
    expect(bank.count).toBe(1);
  });

  it('limits to 20 landmarks', () => {
    const bank = new EmotionalMemoryBank();
    for (let i = 0; i < 30; i++) {
      bank.store({
        tick: i,
        section: 'groove',
        tension: 0.5,
        chord: { root: 'C', quality: 'maj', degree: 1 },
        type: 'section_arrival',
        weight: i / 30,
      });
    }
    expect(bank.count).toBeLessThanOrEqual(20);
  });

  it('recalls highest-weight landmark for breakdown', () => {
    const bank = new EmotionalMemoryBank();
    bank.store({
      tick: 5, section: 'groove', tension: 0.5,
      chord: { root: 'C', quality: 'maj', degree: 1 },
      type: 'section_arrival', weight: 0.3,
    });
    bank.store({
      tick: 10, section: 'peak', tension: 0.95,
      chord: { root: 'G', quality: 'dom7', degree: 5 },
      type: 'tension_peak', weight: 0.95,
    });
    const recalled = bank.recallChord('breakdown', 'lofi');
    expect(recalled).not.toBeNull();
    expect(recalled!.chord.root).toBe('G');
  });

  it('returns null when empty', () => {
    const bank = new EmotionalMemoryBank();
    expect(bank.recallChord('groove', 'lofi')).toBeNull();
  });

  it('clears all landmarks', () => {
    const bank = new EmotionalMemoryBank();
    bank.store({
      tick: 1, section: 'groove', tension: 0.5,
      chord: { root: 'C', quality: 'maj', degree: 1 },
      type: 'section_arrival', weight: 0.5,
    });
    bank.clear();
    expect(bank.count).toBe(0);
  });

  it('chordRecallBias boosts matching root', () => {
    const bank = new EmotionalMemoryBank();
    bank.store({
      tick: 10, section: 'peak', tension: 0.9,
      chord: { root: 'G', quality: 'dom7', degree: 5 },
      type: 'tension_peak', weight: 0.9,
    });
    const biasMatch = bank.chordRecallBias('G', 5, 'lofi', 'breakdown');
    const biasNoMatch = bank.chordRecallBias('D', 2, 'lofi', 'breakdown');
    expect(biasMatch).toBeGreaterThan(biasNoMatch);
  });

  it('chordRecallBias returns 1.0 when no recall', () => {
    const bank = new EmotionalMemoryBank();
    expect(bank.chordRecallBias('C', 1, 'lofi', 'groove')).toBe(1.0);
  });
});

describe('isEmotionalLandmark', () => {
  it('detects tension peaks', () => {
    const result = isEmotionalLandmark(0.9, 0.5, false, false, false);
    expect(result.isLandmark).toBe(true);
    expect(result.type).toBe('tension_peak');
  });

  it('detects resolutions', () => {
    const result = isEmotionalLandmark(0.3, 0.7, false, true, false);
    expect(result.isLandmark).toBe(true);
    expect(result.type).toBe('resolution');
  });

  it('detects section arrivals', () => {
    const result = isEmotionalLandmark(0.5, 0.5, true, false, false);
    expect(result.isLandmark).toBe(true);
    expect(result.type).toBe('section_arrival');
  });

  it('detects harmonic surprises', () => {
    const result = isEmotionalLandmark(0.5, 0.5, false, true, true);
    expect(result.isLandmark).toBe(true);
    expect(result.type).toBe('harmonic_surprise');
  });

  it('returns false for unremarkable moments', () => {
    const result = isEmotionalLandmark(0.5, 0.48, false, false, false);
    expect(result.isLandmark).toBe(false);
  });
});

describe('recallAffinity', () => {
  it('avril has highest affinity', () => {
    expect(recallAffinity('avril')).toBe(0.55);
  });

  it('trance has lowest affinity', () => {
    expect(recallAffinity('trance')).toBe(0.15);
  });
});
