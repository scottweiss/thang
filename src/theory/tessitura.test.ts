import { describe, it, expect } from 'vitest';
import {
  tessituraPosition,
  phraseTestitura,
  tessituraGain,
  tessituraBrightness,
  tessituraReverb,
  tessituraGainMap,
  tessituraSensitivity,
} from './tessitura';

describe('tessituraPosition', () => {
  it('middle of range = 0.5', () => {
    // C3 to C5 = 24 semitones. C4 is middle.
    expect(tessituraPosition('C4', 'C3', 'C5')).toBeCloseTo(0.5, 1);
  });

  it('bottom of range = 0', () => {
    expect(tessituraPosition('C3', 'C3', 'C5')).toBe(0);
  });

  it('top of range = 1', () => {
    expect(tessituraPosition('C5', 'C3', 'C5')).toBe(1);
  });

  it('handles rests gracefully', () => {
    expect(tessituraPosition('~', 'C3', 'C5')).toBe(0.5);
  });

  it('clamps out-of-range notes', () => {
    expect(tessituraPosition('C6', 'C3', 'C5')).toBe(1);
    expect(tessituraPosition('C2', 'C3', 'C5')).toBe(0);
  });
});

describe('phraseTestitura', () => {
  it('calculates average position', () => {
    const avg = phraseTestitura(['C3', 'C5'], 'C3', 'C5');
    expect(avg).toBeCloseTo(0.5, 1);
  });

  it('excludes rests', () => {
    const avg = phraseTestitura(['C5', '~', '~'], 'C3', 'C5');
    expect(avg).toBe(1);
  });

  it('returns 0.5 for empty', () => {
    expect(phraseTestitura([], 'C3', 'C5')).toBe(0.5);
  });
});

describe('tessituraGain', () => {
  it('high position boosts gain', () => {
    expect(tessituraGain(1.0, 0.5)).toBeGreaterThan(1.0);
  });

  it('low position reduces gain', () => {
    expect(tessituraGain(0.0, 0.5)).toBeLessThan(1.0);
  });

  it('middle position is neutral', () => {
    expect(tessituraGain(0.5, 0.5)).toBeCloseTo(1.0, 5);
  });

  it('zero sensitivity = no change', () => {
    expect(tessituraGain(1.0, 0)).toBe(1.0);
    expect(tessituraGain(0.0, 0)).toBe(1.0);
  });
});

describe('tessituraBrightness', () => {
  it('high position = brighter', () => {
    expect(tessituraBrightness(1.0, 0.5)).toBeGreaterThan(1.0);
  });

  it('low position = darker', () => {
    expect(tessituraBrightness(0.0, 0.5)).toBeLessThan(1.0);
  });
});

describe('tessituraReverb', () => {
  it('low position = more reverb', () => {
    expect(tessituraReverb(0.0, 0.5)).toBeGreaterThan(1.0);
  });

  it('high position = less reverb', () => {
    expect(tessituraReverb(1.0, 0.5)).toBeLessThan(1.0);
  });
});

describe('tessituraGainMap', () => {
  it('returns multipliers for each note', () => {
    const map = tessituraGainMap(['C3', '~', 'C5'], 'C3', 'C5', 'avril');
    expect(map).toHaveLength(3);
    expect(map[0]).toBeLessThan(1.0);  // low = quiet
    expect(map[1]).toBe(1.0);          // rest = neutral
    expect(map[2]).toBeGreaterThan(1.0); // high = loud
  });
});

describe('tessituraSensitivity', () => {
  it('avril has highest', () => {
    expect(tessituraSensitivity('avril')).toBe(0.55);
  });

  it('trance has lowest', () => {
    expect(tessituraSensitivity('trance')).toBe(0.08);
  });
});
