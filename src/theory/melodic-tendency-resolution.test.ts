import { describe, it, expect } from 'vitest';
import {
  tendencyResolutionGain,
  tendencyStrength,
} from './melodic-tendency-resolution';

describe('tendencyResolutionGain', () => {
  it('leading tone resolving to tonic gets boost', () => {
    const gain = tendencyResolutionGain(6, 0, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('fa resolving to mi gets boost', () => {
    const gain = tendencyResolutionGain(3, 2, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('leading tone NOT resolving gets reduction', () => {
    const gain = tendencyResolutionGain(6, 3, 'avril');
    expect(gain).toBeLessThan(1.0);
  });

  it('non-tendency degree is neutral', () => {
    const gain = tendencyResolutionGain(2, 4, 'avril');
    expect(gain).toBe(1.0);
  });

  it('avril has stronger resolution than syro', () => {
    const avrilBoost = tendencyResolutionGain(6, 0, 'avril');
    const syroBoost = tendencyResolutionGain(6, 0, 'syro');
    expect(avrilBoost).toBeGreaterThan(syroBoost);
  });

  it('stays in 0.95-1.08 range', () => {
    for (let from = 0; from < 7; from++) {
      for (let to = 0; to < 7; to++) {
        const gain = tendencyResolutionGain(from, to, 'trance');
        expect(gain).toBeGreaterThanOrEqual(0.95);
        expect(gain).toBeLessThanOrEqual(1.08);
      }
    }
  });
});

describe('tendencyStrength', () => {
  it('avril is highest', () => {
    expect(tendencyStrength('avril')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(tendencyStrength('syro')).toBe(0.20);
  });
});
