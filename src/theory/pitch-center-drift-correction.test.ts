import { describe, it, expect } from 'vitest';
import {
  driftCorrectionGain,
  driftTolerance,
} from './pitch-center-drift-correction';

describe('driftCorrectionGain', () => {
  it('near center returns 1.0', () => {
    expect(driftCorrectionGain(62, 60, 'trance')).toBe(1.0);
  });

  it('far from center gets reduction', () => {
    // 2 octaves away from center with low tolerance
    const gain = driftCorrectionGain(84, 60, 'trance');
    expect(gain).toBeLessThan(1.0);
  });

  it('syro tolerates more drift than trance', () => {
    const trance = driftCorrectionGain(84, 60, 'trance');
    const syro = driftCorrectionGain(84, 60, 'syro');
    expect(syro).toBeGreaterThanOrEqual(trance);
  });

  it('stays in 0.90-1.0 range', () => {
    for (let note = 36; note <= 96; note += 6) {
      const gain = driftCorrectionGain(note, 60, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.90);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('driftTolerance', () => {
  it('syro is highest', () => {
    expect(driftTolerance('syro')).toBe(0.70);
  });

  it('disco is lowest', () => {
    expect(driftTolerance('disco')).toBe(0.30);
  });
});
