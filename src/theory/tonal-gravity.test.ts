import { describe, it, expect } from 'vitest';
import { TonalGravity, rootDistance } from './tonal-gravity';

describe('rootDistance', () => {
  it('same note = 0', () => {
    expect(rootDistance('C', 'C')).toBe(0);
  });

  it('semitone = 1', () => {
    expect(rootDistance('C', 'C#')).toBe(1);
    expect(rootDistance('C', 'Db')).toBe(1);
  });

  it('tritone = max distance (6)', () => {
    expect(rootDistance('C', 'F#')).toBe(6);
    expect(rootDistance('C', 'Gb')).toBe(6);
  });

  it('wraps around (C to A = 3, not 9)', () => {
    expect(rootDistance('C', 'A')).toBe(3);
  });

  it('perfect fifth = 5', () => {
    expect(rootDistance('C', 'G')).toBe(5);
  });
});

describe('TonalGravity', () => {
  it('no bias when at home', () => {
    const gravity = new TonalGravity('C', 'minor');
    gravity.record('C', 'minor', 0);
    expect(gravity.homewardBias('C', 'minor')).toBe(0);
  });

  it('bias increases with distance from home', () => {
    const gravity = new TonalGravity('C', 'minor');
    // Record some wandering
    gravity.record('D', 'dorian', 1);
    gravity.record('E', 'phrygian', 2);
    gravity.record('F#', 'lydian', 3);

    const biasNear = gravity.homewardBias('D', 'dorian');
    const biasFar = gravity.homewardBias('F#', 'lydian');
    expect(biasFar).toBeGreaterThan(biasNear);
  });

  it('bias increases with time away', () => {
    const gravity = new TonalGravity('C', 'minor');
    gravity.record('C', 'minor', 0); // home at tick 0
    gravity.record('D', 'dorian', 1);
    const biasShort = gravity.homewardBias('D', 'dorian');

    // Record many ticks away
    for (let t = 2; t <= 15; t++) {
      gravity.record('D', 'dorian', t);
    }
    const biasLong = gravity.homewardBias('D', 'dorian');
    expect(biasLong).toBeGreaterThan(biasShort);
  });

  it('shouldReturnHome for trance at high bias', () => {
    const gravity = new TonalGravity('C', 'minor');
    // Wander far
    for (let t = 0; t < 15; t++) {
      gravity.record('F#', 'lydian', t);
    }
    // Trance has low threshold (0.30), so should want to return
    expect(gravity.shouldReturnHome('F#', 'lydian', 'trance')).toBe(true);
  });

  it('syro tolerates more wandering', () => {
    const gravity = new TonalGravity('C', 'minor');
    gravity.record('D', 'dorian', 0);
    gravity.record('E', 'minor', 1);
    // Syro has high threshold (0.60), so may not want to return
    const bias = gravity.homewardBias('E', 'minor');
    if (bias < 0.60) {
      expect(gravity.shouldReturnHome('E', 'minor', 'syro')).toBe(false);
    }
  });

  it('reset clears history and sets new home', () => {
    const gravity = new TonalGravity('C', 'minor');
    gravity.record('D', 'dorian', 0);
    gravity.reset('G', 'major');
    expect(gravity.getHome()).toEqual({ root: 'G', type: 'major' });
    // After reset, no bias at home
    expect(gravity.homewardBias('G', 'major')).toBe(0);
  });

  it('getHome returns initial home key', () => {
    const gravity = new TonalGravity('Ab', 'minor');
    expect(gravity.getHome()).toEqual({ root: 'Ab', type: 'minor' });
  });
});
