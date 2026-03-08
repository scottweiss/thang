import { describe, it, expect } from 'vitest';
import {
  phraseTensionProfile,
  resolvePoint,
  tensionGainMultiplier,
  consonanceSensitivity,
} from './phrase-consonance-curve';

describe('phraseTensionProfile', () => {
  it('root note has lowest tension', () => {
    const profile = phraseTensionProfile(['C4', 'E4', 'G4', 'C5'], 'C', 'avril');
    expect(profile[0]).toBeLessThan(profile[1]); // C < E
    expect(profile[3]).toBeLessThan(profile[1]); // C5 < E
  });

  it('rests are neutral (1.0)', () => {
    const profile = phraseTensionProfile(['C4', '~', 'G4'], 'C', 'lofi');
    expect(profile[1]).toBe(1.0);
  });

  it('tritone has highest tension', () => {
    const profile = phraseTensionProfile(['C4', 'F#4'], 'C', 'avril');
    expect(profile[1]).toBeGreaterThan(profile[0]);
  });

  it('avril has tighter shaping than trance', () => {
    const avrilProfile = phraseTensionProfile(['C4', 'F#4'], 'C', 'avril');
    const tranceProfile = phraseTensionProfile(['C4', 'F#4'], 'C', 'trance');
    // Avril should have more extreme difference
    const avrilRange = avrilProfile[1] - avrilProfile[0];
    const tranceRange = tranceProfile[1] - tranceProfile[0];
    expect(avrilRange).toBeGreaterThan(tranceRange);
  });

  it('values clamped 0.6-1.2', () => {
    const profile = phraseTensionProfile(['C4', 'F#4', 'B4'], 'C', 'avril');
    for (const val of profile) {
      expect(val).toBeGreaterThanOrEqual(0.6);
      expect(val).toBeLessThanOrEqual(1.2);
    }
  });
});

describe('resolvePoint', () => {
  it('finds root note near end', () => {
    const idx = resolvePoint(['E4', 'D4', 'C4'], 'C', 'lofi');
    expect(idx).toBe(2); // C4 at end
  });

  it('prefers notes in second half', () => {
    const idx = resolvePoint(['C4', 'E4', 'G4', 'B4'], 'C', 'lofi');
    // C4 is at index 0 but outside search range (second half only)
    // G4 (dist 5) vs B4 (dist 1) — B4 wins
    expect(idx).toBe(3);
  });

  it('-1 when no suitable resolution', () => {
    const idx = resolvePoint(['~', '~', '~'], 'C', 'lofi');
    expect(idx).toBe(-1);
  });
});

describe('tensionGainMultiplier', () => {
  it('> 1.0 for high tension', () => {
    expect(tensionGainMultiplier(1.2, 'avril')).toBeGreaterThan(1.0);
  });

  it('< 1.0 for low tension', () => {
    expect(tensionGainMultiplier(0.6, 'avril')).toBeLessThan(1.0);
  });

  it('clamped 0.92-1.08', () => {
    expect(tensionGainMultiplier(1.5, 'avril')).toBeLessThanOrEqual(1.08);
    expect(tensionGainMultiplier(0.0, 'avril')).toBeGreaterThanOrEqual(0.92);
  });
});

describe('consonanceSensitivity', () => {
  it('avril is most sensitive', () => {
    expect(consonanceSensitivity('avril')).toBe(0.85);
  });

  it('trance is least sensitive', () => {
    expect(consonanceSensitivity('trance')).toBe(0.40);
  });
});
