/**
 * Performer — turns a Phrase + Voicing + Key into one self-contained Strudel
 * `stack(...)` pattern that loops as one full phrase (4 bars).
 *
 * Each role renders independently. No post-processing regex. If you want
 * something to sound different, change its Instrument in the Voicing.
 */

import type { NoteName, ScaleType, ChordQuality } from '../types';
import { getScaleNotes, noteIndex, noteFromIndex } from '../theory/scales';
import type { Phrase, Voicing, Instrument, Motif, PulseVoicing, PulsePattern } from './types';

/** Clamp to GM soundfont safe range (2-6) */
function clampOctave(n: number): number {
  return Math.max(2, Math.min(6, n));
}

/**
 * Map a scale degree (0-based, 0 = tonic) to a concrete note name + octave,
 * given the key root and scale type and a base octave.
 *
 * Degrees above 6 wrap up an octave; degrees below 0 wrap down.
 */
function degreeToNote(
  degree: number,
  scaleNotes: NoteName[],
  baseOctave: number
): string {
  const len = scaleNotes.length;  // 7 for diatonic scales
  const octShift = Math.floor(degree / len);
  const idx = ((degree % len) + len) % len;
  const note = scaleNotes[idx];
  // The note may naturally sit above or below the "root" in pitch order;
  // the octave label increments at C, so we compensate.
  const rootIdx = noteIndex(scaleNotes[0]);
  const noteIdx = noteIndex(note);
  const octaveLabelBump = noteIdx < rootIdx ? 1 : 0;
  return `${note}${clampOctave(baseOctave + octShift + octaveLabelBump)}`;
}

/** Build a triad/tetrad for a chord root and quality at a given octave */
const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  maj:  [0, 4, 7],
  min:  [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim:  [0, 3, 6],
  aug:  [0, 4, 8],
  add9: [0, 4, 7, 14],
  min9: [0, 3, 7, 10, 14],
};

function chordVoicing(rootNote: NoteName, quality: ChordQuality, baseOctave: number): string[] {
  const rootIdx = noteIndex(rootNote);
  return CHORD_INTERVALS[quality].map(iv => {
    const pitchIdx = rootIdx + iv;
    const oct = baseOctave + Math.floor(pitchIdx / 12);
    const name = noteFromIndex(pitchIdx);
    return `${name}${clampOctave(oct)}`;
  });
}

/** Decorate a note/silence pattern with instrument params. */
function decorate(pattern: string, inst: Instrument, orbit: number): string {
  const parts: string[] = [pattern];
  parts.push(`.sound("${inst.sound}")`);
  if (inst.attack  !== undefined) parts.push(`.attack(${inst.attack})`);
  if (inst.decay   !== undefined) parts.push(`.decay(${inst.decay})`);
  if (inst.sustain !== undefined) parts.push(`.sustain(${inst.sustain})`);
  if (inst.release !== undefined) parts.push(`.release(${inst.release})`);
  if (inst.fmIndex !== undefined) parts.push(`.fm(${inst.fmIndex})`);
  if (inst.fmH     !== undefined) parts.push(`.fmh(${inst.fmH})`);
  if (inst.lpf     !== undefined) parts.push(`.lpf(${Math.round(inst.lpf)})`);
  if (inst.room    !== undefined) parts.push(`.room(${inst.room})`);
  if (inst.delay   !== undefined) parts.push(`.delay(${inst.delay})`);
  parts.push(`.gain(${inst.gain.toFixed(3)})`);
  if (inst.pan     !== undefined) parts.push(`.pan(${inst.pan})`);
  parts.push(`.orbit(${orbit})`);
  return parts.join('\n  ');
}

/** Render the bass: chord root per bar, whole-note feel */
function renderBass(phrase: Phrase, scaleNotes: NoteName[], inst: Instrument, orbit: number): string {
  const baseOct = 4 + (inst.octaveOffset ?? 0);
  // One note per bar; .slow(phrase.bars) stretches one cycle across all bars
  const noteNames: string[] = [];
  for (let bar = 0; bar < phrase.bars; bar++) {
    const chordIdx = Math.floor(bar / phrase.barsPerChord);
    const degree = phrase.chordDegrees[chordIdx % phrase.chordDegrees.length];
    const rootNote = scaleNotes[degree % scaleNotes.length];
    const rootIdx = noteIndex(scaleNotes[0]);
    const noteIdx = noteIndex(rootNote);
    const octBump = noteIdx < rootIdx ? 1 : 0;
    noteNames.push(`${rootNote}${clampOctave(baseOct + octBump)}`);
  }
  return decorate(`note("${noteNames.join(' ')}").slow(${phrase.bars})`, inst, orbit);
}

/** Render the chord comping: one triad per bar */
function renderChord(phrase: Phrase, scaleNotes: NoteName[], inst: Instrument, orbit: number): string {
  const baseOct = 4 + (inst.octaveOffset ?? 0);
  const chordStrs: string[] = [];
  for (let bar = 0; bar < phrase.bars; bar++) {
    const chordIdx = Math.floor(bar / phrase.barsPerChord);
    const degree = phrase.chordDegrees[chordIdx % phrase.chordDegrees.length];
    const quality = phrase.chordQualities[chordIdx % phrase.chordQualities.length];
    const rootNote = scaleNotes[degree % scaleNotes.length];
    const voicing = chordVoicing(rootNote, quality, baseOct);
    chordStrs.push(voicing.length > 1 ? `[${voicing.join(',')}]` : voicing[0]);
  }
  return decorate(`note("${chordStrs.join(' ')}").slow(${phrase.bars})`, inst, orbit);
}

/**
 * Render a motif into a bar of sixteenth-note steps. Motif pitches are
 * **chord-tone indices** into the current chord's interval structure:
 *   pitch 0 = root, 1 = 3rd, 2 = 5th, 3 = 7th (for 7th chords)
 * Pitches beyond the chord size wrap into the next octave. This guarantees
 * every motif note is a chord tone, regardless of chord quality — so a
 * motif like `[0, 1, 2, 1]` plays 1-3-5-3 whether the chord is maj, min,
 * min7, dom7, or sus2.
 *
 * Returns a 16-step space-separated pattern ("~" for rests).
 */
function motifToBar(
  motif: Motif,
  chordRoot: NoteName,
  chordQuality: ChordQuality,
  baseOctave: number
): string {
  const steps = Array(16).fill('~');
  const intervals = CHORD_INTERVALS[chordQuality];
  const chordSize = intervals.length;
  const chordRootPc = noteIndex(chordRoot);
  let stepCursor = 0;

  for (let i = 0; i < motif.pitches.length; i++) {
    const pitch = motif.pitches[i];
    const beatDur = motif.rhythm[i];
    const stepCount = Math.max(1, Math.round(beatDur * 4));
    if (stepCursor >= 16) break;

    // Chord-tone resolution: pitch is an index into the chord's interval
    // array; pitches >= chordSize wrap to next octave.
    const octShift = Math.floor(pitch / chordSize);
    const idx = ((pitch % chordSize) + chordSize) % chordSize;
    const semitonesAboveRoot = intervals[idx] + octShift * 12;
    const absPc = chordRootPc + semitonesAboveRoot;
    const pitchClass = ((absPc % 12) + 12) % 12;
    const octaveLabel = baseOctave + Math.floor(absPc / 12);
    const noteName = noteFromIndex(pitchClass);
    steps[stepCursor] = `${noteName}${clampOctave(octaveLabel)}`;
    stepCursor += stepCount;
  }
  return steps.join(' ');
}

/** Render the lead: motif statements at the phrase's motifSlots bars */
function renderLead(phrase: Phrase, scaleNotes: NoteName[], inst: Instrument, orbit: number): string {
  const baseOct = 4 + (inst.octaveOffset ?? 0);
  const restBar = Array(16).fill('~').join(' ');
  const bars: string[] = [];
  for (let bar = 0; bar < phrase.bars; bar++) {
    if (phrase.motifSlots[bar]) {
      const chordIdx = Math.floor(bar / phrase.barsPerChord);
      const degree = phrase.chordDegrees[chordIdx % phrase.chordDegrees.length];
      const quality = phrase.chordQualities[chordIdx % phrase.chordQualities.length];
      const chordRoot = scaleNotes[degree % scaleNotes.length];
      bars.push(`[${motifToBar(phrase.motif, chordRoot, quality, baseOct)}]`);
    } else {
      bars.push(`[${restBar}]`);
    }
  }
  // Angle brackets cycle through bars, one per cycle.
  // `.slow(phrase.bars)` would give one element per phrase, which is wrong.
  // Use space-separated bars + .slow(bars) so each bar-step gets 1 cycle.
  // Each bar is a 16-step sub-pattern; the outer .slow makes each bar fit 1 cycle.
  return decorate(`note("${bars.join(' ')}").slow(${phrase.bars})`, inst, orbit);
}

/**
 * Render the color voice: a sparse sprinkle of high chord tones.
 * One note per phrase on the final bar's 3rd or 5th.
 */
function renderColor(phrase: Phrase, scaleNotes: NoteName[], inst: Instrument, orbit: number): string {
  const baseOct = 4 + (inst.octaveOffset ?? 0);
  const rootIdx = noteIndex(scaleNotes[0]);
  // Sparse: a single note near the start of each phrase, on the tonic-ish chord tone
  const bars: string[] = [];
  for (let bar = 0; bar < phrase.bars; bar++) {
    // Sparkle on odd bars only (1, 3) — keeps color rare
    if (bar % 2 === 1) {
      const chordIdx = Math.floor(bar / phrase.barsPerChord);
      const degree = phrase.chordDegrees[chordIdx % phrase.chordDegrees.length];
      const thirdDegree = (degree + 2) % scaleNotes.length;  // scale third of the chord
      const noteName = scaleNotes[thirdDegree];
      const noteIdx = noteIndex(noteName);
      const octBump = noteIdx < rootIdx ? 1 : 0;
      const note = `${noteName}${clampOctave(baseOct + octBump)}`;
      // One note in the middle of the bar, silence elsewhere
      const steps = Array(16).fill('~');
      steps[8] = note;
      bars.push(`[${steps.join(' ')}]`);
    } else {
      bars.push(`[${Array(16).fill('~').join(' ')}]`);
    }
  }
  return decorate(`note("${bars.join(' ')}").slow(${phrase.bars})`, inst, orbit);
}

/** Decorate a drum sample pattern with its instrument params. Same shape as decorate()
 *  but uses `sound()` instead of `note()` (drums are samples, not pitches). */
function decorateDrum(stepPattern: string, inst: Instrument, orbit: number): string {
  const parts: string[] = [`sound("${stepPattern}")`];
  if (inst.attack  !== undefined) parts.push(`.attack(${inst.attack})`);
  if (inst.decay   !== undefined) parts.push(`.decay(${inst.decay})`);
  if (inst.release !== undefined) parts.push(`.release(${inst.release})`);
  if (inst.lpf     !== undefined) parts.push(`.lpf(${Math.round(inst.lpf)})`);
  if (inst.room    !== undefined) parts.push(`.room(${inst.room})`);
  parts.push(`.gain(${inst.gain.toFixed(3)})`);
  if (inst.pan     !== undefined) parts.push(`.pan(${inst.pan})`);
  parts.push(`.orbit(${orbit})`);
  return parts.join('\n  ');
}

/** Render the pulse (drums): one sub-stack of per-voice step patterns.
 *  Each voice loops its pattern at 1 bar/cycle — the Strudel setCps makes
 *  cycle = bar, so "bd bd bd bd" plays 4 kicks per bar.
 */
function renderPulse(
  pulse: PulsePattern,
  voicing: PulseVoicing,
  orbitStart: number
): { code: string; orbitsUsed: number } {
  const layers: string[] = [];
  let orbit = orbitStart;
  if (pulse.kick  && voicing.kick)  { layers.push(decorateDrum(pulse.kick,  voicing.kick,  orbit++)); }
  if (pulse.snare && voicing.snare) { layers.push(decorateDrum(pulse.snare, voicing.snare, orbit++)); }
  if (pulse.hat   && voicing.hat)   { layers.push(decorateDrum(pulse.hat,   voicing.hat,   orbit++)); }
  if (pulse.perc  && voicing.perc)  { layers.push(decorateDrum(pulse.perc,  voicing.perc,  orbit++)); }
  if (layers.length === 0) return { code: '', orbitsUsed: 0 };
  if (layers.length === 1) return { code: layers[0], orbitsUsed: orbit - orbitStart };
  return {
    code: `stack(\n${layers.join(',\n')}\n)`,
    orbitsUsed: orbit - orbitStart,
  };
}

/**
 * Main entry: convert a Phrase into a single stack() Strudel pattern.
 *
 * The pattern loops once per phrase (4 bars). When the engine wants a new
 * phrase, it calls this again with the new Phrase and re-evaluates in Strudel.
 */
export function renderPhrase(
  phrase: Phrase,
  keyRoot: NoteName,
  scaleType: ScaleType,
  voicing: Voicing
): string {
  const scaleNotes = getScaleNotes(keyRoot, scaleType);
  const layers: string[] = [];
  let orbit = 1;
  if (voicing.bass)  { layers.push(renderBass(phrase,  scaleNotes, voicing.bass,  orbit++)); }
  if (voicing.chord) { layers.push(renderChord(phrase, scaleNotes, voicing.chord, orbit++)); }
  if (voicing.lead)  { layers.push(renderLead(phrase,  scaleNotes, voicing.lead,  orbit++)); }
  if (voicing.color) { layers.push(renderColor(phrase, scaleNotes, voicing.color, orbit++)); }
  if (voicing.pulse && phrase.pulse) {
    const { code, orbitsUsed } = renderPulse(phrase.pulse, voicing.pulse, orbit);
    if (code) { layers.push(code); orbit += orbitsUsed; }
  }
  if (layers.length === 0) return 'silence';
  if (layers.length === 1) return layers[0];
  return `stack(\n${layers.join(',\n')}\n)`;
}
