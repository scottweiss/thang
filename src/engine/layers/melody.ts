import { CachingLayer } from '../caching-layer';
import { GenerativeState } from '../../types';
import { getPentatonicSubset } from '../../theory/scales';
import { randomChoice, weightedChoice } from '../random';
import { noteIndex } from '../../theory/scales';

type Contour = 'ascending' | 'descending' | 'arch' | 'valley';

export class MelodyLayer extends CachingLayer {
  name = 'melody';
  orbit = 2;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) return true;
    if (state.chordChanged) return true;
    if (state.scaleChanged) return true;

    const maxTicks = { downtempo: 10, lofi: 8, trance: 6 }[state.mood] ?? 8;
    if (this.ticksSinceLastGeneration(state) >= maxTicks) return true;

    return false;
  }

  protected buildPattern(state: GenerativeState): string {
    const mood = state.mood;
    const density = state.params.density;
    const room = 0.5 + state.params.spaciousness * 0.4;
    const brightness = state.params.brightness;
    const gain = 0.25 * (0.4 + density * 0.6);

    // Build melodic phrase
    const elements = mood === 'ambient'
      ? this.buildAmbientPhrase(state, density)
      : this.buildStructuredPhrase(state, density);

    switch (mood) {
      case 'ambient':
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(1.5)
          .fmh(4)
          .fmenv("exp")
          .fmdecay(0.3)
          .attack(0.01)
          .decay(0.8)
          .sustain(0.05)
          .release(0.5)
          .slow(5)
          .gain(${(gain * 0.7).toFixed(3)})
          .pan(sine.range(0.15, 0.85).slow(7))
          .room(${room.toFixed(2)})
          .roomsize(4)
          .delay(0.4)
          .delaytime(0.5)
          .delayfeedback(0.4)
          .orbit(${this.orbit})`;

      case 'downtempo':
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(2)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.15)
          .attack(0.002)
          .decay(0.4)
          .sustain(0.05)
          .release(0.3)
          .slow(3)
          .gain(${gain.toFixed(3)})
          .pan(sine.range(0.25, 0.75).slow(5))
          .lpf(${(2000 + brightness * 3000).toFixed(0)})
          .room(${room.toFixed(2)})
          .roomsize(3)
          .delay(0.3)
          .delaytime(0.375)
          .delayfeedback(0.3)
          .orbit(${this.orbit})`;

      case 'lofi':
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(3)
          .fmh(2)
          .fmenv("exp")
          .fmdecay(0.1)
          .attack(0.003)
          .decay(0.3)
          .sustain(0.05)
          .release(0.2)
          .slow(2)
          .gain(${(gain * 1.1).toFixed(3)})
          .lpf(${(1500 + brightness * 2000).toFixed(0)})
          .detune(sine.range(-2, 2).slow(3))
          .pan(sine.range(0.35, 0.65).slow(4))
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(2)
          .delay(0.2)
          .delaytime(0.3)
          .delayfeedback(0.2)
          .orbit(${this.orbit})`;

      case 'trance':
        return `note("${elements.join(' ')}")
          .sound("sine")
          .fm(2)
          .fmh(3)
          .fmenv("exp")
          .fmdecay(0.1)
          .attack(0.001)
          .decay(0.2)
          .sustain(0.05)
          .release(0.1)
          .slow(1)
          .gain(${(gain * 1.2).toFixed(3)})
          .lpf(${(3000 + brightness * 5000).toFixed(0)})
          .pan(sine.range(0.2, 0.8).slow(3))
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(2)
          .delay(0.3)
          .delaytime(0.1875)
          .delayfeedback(0.35)
          .orbit(${this.orbit})`;
    }
  }

  // Ambient stays sparse and random — this is where randomness works well
  private buildAmbientPhrase(state: GenerativeState, density: number): string[] {
    const penta = getPentatonicSubset(state.scale);
    const elements: string[] = [];
    for (let i = 0; i < 16; i++) {
      if (Math.random() < density * 0.15) {
        const note = randomChoice(penta);
        const octave = weightedChoice([4, 5], [3, 2]);
        elements.push(`${note}${octave}`);
      } else {
        elements.push('~');
      }
    }
    return elements;
  }

  // Structured phrase with contour, motifs, and chord-tone anchoring
  private buildStructuredPhrase(state: GenerativeState, density: number): string[] {
    const penta = getPentatonicSubset(state.scale);
    const mood = state.mood;

    // Build a pitch ladder: pentatonic notes across 2 octaves
    const baseOct = mood === 'trance' ? 3 : 4;
    const ladder = this.buildLadder(penta, baseOct, baseOct + 1);

    // Find chord tones in the ladder for anchoring
    const chordNotes = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
    const chordIndices = ladder
      .map((n, i) => ({ n: n.replace(/\d+$/, ''), i }))
      .filter(x => chordNotes.includes(x.n))
      .map(x => x.i);
    const anchorIdx = chordIndices.length > 0
      ? randomChoice(chordIndices)
      : Math.floor(ladder.length / 2);

    // Generate a short motif (3-4 notes)
    const contour = randomChoice<Contour>(['ascending', 'descending', 'arch', 'valley']);
    const motifLen = weightedChoice([3, 4], [3, 2]);
    const motif = this.buildMotif(ladder, anchorIdx, motifLen, contour);

    // Place the motif into the 16-step sequence with rhythmic spacing
    const noteCount = 16;
    const elements: string[] = new Array(noteCount).fill('~');

    // Density determines how many notes appear
    const noteProbability = {
      ambient: density * 0.3,
      downtempo: density * 0.3,
      lofi: density * 0.4,
      trance: density * 0.5,
    }[mood];

    const totalNotes = Math.max(2, Math.floor(noteCount * noteProbability));

    // Place motif in first half, then a variation in second half (call & response)
    const firstHalf = this.placeMotif(motif, 0, 7, totalNotes);
    const variation = this.varyMotif(motif, ladder);
    const secondHalf = this.placeMotif(variation, 0, 7, totalNotes);

    for (const { pos, note } of firstHalf) {
      if (pos < noteCount) elements[pos] = note;
    }
    for (const { pos, note } of secondHalf) {
      if (pos + 8 < noteCount) elements[pos + 8] = note;
    }

    return elements;
  }

  // Build a pitch ladder from pentatonic notes across octaves
  private buildLadder(penta: string[], lowOct: number, highOct: number): string[] {
    const result: string[] = [];
    for (let oct = lowOct; oct <= highOct; oct++) {
      for (const note of penta) {
        result.push(`${note}${oct}`);
      }
    }
    // Sort by pitch
    result.sort((a, b) => {
      const aNote = a.replace(/\d+$/, '');
      const aOct = parseInt(a.replace(/[^\d]/g, ''));
      const bNote = b.replace(/\d+$/, '');
      const bOct = parseInt(b.replace(/[^\d]/g, ''));
      return (aOct * 12 + noteIndex(aNote as any)) - (bOct * 12 + noteIndex(bNote as any));
    });
    return result;
  }

  // Build a motif by walking through the ladder with a contour shape
  private buildMotif(ladder: string[], startIdx: number, length: number, contour: Contour): string[] {
    const notes: string[] = [];
    let idx = Math.max(0, Math.min(startIdx, ladder.length - 1));

    for (let i = 0; i < length; i++) {
      notes.push(ladder[idx]);

      // Determine step direction based on contour and position
      const progress = i / (length - 1);
      let direction: number;

      switch (contour) {
        case 'ascending':
          direction = 1;
          break;
        case 'descending':
          direction = -1;
          break;
        case 'arch':
          direction = progress < 0.5 ? 1 : -1;
          break;
        case 'valley':
          direction = progress < 0.5 ? -1 : 1;
          break;
      }

      // Mostly stepwise (1), occasionally a leap (2)
      const step = Math.random() < 0.75 ? 1 : 2;
      idx = Math.max(0, Math.min(ladder.length - 1, idx + direction * step));
    }

    return notes;
  }

  // Create a variation of a motif (transpose, invert, or reorder)
  private varyMotif(motif: string[], ladder: string[]): string[] {
    const variation = Math.random();

    if (variation < 0.35) {
      // Transpose up or down by 1-2 steps
      const shift = randomChoice([-2, -1, 1, 2]);
      return motif.map(note => {
        const idx = ladder.indexOf(note);
        if (idx < 0) return note;
        const newIdx = Math.max(0, Math.min(ladder.length - 1, idx + shift));
        return ladder[newIdx];
      });
    } else if (variation < 0.6) {
      // Invert (reverse the direction)
      return [...motif].reverse();
    } else if (variation < 0.8) {
      // Slight variation — change one note
      const result = [...motif];
      const changeIdx = Math.floor(Math.random() * result.length);
      const origIdx = ladder.indexOf(result[changeIdx]);
      if (origIdx >= 0) {
        const step = randomChoice([-1, 1, -2, 2]);
        const newIdx = Math.max(0, Math.min(ladder.length - 1, origIdx + step));
        result[changeIdx] = ladder[newIdx];
      }
      return result;
    } else {
      // Repeat the original (exact repetition is also musical)
      return [...motif];
    }
  }

  // Place a motif into time slots, returning position/note pairs
  private placeMotif(
    motif: string[], startSlot: number, endSlot: number, _totalNotes: number
  ): { pos: number; note: string }[] {
    const result: { pos: number; note: string }[] = [];
    const slotRange = endSlot - startSlot + 1;

    // Space the motif notes across the available slots
    for (let i = 0; i < motif.length; i++) {
      const pos = startSlot + Math.floor((i / motif.length) * slotRange);
      // Add slight random offset for human feel (±1 step)
      const offset = Math.random() < 0.3 ? randomChoice([-1, 1]) : 0;
      const finalPos = Math.max(startSlot, Math.min(endSlot, pos + offset));
      result.push({ pos: finalPos, note: motif[i] });
    }

    return result;
  }
}
