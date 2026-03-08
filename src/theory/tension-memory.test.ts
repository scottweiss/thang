import { describe, it, expect } from 'vitest';
import { TensionMemory } from './tension-memory';

describe('TensionMemory', () => {
  it('record and recentAverage: returns correct average', () => {
    const tm = new TensionMemory();
    tm.record(0.2);
    tm.record(0.4);
    tm.record(0.6);
    tm.record(0.8);
    expect(tm.recentAverage()).toBeCloseTo(0.5);
  });

  it('recentAverage with window: only uses last N values', () => {
    const tm = new TensionMemory();
    // Push some early low values
    tm.record(0.1);
    tm.record(0.1);
    tm.record(0.1);
    // Then high values
    tm.record(0.9);
    tm.record(0.9);
    // Window of 2 should only see the 0.9s
    expect(tm.recentAverage(2)).toBeCloseTo(0.9);
    // Window of 5 should see everything
    expect(tm.recentAverage(5)).toBeCloseTo(0.42);
  });

  it('trend: rising tension returns positive', () => {
    const tm = new TensionMemory();
    // 5 low values then 5 high values
    for (let i = 0; i < 5; i++) tm.record(0.2);
    for (let i = 0; i < 5; i++) tm.record(0.8);
    expect(tm.trend()).toBeGreaterThan(0);
  });

  it('trend: falling tension returns negative', () => {
    const tm = new TensionMemory();
    // 5 high values then 5 low values
    for (let i = 0; i < 5; i++) tm.record(0.8);
    for (let i = 0; i < 5; i++) tm.record(0.2);
    expect(tm.trend()).toBeLessThan(0);
  });

  it('suggestModification: sustained high tension suggests decrease', () => {
    const tm = new TensionMemory();
    // Fill with high tension — above 0.7, with non-falling trend
    for (let i = 0; i < 15; i++) tm.record(0.85);
    expect(tm.suggestModification()).toBe(-0.15);
  });

  it('suggestModification: sustained low tension suggests increase', () => {
    const tm = new TensionMemory();
    // Fill with low tension — below 0.3, with non-rising trend
    for (let i = 0; i < 15; i++) tm.record(0.15);
    expect(tm.suggestModification()).toBe(0.15);
  });

  it('isStagnant: constant values returns true', () => {
    const tm = new TensionMemory();
    for (let i = 0; i < 10; i++) tm.record(0.5);
    expect(tm.isStagnant()).toBe(true);
  });

  it('isStagnant: varying values returns false', () => {
    const tm = new TensionMemory();
    for (let i = 0; i < 10; i++) tm.record(i % 2 === 0 ? 0.2 : 0.8);
    expect(tm.isStagnant()).toBe(false);
  });

  it('clear: resets history', () => {
    const tm = new TensionMemory();
    for (let i = 0; i < 10; i++) tm.record(0.9);
    tm.clear();
    // After clear, recentAverage returns the default 0.5
    expect(tm.recentAverage()).toBe(0.5);
    // And trend returns 0
    expect(tm.trend()).toBe(0);
  });

  it('history does not exceed maxHistory', () => {
    const tm = new TensionMemory();
    // Record well over 30 values
    for (let i = 0; i < 50; i++) tm.record(i / 50);
    // recentAverage of a large window should still only use at most 30 values
    // The last 30 values are i=20..49, i.e. 0.4..0.98
    const expectedAvg = (0.4 + 0.98) / 2; // mean of uniform range
    expect(tm.recentAverage(100)).toBeCloseTo(expectedAvg, 1);
  });
});
