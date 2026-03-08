import { describe, it, expect } from 'vitest';
import {
  frequencyOverlap,
  antiMaskingHpf,
  antiMaskingLpf,
  shouldApplyAntiMasking,
  maskingSensitivity,
} from './spectral-masking';

describe('frequencyOverlap', () => {
  it('same frequency = full overlap', () => {
    expect(frequencyOverlap(500, 500)).toBe(1.0);
  });

  it('half-octave apart has overlap', () => {
    const overlap = frequencyOverlap(500, 700); // ~0.49 octaves
    expect(overlap).toBeGreaterThan(0);
  });

  it('2+ octaves apart = no overlap', () => {
    expect(frequencyOverlap(100, 800)).toBe(0);
  });

  it('close frequencies = high overlap', () => {
    const overlap = frequencyOverlap(500, 550); // very close
    expect(overlap).toBeGreaterThan(0.5);
  });
});

describe('antiMaskingHpf', () => {
  it('raises HPF when lower layer overlaps', () => {
    // harmony (350Hz) with atmosphere (500Hz) — close enough to overlap
    // harmony has atmosphere above it, but let's test melody (800Hz) with arp (1200Hz)
    // Actually, atmosphere (500Hz) is above harmony (350Hz) — test a case where
    // a lower layer is close: arp (1200Hz) with melody (800Hz) below
    const offset = antiMaskingHpf('arp', ['melody', 'arp'], 'ambient');
    expect(offset).toBeGreaterThan(0);
  });

  it('no adjustment when alone', () => {
    expect(antiMaskingHpf('melody', ['melody'], 'ambient')).toBe(0);
  });

  it('no adjustment when no lower overlap', () => {
    // melody (800Hz) with arp (1200Hz) above — no masking from below
    const offset = antiMaskingHpf('melody', ['melody', 'arp'], 'ambient');
    expect(offset).toBe(0);
  });
});

describe('antiMaskingLpf', () => {
  it('lowers LPF when upper layer overlaps', () => {
    // harmony (350Hz) with atmosphere (500Hz) above
    const offset = antiMaskingLpf('harmony', ['harmony', 'atmosphere'], 'ambient');
    expect(offset).toBeLessThan(0);
  });

  it('no adjustment when alone', () => {
    expect(antiMaskingLpf('melody', ['melody'], 'ambient')).toBe(0);
  });
});

describe('shouldApplyAntiMasking', () => {
  it('needs 3+ layers', () => {
    expect(shouldApplyAntiMasking(2, 'ambient')).toBe(false);
    expect(shouldApplyAntiMasking(3, 'ambient')).toBe(true);
  });

  it('low sensitivity moods may not apply', () => {
    // Checking if any mood has sensitivity <= 0.25
    // All moods have > 0.25, so this tests the threshold
    expect(shouldApplyAntiMasking(3, 'trance')).toBe(true);
  });
});

describe('maskingSensitivity', () => {
  it('ambient has highest sensitivity', () => {
    expect(maskingSensitivity('ambient')).toBe(0.60);
  });

  it('trance has lower sensitivity', () => {
    expect(maskingSensitivity('trance')).toBe(0.30);
  });
});
