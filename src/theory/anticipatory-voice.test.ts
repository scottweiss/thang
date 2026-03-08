import { describe, it, expect } from 'vitest';
import {
  anticipationAmount,
  anticipatedPitch,
  nearestTarget,
  shouldAnticipateVoice,
  anticipationStrength,
} from './anticipatory-voice';

describe('anticipationAmount', () => {
  it('zero when far from change', () => {
    expect(anticipationAmount(5, 'lofi', 'groove')).toBe(0);
  });

  it('increases as change approaches', () => {
    const far = anticipationAmount(3, 'lofi', 'groove');
    const near = anticipationAmount(1, 'lofi', 'groove');
    expect(near).toBeGreaterThan(far);
  });

  it('zero at change point', () => {
    expect(anticipationAmount(0, 'lofi', 'groove')).toBe(0);
  });

  it('lofi anticipates more than trance', () => {
    const lofi = anticipationAmount(1, 'lofi', 'groove');
    const trance = anticipationAmount(1, 'trance', 'groove');
    expect(lofi).toBeGreaterThan(trance);
  });

  it('breakdown has more anticipation than peak', () => {
    const bd = anticipationAmount(1, 'lofi', 'breakdown');
    const pk = anticipationAmount(1, 'lofi', 'peak');
    expect(bd).toBeGreaterThan(pk);
  });
});

describe('anticipatedPitch', () => {
  it('amount 0 stays at current', () => {
    expect(anticipatedPitch(60, 64, 0)).toBe(60);
  });

  it('amount 1 reaches target', () => {
    expect(anticipatedPitch(60, 64, 1)).toBe(64);
  });

  it('amount 0.5 is halfway', () => {
    expect(anticipatedPitch(60, 64, 0.5)).toBe(62);
  });

  it('rounds to nearest semitone', () => {
    expect(anticipatedPitch(60, 63, 0.5)).toBe(62); // 61.5 → 62
  });
});

describe('nearestTarget', () => {
  it('finds exact match', () => {
    expect(nearestTarget(0, [0, 4, 7])).toBe(0);
  });

  it('finds nearest by semitone distance', () => {
    expect(nearestTarget(3, [0, 4, 7])).toBe(4); // 3→4 is 1, 3→0 is 3
  });

  it('wraps around (enharmonic)', () => {
    expect(nearestTarget(11, [0, 4, 7])).toBe(0); // 11→0 is 1 semitone
  });

  it('returns current for empty targets', () => {
    expect(nearestTarget(5, [])).toBe(5);
  });
});

describe('shouldAnticipateVoice', () => {
  it('true when close to change', () => {
    expect(shouldAnticipateVoice('lofi', 2)).toBe(true);
  });

  it('false when far from change', () => {
    expect(shouldAnticipateVoice('lofi', 5)).toBe(false);
  });

  it('false at change point', () => {
    expect(shouldAnticipateVoice('lofi', 0)).toBe(false);
  });
});

describe('anticipationStrength', () => {
  it('lofi is highest', () => {
    expect(anticipationStrength('lofi')).toBe(0.55);
  });

  it('trance is low', () => {
    expect(anticipationStrength('trance')).toBe(0.15);
  });
});
