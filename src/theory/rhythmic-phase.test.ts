import { describe, it, expect } from 'vitest';
import { layerPhaseOffset, shouldApplyPhaseOffset } from './rhythmic-phase';

describe('layerPhaseOffset', () => {
  it('returns offset for arp in ambient groove', () => {
    const offset = layerPhaseOffset('arp', 'ambient', 'groove');
    expect(offset).toBeCloseTo(0.125);
  });

  it('returns zero for non-arp layers', () => {
    expect(layerPhaseOffset('melody', 'ambient', 'groove')).toBe(0);
    expect(layerPhaseOffset('harmony', 'lofi', 'groove')).toBe(0);
    expect(layerPhaseOffset('drone', 'syro', 'groove')).toBe(0);
  });

  it('trance arp has no offset', () => {
    expect(layerPhaseOffset('arp', 'trance', 'groove')).toBe(0);
  });

  it('disco arp has no offset', () => {
    expect(layerPhaseOffset('arp', 'disco', 'groove')).toBe(0);
  });

  it('peak section reduces offset', () => {
    const groove = layerPhaseOffset('arp', 'ambient', 'groove');
    const peak = layerPhaseOffset('arp', 'ambient', 'peak');
    expect(peak).toBeLessThan(groove);
  });

  it('build section has moderate offset', () => {
    const groove = layerPhaseOffset('arp', 'xtal', 'groove');
    const build = layerPhaseOffset('arp', 'xtal', 'build');
    expect(build).toBeCloseTo(groove * 0.5);
  });

  it('syro uses 1/16 offset', () => {
    const offset = layerPhaseOffset('arp', 'syro', 'groove');
    expect(offset).toBeCloseTo(0.0625);
  });

  it('offset is always between 0 and 0.25', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const m of moods) {
      for (const s of sections) {
        const offset = layerPhaseOffset('arp', m, s);
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThanOrEqual(0.25);
      }
    }
  });
});

describe('shouldApplyPhaseOffset', () => {
  it('returns true for arp in offset moods', () => {
    expect(shouldApplyPhaseOffset('arp', 'ambient')).toBe(true);
    expect(shouldApplyPhaseOffset('arp', 'xtal')).toBe(true);
    expect(shouldApplyPhaseOffset('arp', 'syro')).toBe(true);
  });

  it('returns false for trance/disco', () => {
    expect(shouldApplyPhaseOffset('arp', 'trance')).toBe(false);
    expect(shouldApplyPhaseOffset('arp', 'disco')).toBe(false);
  });

  it('returns false for non-arp layers', () => {
    expect(shouldApplyPhaseOffset('melody', 'ambient')).toBe(false);
    expect(shouldApplyPhaseOffset('harmony', 'lofi')).toBe(false);
  });
});
