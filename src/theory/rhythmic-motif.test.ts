import { describe, it, expect } from 'vitest';
import {
  generateCell,
  applyCell,
  cellLength,
  cellAdherence,
  shouldApplyRhythmicMotif,
} from './rhythmic-motif';

describe('generateCell', () => {
  it('first beat is always a note', () => {
    for (let seed = 0; seed < 20; seed++) {
      const cell = generateCell('lofi', seed);
      expect(cell[0]).toBe(true);
    }
  });

  it('length matches mood', () => {
    expect(generateCell('trance', 0).length).toBe(4);
    expect(generateCell('xtal', 0).length).toBe(7);
    expect(generateCell('ambient', 0).length).toBe(8);
  });

  it('deterministic for same seed', () => {
    const a = generateCell('lofi', 42);
    const b = generateCell('lofi', 42);
    expect(a).toEqual(b);
  });

  it('different seeds can produce different cells', () => {
    const a = generateCell('lofi', 0);
    const b = generateCell('lofi', 1);
    // Seeds 0 and 1 produce different patterns
    const same = a.every((v, i) => v === b[i]);
    expect(same).toBe(false);
  });
});

describe('applyCell', () => {
  it('preserves notes where cell says note', () => {
    const elements = ['C4', 'D4', 'E4', 'F4'];
    const cell = [true, true, true, true];
    const result = applyCell(elements, cell, 1.0, 0);
    expect(result.filter(e => e !== '~').length).toBe(4);
  });

  it('masks some notes where cell says rest', () => {
    const elements = ['C4', 'D4', 'E4', 'F4'];
    const cell = [true, false, true, false];
    const result = applyCell(elements, cell, 1.0, 0);
    // With adherence 1.0, positions 1 and 3 should be masked
    expect(result[0]).toBe('C4');
    expect(result[2]).toBe('E4');
  });

  it('preserves existing rests', () => {
    const elements = ['C4', '~', 'E4'];
    const cell = [true, true, true];
    const result = applyCell(elements, cell, 1.0, 0);
    expect(result[1]).toBe('~');
  });

  it('low adherence preserves more notes', () => {
    const elements = Array(20).fill('C4');
    const cell = [true, false]; // every other is rest
    const highAdherence = applyCell(elements, cell, 0.9, 5);
    const lowAdherence = applyCell(elements, cell, 0.1, 5);
    const highRests = highAdherence.filter(e => e === '~').length;
    const lowRests = lowAdherence.filter(e => e === '~').length;
    expect(highRests).toBeGreaterThan(lowRests);
  });
});

describe('cellLength', () => {
  it('trance is 4', () => {
    expect(cellLength('trance')).toBe(4);
  });

  it('xtal is 7', () => {
    expect(cellLength('xtal')).toBe(7);
  });
});

describe('cellAdherence', () => {
  it('trance is highest', () => {
    expect(cellAdherence('trance')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(cellAdherence('ambient')).toBe(0.15);
  });
});

describe('shouldApplyRhythmicMotif', () => {
  it('trance in groove applies', () => {
    expect(shouldApplyRhythmicMotif('trance', 'groove')).toBe(true);
  });

  it('ambient in intro does not', () => {
    // 0.15 * 0.6 = 0.09 < 0.12
    expect(shouldApplyRhythmicMotif('ambient', 'intro')).toBe(false);
  });
});
