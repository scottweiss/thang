import { describe, it, expect } from 'vitest';
import {
  cadentialAccelMultiplier,
  phraseProgressFromSection,
  shouldAccelerate,
  accelStrength,
} from './cadential-acceleration';

describe('cadentialAccelMultiplier', () => {
  it('start of phrase = normal speed', () => {
    const mult = cadentialAccelMultiplier(0, 'lofi', 'groove');
    expect(mult).toBeCloseTo(1.0, 1);
  });

  it('end of phrase = faster', () => {
    const mult = cadentialAccelMultiplier(1.0, 'lofi', 'groove');
    expect(mult).toBeLessThan(1.0);
  });

  it('stronger moods accelerate more', () => {
    const avril = cadentialAccelMultiplier(0.9, 'avril', 'groove');
    const syro = cadentialAccelMultiplier(0.9, 'syro', 'groove');
    expect(avril).toBeLessThan(syro); // avril accelerates more (lower mult)
  });

  it('build section accelerates most', () => {
    const build = cadentialAccelMultiplier(0.9, 'lofi', 'build');
    const breakdown = cadentialAccelMultiplier(0.9, 'lofi', 'breakdown');
    expect(build).toBeLessThan(breakdown);
  });

  it('never goes below 0.4', () => {
    expect(cadentialAccelMultiplier(1.0, 'avril', 'build')).toBeGreaterThanOrEqual(0.4);
  });
});

describe('phraseProgressFromSection', () => {
  it('0 section = 0 phrase', () => {
    expect(phraseProgressFromSection(0)).toBe(0);
  });

  it('0.25 section = end of first phrase', () => {
    expect(phraseProgressFromSection(0.25)).toBeCloseTo(0, 1);
  });

  it('mid-phrase returns fractional', () => {
    const prog = phraseProgressFromSection(0.125);
    expect(prog).toBeCloseTo(0.5, 1);
  });
});

describe('shouldAccelerate', () => {
  it('lofi in groove accelerates', () => {
    expect(shouldAccelerate('lofi', 'groove')).toBe(true);
  });

  it('ambient in breakdown does not', () => {
    // 0.08 * 0.6 = 0.048 < 0.08
    expect(shouldAccelerate('ambient', 'breakdown')).toBe(false);
  });
});

describe('accelStrength', () => {
  it('avril is highest', () => {
    expect(accelStrength('avril')).toBe(0.35);
  });

  it('ambient is lowest', () => {
    expect(accelStrength('ambient')).toBe(0.03);
  });
});
