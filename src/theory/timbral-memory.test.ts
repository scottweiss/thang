import { describe, it, expect } from 'vitest';
import {
  TimbralMemoryBank,
  blendTimbre,
  recallTendency,
} from './timbral-memory';

describe('TimbralMemoryBank', () => {
  it('stores and recalls', () => {
    const bank = new TimbralMemoryBank();
    bank.store('lofi', 'melody', { fmh: 2, fm: 1, lpf: 2000, section: 'groove', tick: 10 });
    const recalled = bank.recall('lofi', 'melody', 'groove');
    expect(recalled).not.toBeNull();
    expect(recalled!.fmh).toBe(2);
  });

  it('prefers same-section recall', () => {
    const bank = new TimbralMemoryBank();
    bank.store('lofi', 'melody', { fmh: 2, fm: 1, lpf: 2000, section: 'groove', tick: 10 });
    bank.store('lofi', 'melody', { fmh: 5, fm: 2, lpf: 3000, section: 'peak', tick: 20 });
    const recalled = bank.recall('lofi', 'melody', 'groove');
    expect(recalled!.fmh).toBe(2);
  });

  it('falls back to most recent when no section match', () => {
    const bank = new TimbralMemoryBank();
    bank.store('lofi', 'melody', { fmh: 2, fm: 1, lpf: 2000, section: 'groove', tick: 10 });
    const recalled = bank.recall('lofi', 'melody', 'peak');
    expect(recalled).not.toBeNull();
    expect(recalled!.fmh).toBe(2);
  });

  it('returns null for empty bank', () => {
    const bank = new TimbralMemoryBank();
    expect(bank.recall('lofi', 'melody', 'groove')).toBeNull();
  });

  it('limits memory size', () => {
    const bank = new TimbralMemoryBank();
    for (let i = 0; i < 20; i++) {
      bank.store('lofi', 'melody', { fmh: i, fm: 1, lpf: 2000, section: 'groove', tick: i });
    }
    expect(bank.count('lofi', 'melody')).toBeLessThanOrEqual(8);
  });

  it('shouldRecall is probabilistic', () => {
    const bank = new TimbralMemoryBank();
    let recalled = 0;
    for (let t = 0; t < 100; t++) {
      if (bank.shouldRecall('trance', t)) recalled++;
    }
    // trance tendency 0.55, expect ~55% recall rate
    expect(recalled).toBeGreaterThan(30);
    expect(recalled).toBeLessThan(80);
  });

  it('clears all memories', () => {
    const bank = new TimbralMemoryBank();
    bank.store('lofi', 'melody', { fmh: 2, fm: 1, lpf: 2000, section: 'groove', tick: 10 });
    bank.clear();
    expect(bank.recall('lofi', 'melody', 'groove')).toBeNull();
  });
});

describe('blendTimbre', () => {
  it('high tendency leans toward recalled', () => {
    const blended = blendTimbre(3.0, 5.0, 'trance');
    expect(blended).toBeGreaterThan(3.0);
    expect(blended).toBeLessThan(5.0);
  });

  it('low tendency stays near current', () => {
    const blended = blendTimbre(3.0, 5.0, 'syro');
    expect(blended).toBeCloseTo(3.0, 0);
  });

  it('same values = no change', () => {
    expect(blendTimbre(2.0, 2.0, 'lofi')).toBe(2.0);
  });
});

describe('recallTendency', () => {
  it('trance is highest', () => {
    expect(recallTendency('trance')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(recallTendency('syro')).toBe(0.10);
  });
});
