import { describe, it, expect } from 'vitest';
import {
  accentShiftGain,
  shiftRange,
} from './temporal-accent-shift';

describe('accentShiftGain', () => {
  it('downbeat at section start gets boost', () => {
    const gain = accentShiftGain(0, 0.05, 'lofi');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('backbeat at mid-section gets boost', () => {
    const gain = accentShiftGain(4, 0.5, 'lofi');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('syro has more shift than ambient', () => {
    expect(shiftRange('syro')).toBeGreaterThan(shiftRange('ambient'));
  });

  it('off-beat positions are neutral-ish', () => {
    const gain = accentShiftGain(3, 0.5, 'trance');
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('stays in 0.92-1.08 range', () => {
    for (let p = 0; p < 16; p++) {
      for (let t = 0; t <= 1.0; t += 0.25) {
        const gain = accentShiftGain(p, t, 'syro');
        expect(gain).toBeGreaterThanOrEqual(0.92);
        expect(gain).toBeLessThanOrEqual(1.08);
      }
    }
  });
});

describe('shiftRange', () => {
  it('syro is highest', () => {
    expect(shiftRange('syro')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(shiftRange('ambient')).toBe(0.15);
  });
});
