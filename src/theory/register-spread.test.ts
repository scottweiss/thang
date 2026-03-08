import { describe, it, expect } from 'vitest';
import {
  registerSpreadDelta,
  applyRegisterSpread,
  shouldApplyRegisterSpread,
} from './register-spread';

describe('registerSpreadDelta', () => {
  it('returns [0,0] at low tension in breakdown', () => {
    // Low tension + negative section bias = narrowing, but deltas are 0 when factor <= 0
    const [low, high] = registerSpreadDelta('melody', 0.2, 'breakdown', 'lofi');
    expect(low).toBe(0);
    expect(high).toBe(0);
  });

  it('expands range at high tension in peak', () => {
    const [low, high] = registerSpreadDelta('arp', 0.9, 'peak', 'trance');
    // High tension + positive section bias + high depth = expansion
    expect(low).toBeLessThanOrEqual(0); // low bound moves down
    expect(high).toBeGreaterThanOrEqual(0); // high bound moves up
  });

  it('arp spreads more than harmony', () => {
    const [, arpHigh] = registerSpreadDelta('arp', 0.9, 'peak', 'trance');
    const [, harmHigh] = registerSpreadDelta('harmony', 0.9, 'peak', 'trance');
    expect(arpHigh).toBeGreaterThanOrEqual(harmHigh);
  });

  it('drone barely moves', () => {
    const [low, high] = registerSpreadDelta('drone', 0.9, 'peak', 'trance');
    expect(Math.abs(low)).toBeLessThanOrEqual(1);
    expect(Math.abs(high)).toBeLessThanOrEqual(1);
  });
});

describe('applyRegisterSpread', () => {
  it('does not go below octave 1', () => {
    const [low] = applyRegisterSpread(2, 5, 'arp', 1.0, 'peak', 'trance');
    expect(low).toBeGreaterThanOrEqual(1);
  });

  it('does not go above octave 7', () => {
    const [, high] = applyRegisterSpread(3, 6, 'arp', 1.0, 'peak', 'trance');
    expect(high).toBeLessThanOrEqual(7);
  });

  it('maintains at least 1 octave range', () => {
    const [low, high] = applyRegisterSpread(4, 4, 'melody', 0.1, 'breakdown', 'ambient');
    expect(high - low).toBeGreaterThanOrEqual(1);
  });

  it('preserves base range at neutral tension', () => {
    const [low, high] = applyRegisterSpread(3, 5, 'melody', 0.5, 'groove', 'lofi');
    // With 0.5 tension and groove bias 0.1, lofi depth 0.3 → small factor
    // Should be close to base
    expect(low).toBeGreaterThanOrEqual(2);
    expect(high).toBeLessThanOrEqual(6);
  });
});

describe('shouldApplyRegisterSpread', () => {
  it('returns true for most moods', () => {
    expect(shouldApplyRegisterSpread('trance')).toBe(true);
    expect(shouldApplyRegisterSpread('downtempo')).toBe(true);
    expect(shouldApplyRegisterSpread('ambient')).toBe(true);
  });

  it('returns true for avril (small but nonzero depth)', () => {
    expect(shouldApplyRegisterSpread('avril')).toBe(true);
  });
});
