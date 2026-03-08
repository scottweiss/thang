import { describe, it, expect } from 'vitest';
import {
  sustainMultiplier,
  shouldApplySustainCurve,
  sustainSensitivity,
} from './sustain-envelope-curve';

describe('sustainMultiplier', () => {
  it('breakdowns have longer sustain than peaks', () => {
    const bd = sustainMultiplier('breakdown', 0.5, 'trance', 'harmony');
    const pk = sustainMultiplier('peak', 0.5, 'trance', 'harmony');
    expect(bd).toBeGreaterThan(pk);
  });

  it('drone has longer sustain than arp', () => {
    const drone = sustainMultiplier('groove', 0.5, 'lofi', 'drone');
    const arp = sustainMultiplier('groove', 0.5, 'lofi', 'arp');
    expect(drone).toBeGreaterThan(arp);
  });

  it('builds get punchier with progress', () => {
    const early = sustainMultiplier('build', 0.1, 'trance', 'melody');
    const late = sustainMultiplier('build', 0.9, 'trance', 'melody');
    expect(late).toBeLessThanOrEqual(early);
  });

  it('clamped between 0.5 and 1.5', () => {
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      for (const layer of ['drone', 'melody', 'arp', 'atmosphere']) {
        const mult = sustainMultiplier(section, 0.5, 'trance', layer);
        expect(mult).toBeGreaterThanOrEqual(0.5);
        expect(mult).toBeLessThanOrEqual(1.5);
      }
    }
  });

  it('atmosphere has longest sustain', () => {
    const atmo = sustainMultiplier('groove', 0.5, 'ambient', 'atmosphere');
    const melody = sustainMultiplier('groove', 0.5, 'ambient', 'melody');
    expect(atmo).toBeGreaterThan(melody);
  });
});

describe('shouldApplySustainCurve', () => {
  it('all moods apply (>0.20)', () => {
    expect(shouldApplySustainCurve('trance')).toBe(true);
    expect(shouldApplySustainCurve('ambient')).toBe(true);
  });
});

describe('sustainSensitivity', () => {
  it('blockhead is most sensitive', () => {
    expect(sustainSensitivity('blockhead')).toBe(0.55);
  });

  it('ambient is least sensitive', () => {
    expect(sustainSensitivity('ambient')).toBe(0.25);
  });
});
