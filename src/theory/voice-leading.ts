import { noteIndex } from './scales';

// Parse "C#4" into { note, octave, midiApprox }
function parseNote(noteStr: string): { name: string; octave: number; midi: number } {
  const match = noteStr.match(/^([A-G](?:#|b)?)(\d)$/);
  if (!match) return { name: noteStr, octave: 3, midi: 60 };
  const name = match[1];
  const octave = parseInt(match[2]);
  const midi = octave * 12 + noteIndex(name as any) + 12; // +12 so C0 = 12
  return { name, octave, midi };
}

/** Parse a note string to MIDI number */
export function parseMidi(noteStr: string): number {
  return parseNote(noteStr).midi;
}

function midiToNote(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor((midi - 12) / 12);
  const noteIdx = ((midi - 12) % 12 + 12) % 12;
  return `${noteNames[noteIdx]}${octave}`;
}

/**
 * Voice leading cost between two voicings.
 * Lower = smoother. Penalizes large jumps and parallel fifths/octaves.
 */
export function voiceLeadingCost(prev: string[], next: string[]): number {
  const prevMidi = prev.map(parseMidi);
  const nextMidi = next.map(parseMidi);
  const len = Math.min(prevMidi.length, nextMidi.length);

  // Total semitone distance
  let totalDistance = 0;
  for (let i = 0; i < len; i++) {
    totalDistance += Math.abs(prevMidi[i] - nextMidi[i]);
  }

  // Penalty for parallel fifths/octaves (classical voice leading rule)
  let parallelPenalty = 0;
  for (let i = 0; i < len - 1; i++) {
    for (let j = i + 1; j < len; j++) {
      const prevInterval = Math.abs(prevMidi[i] - prevMidi[j]) % 12;
      const nextInterval = Math.abs(nextMidi[i] - nextMidi[j]) % 12;
      // Both voices move to a perfect fifth or octave in parallel
      if ((prevInterval === 7 && nextInterval === 7) ||
          (prevInterval === 0 && nextInterval === 0)) {
        // Only penalize if both voices actually moved
        if (prevMidi[i] !== nextMidi[i] && prevMidi[j] !== nextMidi[j]) {
          parallelPenalty += 4;
        }
      }
    }
  }

  // Bonus for contrary motion (voices moving in opposite directions)
  let contraryBonus = 0;
  for (let i = 0; i < len - 1; i++) {
    const motionA = nextMidi[i] - prevMidi[i];
    const motionB = nextMidi[i + 1] - prevMidi[i + 1];
    if (motionA !== 0 && motionB !== 0 && Math.sign(motionA) !== Math.sign(motionB)) {
      contraryBonus += 1;
    }
  }

  return totalDistance + parallelPenalty - contraryBonus;
}

/**
 * Find the voicing of newChordNotes that minimizes voice leading cost
 * from prevNotes. Evaluates candidate voicings and picks the best.
 */
export function smoothVoicing(
  prevNotes: string[], newChordNotes: string[], range: [number, number] = [48, 84]
): string[] {
  if (prevNotes.length === 0) return newChordNotes;

  const newParsed = newChordNotes.map(n => parseNote(n));

  // For each chord tone, find all possible octave placements within range
  const candidates: number[][] = newParsed.map(n => {
    const pitchClass = noteIndex(n.name as any);
    const options: number[] = [];
    for (let oct = 1; oct <= 7; oct++) {
      const midi = oct * 12 + pitchClass + 12;
      if (midi >= range[0] && midi <= range[1]) {
        options.push(midi);
      }
    }
    return options.length > 0 ? options : [n.midi];
  });

  // For 3-4 voices, evaluate all combinations (manageable search space)
  const voiceCount = candidates.length;
  let bestVoicing: number[] | null = null;
  let bestCost = Infinity;

  // Generate all combinations of octave placements
  const combos = cartesianProduct(candidates);

  // Limit search to first 200 combos to avoid performance issues
  const maxCombos = Math.min(combos.length, 200);
  for (let i = 0; i < maxCombos; i++) {
    const combo = combos[i];
    const sorted = [...combo].sort((a, b) => a - b);
    const asNotes = sorted.map(midiToNote);
    const cost = voiceLeadingCost(prevNotes, asNotes);
    if (cost < bestCost) {
      bestCost = cost;
      bestVoicing = sorted;
    }
  }

  if (!bestVoicing) {
    // Fallback: keep existing greedy approach
    return greedyVoicing(prevNotes, candidates);
  }

  return bestVoicing.map(midiToNote);
}

/** Cartesian product of arrays (all combinations) */
function cartesianProduct(arrays: number[][]): number[][] {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);
  const result: number[][] = [];
  for (const item of first) {
    for (const combo of restProduct) {
      result.push([item, ...combo]);
    }
  }
  return result;
}

/** Greedy fallback voicing */
function greedyVoicing(prevNotes: string[], candidates: number[][]): string[] {
  const prevMidi = prevNotes.map(parseMidi);
  const result: number[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const target = i < prevMidi.length ? prevMidi[i] : prevMidi[prevMidi.length - 1];
    let bestPitch = candidates[i][0];
    let bestDist = Math.abs(bestPitch - target);
    for (const pitch of candidates[i]) {
      const dist = Math.abs(pitch - target);
      if (dist < bestDist) {
        bestDist = dist;
        bestPitch = pitch;
      }
    }
    result.push(bestPitch);
  }
  result.sort((a, b) => a - b);
  return result.map(midiToNote);
}
