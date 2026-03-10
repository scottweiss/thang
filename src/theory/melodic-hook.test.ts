import { describe, it, expect } from 'vitest';
import { HookManager } from './melodic-hook';

describe('HookManager', () => {
  it('getPhase returns establish for first repetitions', () => {
    const hm = new HookManager();
    expect(hm.getPhase(0, 16, 2)).toBe('establish');
    expect(hm.getPhase(1, 16, 2)).toBe('establish');
  });

  it('getPhase returns confirm after establish', () => {
    const hm = new HookManager();
    expect(hm.getPhase(4, 16, 2)).toBe('confirm');
  });

  it('getPhase returns develop after confirm', () => {
    const hm = new HookManager();
    expect(hm.getPhase(8, 16, 2)).toBe('develop');
  });

  it('getPhase returns return after develop', () => {
    const hm = new HookManager();
    expect(hm.getPhase(12, 16, 2)).toBe('return');
  });

  it('shouldRepeatHook is true for establish/confirm/return', () => {
    const hm = new HookManager();
    expect(hm.shouldRepeatHook('establish')).toBe(true);
    expect(hm.shouldRepeatHook('confirm')).toBe(true);
    expect(hm.shouldRepeatHook('return')).toBe(true);
  });

  it('shouldRepeatHook is false for develop', () => {
    const hm = new HookManager();
    expect(hm.shouldRepeatHook('develop')).toBe(false);
  });

  it('storeHook and getStoredHook round-trip', () => {
    const hm = new HookManager();
    hm.storeHook(['C4', 'D4', 'E4'], 'lofi');
    expect(hm.getStoredHook('lofi')).toEqual(['C4', 'D4', 'E4']);
  });

  it('getStoredHook returns null for different mood', () => {
    const hm = new HookManager();
    hm.storeHook(['C4', 'D4'], 'lofi');
    expect(hm.getStoredHook('trance')).toBeNull();
  });

  it('clear removes stored hook', () => {
    const hm = new HookManager();
    hm.storeHook(['C4'], 'lofi');
    hm.clear();
    expect(hm.getStoredHook('lofi')).toBeNull();
  });

  it('getHookLengthBars returns mood-specific length', () => {
    const hm = new HookManager();
    expect(hm.getHookLengthBars('ambient')).toBe(4);
    expect(hm.getHookLengthBars('trance')).toBe(2);
  });

  it('getPhaseReps returns mood-specific repetition counts', () => {
    const hm = new HookManager();
    expect(hm.getPhaseReps('ambient')).toBe(2);
    expect(hm.getPhaseReps('trance')).toBe(4);
    expect(hm.getPhaseReps('syro')).toBe(1);
    expect(hm.getPhaseReps('disco')).toBe(4);
  });

  it('storeHook stores a copy, not a reference', () => {
    const hm = new HookManager();
    const notes = ['C4', 'D4', 'E4'];
    hm.storeHook(notes, 'lofi');
    notes[0] = 'G4';
    expect(hm.getStoredHook('lofi')).toEqual(['C4', 'D4', 'E4']);
  });

  it('storeHook overwrites previous hook', () => {
    const hm = new HookManager();
    hm.storeHook(['C4', 'D4'], 'lofi');
    hm.storeHook(['E4', 'F4'], 'lofi');
    expect(hm.getStoredHook('lofi')).toEqual(['E4', 'F4']);
  });

  it('getPhase cycles correctly for small hookLengthBars', () => {
    const hm = new HookManager();
    // totalHookBars=8, hookLengthBars=2 → 4 reps, repsPerPhase=1
    // rep 0 → establish, rep 1 → confirm, rep 2 → develop, rep 3 → return
    expect(hm.getPhase(0, 8, 2)).toBe('establish');
    expect(hm.getPhase(2, 8, 2)).toBe('confirm');
    expect(hm.getPhase(4, 8, 2)).toBe('develop');
    expect(hm.getPhase(6, 8, 2)).toBe('return');
  });

  it('getHookLengthBars covers all moods', () => {
    const hm = new HookManager();
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      const len = hm.getHookLengthBars(mood);
      expect(len).toBeGreaterThan(0);
      expect(len === 2 || len === 4).toBe(true);
    }
  });
});
