import { describe, it, expect } from 'vitest';
import {
  macroDynamicGain,
  transitionDynamicAccent,
  shouldApplyMacroDynamics,
  dynamicRange,
} from './macro-dynamics';

describe('macroDynamicGain', () => {
  it('peak is louder than intro', () => {
    const peakGain = macroDynamicGain('peak', 0.5, 'lofi');
    const introGain = macroDynamicGain('intro', 0.5, 'lofi');
    expect(peakGain).toBeGreaterThan(introGain);
  });

  it('breakdown is quieter than peak', () => {
    const breakdownGain = macroDynamicGain('breakdown', 0.5, 'trance');
    const peakGain = macroDynamicGain('peak', 0.5, 'trance');
    expect(breakdownGain).toBeLessThan(peakGain);
  });

  it('progress increases gain within a section', () => {
    const earlyBuild = macroDynamicGain('build', 0.1, 'disco');
    const lateBuild = macroDynamicGain('build', 0.9, 'disco');
    expect(lateBuild).toBeGreaterThan(earlyBuild);
  });

  it('ambient has compressed range', () => {
    const ambientPeak = macroDynamicGain('peak', 1.0, 'ambient');
    const ambientIntro = macroDynamicGain('intro', 0.0, 'ambient');
    const ambientRange = ambientPeak - ambientIntro;

    const syroPeak = macroDynamicGain('peak', 1.0, 'syro');
    const syroIntro = macroDynamicGain('intro', 0.0, 'syro');
    const syroRange = syroPeak - syroIntro;

    expect(ambientRange).toBeLessThan(syroRange);
  });

  it('gain is always positive and reasonable', () => {
    const sections: Array<'intro' | 'build' | 'peak' | 'breakdown' | 'groove'> =
      ['intro', 'build', 'peak', 'breakdown', 'groove'];
    for (const s of sections) {
      for (let p = 0; p <= 1; p += 0.25) {
        const g = macroDynamicGain(s, p, 'lofi');
        expect(g).toBeGreaterThan(0.3);
        expect(g).toBeLessThanOrEqual(1.2);
      }
    }
  });
});

describe('transitionDynamicAccent', () => {
  it('peak gets accent on first tick', () => {
    expect(transitionDynamicAccent('peak', 0)).toBeGreaterThan(1.0);
  });

  it('breakdown gets drop on first tick', () => {
    expect(transitionDynamicAccent('breakdown', 0)).toBeLessThan(1.0);
  });

  it('no effect after 3 ticks', () => {
    expect(transitionDynamicAccent('peak', 4)).toBe(1.0);
    expect(transitionDynamicAccent('breakdown', 4)).toBe(1.0);
  });

  it('groove has no transition effect', () => {
    expect(transitionDynamicAccent('groove', 0)).toBe(1.0);
  });
});

describe('shouldApplyMacroDynamics', () => {
  it('always true for all moods', () => {
    const moods = ['ambient', 'xtal', 'downtempo', 'lofi', 'avril', 'flim',
                   'blockhead', 'syro', 'disco', 'trance'] as const;
    for (const m of moods) {
      expect(shouldApplyMacroDynamics(m)).toBe(true);
    }
  });
});

describe('dynamicRange', () => {
  it('syro has widest range', () => {
    expect(dynamicRange('syro')).toBe(0.70);
  });

  it('ambient has most compressed range', () => {
    expect(dynamicRange('ambient')).toBe(0.30);
  });
});
