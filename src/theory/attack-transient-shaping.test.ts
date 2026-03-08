import { describe, it, expect } from 'vitest';
import {
  attackMultiplier,
  attackSharpness,
} from './attack-transient-shaping';

describe('attackMultiplier', () => {
  it('downbeat is sharper than off-beat', () => {
    const downbeat = attackMultiplier(0, 'blockhead');
    const offbeat = attackMultiplier(3, 'blockhead');
    expect(downbeat).toBeLessThan(offbeat);
  });

  it('ambient has softer attacks', () => {
    const ambient = attackMultiplier(0, 'ambient');
    const blockhead = attackMultiplier(0, 'blockhead');
    expect(ambient).toBeGreaterThan(blockhead);
  });

  it('stays in 0.5-2.0 range', () => {
    for (let p = 0; p < 16; p++) {
      const mul = attackMultiplier(p, 'syro');
      expect(mul).toBeGreaterThanOrEqual(0.5);
      expect(mul).toBeLessThanOrEqual(2.0);
    }
  });

  it('quarter beats are medium', () => {
    const quarter = attackMultiplier(4, 'trance');
    const downbeat = attackMultiplier(0, 'trance');
    const offbeat = attackMultiplier(3, 'trance');
    expect(quarter).toBeGreaterThan(downbeat);
    expect(quarter).toBeLessThan(offbeat);
  });
});

describe('attackSharpness', () => {
  it('blockhead is sharpest', () => {
    expect(attackSharpness('blockhead')).toBe(0.65);
  });

  it('ambient is softest', () => {
    expect(attackSharpness('ambient')).toBe(0.20);
  });
});
