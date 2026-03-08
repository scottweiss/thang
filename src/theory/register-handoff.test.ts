import { describe, it, expect } from 'vitest';
import {
  registerHandoffGain,
  handoffStrength,
} from './register-handoff';

describe('registerHandoffGain', () => {
  it('same register gets penalty', () => {
    const gain = registerHandoffGain(60, 62, 'lofi');
    expect(gain).toBeLessThan(1.0);
  });

  it('distant register gets bonus', () => {
    const gain = registerHandoffGain(48, 72, 'lofi');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('lofi has stronger handoff than syro', () => {
    const lofi = registerHandoffGain(60, 62, 'lofi');
    const syro = registerHandoffGain(60, 62, 'syro');
    expect(lofi).toBeLessThan(syro); // lofi penalizes overlap more
  });

  it('stays in 0.90-1.06 range', () => {
    for (let midi = 36; midi <= 84; midi += 12) {
      const gain = registerHandoffGain(midi, 60, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.90);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('handoffStrength', () => {
  it('avril and lofi are highest', () => {
    expect(handoffStrength('avril')).toBe(0.55);
    expect(handoffStrength('lofi')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(handoffStrength('syro')).toBe(0.30);
  });
});
