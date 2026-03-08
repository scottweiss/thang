import { describe, it, expect } from 'vitest';
import { chordTension, resolutionPull, qualityTension } from './chord-tension';

describe('chordTension', () => {
  it('tonic major is least tense', () => {
    const t = chordTension(0, 'maj');
    expect(t).toBeLessThan(0.15);
  });

  it('dominant seventh is tense', () => {
    const t = chordTension(4, 'dom7');
    expect(t).toBeGreaterThan(0.5);
  });

  it('diminished vii is very tense', () => {
    const t = chordTension(6, 'dim');
    expect(t).toBeGreaterThan(0.7);
  });

  it('IV major is less tense than V7', () => {
    const iv = chordTension(3, 'maj');
    const v7 = chordTension(4, 'dom7');
    expect(iv).toBeLessThan(v7);
  });

  it('minor is more tense than major at same degree', () => {
    const maj = chordTension(0, 'maj');
    const min = chordTension(0, 'min');
    expect(min).toBeGreaterThan(maj);
  });

  it('all values between 0 and 1', () => {
    const qualities = ['maj', 'min', 'dim', 'aug', 'sus2', 'sus4', 'dom7', 'maj7', 'min7'] as const;
    for (let degree = 0; degree < 7; degree++) {
      for (const q of qualities) {
        const t = chordTension(degree, q);
        expect(t).toBeGreaterThanOrEqual(0);
        expect(t).toBeLessThanOrEqual(1);
      }
    }
  });

  it('dominant function chords get boost', () => {
    // Same quality, different degree — V and vii get boost
    const iii = chordTension(2, 'min');
    const v = chordTension(4, 'min');
    // V should be higher due to dominant boost
    expect(v).toBeGreaterThan(iii);
  });
});

describe('resolutionPull', () => {
  it('V7 has strongest pull', () => {
    expect(resolutionPull(4, 'dom7')).toBeGreaterThan(0.9);
  });

  it('I has no pull', () => {
    expect(resolutionPull(0, 'maj')).toBe(0);
  });

  it('vii dim has strong pull', () => {
    expect(resolutionPull(6, 'dim')).toBeGreaterThan(0.8);
  });

  it('IV has moderate pull (plagal)', () => {
    const pull = resolutionPull(3, 'maj');
    expect(pull).toBeGreaterThan(0.3);
    expect(pull).toBeLessThan(0.6);
  });

  it('V major has less pull than V7', () => {
    const v = resolutionPull(4, 'maj');
    const v7 = resolutionPull(4, 'dom7');
    expect(v).toBeLessThan(v7);
  });
});

describe('qualityTension', () => {
  it('dim is most tense quality', () => {
    expect(qualityTension('dim')).toBeGreaterThan(qualityTension('dom7'));
    expect(qualityTension('dim')).toBeGreaterThan(qualityTension('min'));
  });

  it('major is least tense quality', () => {
    expect(qualityTension('maj')).toBeLessThan(qualityTension('min'));
  });
});
