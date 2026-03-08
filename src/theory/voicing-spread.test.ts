import { describe, it, expect } from 'vitest';
import { getVoicingRange, applyVoicingSpread } from './voicing-spread';

describe('getVoicingRange', () => {
  it('peak has widest spread', () => {
    const peak = getVoicingRange('peak', 0.5);
    const breakdown = getVoicingRange('breakdown', 0.5);
    expect(peak.spread).toBeGreaterThan(breakdown.spread);
  });

  it('high tension widens spread', () => {
    const low = getVoicingRange('groove', 0.1);
    const high = getVoicingRange('groove', 0.9);
    expect(high.spread).toBeGreaterThan(low.spread);
  });

  it('spread is clamped to 0-1', () => {
    const range = getVoicingRange('peak', 1.0);
    expect(range.spread).toBeLessThanOrEqual(1.0);
    expect(range.spread).toBeGreaterThanOrEqual(0);
  });

  it('breakdown has tightest spread', () => {
    const bd = getVoicingRange('breakdown', 0.3);
    const sections = ['intro', 'build', 'peak', 'groove'] as const;
    for (const s of sections) {
      expect(bd.spread).toBeLessThanOrEqual(getVoicingRange(s, 0.3).spread);
    }
  });
});

describe('applyVoicingSpread', () => {
  it('returns same number of notes', () => {
    const notes = ['C3', 'E3', 'G3', 'B3'];
    const range = getVoicingRange('peak', 0.8);
    const result = applyVoicingSpread(notes, range);
    expect(result).toHaveLength(4);
  });

  it('peak spread distributes across wider range', () => {
    const notes = ['C3', 'E3', 'G3', 'B3'];
    const peakRange = getVoicingRange('peak', 0.8);
    const bdRange = getVoicingRange('breakdown', 0.2);

    const peakResult = applyVoicingSpread(notes, peakRange);
    const bdResult = applyVoicingSpread(notes, bdRange);

    // Peak voicing should span more octaves
    const peakOcts = peakResult.map(n => parseInt(n.replace(/[^0-9]/g, '')));
    const bdOcts = bdResult.map(n => parseInt(n.replace(/[^0-9]/g, '')));

    const peakSpan = Math.max(...peakOcts) - Math.min(...peakOcts);
    const bdSpan = Math.max(...bdOcts) - Math.min(...bdOcts);

    expect(peakSpan).toBeGreaterThanOrEqual(bdSpan);
  });

  it('handles single note', () => {
    const result = applyVoicingSpread(['C3'], getVoicingRange('peak', 0.5));
    expect(result).toHaveLength(1);
  });

  it('preserves note names', () => {
    const notes = ['C3', 'E3', 'G3'];
    const result = applyVoicingSpread(notes, getVoicingRange('groove', 0.5));
    expect(result[0]).toMatch(/^C\d$/);
    expect(result[1]).toMatch(/^E\d$/);
    expect(result[2]).toMatch(/^G\d$/);
  });
});
