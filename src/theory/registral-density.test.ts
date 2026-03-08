import { describe, it, expect } from 'vitest';
import {
  octaveDensity,
  shouldShiftForClarity,
  shiftDirection,
  spreadScore,
  crowdingTolerance,
} from './registral-density';

describe('octaveDensity', () => {
  it('counts layers in same octave', () => {
    const octs = { melody: 4, harmony: 4, arp: 4 };
    expect(octaveDensity(octs, 4)).toBe(3);
  });

  it('partially counts adjacent octaves', () => {
    const octs = { melody: 4, harmony: 3 };
    expect(octaveDensity(octs, 4)).toBe(1.5);
  });

  it('ignores distant octaves', () => {
    const octs = { melody: 4, drone: 2 };
    expect(octaveDensity(octs, 4)).toBe(1);
  });
});

describe('shouldShiftForClarity', () => {
  it('shift when crowded and intolerant mood', () => {
    const octs = { melody: 4, harmony: 4, arp: 4 };
    expect(shouldShiftForClarity('melody', octs, 'ambient')).toBe(true);
  });

  it('no shift when well-spread', () => {
    const octs = { melody: 4, harmony: 2, arp: 6 };
    expect(shouldShiftForClarity('melody', octs, 'ambient')).toBe(false);
  });

  it('tolerant moods allow crowding', () => {
    const octs = { melody: 4, harmony: 4, arp: 4 };
    expect(shouldShiftForClarity('melody', octs, 'blockhead')).toBe(false);
  });
});

describe('shiftDirection', () => {
  it('moves toward ideal octave', () => {
    const octs = { drone: 4 }; // drone ideal is 2
    expect(shiftDirection('drone', octs)).toBe(-1);
  });

  it('moves toward less crowded side', () => {
    const octs = { melody: 4, harmony: 4, arp: 5 };
    // melody at ideal (4), above is crowded (arp at 5), below is empty
    expect(shiftDirection('melody', octs)).toBe(-1);
  });

  it('returns 0 for unknown layer', () => {
    expect(shiftDirection('unknown', {})).toBe(0);
  });
});

describe('spreadScore', () => {
  it('well-spread = high score', () => {
    const octs = { drone: 2, harmony: 3, melody: 4, arp: 5 };
    expect(spreadScore(octs)).toBeGreaterThan(0.7);
  });

  it('clustered = low score', () => {
    const octs = { drone: 4, harmony: 4, melody: 4, arp: 4 };
    expect(spreadScore(octs)).toBe(0);
  });

  it('single layer = 1.0', () => {
    expect(spreadScore({ melody: 4 })).toBe(1.0);
  });
});

describe('crowdingTolerance', () => {
  it('ambient is most intolerant', () => {
    expect(crowdingTolerance('ambient')).toBe(0.10);
  });

  it('blockhead is most tolerant', () => {
    expect(crowdingTolerance('blockhead')).toBe(0.40);
  });
});
