import { describe, it, expect } from 'vitest';
import {
  classifyArticulation,
  coupledDecay,
  shouldCoupleArticulation,
  couplingStrength,
} from './articulation-coupling';

describe('classifyArticulation', () => {
  it('short = staccato', () => {
    expect(classifyArticulation(0.05)).toBe('staccato');
  });

  it('medium-short = marcato', () => {
    expect(classifyArticulation(0.2)).toBe('marcato');
  });

  it('medium = tenuto', () => {
    expect(classifyArticulation(0.5)).toBe('tenuto');
  });

  it('long = legato', () => {
    expect(classifyArticulation(1.2)).toBe('legato');
  });
});

describe('coupledDecay', () => {
  it('high coupling matches lead', () => {
    // trance (0.65) * peak (1.3) = 0.845 → high coupling
    const result = coupledDecay(0.1, 0.5, 'trance', 'peak');
    expect(result).toBeLessThan(0.5); // moved toward lead's 0.1
  });

  it('low coupling contrasts lead', () => {
    // ambient (0.10) * breakdown (0.6) = 0.06 → low coupling
    // Lead is short (0.1) → follower should get longer
    const result = coupledDecay(0.1, 0.5, 'ambient', 'breakdown');
    expect(result).toBeGreaterThan(0.5); // moved away from lead
  });

  it('moderate coupling is near base', () => {
    // downtempo (0.30) * groove (1.1) = 0.33
    const result = coupledDecay(0.3, 0.5, 'downtempo', 'groove');
    // Coupling < 0.5 → contrast path, lead is medium → follower shortens slightly
    expect(result).toBeLessThan(0.55);
    expect(result).toBeGreaterThan(0.3);
  });
});

describe('shouldCoupleArticulation', () => {
  it('needs 2+ layers', () => {
    expect(shouldCoupleArticulation('trance', 1)).toBe(false);
    expect(shouldCoupleArticulation('trance', 2)).toBe(true);
  });
});

describe('couplingStrength', () => {
  it('trance is highest', () => {
    expect(couplingStrength('trance')).toBe(0.65);
  });

  it('ambient is lowest', () => {
    expect(couplingStrength('ambient')).toBe(0.10);
  });
});
