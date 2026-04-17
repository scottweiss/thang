/**
 * engine2 — a clean-slate generative music model.
 *
 * Concepts are first-class: Piece > Section > Phrase > Motif. Mood is a
 * MoodComposer instance (not a string switch). Voicing declares which roles
 * are active per piece. The Performer turns a Phrase + Voicing into one
 * self-contained Strudel pattern (no post-processing regex).
 */

import type { NoteName, ScaleType, ChordQuality } from '../types';

/**
 * A voicing role. Five roles cover most music:
 *   bass   — low register, slow-moving, harmonic foundation
 *   chord  — midrange, sustained, harmonic filler
 *   lead   — melodic voice that carries the tune
 *   pulse  — drums / rhythmic percussion (optional)
 *   color  — ornaments, ambient texture, sparse high notes
 */
export type Role = 'bass' | 'chord' | 'lead' | 'pulse' | 'color';

export interface Instrument {
  /** Strudel sound name (soundfont id, 'sine'/'triangle'/etc, or synth preset) */
  sound: string;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  /** FM modulation index (for FM synths only) */
  fmIndex?: number;
  /** FM harmonicity ratio */
  fmH?: number;
  /** Low-pass filter cutoff in Hz */
  lpf?: number;
  /** Reverb room amount (0-1) */
  room?: number;
  /** Delay send (0-1) */
  delay?: number;
  /** Base gain for this role before per-note dynamics */
  gain: number;
  /** Pan position (0=left, 0.5=center, 1=right) */
  pan?: number;
  /** Octave offset — added to the base octave the performer picks for this role */
  octaveOffset?: number;
}

/**
 * The pulse role carries multiple independent drum voices. Each voice is
 * its own Instrument (different sample, different gain, different filter).
 */
export interface PulseVoicing {
  kick?: Instrument;
  snare?: Instrument;
  hat?: Instrument;
  perc?: Instrument;
}

/**
 * A drum pattern for one phrase. Each voice is a step string using Strudel
 * syntax — sample name at a step plays the hit, `~` is rest, `*N` multiplies.
 * One string covers one bar; patterns loop across the phrase.
 * Example kick for four-on-the-floor: `"bd bd bd bd"` (1 kick per quarter).
 */
export interface PulsePattern {
  kick?: string;
  snare?: string;
  hat?: string;
  perc?: string;
}

/** Which roles are active, and what instrument(s) play each */
export interface Voicing {
  bass?: Instrument;
  chord?: Instrument;
  lead?: Instrument;
  color?: Instrument;
  pulse?: PulseVoicing;
}

/**
 * A melodic cell — 2 to 5 pitches expressed as scale degrees (0 = tonic,
 * 1 = second, 2 = third, ..., 7 = octave tonic, 9 = second above octave).
 *
 * The rhythm array gives each pitch's duration in beats (1 = quarter
 * note, 0.5 = eighth, 2 = half). Rests between notes are NOT represented
 * here — the Performer decides placement within a bar.
 */
export interface Motif {
  pitches: number[];
  rhythm: number[];
  /** Total motif length in beats */
  length: number;
}

export type CadenceType = 'open' | 'half' | 'closed';

/**
 * A Phrase is a self-contained 4-bar (or 8-bar) musical statement with
 * its own chord progression and motivic content. When the piece advances,
 * it moves to the next Phrase — not the next tick.
 */
export interface Phrase {
  /** Phrase length in bars (typically 4) */
  bars: number;
  /** One chord per `barsPerChord` bars */
  barsPerChord: number;
  chordDegrees: number[];       // length = bars / barsPerChord
  chordQualities: ChordQuality[];
  /** Lead motif for this phrase */
  motif: Motif;
  /**
   * Which bar positions within the phrase get a motif statement.
   * For AABA over 4 bars: [true, true, false, true] (B = rest).
   */
  motifSlots: boolean[];
  /** How the phrase ends harmonically */
  cadence: CadenceType;
  /** Drum pattern — rendered if voicing.pulse is defined and section includes 'pulse' */
  pulse?: PulsePattern | null;
}

export type SectionType = 'intro' | 'build' | 'peak' | 'breakdown' | 'groove';

export interface SectionShape {
  bars: number;
  activeRoles: Set<Role>;
  /** Target dynamic level for this section (0-1, affects overall gain) */
  intensity: number;
}

export interface Section {
  type: SectionType;
  shape: SectionShape;
  phrases: Phrase[];
}

export interface Piece {
  key: { root: NoteName; scaleType: ScaleType };
  tempo: number;           // BPM
  voicing: Voicing;
  sections: Section[];
  /** Current position within the arc */
  currentSectionIdx: number;
  currentPhraseIdx: number;
  /** Pieces evolve — keep the MoodComposer around for new sections/phrases */
  moodName: string;
}
