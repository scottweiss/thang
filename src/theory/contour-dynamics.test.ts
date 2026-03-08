import { describe, it, expect } from 'vitest';
import {
  contourGainMultipliers,
  shouldApplyContourDynamics,
} from './contour-dynamics';

describe('contourGainMultipliers', () => {
  it('ascending notes get louder', () => {
    const elements = ['C4', 'E4', 'G4', 'C5'];
    const gains = contourGainMultipliers(elements, 'lofi');
    // Each subsequent note should be louder than neutral
    expect(gains[1]).toBeGreaterThan(1.0);
    expect(gains[2]).toBeGreaterThan(1.0);
    expect(gains[3]).toBeGreaterThan(1.0);
  });

  it('descending notes get softer', () => {
    const elements = ['C5', 'G4', 'E4', 'C4'];
    const gains = contourGainMultipliers(elements, 'lofi');
    expect(gains[1]).toBeLessThan(1.0);
    expect(gains[2]).toBeLessThan(1.0);
    expect(gains[3]).toBeLessThan(1.0);
  });

  it('same pitch stays neutral', () => {
    const elements = ['C4', 'C4', 'C4'];
    const gains = contourGainMultipliers(elements, 'lofi');
    expect(gains[1]).toBe(1.0);
    expect(gains[2]).toBe(1.0);
  });

  it('rests are neutral', () => {
    const elements = ['C4', '~', 'E4'];
    const gains = contourGainMultipliers(elements, 'lofi');
    expect(gains[1]).toBe(1.0);
  });

  it('first note is always neutral', () => {
    const elements = ['C4', 'G4'];
    const gains = contourGainMultipliers(elements, 'lofi');
    expect(gains[0]).toBe(1.0);
  });

  it('returns correct length', () => {
    const elements = ['C4', '~', 'E4', '~', 'G4', '~'];
    const gains = contourGainMultipliers(elements, 'lofi');
    expect(gains).toHaveLength(6);
  });

  it('trance has minimal effect', () => {
    const elements = ['C4', 'C5']; // octave leap
    const lofiGains = contourGainMultipliers(elements, 'lofi');
    const tranceGains = contourGainMultipliers(elements, 'trance');
    // Lofi should have stronger crescendo than trance
    expect(lofiGains[1] - 1.0).toBeGreaterThan(tranceGains[1] - 1.0);
  });

  it('effect is subtle (under 15%)', () => {
    const elements = ['C3', 'C5']; // huge leap
    const gains = contourGainMultipliers(elements, 'lofi');
    expect(gains[1]).toBeLessThan(1.15);
    expect(gains[1]).toBeGreaterThan(1.0);
  });
});

describe('shouldApplyContourDynamics', () => {
  it('true for lofi', () => {
    expect(shouldApplyContourDynamics('lofi')).toBe(true);
  });

  it('true for trance (just barely)', () => {
    expect(shouldApplyContourDynamics('trance')).toBe(true);
  });

  it('true for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(shouldApplyContourDynamics(mood)).toBe(true);
    }
  });
});
