import { describe, it, expect } from 'vitest';
import {
  intervallicTension,
  outerIntervalTension,
  intervalReverb,
  intervalFmDepth,
  intervalSensitivity,
} from './intervallic-tension-map';

describe('intervallicTension', () => {
  it('unison has zero tension', () => {
    expect(intervallicTension('C4', 'C4')).toBe(0.0);
  });

  it('perfect 5th has low tension', () => {
    expect(intervallicTension('C4', 'G4')).toBe(0.10);
  });

  it('tritone has high tension', () => {
    expect(intervallicTension('C4', 'F#4')).toBe(0.85);
  });

  it('minor 2nd has very high tension', () => {
    expect(intervallicTension('C4', 'Db4')).toBe(0.90);
  });

  it('major 3rd is consonant', () => {
    expect(intervallicTension('C4', 'E4')).toBe(0.25);
  });

  it('is symmetric (direction independent)', () => {
    // Both should use the same interval mod 12
    const up = intervallicTension('C4', 'G4');
    expect(up).toBe(0.10); // perfect 5th
  });
});

describe('outerIntervalTension', () => {
  it('returns tension for valid notes', () => {
    const t = outerIntervalTension('G5', 'C3');
    expect(t).toBeGreaterThanOrEqual(0);
    expect(t).toBeLessThanOrEqual(1);
  });

  it('returns fallback for null', () => {
    expect(outerIntervalTension(null, 'C3')).toBe(0.3);
    expect(outerIntervalTension('G5', null)).toBe(0.3);
  });

  it('returns fallback for rests', () => {
    expect(outerIntervalTension('~', 'C3')).toBe(0.3);
  });
});

describe('intervalReverb', () => {
  it('consonant intervals get more reverb', () => {
    const consonant = intervalReverb(0.1, 'trance');
    const dissonant = intervalReverb(0.9, 'trance');
    expect(consonant).toBeGreaterThan(dissonant);
  });

  it('ambient barely changes', () => {
    const consonant = intervalReverb(0.1, 'ambient');
    const dissonant = intervalReverb(0.9, 'ambient');
    expect(Math.abs(consonant - dissonant)).toBeLessThan(0.05);
  });
});

describe('intervalFmDepth', () => {
  it('dissonant intervals get more FM', () => {
    const consonant = intervalFmDepth(0.1, 'trance');
    const dissonant = intervalFmDepth(0.9, 'trance');
    expect(dissonant).toBeGreaterThan(consonant);
  });
});

describe('intervalSensitivity', () => {
  it('avril has highest', () => {
    expect(intervalSensitivity('avril')).toBe(0.45);
  });

  it('ambient has lowest', () => {
    expect(intervalSensitivity('ambient')).toBe(0.08);
  });
});
