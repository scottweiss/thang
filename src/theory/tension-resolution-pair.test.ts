import { describe, it, expect } from 'vitest';
import {
  detectPhase,
  releaseMultiplier,
  releaseReverbMultiplier,
  shouldApplyTensionResolution,
  resolutionDepth,
} from './tension-resolution-pair';

describe('detectPhase', () => {
  it('rising tension = building', () => {
    expect(detectPhase(0.6, 0.4, 'lofi')).toBe('building');
  });

  it('falling tension = releasing', () => {
    expect(detectPhase(0.4, 0.6, 'lofi')).toBe('releasing');
  });

  it('high stable = sustaining', () => {
    expect(detectPhase(0.8, 0.8, 'lofi')).toBe('sustaining');
  });

  it('low stable = resolved', () => {
    expect(detectPhase(0.3, 0.3, 'lofi')).toBe('resolved');
  });
});

describe('releaseMultiplier', () => {
  it('building brightens', () => {
    expect(releaseMultiplier('building', 'avril')).toBeGreaterThan(1.0);
  });

  it('releasing darkens', () => {
    expect(releaseMultiplier('releasing', 'avril')).toBeLessThan(1.0);
  });

  it('resolved is slightly warm', () => {
    const mult = releaseMultiplier('resolved', 'lofi');
    expect(mult).toBeLessThan(1.0);
    expect(mult).toBeGreaterThan(0.9);
  });

  it('syro has less depth', () => {
    const avrilRelease = releaseMultiplier('releasing', 'avril');
    const syroRelease = releaseMultiplier('releasing', 'syro');
    expect(avrilRelease).toBeLessThan(syroRelease); // avril releases more
  });
});

describe('releaseReverbMultiplier', () => {
  it('building dries', () => {
    expect(releaseReverbMultiplier('building', 'lofi')).toBeLessThan(1.0);
  });

  it('releasing opens reverb', () => {
    expect(releaseReverbMultiplier('releasing', 'lofi')).toBeGreaterThan(1.0);
  });

  it('sustaining is neutral', () => {
    expect(releaseReverbMultiplier('sustaining', 'lofi')).toBe(1.0);
  });
});

describe('shouldApplyTensionResolution', () => {
  it('avril applies', () => {
    expect(shouldApplyTensionResolution('avril')).toBe(true);
  });

  it('all moods above threshold', () => {
    expect(shouldApplyTensionResolution('syro')).toBe(true);
  });
});

describe('resolutionDepth', () => {
  it('avril is deepest', () => {
    expect(resolutionDepth('avril')).toBe(0.55);
  });

  it('syro is shallowest', () => {
    expect(resolutionDepth('syro')).toBe(0.20);
  });
});
