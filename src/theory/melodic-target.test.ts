import { describe, it, expect } from 'vitest';
import {
  selectTargetTone,
  targetPull,
  biasTowardTarget,
  shouldApplyTargeting,
  targetingStrength,
} from './melodic-target';

describe('selectTargetTone', () => {
  it('tonal moods prefer root', () => {
    const target = selectTargetTone(['C4', 'E4', 'G4'], 'trance', 'groove', 10);
    expect(['C4', 'G4']).toContain(target);
  });

  it('jazz moods prefer 3rd or 7th', () => {
    const target = selectTargetTone(['C4', 'E4', 'G4', 'Bb4'], 'lofi', 'groove', 42);
    expect(['E4', 'Bb4']).toContain(target);
  });

  it('empty chord returns C4', () => {
    expect(selectTargetTone([], 'trance', 'groove', 0)).toBe('C4');
  });

  it('single-note chord returns that note', () => {
    expect(selectTargetTone(['D4'], 'lofi', 'groove', 0)).toBe('D4');
  });
});

describe('targetPull', () => {
  it('start of phrase = no pull', () => {
    expect(targetPull(0, 'trance')).toBe(0);
  });

  it('end of phrase = strong pull', () => {
    const pull = targetPull(1.0, 'trance');
    expect(pull).toBeGreaterThan(0.3);
  });

  it('pull increases with position', () => {
    const early = targetPull(0.3, 'lofi');
    const late = targetPull(0.8, 'lofi');
    expect(late).toBeGreaterThan(early);
  });

  it('trance pulls stronger than xtal', () => {
    const trance = targetPull(0.8, 'trance');
    const xtal = targetPull(0.8, 'xtal');
    expect(trance).toBeGreaterThan(xtal);
  });
});

describe('biasTowardTarget', () => {
  it('pull 0 = no change', () => {
    expect(biasTowardTarget(60, 64, 0)).toBe(60);
  });

  it('pull 1 = reaches target', () => {
    expect(biasTowardTarget(60, 64, 1)).toBe(64);
  });

  it('pull 0.5 = halfway', () => {
    expect(biasTowardTarget(60, 64, 0.5)).toBe(62);
  });
});

describe('shouldApplyTargeting', () => {
  it('trance applies', () => {
    expect(shouldApplyTargeting('trance')).toBe(true);
  });

  it('ambient does not apply', () => {
    expect(shouldApplyTargeting('ambient')).toBe(false);
  });
});

describe('targetingStrength', () => {
  it('avril is highest', () => {
    expect(targetingStrength('avril')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(targetingStrength('ambient')).toBe(0.10);
  });
});
