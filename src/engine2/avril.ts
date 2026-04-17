/**
 * AvrilComposer — Yann Tiersen / Amélie soundtrack territory. Wistful, lyrical,
 * melodic. Upright piano doing both bass and chord via octave split; accordion
 * or pizzicato strings as lead; celesta sparkle; no drums.
 *
 * 90-110 BPM. Minor-leaning but warm. 4-note lyrical motifs mixing long/short.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const AVRIL_ROOTS: readonly NoteName[] = ['A', 'D', 'E', 'G', 'C', 'F', 'Bb'];

const AVRIL_PROGRESSIONS: readonly Progression[] = [
  // i-iv-V-i minor cadence — classic Amélie
  { degrees: [0, 3, 4, 0], qualities: ['min', 'min', 'maj',  'min'], barsPerChord: 1 },
  // i-VI-III-VII (doom-soft variant)
  { degrees: [0, 5, 2, 4], qualities: ['min', 'maj', 'maj',  'maj'], barsPerChord: 1 },
  // vi-I-IV-V (starts minor, lifts to major by chord 2)
  { degrees: [5, 0, 3, 4], qualities: ['min', 'maj', 'maj',  'maj'], barsPerChord: 1 },
  // i-iv-VII-III (modal colour shift)
  { degrees: [0, 3, 6, 2], qualities: ['min', 'min', 'maj',  'maj'], barsPerChord: 1 },
  // i-V held slow (2 bars each) — reflective
  { degrees: [0, 4],       qualities: ['min', 'maj'],                barsPerChord: 2 },
];

export class AvrilComposer implements MoodComposer {
  name = 'avril';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    const root = pick(AVRIL_ROOTS);
    const scaleType: ScaleType = Math.random() < 0.65 ? 'minor' : 'major';
    return { root, scaleType };
  }

  pickTempo(): number {
    return 90 + Math.random() * 20;  // 90-110 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'gm_acoustic_grand_piano',
        attack: 0.01,
        decay: 0.4,
        sustain: 0.3,
        release: 1.2,
        lpf: 1400,
        gain: 0.26,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_acoustic_grand_piano',
        attack: 0.01,
        decay: 0.4,
        sustain: 0.3,
        release: 1.5,
        lpf: 3000,
        gain: 0.20,
        room: 0.35,
        pan: 0.5,
        octaveOffset: -1,
      },
      lead: {
        sound: 'gm_accordion',
        attack: 0.05,
        decay: 0.2,
        sustain: 0.6,
        release: 0.4,
        lpf: 2800,
        gain: 0.16,
        room: 0.35,
        pan: 0.55,
        octaveOffset: 0,
      },
      color: {
        sound: 'gm_celesta',
        attack: 0.005,
        release: 1.3,
        lpf: 3600,
        gain: 0.08,
        room: 0.55,
        pan: 0.45,
        octaveOffset: 1,
      },
      // no pulse — avril is drumless
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(AVRIL_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Lyrical, 4-5 notes, mixing long and short — question/answer shape.
    // Chord-tone indices: 0=root, 1=3rd, 2=5th, 3=root+oct.
    const cellPool = [
      { pitches: [0, 1, 2, 1],       rhythm: [1.0, 0.5, 0.5, 1.0] },        // 1-3-5-3 arch
      { pitches: [2, 1, 0, 1, 0],    rhythm: [0.5, 0.5, 0.5, 0.5, 1.0] },   // 5-3-1-3-1 falling question
      { pitches: [0, 2, 3, 2, 1],    rhythm: [0.5, 0.5, 0.75, 0.5, 1.0] },  // 1-5-8-5-3 climbing-falling
      { pitches: [1, 2, 3, 2],       rhythm: [0.75, 0.5, 0.5, 1.25] },      // 3-5-8-5 gentle climb
      { pitches: [0, 1, 0, 2, 1],    rhythm: [0.5, 0.5, 0.5, 0.75, 0.75] }, // 1-3-1-5-3 noodle
    ];
    const cell = pick(cellPool);
    return { pitches: [...cell.pitches], rhythm: [...cell.rhythm], length: cell.rhythm.reduce((a, b) => a + b, 0) };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        return { bars: 8,  activeRoles: new Set(['chord', 'color']),                         intensity: 0.30 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                 intensity: 0.50 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color']),         intensity: 0.75 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['chord', 'color']),                         intensity: 0.35 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color']),         intensity: 0.65 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // AABA — classic song form
    if (bars === 4) return [true, true, false, true];
    if (bars === 8) return [true, true, false, true, true, true, false, true];
    return Array.from({ length: bars }, (_, i) => i % 4 !== 2);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (sectionType === 'peak' && isLast) return 'closed';
    if (sectionType === 'breakdown') return 'open';
    if (isLast) return 'half';
    return 'open';
  }
}
