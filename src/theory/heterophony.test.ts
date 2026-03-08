import { describe, it, expect } from 'vitest';
import {
  shouldApplyHeterophony,
  selectVariation,
  rhythmicVariant,
  ornamentalVariant,
  octaveVariant,
  shadowVariant,
  heterophonyTendency,
} from './heterophony';

describe('shouldApplyHeterophony', () => {
  it('is deterministic', () => {
    const a = shouldApplyHeterophony(42, 'xtal', 'breakdown');
    const b = shouldApplyHeterophony(42, 'xtal', 'breakdown');
    expect(a).toBe(b);
  });

  it('xtal breakdown more than trance peak', () => {
    const xtalCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyHeterophony(i, 'xtal', 'breakdown')
    ).filter(Boolean).length;
    const tranceCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyHeterophony(i, 'trance', 'peak')
    ).filter(Boolean).length;
    expect(xtalCount).toBeGreaterThan(tranceCount);
  });
});

describe('selectVariation', () => {
  it('returns valid variation type', () => {
    const valid = ['rhythmic', 'ornamental', 'octave', 'shadow'];
    for (let i = 0; i < 50; i++) {
      const v = selectVariation('ambient', 'intro', i);
      expect(valid).toContain(v);
    }
  });

  it('is deterministic', () => {
    const a = selectVariation('lofi', 'groove', 42);
    const b = selectVariation('lofi', 'groove', 42);
    expect(a).toBe(b);
  });
});

describe('rhythmicVariant', () => {
  it('preserves length', () => {
    const melody = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];
    const variant = rhythmicVariant(melody);
    expect(variant).toHaveLength(6);
  });

  it('inserts rests at offset positions', () => {
    const melody = ['C4', 'D4', 'E4', 'F4'];
    const variant = rhythmicVariant(melody);
    expect(variant[1]).toBe('~'); // i%3 === 1
  });

  it('preserves existing rests', () => {
    const melody = ['C4', '~', 'E4'];
    const variant = rhythmicVariant(melody);
    expect(variant[1]).toBe('~');
  });
});

describe('ornamentalVariant', () => {
  it('preserves length', () => {
    const melody = ['C4', 'D4', 'E4', 'F4'];
    const variant = ornamentalVariant(melody, ['C', 'D', 'E', 'F', 'G']);
    expect(variant).toHaveLength(4);
  });

  it('replaces odd-indexed notes with neighbors', () => {
    const melody = ['C4', 'D4', 'E4', 'F4'];
    const variant = ornamentalVariant(melody, ['C', 'D', 'E', 'F', 'G']);
    expect(variant[0]).toBe('C4'); // even — unchanged
    expect(variant[1]).not.toBe('D4'); // odd — neighbor
  });

  it('preserves rests', () => {
    expect(ornamentalVariant(['~'], ['C'])).toEqual(['~']);
  });
});

describe('octaveVariant', () => {
  it('shifts up by one octave', () => {
    const melody = ['C4', 'D4', '~', 'E3'];
    const variant = octaveVariant(melody, 1);
    expect(variant[0]).toBe('C5');
    expect(variant[1]).toBe('D5');
    expect(variant[2]).toBe('~');
    expect(variant[3]).toBe('E4');
  });

  it('shifts down by one octave', () => {
    const variant = octaveVariant(['G5'], -1);
    expect(variant[0]).toBe('G4');
  });

  it('clamps to range 2-6', () => {
    expect(octaveVariant(['C6'], 1)[0]).toBe('C6'); // clamped
    expect(octaveVariant(['C2'], -1)[0]).toBe('C2'); // clamped
  });
});

describe('shadowVariant', () => {
  it('delays melody by 1 position', () => {
    const melody = ['C4', 'D4', 'E4', 'F4'];
    const shadow = shadowVariant(melody, 1);
    expect(shadow[0]).toBe('~');
    expect(shadow[1]).toBe('C4');
    expect(shadow[2]).toBe('D4');
    expect(shadow[3]).toBe('E4');
  });

  it('delays by 2 positions', () => {
    const melody = ['A4', 'B4', 'C5'];
    const shadow = shadowVariant(melody, 2);
    expect(shadow[0]).toBe('~');
    expect(shadow[1]).toBe('~');
    expect(shadow[2]).toBe('A4');
  });

  it('preserves length', () => {
    const melody = ['C4', 'D4', 'E4'];
    expect(shadowVariant(melody, 1)).toHaveLength(3);
  });
});

describe('heterophonyTendency', () => {
  it('xtal has highest tendency', () => {
    expect(heterophonyTendency('xtal')).toBe(0.40);
  });

  it('trance has lowest tendency', () => {
    expect(heterophonyTendency('trance')).toBe(0.03);
  });
});
