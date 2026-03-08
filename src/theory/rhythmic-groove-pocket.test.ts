import { describe, it, expect } from 'vitest';
import {
  groovePocketGain,
  pocketDepthValue,
} from './rhythmic-groove-pocket';

describe('groovePocketGain', () => {
  it('backbeat gets boost', () => {
    const gain = groovePocketGain(4, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('ghost note position gets smaller boost', () => {
    const backbeat = groovePocketGain(4, 'disco', 'groove');
    const ghost = groovePocketGain(2, 'disco', 'groove');
    expect(ghost).toBeGreaterThan(1.0);
    expect(backbeat).toBeGreaterThan(ghost);
  });

  it('downbeat is slightly reduced', () => {
    const gain = groovePocketGain(0, 'disco', 'groove');
    expect(gain).toBeLessThan(1.0);
  });

  it('other positions are neutral', () => {
    const gain = groovePocketGain(3, 'disco', 'groove');
    expect(gain).toBe(1.0);
  });

  it('disco pockets more than ambient', () => {
    const disc = groovePocketGain(4, 'disco', 'groove');
    const amb = groovePocketGain(4, 'ambient', 'groove');
    expect(disc).toBeGreaterThan(amb);
  });

  it('stays in 0.98-1.03 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      for (let p = 0; p < 16; p++) {
        const gain = groovePocketGain(p, 'disco', s);
        expect(gain).toBeGreaterThanOrEqual(0.98);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('pocketDepthValue', () => {
  it('disco is highest', () => {
    expect(pocketDepthValue('disco')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(pocketDepthValue('ambient')).toBe(0.05);
  });
});
