import { describe, it, expect } from 'vitest';
import {
  isPassingTone,
  passingToneSmoothingGain,
  smoothingDepthValue,
} from './melodic-passing-tone-smoothing';

describe('isPassingTone', () => {
  it('ascending step through is passing', () => {
    expect(isPassingTone(1, 2)).toBe(true);
  });

  it('descending step through is passing', () => {
    expect(isPassingTone(-2, -1)).toBe(true);
  });

  it('direction change is not passing', () => {
    expect(isPassingTone(1, -1)).toBe(false);
  });

  it('leap arriving is not passing', () => {
    expect(isPassingTone(5, 1)).toBe(false);
  });

  it('leap departing is not passing', () => {
    expect(isPassingTone(1, 5)).toBe(false);
  });
});

describe('passingToneSmoothingGain', () => {
  it('passing tone gets reduced gain', () => {
    const gain = passingToneSmoothingGain(1, 2, 'avril', 'build');
    expect(gain).toBeLessThan(1.0);
  });

  it('non-passing is neutral', () => {
    const gain = passingToneSmoothingGain(1, -1, 'avril', 'build');
    expect(gain).toBe(1.0);
  });

  it('avril smooths more than blockhead', () => {
    const av = passingToneSmoothingGain(1, 2, 'avril', 'build');
    const bh = passingToneSmoothingGain(1, 2, 'blockhead', 'build');
    expect(av).toBeLessThan(bh);
  });

  it('stays in 0.97-1.0 range', () => {
    for (let a = -2; a <= 2; a++) {
      for (let d = -2; d <= 2; d++) {
        const gain = passingToneSmoothingGain(a, d, 'avril', 'breakdown');
        expect(gain).toBeGreaterThanOrEqual(0.97);
        expect(gain).toBeLessThanOrEqual(1.0);
      }
    }
  });
});

describe('smoothingDepthValue', () => {
  it('avril is highest', () => {
    expect(smoothingDepthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(smoothingDepthValue('blockhead')).toBe(0.10);
  });
});
