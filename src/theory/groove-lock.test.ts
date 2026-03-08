import { describe, it, expect } from 'vitest';
import {
  applyGrooveLock,
  grooveLockProbability,
  grooveLockStrength,
} from './groove-lock';

describe('applyGrooveLock', () => {
  it('preserves array length', () => {
    const arp = ['C4', '~', '~', '~', 'E4', '~', '~', '~',
                 'G4', '~', '~', '~', 'C5', '~', '~', '~'];
    const mel = ['C4', '~', 'D4', '~', 'E4', '~', '~', '~',
                 'G4', '~', '~', '~', '~', '~', '~', '~'];
    const result = applyGrooveLock(arp, mel, 'disco', 'groove');
    expect(result).toHaveLength(16);
  });

  it('always has at least one note', () => {
    const arp = ['~', '~', '~', '~', 'E4', '~', '~', '~',
                 '~', '~', '~', '~', '~', '~', '~', '~'];
    const mel = ['~', '~', '~', '~', '~', '~', '~', '~',
                 '~', '~', '~', '~', '~', '~', '~', '~'];
    for (let i = 0; i < 20; i++) {
      const result = applyGrooveLock(arp, mel, 'disco', 'groove');
      expect(result.some(s => s !== '~')).toBe(true);
    }
  });

  it('ambient rarely modifies steps', () => {
    const arp = ['C4', '~', '~', '~', 'E4', '~', '~', '~',
                 'G4', '~', '~', '~', 'C5', '~', '~', '~'];
    const mel = ['~', '~', '~', '~', '~', '~', '~', '~',
                 'G4', '~', '~', '~', '~', '~', '~', '~'];
    let unchanged = 0;
    for (let i = 0; i < 50; i++) {
      const result = applyGrooveLock(arp, mel, 'ambient', 'intro');
      if (result.join(' ') === arp.join(' ')) unchanged++;
    }
    // Ambient + intro should leave most patterns unchanged
    expect(unchanged).toBeGreaterThan(30);
  });

  it('preserves non-rest notes on non-strong beats', () => {
    const arp = ['~', 'D4', '~', 'F4', '~', 'A4', '~', 'C5',
                 '~', 'D4', '~', 'F4', '~', 'A4', '~', 'C5'];
    const mel = ['C4', '~', '~', '~', 'E4', '~', '~', '~',
                 '~', '~', '~', '~', '~', '~', '~', '~'];
    for (let i = 0; i < 30; i++) {
      const result = applyGrooveLock(arp, mel, 'disco', 'groove');
      // Non-strong beat notes (positions 1,3,5,7...) should not be changed
      expect(result[1]).toBe('D4');
      expect(result[3]).toBe('F4');
      expect(result[5]).toBe('A4');
    }
  });
});

describe('grooveLockProbability', () => {
  it('disco groove is highest', () => {
    const prob = grooveLockProbability('disco', 'groove');
    expect(prob).toBeGreaterThan(0.5);
  });

  it('ambient intro is near zero', () => {
    const prob = grooveLockProbability('ambient', 'intro');
    expect(prob).toBeLessThan(0.05);
  });

  it('never exceeds 0.6', () => {
    const prob = grooveLockProbability('disco', 'groove');
    expect(prob).toBeLessThanOrEqual(0.6);
  });

  it('groove section boosts probability', () => {
    const groove = grooveLockProbability('lofi', 'groove');
    const intro = grooveLockProbability('lofi', 'intro');
    expect(groove).toBeGreaterThan(intro);
  });
});

describe('grooveLockStrength', () => {
  it('disco has high strength', () => {
    expect(grooveLockStrength('disco', 'groove')).toBeGreaterThan(0.5);
  });

  it('ambient has low strength', () => {
    expect(grooveLockStrength('ambient', 'groove')).toBeLessThan(0.2);
  });

  it('groove section boosts strength', () => {
    const groove = grooveLockStrength('trance', 'groove');
    const intro = grooveLockStrength('trance', 'intro');
    expect(groove).toBeGreaterThan(intro);
  });
});
