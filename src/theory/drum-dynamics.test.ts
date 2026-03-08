import { describe, it, expect } from 'vitest';
import { applyDrumDynamics, TRANCE_VELOCITIES, AVRIL_VELOCITIES } from './drum-dynamics';

describe('applyDrumDynamics', () => {
  const pattern = '1 0.3 0.5 0.4 1 0.3 0.5 0.4';

  it('peak section increases dynamic range', () => {
    const peak = applyDrumDynamics(pattern, 'peak', 0.5);
    const values = peak.split(' ').map(parseFloat);
    // Accents (originally 1.0) should stay high
    expect(values[0]).toBeGreaterThanOrEqual(0.9);
    // Ghost notes (originally 0.3) should get quieter
    expect(values[1]).toBeLessThan(0.3);
  });

  it('breakdown section compresses dynamic range', () => {
    const breakdown = applyDrumDynamics(pattern, 'breakdown', 0.3);
    const values = breakdown.split(' ').map(parseFloat);
    const range = Math.max(...values) - Math.min(...values);
    // Should be more compressed than peak
    const peakValues = applyDrumDynamics(pattern, 'peak', 0.3).split(' ').map(parseFloat);
    const peakRange = Math.max(...peakValues) - Math.min(...peakValues);
    expect(range).toBeLessThan(peakRange);
  });

  it('never produces values below 0.1', () => {
    const result = applyDrumDynamics('1 0.1 0.1 0.1', 'peak', 1.0);
    const values = result.split(' ').map(parseFloat);
    values.forEach(v => expect(v).toBeGreaterThanOrEqual(0.1));
  });

  it('never produces values above 1.0', () => {
    const result = applyDrumDynamics('1 1 1 1', 'peak', 1.0);
    const values = result.split(' ').map(parseFloat);
    values.forEach(v => expect(v).toBeLessThanOrEqual(1.0));
  });

  it('higher tension increases contrast', () => {
    const low = applyDrumDynamics(pattern, 'groove', 0.1);
    const high = applyDrumDynamics(pattern, 'groove', 0.9);
    const lowValues = low.split(' ').map(parseFloat);
    const highValues = high.split(' ').map(parseFloat);
    const lowRange = Math.max(...lowValues) - Math.min(...lowValues);
    const highRange = Math.max(...highValues) - Math.min(...highValues);
    expect(highRange).toBeGreaterThanOrEqual(lowRange);
  });

  it('preserves the number of steps', () => {
    const result = applyDrumDynamics('1 0.5 0.3 0.7 0.9 0.4', 'groove', 0.5);
    expect(result.split(' ').length).toBe(6);
  });
});

describe('velocity templates', () => {
  it('TRANCE_VELOCITIES has valid entries', () => {
    for (const template of TRANCE_VELOCITIES) {
      const values = template.split(' ').map(parseFloat);
      expect(values.length).toBe(16);
      values.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
    }
  });

  it('AVRIL_VELOCITIES has valid entries', () => {
    for (const template of AVRIL_VELOCITIES) {
      const values = template.split(' ').map(parseFloat);
      expect(values.length).toBe(16);
      values.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
    }
  });

  it('AVRIL_VELOCITIES are quieter than TRANCE_VELOCITIES', () => {
    const avrilAvg = AVRIL_VELOCITIES[0].split(' ').map(parseFloat).reduce((a, b) => a + b) / 16;
    const tranceAvg = TRANCE_VELOCITIES[0].split(' ').map(parseFloat).reduce((a, b) => a + b) / 16;
    expect(avrilAvg).toBeLessThan(tranceAvg);
  });
});
