import { describe, it, expect } from 'vitest';
import {
  tensionSyncopation,
  tensionDisplacementPattern,
  tensionRestModifier,
  shouldApplyTensionRhythm,
  tensionRhythmSensitivity,
} from './tension-rhythm';

describe('tensionSyncopation', () => {
  it('high tension increases syncopation', () => {
    const high = tensionSyncopation(1.0, 'disco');
    const low = tensionSyncopation(0.0, 'disco');
    expect(high).toBeGreaterThan(low);
  });

  it('zero tension gives zero syncopation', () => {
    expect(tensionSyncopation(0.0, 'disco')).toBe(0);
  });

  it('ambient has minimal syncopation even at high tension', () => {
    const ambient = tensionSyncopation(1.0, 'ambient');
    const disco = tensionSyncopation(1.0, 'disco');
    expect(ambient).toBeLessThan(disco * 0.3);
  });

  it('syncopation accelerates at high tension (quadratic)', () => {
    const mid = tensionSyncopation(0.5, 'syro');
    const high = tensionSyncopation(1.0, 'syro');
    // Quadratic: at 0.5, should be ~25% of max (not 50%)
    expect(mid / high).toBeLessThan(0.35);
  });

  it('clamps tension to 0-1', () => {
    expect(tensionSyncopation(-0.5, 'disco')).toBe(tensionSyncopation(0, 'disco'));
    expect(tensionSyncopation(1.5, 'disco')).toBe(tensionSyncopation(1, 'disco'));
  });
});

describe('tensionDisplacementPattern', () => {
  it('returns array of correct length', () => {
    const pattern = tensionDisplacementPattern(8, 0.8, 'disco');
    expect(pattern).toHaveLength(8);
  });

  it('zero tension gives all-zero pattern', () => {
    const pattern = tensionDisplacementPattern(8, 0.0, 'disco');
    expect(pattern.every(v => v === 0)).toBe(true);
  });

  it('strong beats have smaller displacement than off-beats', () => {
    const pattern = tensionDisplacementPattern(8, 0.9, 'syro');
    const strongBeat = Math.abs(pattern[0]); // position 0 = strong
    const offBeat = Math.abs(pattern[1]);    // position 1 = off-beat
    expect(offBeat).toBeGreaterThan(strongBeat);
  });

  it('high tension creates larger displacements', () => {
    const highPattern = tensionDisplacementPattern(8, 1.0, 'disco');
    const lowPattern = tensionDisplacementPattern(8, 0.2, 'disco');
    const highMax = Math.max(...highPattern.map(Math.abs));
    const lowMax = Math.max(...lowPattern.map(Math.abs));
    expect(highMax).toBeGreaterThan(lowMax);
  });

  it('displacements stay in reasonable range', () => {
    const pattern = tensionDisplacementPattern(16, 1.0, 'syro');
    for (const v of pattern) {
      expect(Math.abs(v)).toBeLessThan(0.1);
    }
  });
});

describe('tensionRestModifier', () => {
  it('high tension reduces weak beat rest probability', () => {
    const mod = tensionRestModifier(1, 0.9, 'disco'); // weak beat, high tension
    expect(mod).toBeLessThan(1.0);
  });

  it('low tension keeps weak beat rest probability near 1.0', () => {
    const mod = tensionRestModifier(1, 0.1, 'disco');
    expect(mod).toBeCloseTo(1.0, 1);
  });

  it('strong beats are less affected than weak beats', () => {
    const strong = tensionRestModifier(0, 0.9, 'disco');
    const weak = tensionRestModifier(1, 0.9, 'disco');
    // Both < 1.0 at high tension, but weak should be lower
    expect(weak).toBeLessThan(strong);
  });
});

describe('shouldApplyTensionRhythm', () => {
  it('disco applies', () => {
    expect(shouldApplyTensionRhythm('disco')).toBe(true);
  });

  it('ambient does not apply (below threshold)', () => {
    expect(shouldApplyTensionRhythm('ambient')).toBe(false);
  });
});

describe('tensionRhythmSensitivity', () => {
  it('syro is highest', () => {
    expect(tensionRhythmSensitivity('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(tensionRhythmSensitivity('ambient')).toBe(0.05);
  });
});
