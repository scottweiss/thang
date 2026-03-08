import { describe, it, expect } from 'vitest';
import {
  suspensionChainFm,
  chainDepthValue,
} from './harmonic-suspension-chain-fm';

describe('suspensionChainFm', () => {
  it('no chain is neutral', () => {
    expect(suspensionChainFm(0, 'avril', 'peak')).toBe(1.0);
  });

  it('chain gets FM enrichment', () => {
    const fm = suspensionChainFm(2, 'avril', 'peak');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('longer chain = more enrichment', () => {
    const short = suspensionChainFm(1, 'avril', 'peak');
    const long = suspensionChainFm(4, 'avril', 'peak');
    expect(long).toBeGreaterThan(short);
  });

  it('avril enriches more than blockhead', () => {
    const av = suspensionChainFm(3, 'avril', 'peak');
    const bh = suspensionChainFm(3, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.05 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      for (let c = 0; c <= 6; c++) {
        const fm = suspensionChainFm(c, 'avril', s);
        expect(fm).toBeGreaterThanOrEqual(1.0);
        expect(fm).toBeLessThanOrEqual(1.05);
      }
    }
  });
});

describe('chainDepthValue', () => {
  it('avril is highest', () => {
    expect(chainDepthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(chainDepthValue('blockhead')).toBe(0.15);
  });
});
