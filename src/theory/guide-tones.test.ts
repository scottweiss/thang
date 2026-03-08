import { describe, it, expect } from 'vitest';
import { findGuideTones, guideTonePassingNote } from './guide-tones';

describe('findGuideTones', () => {
  it('finds smooth connections between Dm7 and G7', () => {
    // Dm7: D3 F3 A3 C4, G7: G3 B3 D4 F4
    const guides = findGuideTones(
      ['D3', 'F3', 'A3', 'C4'],
      ['G3', 'B3', 'D4', 'F4']
    );
    expect(guides.length).toBeGreaterThan(0);
    // Each connection should be smooth (small interval)
    for (const g of guides) {
      expect(g.current).toBeTruthy();
      expect(g.next).toBeTruthy();
    }
  });

  it('returns at most 2 guide tones', () => {
    const guides = findGuideTones(
      ['C3', 'E3', 'G3', 'B3'],
      ['F3', 'A3', 'C4', 'E4']
    );
    expect(guides.length).toBeLessThanOrEqual(2);
  });

  it('returns empty for single-note chords', () => {
    expect(findGuideTones(['C3'], ['D3'])).toEqual([]);
  });

  it('finds common tones', () => {
    // C major → A minor share E and C
    const guides = findGuideTones(
      ['C3', 'E3', 'G3'],
      ['A3', 'C3', 'E3']
    );
    // Should find at least one connection
    expect(guides.length).toBeGreaterThan(0);
  });

  it('handles empty inputs', () => {
    expect(findGuideTones([], ['C3', 'E3'])).toEqual([]);
    expect(findGuideTones(['C3', 'E3'], [])).toEqual([]);
  });
});

describe('guideTonePassingNote', () => {
  it('returns chromatic passing tone for whole step up', () => {
    const passing = guideTonePassingNote('C3', 'D3');
    expect(passing).toBe('C#3');
  });

  it('returns chromatic passing tone for whole step down', () => {
    const passing = guideTonePassingNote('D3', 'C3');
    expect(passing).toBe('C#3');
  });

  it('returns null for half step (no room for passing tone)', () => {
    expect(guideTonePassingNote('E3', 'F3')).toBeNull();
  });

  it('returns null for large intervals', () => {
    expect(guideTonePassingNote('C3', 'G3')).toBeNull();
  });

  it('returns null for common tone', () => {
    expect(guideTonePassingNote('C3', 'C3')).toBeNull();
  });
});
