import type { Mood } from '../types';

/**
 * Harmonic distance reverb — reverb depth responds to how far the current
 * chord is from the tonic in circle-of-fifths space.
 * Near-tonic chords sound close/dry, distant chords sound far/wet.
 * Models the psychoacoustic association of "tonal distance" with "spatial distance."
 */

const moodDepth: Record<Mood, number> = {
  ambient: 0.60,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.25,
  avril: 0.40,
  xtal: 0.55,
  syro: 0.35,
  blockhead: 0.20,
  flim: 0.45,
  disco: 0.15,
};

const noteToPC: Record<string, number> = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};

/** Circle-of-fifths distance between two pitch classes */
function fifthsDistance(a: string, b: string): number {
  const pcA = noteToPC[a] ?? 0;
  const pcB = noteToPC[b] ?? 0;
  // Count steps around circle of fifths
  let dist = 0;
  let curr = pcA;
  for (let i = 0; i < 12; i++) {
    if (curr === pcB) { dist = i; break; }
    curr = (curr + 7) % 12;
    dist = i + 1;
  }
  // Take shorter path
  return Math.min(dist, 12 - dist);
}

/**
 * Room/reverb multiplier based on harmonic distance.
 * chordRoot: current chord root note name
 * scaleRoot: tonic/home key root
 * Returns 0.95-1.08 range — distant chords get more reverb.
 */
export function distanceReverbGain(
  chordRoot: string,
  scaleRoot: string,
  mood: Mood,
): number {
  const dist = fifthsDistance(chordRoot, scaleRoot);
  const depth = moodDepth[mood];
  // Distance 0 (tonic) → dry, distance 6 (tritone) → wet
  const normalized = dist / 6; // 0-1
  const adjustment = (normalized - 0.3) * depth * 0.10;
  return Math.max(0.95, Math.min(1.08, 1.0 + adjustment));
}

/** Per-mood reverb depth for testing */
export function reverbDepthStrength(mood: Mood): number {
  return moodDepth[mood];
}
