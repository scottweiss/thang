import type { Mood } from '../types';

/* ── Chromatic pitch utilities (self-contained) ──────────────────── */

const NOTE_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/** Strip octave, return semitone index (0-11). */
function pitchClass(note: string): number {
  const name = noteName(note);
  return NOTE_INDEX[name] ?? 0;
}

/** Minimum distance around the chromatic circle. */
function semitoneDist(a: number, b: number): number {
  const diff = Math.abs(a - b) % 12;
  return Math.min(diff, 12 - diff);
}

/** Extract octave digit from a note string like "C#4". */
function octaveOf(note: string): string {
  const m = note.match(/(\d+)$/);
  return m ? m[1] : '4';
}

/** Strip the octave, returning just the note name (e.g. "C#"). */
function noteName(note: string): string {
  return note.replace(/\d+$/, '');
}

/* ── Exported functions ──────────────────────────────────────────── */

/**
 * Extract positioned notes from a `note("C4 E4 ~ G4")` string.
 * Rests (`~`) are skipped; their positions are still counted.
 */
export function extractNotes(code: string): { index: number; note: string }[] {
  const m = code.match(/note\("([^"]+)"\)/);
  if (!m) return [];
  const tokens = m[1].split(/\s+/);
  const result: { index: number; note: string }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== '~' && tokens[i] !== '') {
      result.push({ index: i, note: tokens[i] });
    }
  }
  return result;
}

/**
 * A note clashes if it is 2+ semitones from ALL chord tones.
 * Notes within 1 semitone of any chord tone are safe (leading tones, neighbors).
 */
export function isClash(note: string, chordTones: string[]): boolean {
  const pc = pitchClass(note);
  return chordTones.every(ct => {
    const ctPc = NOTE_INDEX[ct] ?? pitchClass(ct);
    return semitoneDist(pc, ctPc) >= 2;
  });
}

/**
 * Move a clashing note to the nearest chord tone, preserving octave.
 * If the note is already safe (chord tone or neighbor), return it unchanged.
 */
export function nudgeNote(note: string, chordTones: string[]): string {
  if (!isClash(note, chordTones)) return note;

  const pc = pitchClass(note);
  const oct = octaveOf(note);
  let bestDist = Infinity;
  let bestName = chordTones[0];

  for (const ct of chordTones) {
    const ctPc = NOTE_INDEX[ct] ?? pitchClass(ct);
    const d = semitoneDist(pc, ctPc);
    if (d < bestDist) {
      bestDist = d;
      bestName = ct;
    }
  }

  return bestName + oct;
}

/**
 * Map notes from old chord tones to nearest new chord tones (for arp voice-leading).
 * Preserves octave.
 */
export function remapChordTones(
  notes: string[],
  oldChord: string[],
  newChord: string[],
): string[] {
  return notes.map(n => {
    const pc = pitchClass(n);
    const oct = octaveOf(n);

    // Find the nearest old chord tone
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < oldChord.length; i++) {
      const d = semitoneDist(pc, NOTE_INDEX[oldChord[i]] ?? 0);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    // Map to the corresponding new chord tone (clamp index if sizes differ)
    const newIdx = Math.min(bestIdx, newChord.length - 1);
    return newChord[newIdx] + oct;
  });
}

/**
 * Apply minimal-clash adjustment to a cached Strudel pattern string.
 * Only nudges notes that clash; keeps everything else (rests, chaining, etc.).
 */
export function adaptMelodyToChord(cachedCode: string, newChordTones: string[]): string {
  const m = cachedCode.match(/note\("([^"]+)"\)/);
  if (!m) return cachedCode;

  const tokens = m[1].split(/\s+/);
  const adapted = tokens.map(token => {
    if (token === '~') return token;
    if (isClash(token, newChordTones)) {
      return nudgeNote(token, newChordTones);
    }
    return token;
  });

  return cachedCode.replace(m[0], `note("${adapted.join(' ')}")`);
}

/**
 * Remap all chord tones in an arp pattern string.
 */
export function adaptArpToChord(
  cachedCode: string,
  oldChordTones: string[],
  newChordTones: string[],
): string {
  const m = cachedCode.match(/note\("([^"]+)"\)/);
  if (!m) return cachedCode;

  const tokens = m[1].split(/\s+/);
  const adapted = tokens.map(token => {
    if (token === '~') return token;
    const oct = octaveOf(token);
    const pc = pitchClass(token);

    // Find nearest old chord tone
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < oldChordTones.length; i++) {
      const d = semitoneDist(pc, NOTE_INDEX[oldChordTones[i]] ?? 0);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    const newIdx = Math.min(bestIdx, newChordTones.length - 1);
    return newChordTones[newIdx] + oct;
  });

  return cachedCode.replace(m[0], `note("${adapted.join(' ')}")`);
}

/**
 * Swap root note name in a drone pattern string.
 */
export function adaptDroneToChord(
  cachedCode: string,
  oldRoot: string,
  newRoot: string,
): string {
  const m = cachedCode.match(/note\("([^"]+)"\)/);
  if (!m) return cachedCode;
  const escaped = oldRoot.replace(/[#]/g, '\\$&');
  const swapped = m[1].replace(new RegExp(escaped + '(\\d)', 'g'), newRoot + '$1');
  return cachedCode.replace(m[1], swapped);
}

/**
 * Mood-specific phrase repeat count.
 * Returns a random integer within the mood's range [min, max].
 */
const REPEAT_RANGES: Record<Mood, [number, number]> = {
  trance:    [5, 6],
  disco:     [4, 5],
  flim:      [4, 5],
  blockhead: [3, 4],
  avril:     [3, 4],
  downtempo: [2, 3],
  lofi:      [2, 3],
  xtal:      [2, 3],
  syro:      [1, 2],
  ambient:   [1, 1],
};

export function phraseRepeatCount(mood: Mood): number {
  const [min, max] = REPEAT_RANGES[mood];
  return min + Math.floor(Math.random() * (max - min + 1));
}
