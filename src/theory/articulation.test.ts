import { describe, it, expect } from 'vitest';
import { sectionArticulation, articulationToStrudel } from './articulation';

describe('sectionArticulation', () => {
  it('peak has shortest decay', () => {
    const peak = sectionArticulation('peak', 0.5);
    const breakdown = sectionArticulation('breakdown', 0.5);
    expect(peak.decay).toBeLessThan(breakdown.decay);
  });

  it('breakdown has highest sustain', () => {
    const breakdown = sectionArticulation('breakdown', 0.5);
    const peak = sectionArticulation('peak', 0.5);
    expect(breakdown.sustain).toBeGreaterThan(peak.sustain);
  });

  it('high tension shortens notes', () => {
    const lowTension = sectionArticulation('build', 0.1);
    const highTension = sectionArticulation('build', 0.9);
    expect(highTension.decay).toBeLessThan(lowTension.decay);
  });

  it('all values are positive', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      const art = sectionArticulation(section, 0.5);
      expect(art.attack).toBeGreaterThan(0);
      expect(art.decay).toBeGreaterThan(0);
      expect(art.sustain).toBeGreaterThan(0);
      expect(art.release).toBeGreaterThan(0);
    }
  });
});

describe('articulationToStrudel', () => {
  it('returns valid Strudel method chain', () => {
    const params = sectionArticulation('peak', 0.5);
    const code = articulationToStrudel(params);
    expect(code).toContain('.attack(');
    expect(code).toContain('.decay(');
    expect(code).toContain('.sustain(');
    expect(code).toContain('.release(');
  });
});
