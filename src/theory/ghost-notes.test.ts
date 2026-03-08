import { describe, it, expect } from 'vitest';
import { addIntelligentGhosts, moodGhostDensity } from './ghost-notes';

describe('addIntelligentGhosts', () => {
  it('does not replace existing sounds', () => {
    const pattern = 'bd ~ ~ ~ sd ~ ~ ~ bd ~ ~ ~ sd ~ ~ ~';
    const result = addIntelligentGhosts(pattern, 'lofi', 1.0);
    const steps = result.split(' ');
    // Kicks and snares should remain
    expect(steps[0]).toBe('bd');
    expect(steps[4]).toBe('sd');
    expect(steps[8]).toBe('bd');
    expect(steps[12]).toBe('sd');
  });

  it('adds ghosts only at rest positions', () => {
    const pattern = 'bd ~ ~ ~ sd ~ ~ ~ bd ~ ~ ~ sd ~ ~ ~';
    const result = addIntelligentGhosts(pattern, 'syro', 1.0);
    const steps = result.split(' ');
    for (let i = 0; i < steps.length; i++) {
      if (pattern.split(' ')[i] !== '~') {
        expect(steps[i]).toBe(pattern.split(' ')[i]);
      }
    }
  });

  it('adds more ghosts at higher density', () => {
    const pattern = '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~';
    const low = addIntelligentGhosts(pattern, 'lofi', 0.1);
    const high = addIntelligentGhosts(pattern, 'lofi', 1.0);
    const lowCount = low.split(' ').filter(s => s === 'hh').length;
    const highCount = high.split(' ').filter(s => s === 'hh').length;
    // On average, high density should add more (run multiple times for confidence)
    let lowTotal = 0, highTotal = 0;
    for (let i = 0; i < 50; i++) {
      lowTotal += addIntelligentGhosts(pattern, 'lofi', 0.1).split(' ').filter(s => s === 'hh').length;
      highTotal += addIntelligentGhosts(pattern, 'lofi', 1.0).split(' ').filter(s => s === 'hh').length;
    }
    expect(highTotal).toBeGreaterThan(lowTotal);
  });

  it('returns unchanged at density 0', () => {
    const pattern = 'bd ~ ~ ~ sd ~ ~ ~';
    // Ghost map has 0 on beat positions, but at density 0 even off-beats won't trigger
    const result = addIntelligentGhosts(pattern, 'lofi', 0);
    expect(result).toBe(pattern);
  });

  it('respects mood character — lofi favors "a" positions', () => {
    // Run many times and check that "a" positions (3,7,11,15) get more ghosts
    const pattern = '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~';
    let aCount = 0, eCount = 0;
    for (let i = 0; i < 200; i++) {
      const steps = addIntelligentGhosts(pattern, 'lofi', 0.8).split(' ');
      // "a" positions: 3,7,11,15
      aCount += [3, 7, 11, 15].filter(p => steps[p] === 'hh').length;
      // "e" positions: 1,5,9,13
      eCount += [1, 5, 9, 13].filter(p => steps[p] === 'hh').length;
    }
    // Lofi should have more ghosts on "a" than "e"
    expect(aCount).toBeGreaterThan(eCount);
  });

  it('uses custom ghost sound', () => {
    const pattern = '~ ~ ~ ~ ~ ~ ~ ~';
    const result = addIntelligentGhosts(pattern, 'syro', 1.0, 'cp');
    const steps = result.split(' ');
    const hasClap = steps.some(s => s === 'cp');
    // Should eventually have a clap at high density
    let found = false;
    for (let i = 0; i < 20; i++) {
      if (addIntelligentGhosts(pattern, 'syro', 1.0, 'cp').includes('cp')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('handles short patterns', () => {
    expect(addIntelligentGhosts('bd ~', 'lofi', 1.0)).toBe('bd ~');
  });
});

describe('moodGhostDensity', () => {
  it('syro has highest density', () => {
    expect(moodGhostDensity('syro')).toBeGreaterThan(moodGhostDensity('flim'));
  });

  it('all values between 0 and 1', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      const d = moodGhostDensity(mood);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1);
    }
  });
});
