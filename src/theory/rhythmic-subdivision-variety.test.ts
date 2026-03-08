import { describe, it, expect } from 'vitest';
import {
  subdivisionVarietyGain,
  subdivisionVarietyDepth,
} from './rhythmic-subdivision-variety';

describe('subdivisionVarietyGain', () => {
  it('mid-phrase is boosted', () => {
    const gain = subdivisionVarietyGain(0.55, 'syro');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('phrase edges are lower than middle', () => {
    const start = subdivisionVarietyGain(0.05, 'syro');
    const mid = subdivisionVarietyGain(0.55, 'syro');
    expect(mid).toBeGreaterThan(start);
  });

  it('syro has more variety than trance', () => {
    const sy = subdivisionVarietyGain(0.55, 'syro');
    const tr = subdivisionVarietyGain(0.55, 'trance');
    expect(sy).toBeGreaterThan(tr);
  });

  it('stays in 0.97-1.03 range', () => {
    for (let p = 0; p <= 1.0; p += 0.05) {
      const gain = subdivisionVarietyGain(p, 'syro');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('subdivisionVarietyDepth', () => {
  it('syro is highest', () => {
    expect(subdivisionVarietyDepth('syro')).toBe(0.60);
  });

  it('trance is low', () => {
    expect(subdivisionVarietyDepth('trance')).toBe(0.20);
  });
});
