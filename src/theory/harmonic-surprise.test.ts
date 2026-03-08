import { describe, it, expect } from 'vitest';
import {
  chordSurprise,
  qualitySurprise,
  totalSurprise,
  surpriseBrightness,
  surpriseGain,
  surpriseSensitivity,
} from './harmonic-surprise';

describe('chordSurprise', () => {
  it('V→I is very expected (low surprise)', () => {
    expect(chordSurprise(5, 1)).toBeLessThan(0.1);
  });

  it('V→vi is very surprising (deceptive cadence)', () => {
    expect(chordSurprise(5, 6)).toBeGreaterThan(0.6);
  });

  it('repetition has zero surprise', () => {
    expect(chordSurprise(1, 1)).toBe(0.0);
    expect(chordSurprise(4, 4)).toBe(0.0);
  });

  it('IV→V is expected', () => {
    expect(chordSurprise(4, 5)).toBeLessThan(0.2);
  });

  it('unknown transitions have moderate surprise', () => {
    expect(chordSurprise(1, 7)).toBeGreaterThan(0.5);
  });
});

describe('qualitySurprise', () => {
  it('major/minor are not surprising', () => {
    expect(qualitySurprise('maj')).toBe(0.0);
    expect(qualitySurprise('min')).toBe(0.0);
  });

  it('dim and aug are surprising', () => {
    expect(qualitySurprise('dim')).toBeGreaterThan(0.3);
    expect(qualitySurprise('aug')).toBeGreaterThan(0.3);
  });

  it('sus chords are moderately surprising', () => {
    expect(qualitySurprise('sus4')).toBeGreaterThan(0.1);
    expect(qualitySurprise('sus4')).toBeLessThan(0.4);
  });
});

describe('totalSurprise', () => {
  it('expected transition + normal quality = low surprise', () => {
    expect(totalSurprise(5, 1, 'maj')).toBeLessThan(0.1);
  });

  it('deceptive cadence + dim quality = high surprise', () => {
    expect(totalSurprise(5, 6, 'dim')).toBeGreaterThan(0.5);
  });

  it('clamps to 1.0', () => {
    expect(totalSurprise(5, 6, 'aug')).toBeLessThanOrEqual(1.0);
  });
});

describe('surpriseBrightness', () => {
  it('no surprise = no change', () => {
    expect(surpriseBrightness(0, 'trance')).toBe(1.0);
  });

  it('high surprise = brighter', () => {
    expect(surpriseBrightness(0.8, 'trance')).toBeGreaterThan(1.05);
  });

  it('ambient barely changes', () => {
    expect(surpriseBrightness(0.8, 'ambient')).toBeLessThan(1.02);
  });
});

describe('surpriseGain', () => {
  it('no surprise = no change', () => {
    expect(surpriseGain(0, 'trance')).toBe(1.0);
  });

  it('high surprise = gain boost', () => {
    expect(surpriseGain(0.8, 'trance')).toBeGreaterThan(1.03);
  });
});

describe('surpriseSensitivity', () => {
  it('trance has highest', () => {
    expect(surpriseSensitivity('trance')).toBe(0.45);
  });

  it('ambient has lowest', () => {
    expect(surpriseSensitivity('ambient')).toBe(0.05);
  });
});
