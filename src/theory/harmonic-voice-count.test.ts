import { describe, it, expect } from 'vitest';
import {
  voiceCountGain,
  voiceSensitivity,
  targetVoices,
} from './harmonic-voice-count';

describe('voiceCountGain', () => {
  it('matching target is near 1.0', () => {
    const gain = voiceCountGain(4.5, 'avril', 'peak');
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('too many voices gets reduction', () => {
    const gain = voiceCountGain(6, 'avril', 'intro');
    expect(gain).toBeLessThan(1.0);
  });

  it('too few voices gets boost', () => {
    const gain = voiceCountGain(1, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('avril is more sensitive than syro', () => {
    const avril = voiceCountGain(6, 'avril', 'intro');
    const syro = voiceCountGain(6, 'syro', 'intro');
    expect(avril).toBeLessThan(syro); // avril reduces more
  });

  it('stays in 0.90-1.08 range', () => {
    for (let v = 1; v <= 6; v++) {
      const gain = voiceCountGain(v, 'trance', 'peak');
      expect(gain).toBeGreaterThanOrEqual(0.90);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('voiceSensitivity', () => {
  it('avril and ambient are highest', () => {
    expect(voiceSensitivity('avril')).toBe(0.60);
    expect(voiceSensitivity('ambient')).toBe(0.60);
  });

  it('syro and disco are low', () => {
    expect(voiceSensitivity('syro')).toBe(0.35);
    expect(voiceSensitivity('disco')).toBe(0.35);
  });
});

describe('targetVoices', () => {
  it('peak has most voices', () => {
    expect(targetVoices('peak')).toBe(4.5);
  });

  it('breakdown has fewest', () => {
    expect(targetVoices('breakdown')).toBe(2.0);
  });
});
