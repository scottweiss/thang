import { describe, it, expect } from 'vitest';
import {
  detectCadence,
  cadentialGainBoost,
  cadentialReverbBoost,
  shouldApplyCadentialWeight,
  moodCadentialWeight,
} from './cadential-weight';

describe('detectCadence', () => {
  it('V→I is perfect authentic', () => {
    expect(detectCadence(5, 1, 'maj')).toBe(1.0);
  });

  it('V7→I is perfect authentic', () => {
    expect(detectCadence(5, 1, 'dom7')).toBe(1.0);
  });

  it('IV→I is plagal', () => {
    expect(detectCadence(4, 1, 'maj')).toBe(0.7);
  });

  it('vii→I is leading tone', () => {
    expect(detectCadence(7, 1, 'dim')).toBe(0.8);
  });

  it('random motion is not a cadence', () => {
    expect(detectCadence(3, 6, 'min')).toBe(0);
  });

  it('ii→V is approach', () => {
    expect(detectCadence(2, 5, 'min')).toBe(0.5);
  });
});

describe('cadentialGainBoost', () => {
  it('no cadence = no boost', () => {
    expect(cadentialGainBoost(0, 'trance', 'groove')).toBe(1.0);
  });

  it('strong cadence gives boost', () => {
    const boost = cadentialGainBoost(1.0, 'trance', 'peak');
    expect(boost).toBeGreaterThan(1.1);
  });

  it('peak section boosts more than groove', () => {
    const peak = cadentialGainBoost(1.0, 'trance', 'peak');
    const groove = cadentialGainBoost(1.0, 'trance', 'groove');
    expect(peak).toBeGreaterThan(groove);
  });

  it('trance boosts more than ambient', () => {
    const trance = cadentialGainBoost(1.0, 'trance', 'groove');
    const ambient = cadentialGainBoost(1.0, 'ambient', 'groove');
    expect(trance).toBeGreaterThan(ambient);
  });
});

describe('cadentialReverbBoost', () => {
  it('no cadence = no boost', () => {
    expect(cadentialReverbBoost(0, 'trance')).toBe(1.0);
  });

  it('strong cadence adds reverb', () => {
    expect(cadentialReverbBoost(1.0, 'trance')).toBeGreaterThan(1.1);
  });
});

describe('shouldApplyCadentialWeight', () => {
  it('strong cadence in weighted mood', () => {
    expect(shouldApplyCadentialWeight(0.8, 'trance')).toBe(true);
  });

  it('weak cadence does not apply', () => {
    expect(shouldApplyCadentialWeight(0.1, 'trance')).toBe(false);
  });
});

describe('moodCadentialWeight', () => {
  it('trance is highest', () => {
    expect(moodCadentialWeight('trance')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(moodCadentialWeight('ambient')).toBe(0.10);
  });
});
