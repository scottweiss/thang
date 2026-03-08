import { describe, it, expect } from 'vitest';
import {
  expectedInterval,
  onsetSurprise,
  anticipationDelay,
  urgencyRush,
  violationTendency,
} from './temporal-expectancy';

describe('expectedInterval', () => {
  it('detects regular spacing', () => {
    expect(expectedInterval([0, 4, 8, 12])).toBe(4);
  });

  it('detects shorter spacing', () => {
    expect(expectedInterval([0, 2, 4, 6, 8])).toBe(2);
  });

  it('returns default for short history', () => {
    expect(expectedInterval([0, 4])).toBe(4);
  });

  it('uses mode for irregular sequences', () => {
    // Two intervals of 4, one of 3 → mode is 4
    expect(expectedInterval([0, 4, 8, 11])).toBe(4);
  });
});

describe('onsetSurprise', () => {
  it('expected position = no surprise', () => {
    expect(onsetSurprise(12, [0, 4, 8])).toBe(0);
  });

  it('early onset = surprise', () => {
    const s = onsetSurprise(10, [0, 4, 8]);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(1);
  });

  it('late onset = surprise', () => {
    const s = onsetSurprise(14, [0, 4, 8]);
    expect(s).toBeGreaterThan(0);
  });

  it('very late = high surprise', () => {
    const s = onsetSurprise(20, [0, 4, 8]);
    expect(s).toBeGreaterThan(0.5);
  });

  it('short history = no surprise', () => {
    expect(onsetSurprise(5, [0])).toBe(0);
  });
});

describe('anticipationDelay', () => {
  it('trance rarely delays', () => {
    let totalDelay = 0;
    for (let t = 0; t < 100; t++) {
      totalDelay += anticipationDelay([0, 4, 8], 'trance', 'groove', t);
    }
    expect(totalDelay / 100).toBeLessThan(0.05);
  });

  it('lofi delays more often', () => {
    let totalDelay = 0;
    for (let t = 0; t < 100; t++) {
      totalDelay += anticipationDelay([0, 4, 8], 'lofi', 'groove', t);
    }
    expect(totalDelay / 100).toBeGreaterThan(0.05);
  });

  it('delay is non-negative', () => {
    for (let t = 0; t < 50; t++) {
      expect(anticipationDelay([0, 4, 8], 'syro', 'breakdown', t)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('urgencyRush', () => {
  it('no rush at low tension', () => {
    expect(urgencyRush(0.3, 'lofi', 'build', 42)).toBe(0);
  });

  it('no rush in breakdown', () => {
    expect(urgencyRush(0.9, 'lofi', 'breakdown', 42)).toBe(0);
  });

  it('sometimes rushes at high tension in build', () => {
    let rushed = false;
    for (let t = 0; t < 100; t++) {
      if (urgencyRush(0.9, 'lofi', 'build', t) > 0) {
        rushed = true;
        break;
      }
    }
    expect(rushed).toBe(true);
  });

  it('rush is non-negative', () => {
    for (let t = 0; t < 50; t++) {
      expect(urgencyRush(0.9, 'syro', 'peak', t)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('violationTendency', () => {
  it('syro has highest', () => {
    expect(violationTendency('syro')).toBe(0.45);
  });

  it('trance has lowest', () => {
    expect(violationTendency('trance')).toBe(0.05);
  });
});
