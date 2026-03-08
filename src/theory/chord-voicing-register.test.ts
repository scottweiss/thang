import { describe, it, expect } from 'vitest';
import {
  voicingRegisterFm,
  registerSensitivity,
} from './chord-voicing-register';

describe('voicingRegisterFm', () => {
  it('high register gets FM boost', () => {
    const fm = voicingRegisterFm(76, 'avril');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('low register gets FM reduction', () => {
    const fm = voicingRegisterFm(52, 'avril');
    expect(fm).toBeLessThan(1.0);
  });

  it('center register is near neutral', () => {
    const fm = voicingRegisterFm(64, 'avril');
    expect(fm).toBeCloseTo(1.0, 2);
  });

  it('avril is more sensitive than syro', () => {
    const av = voicingRegisterFm(76, 'avril');
    const sy = voicingRegisterFm(76, 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 0.90-1.10 range', () => {
    for (let midi = 40; midi <= 88; midi += 4) {
      const fm = voicingRegisterFm(midi, 'avril');
      expect(fm).toBeGreaterThanOrEqual(0.90);
      expect(fm).toBeLessThanOrEqual(1.10);
    }
  });
});

describe('registerSensitivity', () => {
  it('avril is highest', () => {
    expect(registerSensitivity('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(registerSensitivity('syro')).toBe(0.20);
  });
});
