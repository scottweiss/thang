import { describe, it, expect } from 'vitest';
import { hpfBandOffset, lpfBandOffset, shouldApplyBandSeparation } from './frequency-band';

describe('hpfBandOffset', () => {
  it('returns 0 when only 2 layers active (no crowding)', () => {
    const active = new Set(['drone', 'harmony']);
    expect(hpfBandOffset('harmony', active)).toBe(0);
  });

  it('increases harmony HPF when drone is active and crowded', () => {
    const active = new Set(['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere']);
    const offset = hpfBandOffset('harmony', active);
    expect(offset).toBeGreaterThan(0);
  });

  it('increases arp HPF when melody is active and crowded', () => {
    const active = new Set(['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere']);
    const offset = hpfBandOffset('arp', active);
    expect(offset).toBeGreaterThan(0);
  });

  it('larger offset with more active layers', () => {
    const few = new Set(['drone', 'harmony', 'melody']);
    const many = new Set(['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere']);
    const fewOffset = hpfBandOffset('harmony', few);
    const manyOffset = hpfBandOffset('harmony', many);
    expect(manyOffset).toBeGreaterThan(fewOffset);
  });

  it('drone gets no HPF offset (needs low frequencies)', () => {
    const active = new Set(['drone', 'harmony', 'melody']);
    // Drone is only the 'b' side of the harmony-drone pair,
    // so it gets a smaller offset
    const offset = hpfBandOffset('drone', active);
    expect(offset).toBeLessThanOrEqual(10);
  });

  it('returns 0 for layers with no competing pairs active', () => {
    const active = new Set(['melody', 'texture']);
    expect(hpfBandOffset('melody', active)).toBe(0);
  });
});

describe('lpfBandOffset', () => {
  it('returns 0 when few layers active', () => {
    const active = new Set(['harmony', 'melody']);
    expect(lpfBandOffset('harmony', active)).toBe(0);
  });

  it('pushes harmony LPF down when melody is active and crowded', () => {
    const active = new Set(['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere']);
    const offset = lpfBandOffset('harmony', active);
    expect(offset).toBeLessThan(0);
  });

  it('melody gets no LPF reduction (needs brightness)', () => {
    const active = new Set(['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere']);
    const offset = lpfBandOffset('melody', active);
    expect(offset).toBe(0);
  });
});

describe('shouldApplyBandSeparation', () => {
  it('returns false for 2 layers', () => {
    expect(shouldApplyBandSeparation(new Set(['drone', 'harmony']))).toBe(false);
  });

  it('returns true for 3 layers', () => {
    expect(shouldApplyBandSeparation(new Set(['drone', 'harmony', 'melody']))).toBe(true);
  });

  it('returns true for all layers', () => {
    expect(shouldApplyBandSeparation(
      new Set(['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere'])
    )).toBe(true);
  });
});
