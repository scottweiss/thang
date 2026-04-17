/**
 * FlimComposer — Aphex Twin *Selected Ambient Works II* — fragile, childlike,
 * lullaby tones. Music box lead, celesta color, soft pad chords, sine sub.
 * No drums. Slow, bright, tension-free.
 *
 * 66-80 BPM. Major and lydian keys only. Delicate stepwise motifs.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FLIM_ROOTS: readonly NoteName[] = ['C', 'D', 'F', 'G', 'A', 'Bb'];

const FLIM_PROGRESSIONS: readonly Progression[] = [
  // I-IV-vi-V — pure diatonic warmth
  { degrees: [0, 3, 5, 4], qualities: ['maj',  'maj', 'min', 'maj'], barsPerChord: 1 },
  // I-vi-IV-I — gentle cradle
  { degrees: [0, 5, 3, 0], qualities: ['maj',  'min', 'maj', 'maj'], barsPerChord: 1 },
  // Iadd9-IVadd9 — two chords holding for 2 bars each
  { degrees: [0, 3],       qualities: ['add9', 'add9'],              barsPerChord: 2 },
  // I-iii-IV-V with add9 sparkle
  { degrees: [0, 2, 3, 4], qualities: ['add9', 'min', 'maj', 'maj'], barsPerChord: 1 },
  // I-V-vi-iii (pachelbel-ish)
  { degrees: [0, 4, 5, 2], qualities: ['maj',  'maj', 'min', 'min'], barsPerChord: 1 },
];

export class FlimComposer implements MoodComposer {
  name = 'flim';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    const root = pick(FLIM_ROOTS);
    const scaleType: ScaleType = Math.random() < 0.70 ? 'major' : 'lydian';
    return { root, scaleType };
  }

  pickTempo(): number {
    return 66 + Math.random() * 14;  // 66-80 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'sine',
        attack: 0.15,
        decay: 0.5,
        sustain: 0.6,
        release: 1.5,
        lpf: 500,
        gain: 0.22,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_pad_new_age',
        attack: 0.9,
        release: 2.5,
        lpf: 2000,
        gain: 0.14,
        room: 0.5,
        pan: 0.5,
        octaveOffset: -1,
      },
      lead: {
        sound: 'gm_music_box',
        attack: 0.005,
        decay: 0.3,
        sustain: 0.1,
        release: 1.8,
        lpf: 3400,
        gain: 0.18,
        room: 0.55,
        pan: 0.53,
        octaveOffset: 0,
      },
      color: {
        sound: 'gm_celesta',
        attack: 0.005,
        release: 1.6,
        lpf: 3800,
        gain: 0.07,
        room: 0.65,
        pan: 0.47,
        octaveOffset: 1,
      },
      // no pulse — flim is drumless
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(FLIM_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Delicate 3-4 note stepwise patterns. Chord-tone indices — everything
    // lands on chord tones so it reads as cradle-safe.
    const cellPool = [
      { pitches: [0, 2, 1, 0],    rhythm: [0.75, 0.75, 0.75, 0.75] },  // 1-5-3-1 gentle
      { pitches: [2, 1, 0],       rhythm: [1.0, 1.0, 1.0] },           // 5-3-1 settle
      { pitches: [0, 1, 2, 1],    rhythm: [0.5, 0.5, 0.5, 1.5] },      // 1-3-5-3 arch
      { pitches: [1, 2, 1, 0],    rhythm: [0.5, 0.5, 1.0, 1.0] },      // 3-5-3-1 lullaby
      { pitches: [0, 2, 3, 2],    rhythm: [0.5, 0.5, 1.0, 1.0] },      // 1-5-root+oct-5
    ];
    const cell = pick(cellPool);
    return { pitches: [...cell.pitches], rhythm: [...cell.rhythm], length: cell.rhythm.reduce((a, b) => a + b, 0) };
  }

  sectionShape(type: SectionType): SectionShape {
    // Flim never shouts — intensity capped at 0.55.
    switch (type) {
      case 'intro':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                 intensity: 0.25 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                 intensity: 0.35 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color']),         intensity: 0.55 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                 intensity: 0.30 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color']),         intensity: 0.45 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // Sparse statements — every other bar
    if (bars === 4) return [true, false, true, false];
    if (bars === 8) return [true, false, true, false, false, true, false, true];
    return Array.from({ length: bars }, (_, i) => i % 2 === 0);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (sectionType === 'peak' && isLast) return 'closed';
    if (isLast) return 'half';
    return 'open';
  }
}
