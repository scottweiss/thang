import { describe, it, expect } from 'vitest';
import { densityBalanceDegrade, shouldApplyDensityBalance } from './density-balance';

const ALL_LAYERS = new Set(['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere']);
const FEW_LAYERS = new Set(['drone', 'harmony', 'atmosphere']);
const FOUR_LAYERS = new Set(['drone', 'harmony', 'melody', 'arp']);

describe('densityBalanceDegrade', () => {
  it('melody is never thinned', () => {
    expect(densityBalanceDegrade('melody', ALL_LAYERS, 0.5)).toBe(0);
  });

  it('harmony is never thinned', () => {
    expect(densityBalanceDegrade('harmony', ALL_LAYERS, 0.5)).toBe(0);
  });

  it('no thinning with 3 or fewer layers', () => {
    expect(densityBalanceDegrade('arp', FEW_LAYERS, 0.5)).toBe(0);
  });

  it('arp gets thinned with all 6 layers', () => {
    const amount = densityBalanceDegrade('arp', ALL_LAYERS, 0.5);
    expect(amount).toBeGreaterThan(0);
  });

  it('atmosphere gets thinned more than arp', () => {
    const arp = densityBalanceDegrade('arp', ALL_LAYERS, 0.5);
    const atmo = densityBalanceDegrade('atmosphere', ALL_LAYERS, 0.5);
    expect(atmo).toBeGreaterThan(arp);
  });

  it('texture gets thinned more than drone', () => {
    const drone = densityBalanceDegrade('drone', ALL_LAYERS, 0.5);
    const texture = densityBalanceDegrade('texture', ALL_LAYERS, 0.5);
    expect(texture).toBeGreaterThan(drone);
  });

  it('more layers = more thinning', () => {
    const four = densityBalanceDegrade('arp', FOUR_LAYERS, 0.5);
    const six = densityBalanceDegrade('arp', ALL_LAYERS, 0.5);
    expect(six).toBeGreaterThan(four);
  });

  it('high tension reduces thinning', () => {
    const lowTension = densityBalanceDegrade('arp', ALL_LAYERS, 0.1);
    const highTension = densityBalanceDegrade('arp', ALL_LAYERS, 0.9);
    expect(highTension).toBeLessThan(lowTension);
  });

  it('never exceeds 0.4', () => {
    const amount = densityBalanceDegrade('atmosphere', ALL_LAYERS, 0);
    expect(amount).toBeLessThanOrEqual(0.4);
  });

  it('values always >= 0', () => {
    const layers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    for (const layer of layers) {
      for (let t = 0; t <= 1; t += 0.25) {
        const d = densityBalanceDegrade(layer, ALL_LAYERS, t);
        expect(d).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('shouldApplyDensityBalance', () => {
  it('false for melody', () => {
    expect(shouldApplyDensityBalance('melody', ALL_LAYERS)).toBe(false);
  });

  it('false for harmony', () => {
    expect(shouldApplyDensityBalance('harmony', ALL_LAYERS)).toBe(false);
  });

  it('false with 3 or fewer layers', () => {
    expect(shouldApplyDensityBalance('arp', FEW_LAYERS)).toBe(false);
  });

  it('true for arp with 4+ layers', () => {
    expect(shouldApplyDensityBalance('arp', FOUR_LAYERS)).toBe(true);
  });

  it('true for atmosphere with all layers', () => {
    expect(shouldApplyDensityBalance('atmosphere', ALL_LAYERS)).toBe(true);
  });
});
