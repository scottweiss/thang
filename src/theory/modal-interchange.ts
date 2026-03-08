import type { ScaleType, ChordQuality } from '../types';

export interface BorrowedChord {
  degree: number;         // scale degree (0-6)
  quality: ChordQuality;  // chord quality to substitute
  source: string;         // where it's borrowed from
  tension: number;        // how much tension this adds (0-1)
}

// Classic borrowed chords from parallel modes
const MAJOR_BORROWS: BorrowedChord[] = [
  { degree: 3, quality: 'min',  source: 'parallel minor iv',   tension: 0.4 },
  { degree: 5, quality: 'maj',  source: 'parallel minor bVI',  tension: 0.5 },
  { degree: 6, quality: 'dom7', source: 'parallel minor bVII', tension: 0.6 },
  { degree: 1, quality: 'min',  source: 'dorian ii',           tension: 0.3 },
  { degree: 0, quality: 'dom7', source: 'mixolydian I7',       tension: 0.35 },
];

const MINOR_BORROWS: BorrowedChord[] = [
  { degree: 3, quality: 'maj',  source: 'parallel major IV',   tension: 0.3 },
  { degree: 4, quality: 'dom7', source: 'parallel major V7',   tension: 0.5 },
  { degree: 0, quality: 'maj',  source: 'picardy third I',     tension: 0.6 },
  { degree: 5, quality: 'maj',  source: 'natural minor VI',    tension: 0.2 },
];

/**
 * Get available borrowed chords for the given scale type.
 * These are chords from parallel/related modes that add harmonic color
 * without full key modulation.
 */
export function getBorrowedChords(scaleType: ScaleType): BorrowedChord[] {
  switch (scaleType) {
    case 'major':
      return MAJOR_BORROWS;
    case 'minor':
    case 'aeolian':
      return MINOR_BORROWS;
    case 'dorian':
      return MINOR_BORROWS.filter(b => b.source !== 'dorian ii');
    case 'mixolydian':
      return MAJOR_BORROWS.filter(b => b.source !== 'mixolydian I7');
    default:
      return [];
  }
}
