import { describe, it, expect } from 'vitest';
import {
  sequenceDetectionScore,
  sequenceGainEmphasis,
  sequenceAppreciation,
} from './sequence-recognition';

describe('sequenceDetectionScore', () => {
  it('transposed repeat scores 1.0', () => {
    // C D E → D E F# (same intervals: +2, +2)
    const score = sequenceDetectionScore([60, 62, 64, 62, 64, 66], 3);
    expect(score).toBe(1.0);
  });

  it('different patterns score lower', () => {
    const repeat = sequenceDetectionScore([60, 62, 64, 62, 64, 66], 3);
    const different = sequenceDetectionScore([60, 62, 64, 60, 67, 72], 3);
    expect(repeat).toBeGreaterThan(different);
  });

  it('too short returns 0', () => {
    expect(sequenceDetectionScore([60, 62], 3)).toBe(0);
  });

  it('stays in 0-1 range', () => {
    const score = sequenceDetectionScore([60, 64, 67, 72, 65, 60, 55], 3);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('sequenceGainEmphasis', () => {
  it('detected sequence boosts gain', () => {
    const gain = sequenceGainEmphasis([60, 62, 64, 62, 64, 66], 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('stays in 0.95-1.10 range', () => {
    const gain = sequenceGainEmphasis([60, 62, 64, 62, 64, 66], 'avril');
    expect(gain).toBeGreaterThanOrEqual(0.95);
    expect(gain).toBeLessThanOrEqual(1.10);
  });

  it('unappreciative mood responds less', () => {
    const pitches = [60, 62, 64, 62, 64, 66];
    const avril = sequenceGainEmphasis(pitches, 'avril');
    const syro = sequenceGainEmphasis(pitches, 'syro');
    expect(avril).toBeGreaterThan(syro);
  });
});

describe('sequenceAppreciation', () => {
  it('avril is highest', () => {
    expect(sequenceAppreciation('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(sequenceAppreciation('syro')).toBe(0.15);
  });
});
