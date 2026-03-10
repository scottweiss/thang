import { describe, it, expect } from 'vitest';
import { shouldPlayFill, getDrumFill } from './drum-fill';

describe('shouldPlayFill', () => {
  it('true for build→peak in trance', () => {
    expect(shouldPlayFill('build', 'peak', 'trance')).toBe(true);
  });
  it('true for peak→breakdown in lofi', () => {
    expect(shouldPlayFill('peak', 'breakdown', 'lofi')).toBe(true);
  });
  it('false for ambient moods', () => {
    expect(shouldPlayFill('build', 'peak', 'ambient')).toBe(false);
  });
  it('false for avril moods', () => {
    expect(shouldPlayFill('build', 'peak', 'avril')).toBe(false);
  });
  it('false for xtal moods', () => {
    expect(shouldPlayFill('build', 'peak', 'xtal')).toBe(false);
  });
  it('false for intro transitions', () => {
    expect(shouldPlayFill('intro', 'build', 'trance')).toBe(false);
  });
  it('true for breakdown→groove', () => {
    expect(shouldPlayFill('breakdown', 'groove', 'disco')).toBe(true);
  });
  it('true for groove→build', () => {
    expect(shouldPlayFill('groove', 'build', 'blockhead')).toBe(true);
  });
  it('false for same section', () => {
    expect(shouldPlayFill('peak', 'peak', 'trance')).toBe(false);
  });
  it('false for non-fill transitions', () => {
    expect(shouldPlayFill('build', 'groove', 'trance')).toBe(false);
  });
});

describe('getDrumFill', () => {
  it('returns valid strudel pattern', () => {
    const fill = getDrumFill('build', 'peak', 'trance');
    expect(fill).toContain('sound(');
    expect(fill).toContain('.gain(');
  });
  it('build→peak has crash/clap', () => {
    const fill = getDrumFill('build', 'peak', 'trance');
    expect(fill).toMatch(/cp|oh/);
  });
  it('build→peak has snare roll', () => {
    const fill = getDrumFill('build', 'peak', 'disco');
    const sdCount = (fill.match(/sd/g) || []).length;
    expect(sdCount).toBeGreaterThanOrEqual(5);
  });
  it('peak→breakdown is sparse', () => {
    const fill = getDrumFill('peak', 'breakdown', 'lofi');
    expect(fill).toContain('bd');
    // Should NOT have dense snare rolls
    const sdCount = (fill.match(/sd/g) || []).length;
    expect(sdCount).toBeLessThanOrEqual(2);
  });
  it('breakdown→groove rebuilds kick', () => {
    const fill = getDrumFill('breakdown', 'groove', 'trance');
    const bdCount = (fill.match(/bd/g) || []).length;
    expect(bdCount).toBeGreaterThanOrEqual(3);
  });
  it('groove→build has mixed sounds', () => {
    const fill = getDrumFill('groove', 'build', 'disco');
    expect(fill).toContain('bd');
    expect(fill).toContain('sd');
  });
  it('default fill uses crash', () => {
    // peak→groove is not a defined transition, so default fill
    const fill = getDrumFill('peak', 'groove', 'trance');
    expect(fill).toContain('cp');
  });
  it('trance fills are louder', () => {
    const tranceFill = getDrumFill('build', 'peak', 'trance');
    const flimFill = getDrumFill('build', 'peak', 'flim');
    // Extract first gain value from each
    const tranceGains = tranceFill.match(/[\d.]+/g) || [];
    const flimGains = flimFill.match(/[\d.]+/g) || [];
    // trance gains should be higher than flim (neutral mood)
    const tranceMax = Math.max(...tranceGains.map(Number).filter(n => n <= 2));
    const flimMax = Math.max(...flimGains.map(Number).filter(n => n <= 2));
    expect(tranceMax).toBeGreaterThan(flimMax);
  });
  it('lofi fills are softer', () => {
    const lofiFill = getDrumFill('build', 'peak', 'lofi');
    const flimFill = getDrumFill('build', 'peak', 'flim');
    const lofiGains = lofiFill.match(/[\d.]+/g) || [];
    const flimGains = flimFill.match(/[\d.]+/g) || [];
    const lofiMax = Math.max(...lofiGains.map(Number).filter(n => n <= 2));
    const flimMax = Math.max(...flimGains.map(Number).filter(n => n <= 2));
    expect(lofiMax).toBeLessThan(flimMax);
  });
  it('syro fills have extra hh complexity', () => {
    const syroFill = getDrumFill('build', 'peak', 'syro');
    expect(syroFill).toContain('hh');
  });
  it('blockhead fills have extra hh complexity', () => {
    const blockheadFill = getDrumFill('build', 'peak', 'blockhead');
    expect(blockheadFill).toContain('hh');
  });
});
