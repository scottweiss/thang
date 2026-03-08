import { describe, it, expect } from 'vitest';
import {
  phaseLockCorrection,
  shouldApplyPhaseLock,
  lockTightness,
} from './grid-phase-lock';

describe('phaseLockCorrection', () => {
  it('zero at chord change (tick 0)', () => {
    expect(phaseLockCorrection('arp', 0, 'trance', 'peak')).toBe(0);
  });

  it('positive after chord change', () => {
    const corr = phaseLockCorrection('arp', 1, 'trance', 'peak');
    expect(corr).toBeGreaterThan(0);
  });

  it('decays over ticks', () => {
    const t1 = phaseLockCorrection('arp', 1, 'trance', 'peak');
    const t3 = phaseLockCorrection('arp', 3, 'trance', 'peak');
    expect(t1).toBeGreaterThan(t3);
  });

  it('arp gets more correction than drone', () => {
    const arp = phaseLockCorrection('arp', 1, 'trance', 'peak');
    const drone = phaseLockCorrection('drone', 1, 'trance', 'peak');
    expect(arp).toBeGreaterThan(drone);
  });

  it('tight moods have more correction', () => {
    const trance = phaseLockCorrection('arp', 1, 'trance', 'groove');
    const ambient = phaseLockCorrection('arp', 1, 'ambient', 'groove');
    expect(trance).toBeGreaterThan(ambient);
  });

  it('max correction stays small (< 10ms)', () => {
    const corr = phaseLockCorrection('arp', 1, 'trance', 'peak');
    expect(corr).toBeLessThan(0.01);
  });
});

describe('shouldApplyPhaseLock', () => {
  it('true for tight mood near chord change', () => {
    expect(shouldApplyPhaseLock('trance', 'peak', 1)).toBe(true);
  });

  it('false at chord change (tick 0)', () => {
    expect(shouldApplyPhaseLock('trance', 'peak', 0)).toBe(false);
  });

  it('false after 4 ticks', () => {
    expect(shouldApplyPhaseLock('trance', 'peak', 5)).toBe(false);
  });

  it('false for very loose moods in breakdowns', () => {
    expect(shouldApplyPhaseLock('ambient', 'breakdown', 1)).toBe(false);
  });
});

describe('lockTightness', () => {
  it('trance is tightest', () => {
    expect(lockTightness('trance')).toBe(0.70);
  });

  it('ambient is loosest', () => {
    expect(lockTightness('ambient')).toBe(0.15);
  });
});
