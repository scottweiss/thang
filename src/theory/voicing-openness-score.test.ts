import { describe, it, expect } from 'vitest';
import {
  opennessGain,
  opennessPreference,
} from './voicing-openness-score';

describe('opennessGain', () => {
  it('open voicing in ambient gets boost', () => {
    // 2 octave spread in ambient breakdown
    const gain = opennessGain(48, 72, 'ambient', 'breakdown');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('close voicing in blockhead is acceptable', () => {
    // tight cluster in blockhead peak
    const gain = opennessGain(60, 67, 'blockhead', 'peak');
    expect(gain).toBeGreaterThanOrEqual(0.95);
  });

  it('stays in 0.93-1.06 range', () => {
    for (let span = 0; span <= 36; span += 6) {
      const gain = opennessGain(48, 48 + span, 'ambient', 'peak');
      expect(gain).toBeGreaterThanOrEqual(0.93);
      expect(gain).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('opennessPreference', () => {
  it('ambient is most open', () => {
    expect(opennessPreference('ambient')).toBe(0.75);
  });

  it('blockhead is close', () => {
    expect(opennessPreference('blockhead')).toBe(0.35);
  });
});
