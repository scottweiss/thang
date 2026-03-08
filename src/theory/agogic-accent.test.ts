import { describe, it, expect } from 'vitest';
import {
  agogicDuration,
  noteImportance,
  agogicStrength,
} from './agogic-accent';

describe('agogicDuration', () => {
  it('important notes are longer', () => {
    const important = agogicDuration(1.0, 'avril', 'build');
    const unimportant = agogicDuration(0.0, 'avril', 'build');
    expect(important).toBeGreaterThan(unimportant);
  });

  it('ambient has more agogic than disco', () => {
    const ambient = agogicDuration(0.8, 'ambient', 'build');
    const disco = agogicDuration(0.8, 'disco', 'build');
    expect(ambient).toBeGreaterThan(disco);
  });

  it('breakdown has more agogic than peak', () => {
    const breakdown = agogicDuration(0.8, 'lofi', 'breakdown');
    const peak = agogicDuration(0.8, 'lofi', 'peak');
    expect(breakdown).toBeGreaterThan(peak);
  });

  it('stays in 1.0-1.6 range', () => {
    const dur = agogicDuration(1.0, 'ambient', 'breakdown');
    expect(dur).toBeGreaterThanOrEqual(1.0);
    expect(dur).toBeLessThanOrEqual(1.6);
  });

  it('unimportant note returns 1.0', () => {
    expect(agogicDuration(0, 'lofi', 'build')).toBe(1.0);
  });
});

describe('noteImportance', () => {
  it('downbeat is important', () => {
    expect(noteImportance(0, 0.5)).toBeGreaterThan(0.5);
  });

  it('phrase start is important', () => {
    expect(noteImportance(2, 0.05)).toBeGreaterThan(0.4);
  });

  it('phrase end is important', () => {
    expect(noteImportance(2, 0.95)).toBeGreaterThan(0.4);
  });

  it('golden section is important', () => {
    expect(noteImportance(2, 0.618)).toBeGreaterThan(0.4);
  });

  it('stays in 0-1 range', () => {
    for (let b = 0; b < 4; b++) {
      for (let p = 0; p <= 1; p += 0.2) {
        const imp = noteImportance(b, p);
        expect(imp).toBeGreaterThanOrEqual(0);
        expect(imp).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('agogicStrength', () => {
  it('ambient is highest', () => {
    expect(agogicStrength('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(agogicStrength('disco')).toBe(0.15);
  });
});
