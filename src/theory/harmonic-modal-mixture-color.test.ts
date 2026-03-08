import { describe, it, expect } from 'vitest';
import {
  isBorrowedChord,
  modalMixtureColorLpf,
  mixtureDepthValue,
} from './harmonic-modal-mixture-color';

describe('isBorrowedChord', () => {
  it('bVI (major VI) is borrowed', () => {
    expect(isBorrowedChord(6, 'maj')).toBe(true);
  });

  it('bVII (major VII) is borrowed', () => {
    expect(isBorrowedChord(7, 'maj')).toBe(true);
  });

  it('bIII (major III) is borrowed', () => {
    expect(isBorrowedChord(3, 'maj')).toBe(true);
  });

  it('iv (minor IV) is borrowed', () => {
    expect(isBorrowedChord(4, 'min')).toBe(true);
  });

  it('normal I is not borrowed', () => {
    expect(isBorrowedChord(1, 'maj')).toBe(false);
  });

  it('normal vi is not borrowed', () => {
    expect(isBorrowedChord(6, 'min')).toBe(false);
  });
});

describe('modalMixtureColorLpf', () => {
  it('borrowed chord gets darkened', () => {
    const lpf = modalMixtureColorLpf(6, 'maj', 'avril', 'breakdown');
    expect(lpf).toBeLessThan(1.0);
  });

  it('non-borrowed is neutral', () => {
    const lpf = modalMixtureColorLpf(1, 'maj', 'avril', 'peak');
    expect(lpf).toBe(1.0);
  });

  it('avril darkens more than syro', () => {
    const av = modalMixtureColorLpf(6, 'maj', 'avril', 'peak');
    const sy = modalMixtureColorLpf(6, 'maj', 'syro', 'peak');
    expect(av).toBeLessThan(sy);
  });

  it('stays in 0.90-1.0 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      const lpf = modalMixtureColorLpf(6, 'maj', 'avril', s);
      expect(lpf).toBeGreaterThanOrEqual(0.90);
      expect(lpf).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('mixtureDepthValue', () => {
  it('avril is highest', () => {
    expect(mixtureDepthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(mixtureDepthValue('blockhead')).toBe(0.20);
  });
});
