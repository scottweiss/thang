import { describe, it, expect } from 'vitest';
import { melodicVelocityCurve, applyMelodicDynamics } from './melodic-dynamics';

describe('melodicVelocityCurve', () => {
  it('returns same length as input', () => {
    const notes = ['C4', '~', 'E4', '~', 'G4', '~', '~', '~'];
    expect(melodicVelocityCurve(notes)).toHaveLength(notes.length);
  });

  it('downbeats are louder than off-beats', () => {
    // Notes on beats 0 and 2 (positions 0 and 2 with beatsPerBar=4)
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const curve = melodicVelocityCurve(notes, '~', 4);
    // Position 0 is a downbeat, position 1 is an off-beat
    expect(curve[0]).toBeGreaterThan(curve[1]);
  });

  it('all values within 0.4-1.0 range', () => {
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5',
                   'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6'];
    const curve = melodicVelocityCurve(notes);
    for (const v of curve) {
      expect(v).toBeGreaterThanOrEqual(0.4);
      expect(v).toBeLessThanOrEqual(1.0);
    }
  });

  it('returns empty for empty input', () => {
    expect(melodicVelocityCurve([])).toEqual([]);
  });

  it('phrase peak gets contour accent', () => {
    // C4 E4 G5 E4 — G5 is the peak
    const notes = ['C4', 'E4', 'G5', 'E4', '~', '~', '~', '~'];
    const curve = melodicVelocityCurve(notes);
    // G5 at index 2 should be louder than E4 at index 1
    expect(curve[2]).toBeGreaterThan(curve[1]);
  });

  it('phrase ending tapers', () => {
    // C4 D5 E4 D4 — peak is D5 at index 1, ending is D4 at index 3
    const notes = ['C4', 'D5', 'E4', 'D4', '~', '~', '~', '~'];
    const curve = melodicVelocityCurve(notes);
    // Last note of phrase (D4 at index 3) should be softer than peak (D5 at index 1)
    expect(curve[3]).toBeLessThan(curve[1]);
  });
});

describe('applyMelodicDynamics', () => {
  it('returns space-separated gain string', () => {
    const notes = ['C4', '~', 'E4', '~'];
    const result = applyMelodicDynamics(0.2, notes);
    const parts = result.split(' ');
    expect(parts).toHaveLength(4);
    // Each part should be a valid number
    for (const p of parts) {
      expect(parseFloat(p)).not.toBeNaN();
    }
  });

  it('gain values are scaled by base gain', () => {
    const notes = ['C4', '~', 'E4', '~'];
    const result = applyMelodicDynamics(0.5, notes);
    const values = result.split(' ').map(Number);
    // All values should be <= 0.5 (since curve max is 1.0)
    for (const v of values) {
      expect(v).toBeLessThanOrEqual(0.5);
      expect(v).toBeGreaterThan(0);
    }
  });
});
