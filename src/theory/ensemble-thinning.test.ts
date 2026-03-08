import { describe, it, expect } from 'vitest';
import {
  ensembleFmMultiplier,
  ensembleRoomMultiplier,
  ensembleDelayMultiplier,
  shouldApplyEnsembleThinning,
} from './ensemble-thinning';

describe('ensembleFmMultiplier', () => {
  it('boosts FM when few layers active', () => {
    const fm = ensembleFmMultiplier(1, 'lofi');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('reduces FM when many layers active', () => {
    const fm = ensembleFmMultiplier(6, 'lofi');
    expect(fm).toBeLessThan(1.0);
  });

  it('neutral at 3 layers', () => {
    const fm = ensembleFmMultiplier(3, 'lofi');
    expect(fm).toBe(1.0);
  });

  it('syro thins more aggressively than ambient', () => {
    const syro = ensembleFmMultiplier(6, 'syro');
    const ambient = ensembleFmMultiplier(6, 'ambient');
    // Syro should reduce FM more (lower multiplier)
    expect(syro).toBeLessThan(ambient);
  });

  it('stays within reasonable bounds', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let count = 1; count <= 6; count++) {
        const fm = ensembleFmMultiplier(count, mood);
        expect(fm).toBeGreaterThanOrEqual(0.5);
        expect(fm).toBeLessThanOrEqual(1.3);
      }
    }
  });
});

describe('ensembleRoomMultiplier', () => {
  it('more reverb when few layers', () => {
    const room = ensembleRoomMultiplier(1, 'trance');
    expect(room).toBeGreaterThan(1.0);
  });

  it('drier when many layers', () => {
    const room = ensembleRoomMultiplier(6, 'trance');
    expect(room).toBeLessThan(1.0);
  });

  it('effect scales with mood sensitivity', () => {
    const trance6 = ensembleRoomMultiplier(6, 'trance');
    const ambient6 = ensembleRoomMultiplier(6, 'ambient');
    // Trance should thin room more at 6 layers
    expect(trance6).toBeLessThan(ambient6);
  });
});

describe('ensembleDelayMultiplier', () => {
  it('longer echoes when few layers', () => {
    const delay = ensembleDelayMultiplier(1, 'disco');
    expect(delay).toBeGreaterThan(1.0);
  });

  it('tighter delay when many layers', () => {
    const delay = ensembleDelayMultiplier(6, 'disco');
    expect(delay).toBeLessThan(1.0);
  });
});

describe('shouldApplyEnsembleThinning', () => {
  it('false for solo layer', () => {
    expect(shouldApplyEnsembleThinning(1)).toBe(false);
  });

  it('true for 2+ layers', () => {
    expect(shouldApplyEnsembleThinning(2)).toBe(true);
    expect(shouldApplyEnsembleThinning(6)).toBe(true);
  });
});
