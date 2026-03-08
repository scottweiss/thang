import { describe, it, expect } from 'vitest';
import {
  momentumTransferGain,
  momentumStrength,
} from './rhythmic-momentum-transfer';

describe('momentumTransferGain', () => {
  it('position after onset gets boost', () => {
    const gain = momentumTransferGain(1, 'trance', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('on the onset itself is neutral', () => {
    const gain = momentumTransferGain(0, 'trance', 'peak');
    expect(gain).toBe(1.0);
  });

  it('momentum decays with distance', () => {
    const near = momentumTransferGain(1, 'trance', 'peak');
    const far = momentumTransferGain(4, 'trance', 'peak');
    expect(near).toBeGreaterThan(far);
  });

  it('trance has more momentum than ambient', () => {
    const tr = momentumTransferGain(1, 'trance', 'groove');
    const amb = momentumTransferGain(1, 'ambient', 'groove');
    expect(tr).toBeGreaterThan(amb);
  });

  it('build has more momentum than breakdown', () => {
    const build = momentumTransferGain(1, 'lofi', 'build');
    const bd = momentumTransferGain(1, 'lofi', 'breakdown');
    expect(build).toBeGreaterThan(bd);
  });

  it('stays in 1.0-1.05 range', () => {
    for (let b = 0; b <= 8; b++) {
      const gain = momentumTransferGain(b, 'trance', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('momentumStrength', () => {
  it('trance is high', () => {
    expect(momentumStrength('trance')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(momentumStrength('ambient')).toBe(0.15);
  });
});
