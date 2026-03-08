import { describe, it, expect } from 'vitest';
import {
  echoDensityFeedback,
  echoDensityWet,
  shouldApplyEchoDensity,
  echoSensitivity,
} from './echo-density';

describe('echoDensityFeedback', () => {
  it('sparse sections get more feedback', () => {
    const sparse = echoDensityFeedback(0.1, 'lofi', 'groove');
    const dense = echoDensityFeedback(0.9, 'lofi', 'groove');
    expect(sparse).toBeGreaterThan(dense);
  });

  it('clamped to [0.5, 1.5]', () => {
    const fb = echoDensityFeedback(0, 'ambient', 'breakdown');
    expect(fb).toBeLessThanOrEqual(1.5);
    expect(fb).toBeGreaterThanOrEqual(0.5);
  });

  it('breakdown amplifies effect', () => {
    const bd = echoDensityFeedback(0.2, 'lofi', 'breakdown');
    const pk = echoDensityFeedback(0.2, 'lofi', 'peak');
    expect(bd).toBeGreaterThan(pk);
  });
});

describe('echoDensityWet', () => {
  it('sparse = wetter', () => {
    const sparse = echoDensityWet(0.1, 'xtal');
    const dense = echoDensityWet(0.9, 'xtal');
    expect(sparse).toBeGreaterThan(dense);
  });

  it('clamped to [0.6, 1.4]', () => {
    expect(echoDensityWet(0, 'ambient')).toBeLessThanOrEqual(1.4);
    expect(echoDensityWet(1, 'ambient')).toBeGreaterThanOrEqual(0.6);
  });
});

describe('shouldApplyEchoDensity', () => {
  it('xtal applies', () => {
    expect(shouldApplyEchoDensity('xtal')).toBe(true);
  });

  it('trance applies (barely)', () => {
    // 0.20 > 0.18
    expect(shouldApplyEchoDensity('trance')).toBe(true);
  });
});

describe('echoSensitivity', () => {
  it('ambient is highest', () => {
    expect(echoSensitivity('ambient')).toBe(0.60);
  });

  it('trance is lowest', () => {
    expect(echoSensitivity('trance')).toBe(0.20);
  });
});
