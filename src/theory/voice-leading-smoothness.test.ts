import { describe, it, expect } from 'vitest';
import {
  voiceLeadingGain,
  smoothnessPreference,
} from './voice-leading-smoothness';

describe('voiceLeadingGain', () => {
  it('smooth motion (1-2 semitones avg) gets boost', () => {
    // 4 voices, 6 total semitones = 1.5 avg
    const gain = voiceLeadingGain(6, 4, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('large jumps get reduction', () => {
    // 4 voices, 24 total semitones = 6 avg
    const gain = voiceLeadingGain(24, 4, 'avril');
    expect(gain).toBeLessThan(1.0);
  });

  it('avril prefers smoothness more than syro', () => {
    const avril = voiceLeadingGain(6, 4, 'avril');
    const syro = voiceLeadingGain(6, 4, 'syro');
    expect(avril).toBeGreaterThan(syro);
  });

  it('stays in 0.94-1.06 range', () => {
    for (let s = 0; s <= 30; s += 5) {
      const gain = voiceLeadingGain(s, 4, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.94);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
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
