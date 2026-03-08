import { describe, it, expect } from 'vitest';
import {
  shouldUseLydian,
  lydianFourth,
  naturalFourth,
  lydianProbability,
} from './lydian-brightness';

describe('shouldUseLydian', () => {
  it('returns boolean', () => {
    const result = shouldUseLydian(0, 'ambient', 'breakdown');
    expect(typeof result).toBe('boolean');
  });

  it('more likely for ambient breakdown than trance peak', () => {
    let ambientCount = 0;
    let tranceCount = 0;
    for (let tick = 0; tick < 100; tick++) {
      if (shouldUseLydian(tick, 'ambient', 'breakdown')) ambientCount++;
      if (shouldUseLydian(tick, 'trance', 'peak')) tranceCount++;
    }
    expect(ambientCount).toBeGreaterThan(tranceCount);
  });
});

describe('lydianFourth', () => {
  it('C root → F# (6)', () => {
    expect(lydianFourth(0)).toBe(6);
  });

  it('G root → C# (1)', () => {
    expect(lydianFourth(7)).toBe(1);
  });

  it('wraps at 12', () => {
    expect(lydianFourth(11)).toBe(5);
  });
});

describe('naturalFourth', () => {
  it('C root → F (5)', () => {
    expect(naturalFourth(0)).toBe(5);
  });

  it('1 semitone below Lydian 4th', () => {
    expect(lydianFourth(0) - naturalFourth(0)).toBe(1);
  });
});

describe('lydianProbability', () => {
  it('ambient is highest', () => {
    expect(lydianProbability('ambient')).toBe(0.40);
  });

  it('blockhead is lowest', () => {
    expect(lydianProbability('blockhead')).toBe(0.08);
  });
});
