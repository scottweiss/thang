import { describe, it, expect } from 'vitest';
import {
  bassClarityHpf,
  bassClarity,
} from './harmonic-bass-clarity';

describe('bassClarityHpf', () => {
  it('with drone active, HPF goes up', () => {
    const hpf = bassClarityHpf(true, 'blockhead');
    expect(hpf).toBeGreaterThan(1.0);
  });

  it('without drone, returns 1.0', () => {
    expect(bassClarityHpf(false, 'blockhead')).toBe(1.0);
  });

  it('blockhead separates more than ambient', () => {
    const bh = bassClarityHpf(true, 'blockhead');
    const amb = bassClarityHpf(true, 'ambient');
    expect(bh).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.30 range', () => {
    const hpf = bassClarityHpf(true, 'blockhead');
    expect(hpf).toBeGreaterThanOrEqual(1.0);
    expect(hpf).toBeLessThanOrEqual(1.30);
  });
});

describe('bassClarity', () => {
  it('blockhead is highest', () => {
    expect(bassClarity('blockhead')).toBe(0.60);
  });

  it('ambient is low', () => {
    expect(bassClarity('ambient')).toBe(0.30);
  });
});
