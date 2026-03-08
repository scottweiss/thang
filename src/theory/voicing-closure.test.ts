import { describe, it, expect } from 'vitest';
import { closureSpread, closureIntensity } from './voicing-closure';

describe('closureSpread', () => {
  it('wider at phrase start than end', () => {
    const start = closureSpread(0.0, 'avril', 'peak');
    const end = closureSpread(1.0, 'avril', 'peak');
    expect(start).toBeGreaterThan(end);
  });

  it('stays in 0.85-1.15 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const s = closureSpread(p, 'avril', 'peak');
      expect(s).toBeGreaterThanOrEqual(0.85);
      expect(s).toBeLessThanOrEqual(1.20);
    }
  });

  it('avril has more variation than disco', () => {
    const avrilRange = closureSpread(0.0, 'avril', 'groove') - closureSpread(1.0, 'avril', 'groove');
    const discoRange = closureSpread(0.0, 'disco', 'groove') - closureSpread(1.0, 'disco', 'groove');
    expect(avrilRange).toBeGreaterThan(discoRange);
  });
});

describe('closureIntensity', () => {
  it('avril is highest', () => {
    expect(closureIntensity('avril')).toBe(0.60);
  });

  it('disco and syro are lowest', () => {
    expect(closureIntensity('disco')).toBe(0.20);
    expect(closureIntensity('syro')).toBe(0.20);
  });
});
