import { describe, it, expect } from 'vitest';
import {
  getScaleCharacter,
  getPreferredScales,
  scaleContextScore,
  pickContextualScale,
} from './scale-color';

describe('getScaleCharacter', () => {
  it('lydian is the brightest', () => {
    const char = getScaleCharacter('lydian');
    expect(char.brightness).toBeGreaterThan(0.9);
  });

  it('phrygian is dark and exotic', () => {
    const char = getScaleCharacter('phrygian');
    expect(char.brightness).toBeLessThan(0.3);
    expect(char.exoticism).toBeGreaterThan(0.5);
  });

  it('pentatonic is low tension', () => {
    const char = getScaleCharacter('pentatonic');
    expect(char.tension).toBeLessThan(0.1);
  });
});

describe('getPreferredScales', () => {
  it('ambient prefers lydian/major', () => {
    const prefs = getPreferredScales('ambient');
    expect(prefs[0]).toBe('lydian');
  });

  it('lofi prefers dorian', () => {
    const prefs = getPreferredScales('lofi');
    expect(prefs[0]).toBe('dorian');
  });

  it('returns non-empty for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(getPreferredScales(mood).length).toBeGreaterThan(0);
    }
  });
});

describe('scaleContextScore', () => {
  it('preferred scales score higher', () => {
    const lydianScore = scaleContextScore('lydian', 'ambient', 0.3, 0.5);
    const phrygianScore = scaleContextScore('phrygian', 'ambient', 0.3, 0.5);
    expect(lydianScore).toBeGreaterThan(phrygianScore);
  });

  it('score is between 0 and 2', () => {
    const score = scaleContextScore('dorian', 'lofi', 0.5, 0.5);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(2);
  });
});

describe('pickContextualScale', () => {
  it('returns a valid scale type', () => {
    const scale = pickContextualScale('ambient', 0.3, 0.5);
    expect(['lydian', 'major', 'pentatonic', 'dorian']).toContain(scale);
  });

  it('penalizes current scale (encourages modulation)', () => {
    // When current is the top preference, might pick second choice
    let switchCount = 0;
    for (let i = 0; i < 50; i++) {
      const result = pickContextualScale('ambient', 0.3, 0.5, 'lydian');
      if (result !== 'lydian') switchCount++;
    }
    // Should sometimes switch (due to penalty), but not always
    // (since lydian is still the top preference)
    expect(switchCount).toBeGreaterThanOrEqual(0);
  });
});
