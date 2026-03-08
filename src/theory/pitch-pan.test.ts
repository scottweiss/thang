import { describe, it, expect } from 'vitest';
import { pitchPanPattern, shouldApplyPitchPan } from './pitch-pan';

describe('pitchPanPattern', () => {
  it('returns correct number of values', () => {
    const elements = ['C4', '~', 'E4', '~', 'G4', '~', 'C5', '~'];
    const pan = pitchPanPattern(elements, 'ambient');
    const values = pan.split(' ');
    expect(values).toHaveLength(8);
  });

  it('higher notes pan more right', () => {
    const elements = ['C3', '~', '~', '~', 'C5', '~', '~', '~'];
    const pan = pitchPanPattern(elements, 'ambient');
    const values = pan.split(' ').map(parseFloat);
    // C3 should be more left, C5 should be more right
    expect(values[4]).toBeGreaterThan(values[0]);
  });

  it('center for single-pitch phrases', () => {
    const elements = ['C4', '~', 'C4', '~', 'C4', '~', '~', '~'];
    const pan = pitchPanPattern(elements, 'ambient');
    const values = pan.split(' ').map(parseFloat);
    // All same pitch — should all be centered
    values.forEach(v => expect(v).toBeCloseTo(0.5, 1));
  });

  it('rests get center panning', () => {
    const elements = ['~', '~', '~', '~'];
    const pan = pitchPanPattern(elements, 'ambient');
    const values = pan.split(' ').map(parseFloat);
    values.forEach(v => expect(v).toBeCloseTo(0.5, 1));
  });

  it('trance has narrow panning', () => {
    const elements = ['C3', '~', '~', '~', 'C5', '~', '~', '~'];
    const trancePan = pitchPanPattern(elements, 'trance');
    const ambientPan = pitchPanPattern(elements, 'ambient');
    const tranceValues = trancePan.split(' ').map(parseFloat);
    const ambientValues = ambientPan.split(' ').map(parseFloat);
    // Trance spread should be narrower than ambient
    const tranceSpread = Math.abs(tranceValues[4] - tranceValues[0]);
    const ambientSpread = Math.abs(ambientValues[4] - ambientValues[0]);
    expect(tranceSpread).toBeLessThan(ambientSpread);
  });

  it('pan values stay within safe range', () => {
    const elements = ['C2', 'C3', 'C4', 'C5', 'C6', 'C2', 'C6', 'C4'];
    const pan = pitchPanPattern(elements, 'ambient');
    const values = pan.split(' ').map(parseFloat);
    values.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0.15);
      expect(v).toBeLessThanOrEqual(0.85);
    });
  });
});

describe('shouldApplyPitchPan', () => {
  it('true for ambient', () => {
    expect(shouldApplyPitchPan('ambient')).toBe(true);
  });

  it('true for trance (just barely)', () => {
    expect(shouldApplyPitchPan('trance')).toBe(true);
  });

  it('true for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(shouldApplyPitchPan(mood)).toBe(true);
    }
  });
});
