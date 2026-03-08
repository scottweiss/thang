import { describe, it, expect } from 'vitest';
import {
  progressionMomentum,
  momentumDriveGain,
  progressionSensitivity,
} from './progression-momentum';

describe('progressionMomentum', () => {
  it('strong motions (4ths/5ths) give high momentum', () => {
    const score = progressionMomentum([5, 7, 5], 'avril'); // IV-V-IV
    expect(score).toBeGreaterThan(0.3);
  });

  it('static harmony gives low momentum', () => {
    const moving = progressionMomentum([5, 7], 'trance');
    const _static = progressionMomentum([0, 0], 'trance');
    expect(moving).toBeGreaterThan(_static);
  });

  it('empty array returns 0', () => {
    expect(progressionMomentum([], 'lofi')).toBe(0);
  });

  it('stays in 0-1 range', () => {
    const score = progressionMomentum([5, 7, 5, 7, 5], 'avril');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('momentumDriveGain', () => {
  it('strong progression boosts gain', () => {
    const gain = momentumDriveGain([5, 7, 5], 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('stays in 0.95-1.12 range', () => {
    const gain = momentumDriveGain([5, 7, 5, 7], 'avril');
    expect(gain).toBeGreaterThanOrEqual(0.95);
    expect(gain).toBeLessThanOrEqual(1.12);
  });
});

describe('progressionSensitivity', () => {
  it('avril is highest', () => {
    expect(progressionSensitivity('avril')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(progressionSensitivity('ambient')).toBe(0.15);
  });
});
