/**
 * HPF sweep — high-pass filter evolution for build-up tension.
 *
 * The classic electronic music build-up: low frequencies are gradually
 * removed during builds, creating tension and anticipation. At the peak
 * transition, the HPF drops back down — the "drop" that releases all
 * that built-up energy. During breakdowns, a gentle HPF rise creates
 * an ethereal, floating quality.
 *
 * Applied as an additive offset to existing .hpf() values.
 * Uses additive (not multiplicative) because HPF=0 is common and
 * multiplying by 0 would have no effect.
 */

import type { Section } from '../types';

interface HpfShape {
  addStart: number;  // Hz to add at section start
  addEnd: number;    // Hz to add at section end
  curve: 'linear' | 'exp';
}

const SECTION_HPF: Record<Section, HpfShape> = {
  intro:     { addStart: 0,    addEnd: 20,   curve: 'linear' },  // subtle
  build:     { addStart: 30,   addEnd: 250,  curve: 'exp' },     // the sweep up
  peak:      { addStart: 0,    addEnd: 0,    curve: 'linear' },  // fully open
  breakdown: { addStart: 10,   addEnd: 80,   curve: 'linear' },  // gentle float
  groove:    { addStart: 0,    addEnd: 10,   curve: 'linear' },  // negligible
};

/**
 * Compute the HPF offset in Hz to add for the current section position.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Hz to ADD to existing .hpf() values
 */
export function hpfSweepOffset(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_HPF[section] ?? SECTION_HPF.groove;

  let t: number;
  if (shape.curve === 'exp') {
    // Exponential: slow start, dramatic rise at end (classic build sweep)
    t = p * p * p;
  } else {
    t = p;
  }

  return shape.addStart + (shape.addEnd - shape.addStart) * t;
}

/**
 * Whether HPF sweep should be applied for this section.
 */
export function shouldApplyHpfSweep(section: Section): boolean {
  const shape = SECTION_HPF[section];
  return Math.abs(shape.addEnd - shape.addStart) > 15;
}
