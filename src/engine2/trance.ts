/**
 * TranceComposer — anthemic minor-key electronic dance.
 *
 * Conventions: i-V-VI-IV progressions in natural minor, four-on-the-floor
 * drums, synth bass on every eighth note, soaring sawtooth lead, pad
 * swells between beats. 128-138 BPM.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType, PulsePattern } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const TRANCE_ROOTS: readonly NoteName[] = ['A', 'D', 'E', 'F', 'G', 'B', 'C'];

/** Anthemic minor progressions (degrees are in natural minor) */
const TRANCE_PROGRESSIONS: readonly Progression[] = [
  { degrees: [0, 5, 3, 4], qualities: ['min', 'maj', 'maj', 'maj'], barsPerChord: 1 },  // i-VI-IV-V  (e.g. Am-F-Dm-E)
  { degrees: [0, 4, 5, 3], qualities: ['min', 'maj', 'maj', 'maj'], barsPerChord: 1 },  // i-V-VI-IV
  { degrees: [5, 3, 0, 4], qualities: ['maj', 'maj', 'min', 'maj'], barsPerChord: 1 },  // VI-IV-i-V
  { degrees: [0, 3, 4, 0], qualities: ['min', 'maj', 'maj', 'min'], barsPerChord: 1 },  // i-IV-V-i
];

export class TranceComposer implements MoodComposer {
  name = 'trance';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    return { root: pick(TRANCE_ROOTS), scaleType: 'minor' };
  }

  pickTempo(): number {
    return 128 + Math.random() * 10;  // 128-138 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'gm_synth_bass_1',
        attack: 0.005,
        decay: 0.15,
        sustain: 0.1,
        release: 0.08,
        lpf: 1200,
        gain: 0.30,
        pan: 0.5,
        octaveOffset: -2,      // bass at octave 2
      },
      chord: {
        sound: 'gm_string_ensemble_1',
        attack: 0.15,
        release: 1.5,
        lpf: 3200,
        gain: 0.18,
        room: 0.35,
        pan: 0.5,
        octaveOffset: -1,      // strings at octave 3
      },
      lead: {
        sound: 'gm_lead_2_sawtooth',
        attack: 0.01,
        decay: 0.15,
        sustain: 0.7,
        release: 0.25,
        lpf: 3500,
        gain: 0.20,
        room: 0.30,
        delay: 0.25,
        pan: 0.52,
        octaveOffset: 0,       // lead at octave 4
      },
      color: {
        sound: 'gm_pad_sweep',
        attack: 1.2,
        release: 2.5,
        lpf: 2800,
        gain: 0.08,
        room: 0.55,
        pan: 0.5,
        octaveOffset: 0,
      },
      pulse: {
        kick: {
          sound: 'bd',
          attack: 0.001,
          release: 0.25,
          lpf: 3000,
          gain: 0.85,
          pan: 0.5,
        },
        snare: {
          sound: 'sd',
          attack: 0.002,
          release: 0.2,
          lpf: 4500,
          gain: 0.45,
          pan: 0.5,
          room: 0.2,
        },
        hat: {
          sound: 'hh',
          attack: 0.001,
          release: 0.06,
          gain: 0.30,
          pan: 0.55,
        },
        perc: {
          // Crash cymbal — peak-bar accent for anthemic lift
          sound: 'cr',
          attack: 0.001,
          release: 1.5,
          lpf: 6000,
          gain: 0.22,
          pan: 0.52,
        },
      },
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(TRANCE_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Trance hooks — repeating triadic phrases outlining the current chord.
    // Chord-tone indices: 0=root, 1=3rd, 2=5th, 3=root+oct, 4=3rd+oct.
    const hookPool = [
      [0, 1, 2, 1],   // 1-3-5-3 — classic triadic hook
      [0, 2, 1, 0],   // 1-5-3-1 — descending
      [0, 1, 0, 2],   // 1-3-1-5 — skipping
      [2, 1, 0, 1],   // 5-3-1-3 — from above
      [0, 1, 2, 3],   // 1-3-5-8 — ascending through octave
    ];
    const pitches = pick(hookPool);
    // Rhythm: eighth notes (0.5 beat each) — 4 eighths = 2 beats
    const rhythm = pitches.map(() => 0.5);
    const length = rhythm.reduce((a, b) => a + b, 0);
    return { pitches: [...pitches], rhythm, length };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.30 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color', 'pulse']),            intensity: 0.55 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.95 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['chord', 'lead', 'color']),                     intensity: 0.40 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.75 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // Trance leads repeat relentlessly — motif on every bar (but gated by section)
    return Array.from({ length: bars }, () => true);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (sectionType === 'peak' && isLast) return 'closed';
    if (sectionType === 'build' && isLast) return 'half';
    return 'open';
  }

  buildPulse(sectionType: SectionType, phraseIdx: number, _totalPhrases: number): PulsePattern | null {
    // Intro and breakdown have no pulse (returns null → renderer skips)
    if (sectionType === 'intro' || sectionType === 'breakdown') return null;

    // Four-on-the-floor: kick on every beat, snare on 2 & 4, hats on offbeats.
    // These strings are 1-bar Strudel step patterns at 4-beat resolution.
    // Peak's first phrase gets a crash — the anthemic "lift" moment.
    const crashThisPhrase = sectionType === 'peak' && phraseIdx === 0;
    return {
      kick:  'bd bd bd bd',
      snare: '~ sd ~ sd',
      hat:   '~ hh ~ hh ~ hh ~ hh',
      ...(crashThisPhrase ? { perc: 'cr ~ ~ ~ ~ ~ ~ ~' } : {}),  // crash on bar-1 downbeat
    };
  }
}
