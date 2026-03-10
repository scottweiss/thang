import { describe, it, expect } from 'vitest';
import {
  computeFinalRoom,
  computeFinalRoomsize,
  computeFinalLpf,
  computeFinalDelayFeedback,
  computeFinalDelayWet,
  applyRoomMultiplier,
  applyRoomsizeMultiplier,
  applyLpfMultiplier,
  applyDelayFeedbackMultiplier,
  applyDelayWetMultiplier,
  type PostProcessState,
} from './post-processing';

/* ──────────────── helpers ──────────────── */

function makeState(overrides: Partial<PostProcessState> = {}): PostProcessState {
  return {
    section: 'groove',
    sectionProgress: 0.5,
    tension: { overall: 0.5 },
    mood: 'lofi',
    activeLayers: new Set(['drone', 'harmony', 'melody']),
    ...overrides,
  };
}

/* ──────────────── compute* suite ──────────────── */

describe('computeFinalRoom', () => {
  it('returns a positive number', () => {
    const m = computeFinalRoom(makeState(), 'melody');
    expect(typeof m).toBe('number');
    expect(m).toBeGreaterThan(0);
  });

  it('high tension reduces room (drier at climactic moments)', () => {
    const low = computeFinalRoom(makeState({ tension: { overall: 0.2 } }), 'melody');
    const high = computeFinalRoom(makeState({ tension: { overall: 0.9 } }), 'melody');
    expect(low).toBeGreaterThan(high);
  });

  it('more active layers reduce room (ensemble thinning)', () => {
    const few = computeFinalRoom(
      makeState({ activeLayers: new Set(['drone']) }),
      'melody',
    );
    const many = computeFinalRoom(
      makeState({ activeLayers: new Set(['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere']) }),
      'melody',
    );
    expect(few).toBeGreaterThan(many);
  });

  it('result stays within reasonable bounds', () => {
    for (const section of ['intro', 'build', 'peak', 'breakdown', 'groove'] as const) {
      for (const t of [0, 0.5, 1]) {
        const m = computeFinalRoom(
          makeState({ section, tension: { overall: t } }),
          'melody',
        );
        expect(m).toBeGreaterThan(0);
        expect(m).toBeLessThan(3);
      }
    }
  });
});

describe('computeFinalRoomsize', () => {
  it('returns a positive number', () => {
    const m = computeFinalRoomsize(makeState(), 'melody');
    expect(typeof m).toBe('number');
    expect(m).toBeGreaterThan(0);
  });

  it('breakdowns have larger rooms than builds', () => {
    const build = computeFinalRoomsize(makeState({ section: 'build' }), 'melody');
    const breakdown = computeFinalRoomsize(makeState({ section: 'breakdown' }), 'melody');
    expect(breakdown).toBeGreaterThan(build);
  });
});

describe('computeFinalLpf', () => {
  it('returns a positive number', () => {
    const m = computeFinalLpf(makeState(), 'melody');
    expect(typeof m).toBe('number');
    expect(m).toBeGreaterThan(0);
  });

  it('high tension opens filter (brighter)', () => {
    const low = computeFinalLpf(makeState({ tension: { overall: 0.2 } }), 'melody');
    const high = computeFinalLpf(makeState({ tension: { overall: 0.9 } }), 'melody');
    expect(high).toBeGreaterThan(low);
  });

  it('peak section has higher LPF than breakdown', () => {
    const peak = computeFinalLpf(makeState({ section: 'peak' }), 'melody');
    const breakdown = computeFinalLpf(makeState({ section: 'breakdown' }), 'melody');
    expect(peak).toBeGreaterThan(breakdown);
  });
});

describe('computeFinalDelayFeedback', () => {
  it('returns a positive number', () => {
    const m = computeFinalDelayFeedback(makeState(), 'melody');
    expect(typeof m).toBe('number');
    expect(m).toBeGreaterThan(0);
  });

  it('high tension increases delay feedback', () => {
    const low = computeFinalDelayFeedback(makeState({ tension: { overall: 0.2 } }), 'melody');
    const high = computeFinalDelayFeedback(makeState({ tension: { overall: 0.9 } }), 'melody');
    expect(high).toBeGreaterThan(low);
  });

  it('many active layers reduce delay feedback', () => {
    const few = computeFinalDelayFeedback(
      makeState({ activeLayers: new Set(['drone']) }),
      'melody',
    );
    const many = computeFinalDelayFeedback(
      makeState({ activeLayers: new Set(['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere']) }),
      'melody',
    );
    expect(few).toBeGreaterThan(many);
  });
});

describe('computeFinalDelayWet', () => {
  it('returns a positive number', () => {
    const m = computeFinalDelayWet(makeState(), 'melody');
    expect(typeof m).toBe('number');
    expect(m).toBeGreaterThan(0);
  });

  it('breakdown has higher wet than peak', () => {
    const peak = computeFinalDelayWet(makeState({ section: 'peak' }), 'melody');
    const breakdown = computeFinalDelayWet(makeState({ section: 'breakdown' }), 'melody');
    expect(breakdown).toBeGreaterThan(peak);
  });
});

/* ──────────────── apply* suite ──────────────── */

describe('applyRoomMultiplier', () => {
  it('scales .room() values', () => {
    const result = applyRoomMultiplier('.room(0.50)', 1.5);
    expect(result).toBe('.room(0.75)');
  });

  it('skips near-unity multiplier (|mult-1| <= 0.05)', () => {
    const result = applyRoomMultiplier('.room(0.50)', 1.02);
    expect(result).toBe('.room(0.50)');
  });

  it('handles multiple .room() in one pattern', () => {
    const result = applyRoomMultiplier('.room(0.40).sound("piano").room(0.60)', 2.0);
    expect(result).toBe('.room(0.80).sound("piano").room(1.20)');
  });

  it('handles zero multiplier', () => {
    const result = applyRoomMultiplier('.room(0.50)', 0);
    expect(result).toBe('.room(0.00)');
  });

  it('returns pattern unchanged if no .room() present', () => {
    const result = applyRoomMultiplier('.sound("piano").gain(0.5)', 2.0);
    expect(result).toBe('.sound("piano").gain(0.5)');
  });
});

describe('applyRoomsizeMultiplier', () => {
  it('scales .roomsize() values', () => {
    const result = applyRoomsizeMultiplier('.roomsize(0.40)', 2.0);
    expect(result).toBe('.roomsize(0.80)');
  });

  it('skips near-unity multiplier', () => {
    const result = applyRoomsizeMultiplier('.roomsize(0.40)', 0.97);
    expect(result).toBe('.roomsize(0.40)');
  });
});

describe('applyLpfMultiplier', () => {
  it('scales .lpf() values', () => {
    const result = applyLpfMultiplier('.lpf(500)', 1.5);
    expect(result).toBe('.lpf(750)');
  });

  it('skips near-unity multiplier', () => {
    const result = applyLpfMultiplier('.lpf(500)', 1.01);
    expect(result).toBe('.lpf(500)');
  });

  it('rounds to whole numbers for large LPF values', () => {
    const result = applyLpfMultiplier('.lpf(1000)', 1.333);
    expect(result).toBe('.lpf(1333)');
  });
});

describe('applyDelayFeedbackMultiplier', () => {
  it('scales .delayfeedback() values', () => {
    const result = applyDelayFeedbackMultiplier('.delayfeedback(0.40)', 1.5);
    expect(result).toBe('.delayfeedback(0.60)');
  });

  it('caps at 0.85', () => {
    const result = applyDelayFeedbackMultiplier('.delayfeedback(0.80)', 2.0);
    expect(result).toBe('.delayfeedback(0.85)');
  });

  it('skips near-unity multiplier', () => {
    const result = applyDelayFeedbackMultiplier('.delayfeedback(0.40)', 1.03);
    expect(result).toBe('.delayfeedback(0.40)');
  });
});

describe('applyDelayWetMultiplier', () => {
  it('scales .delay() values', () => {
    const result = applyDelayWetMultiplier('.delay(0.50)', 1.5);
    expect(result).toBe('.delay(0.75)');
  });

  it('caps at 1.0', () => {
    const result = applyDelayWetMultiplier('.delay(0.80)', 2.0);
    expect(result).toBe('.delay(1.00)');
  });

  it('skips near-unity multiplier', () => {
    const result = applyDelayWetMultiplier('.delay(0.50)', 0.98);
    expect(result).toBe('.delay(0.50)');
  });

  it('does not match .delayfeedback() or .delaytime()', () => {
    const pattern = '.delay(0.50).delayfeedback(0.40).delaytime(0.25)';
    const result = applyDelayWetMultiplier(pattern, 2.0);
    expect(result).toContain('.delayfeedback(0.40)');
    expect(result).toContain('.delaytime(0.25)');
    expect(result).toContain('.delay(1.00)');
  });
});
