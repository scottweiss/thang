import { describe, it, expect } from 'vitest';
import {
  arpRegisterOffset,
  layerRegisterOffset,
  shouldApplyRegisterComplement,
  registerComplementStrength,
} from './register-complement';

describe('arpRegisterOffset', () => {
  it('returns 0 for empty melody', () => {
    expect(arpRegisterOffset([], 'lofi')).toBe(0);
  });

  it('returns 0 for low-strength moods', () => {
    expect(arpRegisterOffset(['C5', 'E5', 'G5'], 'ambient')).toBe(0);
  });

  it('tends negative for high melody (over many trials)', () => {
    const highMelody = ['C5', 'E5', 'G5', 'A5'];
    let negCount = 0;
    for (let i = 0; i < 100; i++) {
      const offset = arpRegisterOffset(highMelody, 'lofi');
      if (offset < 0) negCount++;
    }
    // Should shift down at least sometimes for high melody
    expect(negCount).toBeGreaterThan(10);
  });

  it('tends positive for low melody (over many trials)', () => {
    const lowMelody = ['C2', 'E2', 'G2'];
    let posCount = 0;
    for (let i = 0; i < 100; i++) {
      const offset = arpRegisterOffset(lowMelody, 'lofi');
      if (offset > 0) posCount++;
    }
    expect(posCount).toBeGreaterThan(10);
  });

  it('offset is always -1, 0, or +1', () => {
    for (let i = 0; i < 50; i++) {
      const offset = arpRegisterOffset(['C5', 'G5'], 'disco');
      expect([-1, 0, 1]).toContain(offset);
    }
  });

  it('mid-register melody tends toward 0', () => {
    const midMelody = ['C4', 'E4', 'G4'];
    let zeroCount = 0;
    for (let i = 0; i < 100; i++) {
      if (arpRegisterOffset(midMelody, 'lofi') === 0) zeroCount++;
    }
    // Mostly neutral for mid-register
    expect(zeroCount).toBeGreaterThan(30);
  });
});

describe('layerRegisterOffset', () => {
  it('returns offset for arp', () => {
    // Just verify it returns a number for arp
    const offset = layerRegisterOffset(['C5', 'E5'], 'arp', 'lofi');
    expect([-1, 0, 1]).toContain(offset);
  });

  it('returns 0 for non-arp layers', () => {
    expect(layerRegisterOffset(['C5', 'E5'], 'harmony', 'lofi')).toBe(0);
    expect(layerRegisterOffset(['C5', 'E5'], 'drone', 'lofi')).toBe(0);
    expect(layerRegisterOffset(['C5', 'E5'], 'melody', 'lofi')).toBe(0);
  });
});

describe('shouldApplyRegisterComplement', () => {
  it('returns true for lofi', () => {
    expect(shouldApplyRegisterComplement('lofi')).toBe(true);
  });

  it('returns false for ambient', () => {
    expect(shouldApplyRegisterComplement('ambient')).toBe(false);
  });
});

describe('registerComplementStrength', () => {
  it('lofi has strong complement', () => {
    expect(registerComplementStrength('lofi')).toBe(0.75);
  });

  it('ambient has weak complement', () => {
    expect(registerComplementStrength('ambient')).toBe(0.10);
  });
});
