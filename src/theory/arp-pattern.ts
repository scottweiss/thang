/**
 * Arp pattern generation — interval-based arpeggio sequences.
 *
 * Beyond simple up/down arpeggios, real music uses sophisticated
 * note-ordering patterns that create distinct characters:
 *
 * - **Thirds**: Skip every other note (1-3-5-7 → creates compound motion)
 * - **Alberti**: Classic keyboard pattern (1-5-3-5 repeating)
 * - **Pedal**: Alternates between a fixed note and a moving line
 * - **Zigzag**: Steps up then back (1-2-1-3-2-4-3-5...)
 * - **Mirror**: Up then exact reverse (not just updown which reverses middle)
 * - **Scatter**: Non-sequential jumps through the note pool
 *
 * Each pattern takes a pool of notes and returns an ordered sequence
 * for use in step-based pattern building.
 */

import type { Section, Mood } from '../types';

export type ArpStyle =
  | 'up' | 'down' | 'updown' | 'broken'
  | 'thirds' | 'alberti' | 'pedal' | 'zigzag' | 'mirror' | 'scatter';

/**
 * Generate an arp sequence from a note pool using the specified style.
 *
 * @param notes  Available notes (sorted low to high)
 * @param style  Arp pattern style
 * @param length Target sequence length
 * @returns Ordered note sequence
 */
export function generateArpSequence(
  notes: string[],
  style: ArpStyle,
  length: number
): string[] {
  if (notes.length === 0) return [];
  if (notes.length === 1) return new Array(length).fill(notes[0]);

  switch (style) {
    case 'up':
      return sequenceUp(notes, length);

    case 'down':
      return sequenceDown(notes, length);

    case 'updown':
      return sequenceUpDown(notes, length);

    case 'broken':
      return sequenceBroken(notes, length);

    case 'thirds':
      return sequenceThirds(notes, length);

    case 'alberti':
      return sequenceAlberti(notes, length);

    case 'pedal':
      return sequencePedal(notes, length);

    case 'zigzag':
      return sequenceZigzag(notes, length);

    case 'mirror':
      return sequenceMirror(notes, length);

    case 'scatter':
      return sequenceScatter(notes, length);

    default:
      return sequenceUp(notes, length);
  }
}

function sequenceUp(notes: string[], length: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(notes[i % notes.length]);
  }
  return result;
}

function sequenceDown(notes: string[], length: number): string[] {
  const reversed = [...notes].reverse();
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(reversed[i % reversed.length]);
  }
  return result;
}

function sequenceUpDown(notes: string[], length: number): string[] {
  // Up then down, excluding repeated endpoints
  const cycle = [...notes, ...notes.slice(1, -1).reverse()];
  if (cycle.length === 0) return sequenceUp(notes, length);
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(cycle[i % cycle.length]);
  }
  return result;
}

function sequenceBroken(notes: string[], length: number): string[] {
  // Pseudo-random ordering using deterministic shuffle
  const shuffled = [...notes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1); // deterministic "shuffle"
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  return result;
}

/**
 * Thirds: skip every other note (compound intervals).
 * From [C, D, E, F, G, A] → [C, E, G, D, F, A] (1st, 3rd, 5th, 2nd, 4th, 6th)
 */
function sequenceThirds(notes: string[], length: number): string[] {
  const n = notes.length;
  const reordered: string[] = [];
  // First pass: every other note starting from 0
  for (let i = 0; i < n; i += 2) {
    reordered.push(notes[i]);
  }
  // Second pass: every other note starting from 1
  for (let i = 1; i < n; i += 2) {
    reordered.push(notes[i]);
  }
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(reordered[i % reordered.length]);
  }
  return result;
}

/**
 * Alberti bass: classic keyboard accompaniment pattern.
 * From [C, E, G] → [C, G, E, G] repeating (low-high-mid-high)
 */
function sequenceAlberti(notes: string[], length: number): string[] {
  const n = notes.length;
  if (n < 3) return sequenceUpDown(notes, length);

  const low = notes[0];
  const mid = notes[Math.floor(n / 2)];
  const high = notes[n - 1];
  const cycle = [low, high, mid, high];

  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(cycle[i % cycle.length]);
  }
  return result;
}

/**
 * Pedal: alternates between a fixed bass note and ascending upper notes.
 * From [C, E, G, B] → [C, E, C, G, C, B] (root punctuates between each)
 */
function sequencePedal(notes: string[], length: number): string[] {
  const pedal = notes[0]; // root as pedal note
  const moving = notes.slice(1);
  if (moving.length === 0) return new Array(length).fill(pedal);

  const result: string[] = [];
  let movIdx = 0;
  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      result.push(pedal);
    } else {
      result.push(moving[movIdx % moving.length]);
      movIdx++;
    }
  }
  return result;
}

/**
 * Zigzag: steps up then back, creating a wave motion.
 * From [C, D, E, F, G] → [C, D, C, E, D, F, E, G] (up 1, back 1, up 2, back 1...)
 */
function sequenceZigzag(notes: string[], length: number): string[] {
  const result: string[] = [];
  let idx = 0;
  let forward = true;

  for (let i = 0; i < length; i++) {
    result.push(notes[Math.max(0, Math.min(notes.length - 1, idx))]);
    if (forward) {
      idx++;
      if (idx >= notes.length) {
        idx = notes.length - 2;
        forward = false;
      }
    } else {
      idx--;
      if (idx < 0) {
        idx = 1;
        forward = true;
      }
    }
  }
  return result;
}

/**
 * Mirror: up then exact reverse (like updown but includes endpoints).
 * From [C, E, G] → [C, E, G, G, E, C]
 */
function sequenceMirror(notes: string[], length: number): string[] {
  const cycle = [...notes, ...[...notes].reverse()];
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(cycle[i % cycle.length]);
  }
  return result;
}

/**
 * Scatter: non-sequential jumps through the note pool.
 * Creates wide intervals by jumping across the pool.
 * From [C, D, E, F, G, A] → [C, F, D, G, E, A] (jump by ~half the pool size)
 */
function sequenceScatter(notes: string[], length: number): string[] {
  const n = notes.length;
  const jump = Math.max(2, Math.floor(n / 2));
  const reordered: string[] = [];
  const used = new Set<number>();

  let idx = 0;
  while (reordered.length < n) {
    if (!used.has(idx)) {
      reordered.push(notes[idx]);
      used.add(idx);
    }
    idx = (idx + jump) % n;
    // Safety: if we loop back to already-used positions
    if (used.has(idx)) {
      for (let i = 0; i < n; i++) {
        if (!used.has(i)) { idx = i; break; }
      }
    }
  }

  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(reordered[i % reordered.length]);
  }
  return result;
}

/**
 * Choose arp styles appropriate for a mood and section.
 * Returns a weighted list to pick from.
 */
export function moodArpStyles(mood: Mood, section: Section): ArpStyle[] {
  // Base styles per mood character
  const moodStyles: Record<Mood, ArpStyle[]> = {
    ambient:   ['pedal', 'up', 'mirror'],
    downtempo: ['alberti', 'updown', 'thirds', 'zigzag'],
    lofi:      ['broken', 'alberti', 'thirds', 'pedal'],
    trance:    ['up', 'updown', 'zigzag', 'thirds'],
    avril:     ['alberti', 'pedal', 'up', 'mirror'],
    xtal:      ['pedal', 'mirror', 'up', 'broken'],
    syro:      ['scatter', 'broken', 'zigzag', 'thirds'],
    blockhead: ['broken', 'scatter', 'alberti', 'thirds'],
    flim:      ['alberti', 'pedal', 'up', 'mirror'],
    disco:     ['up', 'updown', 'alberti', 'zigzag'],
  };

  // Section modifiers: some styles work better in certain sections
  const styles = [...moodStyles[mood]];
  if (section === 'build' && !styles.includes('zigzag')) {
    styles.push('zigzag'); // zigzag creates momentum
  }
  if (section === 'breakdown' && !styles.includes('pedal')) {
    styles.push('pedal'); // pedal creates space
  }
  if (section === 'peak' && !styles.includes('scatter')) {
    styles.push('scatter'); // scatter creates energy
  }

  return styles;
}
