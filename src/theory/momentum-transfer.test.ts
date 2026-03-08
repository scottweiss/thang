import { describe, it, expect } from 'vitest';
import {
  releasedEnergy,
  transferBoost,
  shouldTransferMomentum,
  transferStrength,
} from './momentum-transfer';

describe('releasedEnergy', () => {
  it('zero when no layers fading', () => {
    const mults = { melody: 1.0, arp: 1.0 };
    const targets = { melody: 1.0, arp: 1.0 };
    expect(releasedEnergy(mults, targets)).toBe(0);
  });

  it('positive when layers fading out', () => {
    const mults = { melody: 0.8, arp: 0.7 };
    const targets = { melody: 0.0, arp: 0.0 };
    expect(releasedEnergy(mults, targets)).toBeGreaterThan(0);
  });

  it('caps at 1.0', () => {
    const mults = { a: 1.0, b: 1.0, c: 1.0, d: 1.0 };
    const targets = { a: 0, b: 0, c: 0, d: 0 };
    expect(releasedEnergy(mults, targets)).toBeLessThanOrEqual(1);
  });

  it('ignores entering layers', () => {
    const mults = { melody: 0.0, arp: 0.0 };
    const targets = { melody: 1.0, arp: 1.0 };
    expect(releasedEnergy(mults, targets)).toBe(0);
  });
});

describe('transferBoost', () => {
  it('no boost when not entering', () => {
    expect(transferBoost('melody', 1.0, 0.5, 0.5, 'trance')).toBe(1.0);
  });

  it('no boost when no energy released', () => {
    expect(transferBoost('melody', 0.0, 1.0, 0.0, 'trance')).toBe(1.0);
  });

  it('boosts entering layer proportionally', () => {
    const boost = transferBoost('melody', 0.2, 1.0, 0.5, 'trance');
    expect(boost).toBeGreaterThan(1.0);
  });

  it('trance boosts more than ambient', () => {
    const trance = transferBoost('melody', 0.0, 1.0, 0.5, 'trance');
    const ambient = transferBoost('melody', 0.0, 1.0, 0.5, 'ambient');
    expect(trance).toBeGreaterThan(ambient);
  });

  it('caps at 1.5', () => {
    expect(transferBoost('melody', 0.0, 1.0, 1.0, 'trance')).toBeLessThanOrEqual(1.5);
  });
});

describe('shouldTransferMomentum', () => {
  it('applies when layers are fading', () => {
    const mults = { melody: 0.8, harmony: 0.6 };
    const targets = { melody: 0.0, harmony: 0.0 };
    expect(shouldTransferMomentum(mults, targets, 'trance')).toBe(true);
  });

  it('does not apply when nothing fading', () => {
    const mults = { melody: 1.0 };
    const targets = { melody: 1.0 };
    expect(shouldTransferMomentum(mults, targets, 'trance')).toBe(false);
  });
});

describe('transferStrength', () => {
  it('trance is highest', () => {
    expect(transferStrength('trance')).toBe(0.50);
  });

  it('ambient is lowest', () => {
    expect(transferStrength('ambient')).toBe(0.10);
  });
});
