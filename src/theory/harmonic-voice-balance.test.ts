import { describe, it, expect } from 'vitest';
import {
  voiceBalanceGain,
  balanceDepth,
} from './harmonic-voice-balance';

describe('voiceBalanceGain', () => {
  it('outer voice (bass) gets boost', () => {
    const gain = voiceBalanceGain(0, 4, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('outer voice (soprano) gets boost', () => {
    const gain = voiceBalanceGain(3, 4, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('inner voice gets reduction', () => {
    const gain = voiceBalanceGain(1, 4, 'avril');
    expect(gain).toBeLessThan(1.0);
  });

  it('single voice is neutral', () => {
    const gain = voiceBalanceGain(0, 1, 'avril');
    expect(gain).toBe(1.0);
  });

  it('avril is deeper than syro', () => {
    const av = voiceBalanceGain(0, 4, 'avril');
    const sy = voiceBalanceGain(0, 4, 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 0.97-1.04 range', () => {
    for (let i = 0; i < 4; i++) {
      const gain = voiceBalanceGain(i, 4, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('balanceDepth', () => {
  it('avril is high', () => {
    expect(balanceDepth('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(balanceDepth('syro')).toBe(0.20);
  });
});
