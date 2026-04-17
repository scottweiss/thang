/**
 * PlantasiaComposer — the Plantasia identity in one file.
 *
 * Inspired by Mort Garson's *Mother Earth's Plantasia* (1976 Moog).
 * Warm, childlike, diatonic, singable. Plain major keys, I-V-vi-IV style
 * progressions, two-or-three-note stepwise motifs, no drums, warm-pad
 * harmony with celesta sprinkles.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Bright, warm keys typical of Plantasia-era Moog records */
const PLANTASIA_ROOTS: readonly NoteName[] = ['C', 'D', 'F', 'G', 'A', 'Bb', 'Eb'];

/** Classic diatonic loops in major — every progression resolves and loops cleanly */
const PLANTASIA_PROGRESSIONS: readonly Progression[] = [
  { degrees: [0, 4, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'],  barsPerChord: 1 },  // I-V-vi-IV
  { degrees: [0, 3, 4, 0], qualities: ['maj', 'maj', 'maj', 'maj'],  barsPerChord: 1 },  // I-IV-V-I
  { degrees: [0, 5, 3, 4], qualities: ['maj', 'min', 'maj', 'maj'],  barsPerChord: 1 },  // I-vi-IV-V
  { degrees: [0, 3, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'],  barsPerChord: 1 },  // I-IV-vi-IV
  { degrees: [0, 2, 3, 4], qualities: ['add9', 'min', 'maj', 'maj'], barsPerChord: 1 },  // Iadd9-iii-IV-V
  { degrees: [0, 4, 5, 3], qualities: ['add9', 'maj', 'min', 'add9'], barsPerChord: 1 }, // Iadd9-V-vi-IVadd9
];

export class PlantasiaComposer implements MoodComposer {
  name = 'plantasia';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    return { root: pick(PLANTASIA_ROOTS), scaleType: 'major' };
  }

  pickTempo(): number {
    // 92–98 BPM — Plantasia's unhurried walking pace
    return 92 + Math.random() * 6;
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'sine',
        attack: 0.08,
        decay: 0.4,
        sustain: 0.7,
        release: 1.2,
        lpf: 600,
        gain: 0.28,
        pan: 0.5,
        octaveOffset: -2,      // bass sits at octave 2 (relative to base octave 4)
      },
      chord: {
        sound: 'gm_pad_warm',
        attack: 0.35,
        release: 1.8,
        lpf: 2200,
        gain: 0.16,
        room: 0.35,
        pan: 0.5,
        octaveOffset: -1,      // chords at octave 3
      },
      lead: {
        // Moog-era voice lead — rounder and more vocal than saw, fits the Plantasia nostalgia
        sound: 'gm_lead_6_voice',
        attack: 0.05,
        decay: 0.25,
        sustain: 0.55,
        release: 0.35,
        lpf: 2800,
        gain: 0.22,
        room: 0.25,
        pan: 0.55,
        octaveOffset: 0,       // lead at octave 4
      },
      color: {
        // Marimba — wooden, percussive, organic sparkle (frees celesta for avril/flim identity)
        sound: 'gm_marimba',
        attack: 0.005,
        release: 0.9,
        lpf: 3200,
        gain: 0.09,
        room: 0.45,
        pan: 0.45,
        octaveOffset: 1,       // marimba pings an octave above (octave 5)
      },
      // no pulse role — Plantasia has no drums
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(PLANTASIA_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // A 2–3 note cell stepping through chord tones starting on root/3rd/5th.
    // Chord-tone semantics: pitch 0=root, 1=3rd, 2=5th, 3=root+oct, 4=3rd+oct.
    const cellSize = 2 + Math.floor(Math.random() * 2);         // 2 or 3
    const startPool: number[] = [0, 1, 2, 3, 4];                // root, 3rd, 5th, root+oct, 3rd+oct
    const pitches: number[] = [startPool[Math.floor(Math.random() * startPool.length)]];
    // Pick a direction and mostly stay in it (creates arches and tumbles)
    const dir = Math.random() < 0.55 ? 1 : -1;
    for (let i = 1; i < cellSize; i++) {
      // mostly move 1 chord tone (root→3rd, 3rd→5th, etc), occasional skip
      const step = Math.random() < 0.75 ? 1 : 2;
      // occasional direction flip
      const thisDir = Math.random() < 0.2 ? -dir : dir;
      let next = pitches[i - 1] + step * thisDir;
      // Clamp to a friendly range: 0 (tonic) up to 5 (5th two octaves up)
      next = Math.max(0, Math.min(5, next));
      pitches.push(next);
    }
    const rhythm = cellSize === 2 ? [1, 1] : [1, 0.5, 0.5];
    const length = rhythm.reduce((a, b) => a + b, 0);
    return { pitches, rhythm, length };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                 intensity: 0.35 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'lead', 'color']),         intensity: 0.55 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color']),         intensity: 0.75 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['bass', 'color']),                          intensity: 0.30 };
      case 'groove':
        return { bars: 12, activeRoles: new Set(['bass', 'chord', 'lead', 'color']),         intensity: 0.60 };
    }
  }

  motifSlots(bars: number): boolean[] {
    if (bars === 4) {
      // AABA: statement, statement, rest (gives the tune breath), statement
      return [true, true, false, true];
    }
    if (bars === 8) {
      // AABA over 8 bars: statement, statement, rest, statement, statement, statement, rest, statement
      return [true, true, false, true, true, true, false, true];
    }
    // Default: every other bar
    return Array.from({ length: bars }, (_, i) => i % 2 === 0);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (sectionType === 'peak' && isLast) return 'closed';
    if (sectionType === 'breakdown') return 'open';
    if (isLast) return 'half';
    return 'open';
  }
}
