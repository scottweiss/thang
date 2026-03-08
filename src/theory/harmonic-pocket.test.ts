import { describe, it, expect } from 'vitest';
import {
  pocketGainMultiplier,
  isPocketLayer,
  shouldApplyPocket,
  pocketDepth,
} from './harmonic-pocket';

describe('pocketGainMultiplier', () => {
  it('dips on tick 0 (chord just changed)', () => {
    const mult = pocketGainMultiplier(0, 'lofi', 'groove');
    expect(mult).toBeLessThan(1.0);
  });

  it('recovers over subsequent ticks', () => {
    const t0 = pocketGainMultiplier(0, 'lofi', 'groove');
    const t1 = pocketGainMultiplier(1, 'lofi', 'groove');
    const t2 = pocketGainMultiplier(2, 'lofi', 'groove');
    const t3 = pocketGainMultiplier(3, 'lofi', 'groove');
    expect(t1).toBeGreaterThan(t0);
    expect(t2).toBeGreaterThan(t1);
    expect(t3).toBe(1.0);
  });

  it('returns 1.0 for trance (minimal pocket)', () => {
    const mult = pocketGainMultiplier(0, 'trance', 'peak');
    // trance * peak = 0.05 * 0.7 = 0.035 — barely audible
    expect(mult).toBeGreaterThan(0.95);
  });

  it('lofi groove has deepest pocket', () => {
    const lofi = pocketGainMultiplier(0, 'lofi', 'groove');
    const trance = pocketGainMultiplier(0, 'trance', 'peak');
    expect(lofi).toBeLessThan(trance);
  });

  it('breakdown deepens the pocket', () => {
    const groove = pocketGainMultiplier(0, 'lofi', 'groove');
    const breakdown = pocketGainMultiplier(0, 'lofi', 'breakdown');
    // breakdown has 1.3 mult vs groove 1.2
    expect(breakdown).toBeLessThanOrEqual(groove);
  });
});

describe('isPocketLayer', () => {
  it('arp is a pocket layer', () => {
    expect(isPocketLayer('arp')).toBe(true);
  });

  it('texture is a pocket layer', () => {
    expect(isPocketLayer('texture')).toBe(true);
  });

  it('atmosphere is a pocket layer', () => {
    expect(isPocketLayer('atmosphere')).toBe(true);
  });

  it('melody is NOT a pocket layer', () => {
    expect(isPocketLayer('melody')).toBe(false);
  });

  it('harmony is NOT a pocket layer', () => {
    expect(isPocketLayer('harmony')).toBe(false);
  });

  it('drone is NOT a pocket layer', () => {
    expect(isPocketLayer('drone')).toBe(false);
  });
});

describe('shouldApplyPocket', () => {
  it('true for lofi groove', () => {
    expect(shouldApplyPocket('lofi', 'groove')).toBe(true);
  });

  it('true for downtempo breakdown', () => {
    expect(shouldApplyPocket('downtempo', 'breakdown')).toBe(true);
  });

  it('true for trance peak (0.05 * 0.7 = 0.035, just above threshold)', () => {
    expect(shouldApplyPocket('trance', 'peak')).toBe(true);
  });
});

describe('pocketDepth', () => {
  it('is deterministic', () => {
    const a = pocketDepth('lofi', 'groove');
    const b = pocketDepth('lofi', 'groove');
    expect(a).toBe(b);
  });

  it('lofi > trance', () => {
    expect(pocketDepth('lofi', 'groove')).toBeGreaterThan(pocketDepth('trance', 'groove'));
  });
});
