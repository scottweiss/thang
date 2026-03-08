import { describe, it, expect } from 'vitest';
import {
  commonToneCount,
  commonToneSmoothness,
  commonToneWeight,
  commonTonePreference,
} from './pitch-set-intersection';

describe('commonToneCount', () => {
  it('identical chords share all tones', () => {
    expect(commonToneCount([0, 4, 7], [0, 4, 7])).toBe(3);
  });

  it('C and Am share C and E', () => {
    expect(commonToneCount([0, 4, 7], [9, 0, 4])).toBe(2);
  });

  it('no shared tones', () => {
    expect(commonToneCount([0, 4, 7], [1, 5, 8])).toBe(0);
  });

  it('handles wrap-around', () => {
    expect(commonToneCount([11], [11])).toBe(1);
  });
});

describe('commonToneSmoothness', () => {
  it('identical = 1.0', () => {
    expect(commonToneSmoothness([0, 4, 7], [0, 4, 7])).toBe(1.0);
  });

  it('no shared = 0.0', () => {
    expect(commonToneSmoothness([0, 4, 7], [1, 5, 8])).toBe(0.0);
  });

  it('partial sharing gives 0-1', () => {
    const s = commonToneSmoothness([0, 4, 7], [0, 3, 7]);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });
});

describe('commonToneWeight', () => {
  it('smooth transitions weighted higher for ambient', () => {
    const smooth = commonToneWeight([0, 4, 7], [0, 3, 7], 'ambient');
    const rough = commonToneWeight([0, 4, 7], [1, 5, 8], 'ambient');
    expect(smooth).toBeGreaterThan(rough);
  });

  it('stays in 0.4-1.4 range', () => {
    const w = commonToneWeight([0, 4, 7], [1, 5, 8], 'syro');
    expect(w).toBeGreaterThanOrEqual(0.4);
    expect(w).toBeLessThanOrEqual(1.4);
  });
});

describe('commonTonePreference', () => {
  it('ambient is highest', () => {
    expect(commonTonePreference('ambient')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(commonTonePreference('syro')).toBe(0.15);
  });
});
