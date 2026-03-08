import { describe, it, expect } from 'vitest';
import {
  fusionCorrection,
  fusionGainBalance,
  shouldApplyFusion,
  fusionPreference,
} from './auditory-stream-fusion';

describe('fusionCorrection', () => {
  it('no correction when already within fusion window', () => {
    expect(fusionCorrection(0.01, 0.02, 'trance')).toBe(0.01);
  });

  it('pulls toward fusion window when close', () => {
    const original = 0.06;
    const target = 0.0;
    const corrected = fusionCorrection(original, target, 'trance');
    expect(Math.abs(corrected - target)).toBeLessThan(Math.abs(original - target));
  });

  it('no correction when far apart', () => {
    expect(fusionCorrection(0.2, 0.0, 'trance')).toBe(0.2);
  });

  it('stronger moods pull harder', () => {
    const trance = fusionCorrection(0.05, 0.0, 'trance');
    const syro = fusionCorrection(0.05, 0.0, 'syro');
    expect(Math.abs(trance - 0.0)).toBeLessThanOrEqual(Math.abs(syro - 0.0));
  });
});

describe('fusionGainBalance', () => {
  it('no boost when not fused (>30ms)', () => {
    expect(fusionGainBalance(35, 'trance')).toBe(1.0);
  });

  it('boost when fused (<30ms)', () => {
    expect(fusionGainBalance(10, 'trance')).toBeGreaterThan(1.0);
  });

  it('capped at 1.1', () => {
    expect(fusionGainBalance(0, 'trance')).toBeLessThanOrEqual(1.1);
  });
});

describe('shouldApplyFusion', () => {
  it('trance builds apply', () => {
    expect(shouldApplyFusion('trance', 'build')).toBe(true);
  });

  it('ambient breakdown does not apply', () => {
    // 0.10 * 0.6 = 0.06, below threshold
    expect(shouldApplyFusion('ambient', 'breakdown')).toBe(false);
  });
});

describe('fusionPreference', () => {
  it('trance is strongest', () => {
    expect(fusionPreference('trance')).toBe(0.60);
  });

  it('ambient is weakest', () => {
    expect(fusionPreference('ambient')).toBe(0.10);
  });
});
