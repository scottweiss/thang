import { describe, it, expect } from 'vitest';
import {
  agogicEmphasis,
  agogicAccentGain,
  agogicStrengthValue,
} from './rhythmic-agogic-accent';

describe('agogicEmphasis', () => {
  it('note at average duration = 0', () => {
    expect(agogicEmphasis(1.0, 1.0)).toBe(0);
  });

  it('shorter than average = 0', () => {
    expect(agogicEmphasis(0.5, 1.0)).toBe(0);
  });

  it('2x average = 1.0 (full emphasis)', () => {
    expect(agogicEmphasis(2.0, 1.0)).toBe(1.0);
  });

  it('1.5x average = 0.5', () => {
    expect(agogicEmphasis(1.5, 1.0)).toBe(0.5);
  });

  it('3x average caps at 1.0', () => {
    expect(agogicEmphasis(3.0, 1.0)).toBe(1.0);
  });

  it('zero average = 0', () => {
    expect(agogicEmphasis(2.0, 0)).toBe(0);
  });
});

describe('agogicAccentGain', () => {
  it('longer note gets boost', () => {
    const gain = agogicAccentGain(2.0, 1.0, 'flim', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('average note is neutral', () => {
    const gain = agogicAccentGain(1.0, 1.0, 'flim', 'peak');
    expect(gain).toBe(1.0);
  });

  it('flim boosts more than disco', () => {
    const fl = agogicAccentGain(2.0, 1.0, 'flim', 'peak');
    const di = agogicAccentGain(2.0, 1.0, 'disco', 'peak');
    expect(fl).toBeGreaterThan(di);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let d = 0.5; d <= 4.0; d += 0.5) {
      const gain = agogicAccentGain(d, 1.0, 'flim', 'breakdown');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('agogicStrengthValue', () => {
  it('flim is highest', () => {
    expect(agogicStrengthValue('flim')).toBe(0.55);
  });

  it('disco is lowest', () => {
    expect(agogicStrengthValue('disco')).toBe(0.15);
  });
});
