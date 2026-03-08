import { describe, it, expect } from 'vitest';
import {
  recallBlendFm,
  recallBlendLpf,
  shouldRecallTimbre,
  timbralRecallStrength,
} from './timbral-recall';

describe('recallBlendFm', () => {
  it('blends toward recalled value', () => {
    const blended = recallBlendFm(2.0, 4.0, 'ambient', 'breakdown');
    expect(blended).toBeGreaterThan(2.0);
    expect(blended).toBeLessThan(4.0);
  });

  it('stronger mood blends more', () => {
    const ambient = recallBlendFm(2.0, 4.0, 'ambient', 'build');
    const syro = recallBlendFm(2.0, 4.0, 'syro', 'build');
    expect(ambient).toBeGreaterThan(syro);
  });

  it('breakdown section blends more', () => {
    const breakdown = recallBlendFm(2.0, 4.0, 'lofi', 'breakdown');
    const build = recallBlendFm(2.0, 4.0, 'lofi', 'build');
    expect(breakdown).toBeGreaterThan(build);
  });
});

describe('recallBlendLpf', () => {
  it('blends toward recalled value', () => {
    const blended = recallBlendLpf(1000, 2000, 'ambient', 'groove');
    expect(blended).toBeGreaterThan(1000);
    expect(blended).toBeLessThan(2000);
  });
});

describe('shouldRecallTimbre', () => {
  it('never recalls in intro', () => {
    for (let t = 0; t < 50; t++) {
      expect(shouldRecallTimbre(t, 'ambient', 'intro')).toBe(false);
    }
  });

  it('ambient recalls more than syro', () => {
    let ambientCount = 0, syroCount = 0;
    for (let t = 0; t < 100; t++) {
      if (shouldRecallTimbre(t, 'ambient', 'breakdown')) ambientCount++;
      if (shouldRecallTimbre(t, 'syro', 'breakdown')) syroCount++;
    }
    expect(ambientCount).toBeGreaterThan(syroCount);
  });
});

describe('timbralRecallStrength', () => {
  it('ambient is highest', () => {
    expect(timbralRecallStrength('ambient')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(timbralRecallStrength('syro')).toBe(0.20);
  });
});
