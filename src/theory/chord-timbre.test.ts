import { describe, it, expect } from 'vitest';
import {
  chordTimbreProfile,
  chordLpfMultiplier,
  chordFmMultiplier,
  shouldApplyChordTimbre,
} from './chord-timbre';

describe('chordTimbreProfile', () => {
  it('minor is darker than major', () => {
    const min = chordTimbreProfile('min');
    const maj = chordTimbreProfile('maj');
    expect(min.lpfMult).toBeLessThan(maj.lpfMult);
  });

  it('dom7 is brightest', () => {
    const dom7 = chordTimbreProfile('dom7');
    expect(dom7.lpfMult).toBeGreaterThan(1.0);
    expect(dom7.fmMult).toBeGreaterThan(1.0);
  });

  it('sus chords have less FM', () => {
    const sus2 = chordTimbreProfile('sus2');
    expect(sus2.fmMult).toBeLessThan(1.0);
  });

  it('dim is tense (more FM, more resonance)', () => {
    const dim = chordTimbreProfile('dim');
    expect(dim.fmMult).toBeGreaterThan(1.0);
    expect(dim.resonanceMult).toBeGreaterThan(1.0);
  });
});

describe('chordLpfMultiplier', () => {
  it('lofi has strongest effect', () => {
    const lofiMin = chordLpfMultiplier('min', 'lofi');
    const tranceMin = chordLpfMultiplier('min', 'trance');
    // Lofi should darken minor more than trance
    expect(lofiMin).toBeLessThan(tranceMin);
  });

  it('major chord brightens', () => {
    const maj = chordLpfMultiplier('maj', 'lofi');
    expect(maj).toBeGreaterThan(1.0);
  });

  it('minor chord darkens', () => {
    const min = chordLpfMultiplier('min', 'lofi');
    expect(min).toBeLessThan(1.0);
  });

  it('ambient has minimal effect', () => {
    const amb = chordLpfMultiplier('min', 'ambient');
    expect(Math.abs(amb - 1.0)).toBeLessThan(0.05);
  });
});

describe('chordFmMultiplier', () => {
  it('dom7 increases FM', () => {
    const fm = chordFmMultiplier('dom7', 'lofi');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('sus2 decreases FM', () => {
    const fm = chordFmMultiplier('sus2', 'lofi');
    expect(fm).toBeLessThan(1.0);
  });
});

describe('shouldApplyChordTimbre', () => {
  it('true for lofi', () => {
    expect(shouldApplyChordTimbre('lofi')).toBe(true);
  });

  it('true for ambient (even if subtle)', () => {
    expect(shouldApplyChordTimbre('ambient')).toBe(true);
  });
});
