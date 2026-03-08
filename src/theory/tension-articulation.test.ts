import { describe, it, expect } from 'vitest';
import {
  tensionDecayMultiplier,
  tensionSustainMultiplier,
  tensionAttackMultiplier,
  shouldApplyTensionArticulation,
  tensionArticulationSensitivity,
} from './tension-articulation';

describe('tensionDecayMultiplier', () => {
  it('high tension shortens decay (multiplier < 1)', () => {
    expect(tensionDecayMultiplier(1.0, 'trance')).toBeLessThan(1.0);
  });

  it('low tension lengthens decay (multiplier > 1)', () => {
    expect(tensionDecayMultiplier(0.0, 'trance')).toBeGreaterThan(1.0);
  });

  it('mid tension is neutral (multiplier ≈ 1)', () => {
    expect(tensionDecayMultiplier(0.5, 'trance')).toBeCloseTo(1.0, 5);
  });

  it('ambient has minimal effect even at extremes', () => {
    const high = tensionDecayMultiplier(1.0, 'ambient');
    const low = tensionDecayMultiplier(0.0, 'ambient');
    expect(Math.abs(high - low)).toBeLessThan(0.05);
  });

  it('trance has larger range than lofi', () => {
    const tranceRange = tensionDecayMultiplier(0, 'trance') - tensionDecayMultiplier(1, 'trance');
    const lofiRange = tensionDecayMultiplier(0, 'lofi') - tensionDecayMultiplier(1, 'lofi');
    expect(tranceRange).toBeGreaterThan(lofiRange);
  });

  it('clamps tension to 0-1 range', () => {
    expect(tensionDecayMultiplier(-0.5, 'trance')).toBe(tensionDecayMultiplier(0, 'trance'));
    expect(tensionDecayMultiplier(1.5, 'trance')).toBe(tensionDecayMultiplier(1, 'trance'));
  });
});

describe('tensionSustainMultiplier', () => {
  it('high tension lowers sustain', () => {
    expect(tensionSustainMultiplier(1.0, 'disco')).toBeLessThan(1.0);
  });

  it('low tension raises sustain', () => {
    expect(tensionSustainMultiplier(0.0, 'disco')).toBeGreaterThan(1.0);
  });

  it('sustain effect is larger than decay effect (higher coefficient)', () => {
    const sustainRange = tensionSustainMultiplier(0, 'trance') - tensionSustainMultiplier(1, 'trance');
    const decayRange = tensionDecayMultiplier(0, 'trance') - tensionDecayMultiplier(1, 'trance');
    expect(sustainRange).toBeGreaterThan(decayRange);
  });

  it('mid tension is neutral', () => {
    expect(tensionSustainMultiplier(0.5, 'lofi')).toBeCloseTo(1.0, 5);
  });
});

describe('tensionAttackMultiplier', () => {
  it('high tension shortens attack', () => {
    expect(tensionAttackMultiplier(1.0, 'trance')).toBeLessThan(1.0);
  });

  it('low tension lengthens attack', () => {
    expect(tensionAttackMultiplier(0.0, 'trance')).toBeGreaterThan(1.0);
  });

  it('attack effect is smallest of the three', () => {
    const attackRange = tensionAttackMultiplier(0, 'trance') - tensionAttackMultiplier(1, 'trance');
    const decayRange = tensionDecayMultiplier(0, 'trance') - tensionDecayMultiplier(1, 'trance');
    expect(attackRange).toBeLessThan(decayRange);
  });
});

describe('shouldApplyTensionArticulation', () => {
  it('returns true for trance (high sensitivity)', () => {
    expect(shouldApplyTensionArticulation('trance')).toBe(true);
  });

  it('returns true for lofi (moderate sensitivity)', () => {
    expect(shouldApplyTensionArticulation('lofi')).toBe(true);
  });

  it('returns false for ambient (below threshold)', () => {
    expect(shouldApplyTensionArticulation('ambient')).toBe(false);
  });

  it('returns true for xtal (exactly at threshold 0.15)', () => {
    expect(shouldApplyTensionArticulation('xtal')).toBe(true);
  });
});

describe('tensionArticulationSensitivity', () => {
  it('trance is highest', () => {
    expect(tensionArticulationSensitivity('trance')).toBe(0.50);
  });

  it('ambient is lowest', () => {
    expect(tensionArticulationSensitivity('ambient')).toBe(0.05);
  });

  it('all moods have a defined sensitivity', () => {
    const moods = ['trance', 'disco', 'syro', 'blockhead', 'downtempo', 'lofi', 'flim', 'xtal', 'avril', 'ambient'] as const;
    for (const mood of moods) {
      expect(tensionArticulationSensitivity(mood)).toBeGreaterThan(0);
      expect(tensionArticulationSensitivity(mood)).toBeLessThanOrEqual(1);
    }
  });
});
