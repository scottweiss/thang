import { describe, it, expect } from 'vitest';
import {
  voiceLeadingCost,
  voiceLeadingSmoothness,
  voiceLeadingWeight,
  smoothnessPreference,
} from './voice-leading-cost';

describe('voiceLeadingCost', () => {
  it('identical chords cost 0', () => {
    expect(voiceLeadingCost([0, 4, 7], [0, 4, 7])).toBe(0);
  });

  it('semitone movement costs 1 per voice', () => {
    expect(voiceLeadingCost([0], [1])).toBe(1);
  });

  it('parallel motion has low cost', () => {
    // C→Db: each voice moves 1 semitone
    const cost = voiceLeadingCost([0, 4, 7], [1, 5, 8]);
    expect(cost).toBe(3);
  });

  it('large leaps have high cost', () => {
    const smooth = voiceLeadingCost([0, 4, 7], [0, 5, 7]);
    const leapy = voiceLeadingCost([0, 4, 7], [6, 10, 1]);
    expect(leapy).toBeGreaterThan(smooth);
  });

  it('empty arrays cost 0', () => {
    expect(voiceLeadingCost([], [0, 4, 7])).toBe(0);
  });
});

describe('voiceLeadingSmoothness', () => {
  it('identical = 1.0', () => {
    expect(voiceLeadingSmoothness([0, 4, 7], [0, 4, 7])).toBe(1.0);
  });

  it('smooth motion scores high', () => {
    const score = voiceLeadingSmoothness([0, 4, 7], [0, 5, 7]);
    expect(score).toBeGreaterThan(0.8);
  });

  it('stays in 0-1 range', () => {
    const score = voiceLeadingSmoothness([0, 4, 7], [6, 10, 1]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('voiceLeadingWeight', () => {
  it('smooth transitions weighted high for avril', () => {
    const smooth = voiceLeadingWeight([0, 4, 7], [0, 5, 7], 'avril');
    const rough = voiceLeadingWeight([0, 4, 7], [6, 10, 1], 'avril');
    expect(smooth).toBeGreaterThan(rough);
  });

  it('syro cares less about smoothness', () => {
    const avrilDiff = voiceLeadingWeight([0, 4, 7], [0, 5, 7], 'avril') -
                      voiceLeadingWeight([0, 4, 7], [6, 10, 1], 'avril');
    const syroDiff = voiceLeadingWeight([0, 4, 7], [0, 5, 7], 'syro') -
                     voiceLeadingWeight([0, 4, 7], [6, 10, 1], 'syro');
    expect(avrilDiff).toBeGreaterThan(syroDiff);
  });

  it('stays in 0.3-1.5 range', () => {
    const w = voiceLeadingWeight([0, 4, 7], [6, 10, 1], 'ambient');
    expect(w).toBeGreaterThanOrEqual(0.3);
    expect(w).toBeLessThanOrEqual(1.5);
  });
});

describe('smoothnessPreference', () => {
  it('avril is highest', () => {
    expect(smoothnessPreference('avril')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(smoothnessPreference('syro')).toBe(0.20);
  });
});
