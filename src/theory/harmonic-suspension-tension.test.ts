import { describe, it, expect } from 'vitest';
import {
  suspensionTensionGain,
  suspensionSensitivity,
} from './harmonic-suspension-tension';

describe('suspensionTensionGain', () => {
  it('sus4 chord builds tension', () => {
    const gain = suspensionTensionGain('sus4', 2, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('major chord is neutral', () => {
    expect(suspensionTensionGain('maj', 2, 'avril')).toBe(1.0);
  });

  it('longer hold builds more tension', () => {
    const short = suspensionTensionGain('sus2', 1, 'avril');
    const long = suspensionTensionGain('sus2', 5, 'avril');
    expect(long).toBeGreaterThan(short);
  });

  it('stays in 0.97-1.08 range', () => {
    for (let t = 0; t <= 10; t++) {
      const gain = suspensionTensionGain('sus4', t, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('suspensionSensitivity', () => {
  it('avril is highest', () => {
    expect(suspensionSensitivity('avril')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(suspensionSensitivity('syro')).toBe(0.25);
  });
});
