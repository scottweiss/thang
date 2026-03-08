import { describe, it, expect } from 'vitest';
import {
  rotatedAccentGain,
  rotationDepth,
} from './accent-rotation';

describe('rotatedAccentGain', () => {
  it('drone accents on global downbeat', () => {
    const downbeat = rotatedAccentGain(0, 'drone', 'lofi');
    const offbeat = rotatedAccentGain(3, 'drone', 'lofi');
    expect(downbeat).toBeGreaterThan(offbeat);
  });

  it('melody accents are rotated from drone', () => {
    // melody offset = 2, so melody's "downbeat" is at global position 2
    const melodyAccent = rotatedAccentGain(2, 'melody', 'syro');
    const melodyOff = rotatedAccentGain(5, 'melody', 'syro');
    expect(melodyAccent).toBeGreaterThan(melodyOff);
  });

  it('arp has different accent position than harmony', () => {
    // arp offset=6, harmony offset=0
    const arpAccent = rotatedAccentGain(6, 'arp', 'flim');
    const harmonyAccent = rotatedAccentGain(0, 'harmony', 'flim');
    // Both should be at their respective accents
    expect(arpAccent).toBeGreaterThan(1.0);
    expect(harmonyAccent).toBeGreaterThan(1.0);
  });

  it('stays in 0.88-1.12 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = rotatedAccentGain(p, 'arp', 'syro');
      expect(gain).toBeGreaterThanOrEqual(0.88);
      expect(gain).toBeLessThanOrEqual(1.12);
    }
  });

  it('low-rotation mood has less contrast', () => {
    const tranceDown = rotatedAccentGain(0, 'drone', 'trance');
    const syroDown = rotatedAccentGain(0, 'drone', 'syro');
    // Both boost on downbeat, but syro's rotation means less consistent emphasis
    expect(tranceDown).toBeGreaterThanOrEqual(0.88);
  });
});

describe('rotationDepth', () => {
  it('syro is deepest', () => {
    expect(rotationDepth('syro')).toBe(0.60);
  });

  it('trance is shallow', () => {
    expect(rotationDepth('trance')).toBe(0.20);
  });
});
