import { describe, it, expect } from 'vitest';
import { evolvedVelocity, applyVelocityEvolution } from './velocity-evolution';

describe('evolvedVelocity', () => {
  it('returns requested number of steps', () => {
    expect(evolvedVelocity(8, 'build', 0.5)).toHaveLength(8);
    expect(evolvedVelocity(16, 'peak', 0.5)).toHaveLength(16);
  });

  it('returns empty for 0 steps', () => {
    expect(evolvedVelocity(0, 'build', 0.5)).toHaveLength(0);
  });

  it('all values within 0.6-1.2 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.2) {
        const v = evolvedVelocity(16, section, p);
        for (const val of v) {
          expect(val).toBeGreaterThanOrEqual(0.6);
          expect(val).toBeLessThanOrEqual(1.2);
        }
      }
    }
  });

  it('build accents increase with progress', () => {
    const early = evolvedVelocity(4, 'build', 0.1);
    const late = evolvedVelocity(4, 'build', 0.9);
    // First beat (downbeat) should be louder later in the build
    expect(late[0]).toBeGreaterThan(early[0]);
  });

  it('breakdown accents decrease with progress', () => {
    const early = evolvedVelocity(4, 'breakdown', 0.1);
    const late = evolvedVelocity(4, 'breakdown', 0.9);
    // First beat should be softer later in the breakdown
    expect(late[0]).toBeLessThan(early[0]);
  });

  it('peak has strongest downbeat accent', () => {
    const v = evolvedVelocity(8, 'peak', 0.5);
    // Downbeat (index 0) should be the loudest or close to it
    const max = Math.max(...v);
    expect(v[0]).toBeGreaterThan(max * 0.9);
  });

  it('groove is relatively even', () => {
    const v = evolvedVelocity(8, 'groove', 0.5);
    const range = Math.max(...v) - Math.min(...v);
    expect(range).toBeLessThan(0.3); // not too much variation
  });

  it('intro is very flat early on', () => {
    const v = evolvedVelocity(8, 'intro', 0.0);
    const range = Math.max(...v) - Math.min(...v);
    expect(range).toBeLessThan(0.1); // very flat
  });

  it('clamps progress', () => {
    const normal = evolvedVelocity(4, 'build', 1.0);
    const clamped = evolvedVelocity(4, 'build', 2.0);
    expect(clamped).toEqual(normal);
  });
});

describe('applyVelocityEvolution', () => {
  it('multiplies gain values by velocity multipliers', () => {
    const result = applyVelocityEvolution('1.0 1.0 1.0 1.0', [1.1, 0.9, 1.1, 0.9]);
    const values = result.split(' ').map(parseFloat);
    expect(values[0]).toBeCloseTo(1.1, 3);
    expect(values[1]).toBeCloseTo(0.9, 3);
  });

  it('handles mismatched lengths (wraps velocities)', () => {
    const result = applyVelocityEvolution('1.0 1.0 1.0 1.0', [1.1, 0.9]);
    const values = result.split(' ').map(parseFloat);
    expect(values[2]).toBeCloseTo(1.1, 3); // wraps to index 0
    expect(values[3]).toBeCloseTo(0.9, 3); // wraps to index 1
  });

  it('returns original on invalid input', () => {
    expect(applyVelocityEvolution('invalid', [1.0])).toBe('invalid');
  });
});
