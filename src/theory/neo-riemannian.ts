/**
 * Neo-Riemannian theory — geometric transformations in chord space.
 *
 * Instead of thinking about chords in terms of Roman numerals (I, IV, V),
 * neo-Riemannian theory defines three basic transformations that move
 * between chords by changing a single note:
 *
 * - **P (Parallel)**: major ↔ minor (C major → C minor, only E changes)
 * - **R (Relative)**: major → relative minor (C major → A minor, only G→A)
 * - **L (Leading-tone)**: major → ??? (C major → E minor, only C→B)
 *
 * These can be chained: PRL, PLR, etc., creating smooth voice-leading
 * paths through harmonic space that sound beautiful but defy traditional
 * functional analysis. This is how film composers create those
 * emotionally evocative chord progressions that feel dreamlike.
 *
 * Application: during breakdowns and ambient sections, navigate chord
 * space via neo-Riemannian transformations instead of functional
 * harmony for a more colorful, floating quality.
 */

import type { Mood, Section, NoteName, ChordQuality } from '../types';

const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

const PC_TO_NOTE: NoteName[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export type NRTransform = 'P' | 'R' | 'L';

interface TriadResult {
  root: NoteName;
  quality: 'maj' | 'min';
}

/**
 * Apply the Parallel transformation: major ↔ minor (same root).
 * C major → C minor, D minor → D major.
 */
export function parallel(root: NoteName, quality: 'maj' | 'min'): TriadResult {
  return { root, quality: quality === 'maj' ? 'min' : 'maj' };
}

/**
 * Apply the Relative transformation: move to relative major/minor.
 * C major → A minor (down minor 3rd), A minor → C major (up minor 3rd).
 */
export function relative(root: NoteName, quality: 'maj' | 'min'): TriadResult {
  const pc = NOTE_TO_PC[root];
  if (pc === undefined) return { root, quality };

  if (quality === 'maj') {
    // Major → relative minor: root goes down 3 semitones
    const newPC = ((pc - 3) % 12 + 12) % 12;
    return { root: PC_TO_NOTE[newPC], quality: 'min' };
  } else {
    // Minor → relative major: root goes up 3 semitones
    const newPC = (pc + 3) % 12;
    return { root: PC_TO_NOTE[newPC], quality: 'maj' };
  }
}

/**
 * Apply the Leading-tone exchange: change the note that's a
 * half-step from the root (for major) or fifth (for minor).
 * C major → E minor, E minor → C major.
 */
export function leadingTone(root: NoteName, quality: 'maj' | 'min'): TriadResult {
  const pc = NOTE_TO_PC[root];
  if (pc === undefined) return { root, quality };

  if (quality === 'maj') {
    // Major: root descends by semitone, becomes minor
    // C major (C-E-G) → E minor (B-E-G)
    const newPC = (pc + 4) % 12; // the third becomes new root
    return { root: PC_TO_NOTE[newPC], quality: 'min' };
  } else {
    // Minor: fifth ascends by semitone, becomes major
    // E minor (E-G-B) → C major (E-G-C... reinterpreted as C-E-G)
    const newPC = ((pc - 4) % 12 + 12) % 12;
    return { root: PC_TO_NOTE[newPC], quality: 'maj' };
  }
}

/**
 * Apply a named transformation.
 */
export function applyTransform(
  root: NoteName,
  quality: 'maj' | 'min',
  transform: NRTransform
): TriadResult {
  switch (transform) {
    case 'P': return parallel(root, quality);
    case 'R': return relative(root, quality);
    case 'L': return leadingTone(root, quality);
  }
}

/**
 * Apply a chain of transformations (e.g., 'PRL' for film-score progressions).
 */
export function applyChain(
  root: NoteName,
  quality: 'maj' | 'min',
  chain: NRTransform[]
): TriadResult {
  let result: TriadResult = { root, quality };
  for (const t of chain) {
    result = applyTransform(result.root, result.quality, t);
  }
  return result;
}

/**
 * Calculate the "distance" between two triads in neo-Riemannian space.
 * Returns the minimum number of P/R/L transformations needed.
 * Distance 1 = smoothest transition, 3+ = dramatic leap.
 */
export function nrDistance(
  root1: NoteName, quality1: 'maj' | 'min',
  root2: NoteName, quality2: 'maj' | 'min'
): number {
  if (root1 === root2 && quality1 === quality2) return 0;

  // BFS through transformation space (max depth 4)
  const visited = new Set<string>();
  const queue: { root: NoteName; quality: 'maj' | 'min'; depth: number }[] = [
    { root: root1, quality: quality1, depth: 0 }
  ];
  visited.add(`${root1}${quality1}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= 4) continue;

    for (const t of ['P', 'R', 'L'] as NRTransform[]) {
      const next = applyTransform(current.root, current.quality, t);
      const key = `${next.root}${next.quality}`;
      if (next.root === root2 && next.quality === quality2) {
        return current.depth + 1;
      }
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ ...next, depth: current.depth + 1 });
      }
    }
  }

  return 5; // unreachable in 4 steps = very distant
}

/** How much each mood uses neo-Riemannian navigation (0-1) */
const NR_TENDENCY: Record<Mood, number> = {
  ambient:   0.45,  // floating, non-functional
  xtal:      0.40,  // dreamy transitions
  flim:      0.30,  // organic color changes
  avril:     0.25,  // film-score progressions
  downtempo: 0.20,  // smooth color
  lofi:      0.15,  // subtle
  syro:      0.12,  // IDM — some geometric harmony
  blockhead: 0.08,  // hip-hop — functional preferred
  disco:     0.05,  // functional
  trance:    0.03,  // very functional
};

/**
 * Whether to use neo-Riemannian navigation for next chord.
 */
export function shouldApplyNR(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const sectionMult = section === 'breakdown' ? 1.8
    : section === 'intro' ? 1.3
    : section === 'groove' ? 1.0
    : 0.5;
  const tendency = NR_TENDENCY[mood] * sectionMult;
  const hash = ((tick * 2654435761 + 12007) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Suggest a neo-Riemannian chord move from the current chord.
 * Picks a transformation that creates smooth voice-leading.
 *
 * @param root     Current chord root
 * @param quality  Current chord quality (mapped to maj/min)
 * @param mood     Current mood (influences transformation choice)
 * @param tick     Tick for determinism
 * @returns Suggested transformation and resulting chord
 */
export function suggestNRMove(
  root: NoteName,
  quality: ChordQuality,
  mood: Mood,
  tick: number
): { transform: NRTransform; result: TriadResult } {
  // Map complex qualities to maj/min for NR operations
  const simpleQuality: 'maj' | 'min' =
    quality === 'min' || quality === 'min7' || quality === 'min9' || quality === 'dim'
      ? 'min' : 'maj';

  // Weight transformations by mood character
  const weights: Record<Mood, Record<NRTransform, number>> = {
    ambient:   { P: 3, R: 2, L: 3 },  // leading tone = dreamy
    xtal:      { P: 2, R: 3, L: 3 },
    flim:      { P: 2, R: 2, L: 3 },
    avril:     { P: 3, R: 3, L: 2 },  // relative = songwriter
    downtempo: { P: 2, R: 3, L: 2 },
    lofi:      { P: 2, R: 3, L: 2 },
    syro:      { P: 3, R: 2, L: 3 },
    blockhead: { P: 3, R: 2, L: 2 },
    disco:     { P: 2, R: 3, L: 1 },
    trance:    { P: 2, R: 3, L: 1 },
  };

  const w = weights[mood];
  const transforms: NRTransform[] = ['P', 'R', 'L'];
  const total = transforms.reduce((s, t) => s + w[t], 0);
  const hash = ((tick * 65537 + 5881) >>> 0) % total;
  let cumulative = 0;
  let chosen: NRTransform = 'R';
  for (const t of transforms) {
    cumulative += w[t];
    if (hash < cumulative) { chosen = t; break; }
  }

  return {
    transform: chosen,
    result: applyTransform(root, simpleQuality, chosen),
  };
}

/**
 * Get NR tendency for a mood (for testing).
 */
export function nrTendency(mood: Mood): number {
  return NR_TENDENCY[mood];
}
