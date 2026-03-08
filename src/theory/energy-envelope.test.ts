import { describe, it, expect } from 'vitest';
import {
  energyLevel,
  energyPhase,
  energyGainMultiplier,
  shouldApplyEnergyEnvelope,
  moodEnergyCeiling,
} from './energy-envelope';

describe('energyLevel', () => {
  it('peak has highest energy', () => {
    const peak = energyLevel('peak', 0.5, 'trance');
    const intro = energyLevel('intro', 0.5, 'trance');
    expect(peak).toBeGreaterThan(intro);
  });

  it('build energy rises with progress', () => {
    const early = energyLevel('build', 0.1, 'trance');
    const late = energyLevel('build', 0.9, 'trance');
    expect(late).toBeGreaterThan(early);
  });

  it('ambient caps energy low', () => {
    const ambientPeak = energyLevel('peak', 0.5, 'ambient');
    const trancePeak = energyLevel('peak', 0.5, 'trance');
    expect(ambientPeak).toBeLessThan(trancePeak);
  });

  it('clamps to 0-ceiling', () => {
    expect(energyLevel('intro', 0, 'ambient')).toBeGreaterThanOrEqual(0);
    expect(energyLevel('peak', 1, 'trance')).toBeLessThanOrEqual(1);
  });

  it('breakdown energy falls with progress', () => {
    const early = energyLevel('breakdown', 0.1, 'trance');
    const late = energyLevel('breakdown', 0.9, 'trance');
    expect(late).toBeLessThan(early);
  });
});

describe('energyPhase', () => {
  it('low energy = rest', () => {
    expect(energyPhase(0.1, 0.1)).toBe('rest');
  });

  it('rising delta = rising', () => {
    expect(energyPhase(0.5, 0.4)).toBe('rising');
  });

  it('falling delta = falling', () => {
    expect(energyPhase(0.4, 0.5)).toBe('falling');
  });

  it('steady = sustain', () => {
    expect(energyPhase(0.6, 0.6)).toBe('sustain');
  });
});

describe('energyGainMultiplier', () => {
  it('high energy boosts gain', () => {
    const high = energyGainMultiplier(0.9, 'trance');
    const low = energyGainMultiplier(0.2, 'trance');
    expect(high).toBeGreaterThan(low);
  });

  it('returns reasonable range', () => {
    const mult = energyGainMultiplier(0.5, 'lofi');
    expect(mult).toBeGreaterThan(0.5);
    expect(mult).toBeLessThan(1.5);
  });
});

describe('shouldApplyEnergyEnvelope', () => {
  it('all moods apply (all have ceiling > 0.3)', () => {
    expect(shouldApplyEnergyEnvelope('trance')).toBe(true);
    expect(shouldApplyEnergyEnvelope('ambient')).toBe(true);
  });
});

describe('moodEnergyCeiling', () => {
  it('trance has highest ceiling', () => {
    expect(moodEnergyCeiling('trance')).toBe(0.95);
  });

  it('ambient has lowest ceiling', () => {
    expect(moodEnergyCeiling('ambient')).toBe(0.40);
  });
});
