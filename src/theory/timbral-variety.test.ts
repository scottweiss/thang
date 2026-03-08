import { describe, it, expect } from 'vitest';
import {
  sectionTimbre,
  interpolateTimbre,
  shouldApplyTimbralVariety,
  timbralVarietyStrength,
} from './timbral-variety';

describe('sectionTimbre', () => {
  it('peak has higher FM depth than breakdown', () => {
    const peak = sectionTimbre('peak', 'lofi');
    const breakdown = sectionTimbre('breakdown', 'lofi');
    expect(peak.fmDepthMult).toBeGreaterThan(breakdown.fmDepthMult);
  });

  it('intro has softer attacks than peak', () => {
    const intro = sectionTimbre('intro', 'lofi');
    const peak = sectionTimbre('peak', 'lofi');
    expect(intro.attackMult).toBeGreaterThan(peak.attackMult);
  });

  it('breakdown is darkest', () => {
    const breakdown = sectionTimbre('breakdown', 'lofi');
    const peak = sectionTimbre('peak', 'lofi');
    expect(breakdown.filterBrightness).toBeLessThan(peak.filterBrightness);
  });

  it('groove is closest to neutral', () => {
    const groove = sectionTimbre('groove', 'lofi');
    expect(groove.fmDepthMult).toBeCloseTo(1.0, 1);
    expect(groove.attackMult).toBeCloseTo(1.0, 1);
  });

  it('trance has weaker variation than syro', () => {
    const trance = sectionTimbre('peak', 'trance');
    const syro = sectionTimbre('peak', 'syro');
    // Syro should deviate more from 1.0
    expect(Math.abs(syro.fmDepthMult - 1.0)).toBeGreaterThan(
      Math.abs(trance.fmDepthMult - 1.0)
    );
  });

  it('all values stay in reasonable range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    const moods = ['ambient', 'lofi', 'trance', 'syro'] as const;
    for (const s of sections) {
      for (const m of moods) {
        const t = sectionTimbre(s, m);
        expect(t.fmDepthMult).toBeGreaterThan(0.3);
        expect(t.fmDepthMult).toBeLessThan(2.0);
        expect(t.attackMult).toBeGreaterThan(0.3);
        expect(t.attackMult).toBeLessThan(2.5);
        expect(t.filterBrightness).toBeGreaterThan(0.7);
        expect(t.filterBrightness).toBeLessThan(1.3);
      }
    }
  });
});

describe('interpolateTimbre', () => {
  it('progress 0 returns from', () => {
    const from = sectionTimbre('intro', 'lofi');
    const to = sectionTimbre('peak', 'lofi');
    const result = interpolateTimbre(from, to, 0);
    expect(result.fmDepthMult).toBeCloseTo(from.fmDepthMult, 5);
  });

  it('progress 1 returns to', () => {
    const from = sectionTimbre('intro', 'lofi');
    const to = sectionTimbre('peak', 'lofi');
    const result = interpolateTimbre(from, to, 1);
    expect(result.fmDepthMult).toBeCloseTo(to.fmDepthMult, 5);
  });

  it('progress 0.5 returns midpoint', () => {
    const from = sectionTimbre('intro', 'lofi');
    const to = sectionTimbre('peak', 'lofi');
    const result = interpolateTimbre(from, to, 0.5);
    const expected = (from.fmDepthMult + to.fmDepthMult) / 2;
    expect(result.fmDepthMult).toBeCloseTo(expected, 5);
  });
});

describe('shouldApplyTimbralVariety', () => {
  it('returns true for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    moods.forEach(m => expect(shouldApplyTimbralVariety(m)).toBe(true));
  });
});

describe('timbralVarietyStrength', () => {
  it('syro has strongest variety', () => {
    expect(timbralVarietyStrength('syro')).toBe(0.60);
  });

  it('trance has weakest variety', () => {
    expect(timbralVarietyStrength('trance')).toBe(0.15);
  });
});
