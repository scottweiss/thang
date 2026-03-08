import { describe, it, expect } from 'vitest';
import {
  parallel,
  relative,
  leadingTone,
  applyChain,
  nrDistance,
  shouldApplyNR,
  suggestNRMove,
  nrTendency,
} from './neo-riemannian';

describe('parallel', () => {
  it('C major → C minor', () => {
    const result = parallel('C', 'maj');
    expect(result.root).toBe('C');
    expect(result.quality).toBe('min');
  });

  it('C minor → C major', () => {
    const result = parallel('C', 'min');
    expect(result.root).toBe('C');
    expect(result.quality).toBe('maj');
  });

  it('is its own inverse', () => {
    const r1 = parallel('D', 'maj');
    const r2 = parallel(r1.root, r1.quality);
    expect(r2.root).toBe('D');
    expect(r2.quality).toBe('maj');
  });
});

describe('relative', () => {
  it('C major → A minor', () => {
    const result = relative('C', 'maj');
    expect(result.root).toBe('A');
    expect(result.quality).toBe('min');
  });

  it('A minor → C major', () => {
    const result = relative('A', 'min');
    expect(result.root).toBe('C');
    expect(result.quality).toBe('maj');
  });

  it('is its own inverse', () => {
    const r1 = relative('G', 'maj');
    const r2 = relative(r1.root, r1.quality);
    expect(r2.root).toBe('G');
    expect(r2.quality).toBe('maj');
  });
});

describe('leadingTone', () => {
  it('C major → E minor', () => {
    const result = leadingTone('C', 'maj');
    expect(result.root).toBe('E');
    expect(result.quality).toBe('min');
  });

  it('E minor → C major', () => {
    const result = leadingTone('E', 'min');
    expect(result.root).toBe('C');
    expect(result.quality).toBe('maj');
  });

  it('is its own inverse', () => {
    const r1 = leadingTone('F', 'maj');
    const r2 = leadingTone(r1.root, r1.quality);
    expect(r2.root).toBe('F');
    expect(r2.quality).toBe('maj');
  });
});

describe('applyChain', () => {
  it('PRL creates chromatic mediant', () => {
    const result = applyChain('C', 'maj', ['P', 'R', 'L']);
    // C major → P → C minor → R → Eb major → L → Ab minor... etc
    expect(result.root).toBeDefined();
    expect(result.quality).toBeDefined();
  });

  it('empty chain returns identity', () => {
    const result = applyChain('C', 'maj', []);
    expect(result.root).toBe('C');
    expect(result.quality).toBe('maj');
  });

  it('PP returns to original', () => {
    const result = applyChain('G', 'min', ['P', 'P']);
    expect(result.root).toBe('G');
    expect(result.quality).toBe('min');
  });
});

describe('nrDistance', () => {
  it('same chord = 0', () => {
    expect(nrDistance('C', 'maj', 'C', 'maj')).toBe(0);
  });

  it('parallel = 1', () => {
    expect(nrDistance('C', 'maj', 'C', 'min')).toBe(1);
  });

  it('relative = 1', () => {
    expect(nrDistance('C', 'maj', 'A', 'min')).toBe(1);
  });

  it('leading-tone exchange = 1', () => {
    expect(nrDistance('C', 'maj', 'E', 'min')).toBe(1);
  });

  it('more distant chords have higher distance', () => {
    const close = nrDistance('C', 'maj', 'A', 'min'); // 1
    const far = nrDistance('C', 'maj', 'F#', 'maj');
    expect(far).toBeGreaterThan(close);
  });
});

describe('shouldApplyNR', () => {
  it('is deterministic', () => {
    const a = shouldApplyNR(42, 'ambient', 'breakdown');
    const b = shouldApplyNR(42, 'ambient', 'breakdown');
    expect(a).toBe(b);
  });

  it('ambient breakdown more than trance peak', () => {
    const ambientCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyNR(i, 'ambient', 'breakdown')
    ).filter(Boolean).length;
    const tranceCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyNR(i, 'trance', 'peak')
    ).filter(Boolean).length;
    expect(ambientCount).toBeGreaterThan(tranceCount);
  });
});

describe('suggestNRMove', () => {
  it('returns valid transformation', () => {
    const move = suggestNRMove('C', 'maj', 'ambient', 42);
    expect(['P', 'R', 'L']).toContain(move.transform);
    expect(move.result.root).toBeDefined();
    expect(['maj', 'min']).toContain(move.result.quality);
  });

  it('is deterministic', () => {
    const a = suggestNRMove('G', 'min', 'lofi', 100);
    const b = suggestNRMove('G', 'min', 'lofi', 100);
    expect(a.transform).toBe(b.transform);
    expect(a.result.root).toBe(b.result.root);
  });

  it('handles complex chord qualities', () => {
    const move = suggestNRMove('D', 'dom7', 'syro', 50);
    expect(move.result.root).toBeDefined();
  });
});

describe('nrTendency', () => {
  it('ambient has highest tendency', () => {
    expect(nrTendency('ambient')).toBe(0.45);
  });

  it('trance has lowest tendency', () => {
    expect(nrTendency('trance')).toBe(0.03);
  });
});
