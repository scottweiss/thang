import { describe, it, expect } from 'vitest';
import {
  shouldExchangeVoices,
  selectExchangeNotes,
  exchangeStrength,
} from './voice-exchange';

describe('shouldExchangeVoices', () => {
  it('is deterministic', () => {
    const a = shouldExchangeVoices(5, 'lofi', 'groove');
    const b = shouldExchangeVoices(5, 'lofi', 'groove');
    expect(a).toBe(b);
  });

  it('lofi has more exchanges than trance over 50 ticks', () => {
    const lofiCount = Array.from({ length: 50 }, (_, i) =>
      shouldExchangeVoices(i, 'lofi', 'groove')
    ).filter(Boolean).length;
    const tranceCount = Array.from({ length: 50 }, (_, i) =>
      shouldExchangeVoices(i, 'trance', 'groove')
    ).filter(Boolean).length;
    expect(lofiCount).toBeGreaterThanOrEqual(tranceCount);
  });

  it('peak has more exchanges than intro', () => {
    const peakCount = Array.from({ length: 50 }, (_, i) =>
      shouldExchangeVoices(i, 'lofi', 'peak')
    ).filter(Boolean).length;
    const introCount = Array.from({ length: 50 }, (_, i) =>
      shouldExchangeVoices(i, 'lofi', 'intro')
    ).filter(Boolean).length;
    expect(peakCount).toBeGreaterThanOrEqual(introCount);
  });

  it('returns boolean', () => {
    expect(typeof shouldExchangeVoices(0, 'ambient', 'groove')).toBe('boolean');
  });
});

describe('selectExchangeNotes', () => {
  it('selects chord tones not in target', () => {
    const source = ['C4', 'E4', 'G4'];
    const target = ['C3', 'G3'];
    const chord = ['C3', 'E3', 'G3'];
    const result = selectExchangeNotes(source, target, chord, 1);
    // E is a chord tone not in target
    expect(result.length).toBe(1);
    expect(result[0]).toBe('E4');
  });

  it('returns empty when no compatible notes', () => {
    const source = ['D4', 'F4']; // not chord tones of C major
    const target = ['C3', 'E3', 'G3'];
    const chord = ['C3', 'E3', 'G3'];
    const result = selectExchangeNotes(source, target, chord);
    expect(result).toHaveLength(0);
  });

  it('skips rests', () => {
    const source = ['~', 'E4', '~'];
    const target = ['C3'];
    const chord = ['C3', 'E3', 'G3'];
    const result = selectExchangeNotes(source, target, chord);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('E4');
  });

  it('respects maxExchange limit', () => {
    const source = ['E4', 'G4', 'B4'];
    const target = ['C3'];
    const chord = ['C3', 'E3', 'G3', 'B3'];
    const result = selectExchangeNotes(source, target, chord, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('deduplicates by pitch class', () => {
    const source = ['E3', 'E4', 'G4'];
    const target = ['C3'];
    const chord = ['C3', 'E3', 'G3'];
    const result = selectExchangeNotes(source, target, chord, 3);
    // Should have E and G (not two Es)
    const pcs = result.map(n => n.replace(/[0-9]/g, ''));
    expect(new Set(pcs).size).toBe(pcs.length);
  });
});

describe('exchangeStrength', () => {
  it('lofi has strong exchange', () => {
    expect(exchangeStrength('lofi')).toBe(0.45);
  });

  it('trance has weak exchange', () => {
    expect(exchangeStrength('trance')).toBe(0.10);
  });
});
