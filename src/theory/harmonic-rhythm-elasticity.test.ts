import { describe, it, expect } from 'vitest';
import {
  chordDurationElasticity,
  elasticityRange,
} from './harmonic-rhythm-elasticity';

describe('chordDurationElasticity', () => {
  it('major tonic lingers (> 1.0)', () => {
    const dur = chordDurationElasticity('maj', 1, 'avril', 'breakdown');
    expect(dur).toBeGreaterThan(1.0);
  });

  it('dom7 on V is short (< 1.0)', () => {
    const dur = chordDurationElasticity('dom7', 5, 'avril', 'breakdown');
    expect(dur).toBeLessThan(1.0);
  });

  it('dim is shortest', () => {
    const dim = chordDurationElasticity('dim', 7, 'avril', 'groove');
    const maj = chordDurationElasticity('maj', 1, 'avril', 'groove');
    expect(dim).toBeLessThan(maj);
  });

  it('trance has less variation than ambient', () => {
    const tranceMaj = chordDurationElasticity('maj', 1, 'trance', 'groove');
    const ambientMaj = chordDurationElasticity('maj', 1, 'ambient', 'groove');
    expect(Math.abs(tranceMaj - 1.0)).toBeLessThan(Math.abs(ambientMaj - 1.0));
  });

  it('stays in 0.6-1.5 range', () => {
    const qualities = ['maj', 'min', 'dom7', 'dim', 'aug'] as const;
    for (const q of qualities) {
      for (let d = 1; d <= 7; d++) {
        const dur = chordDurationElasticity(q, d, 'ambient', 'breakdown');
        expect(dur).toBeGreaterThanOrEqual(0.6);
        expect(dur).toBeLessThanOrEqual(1.5);
      }
    }
  });

  it('breakdown more elastic than peak', () => {
    const bd = chordDurationElasticity('maj', 1, 'lofi', 'breakdown');
    const pk = chordDurationElasticity('maj', 1, 'lofi', 'peak');
    expect(Math.abs(bd - 1.0)).toBeGreaterThan(Math.abs(pk - 1.0));
  });
});

describe('elasticityRange', () => {
  it('ambient is highest', () => {
    expect(elasticityRange('ambient')).toBe(0.60);
  });

  it('disco is lowest', () => {
    expect(elasticityRange('disco')).toBe(0.15);
  });
});
