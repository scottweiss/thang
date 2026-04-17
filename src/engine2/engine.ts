/**
 * engine2 top-level — maintains a Piece, advances phrases, renders to
 * Strudel. The tick-driven outer controller calls `maybeAdvance(elapsedSec)`
 * once per tick and asks for the current pattern.
 */

import type { Mood } from '../types';
import type { Piece, Section, Phrase, SectionType } from './types';
import type { MoodComposer } from './mood-composer';
import { PlantasiaComposer } from './plantasia';
import { TranceComposer } from './trance';
import { AmbientComposer } from './ambient';
import { LofiComposer } from './lofi';
import { DiscoComposer } from './disco';
import { DowntempoComposer } from './downtempo';
import { AvrilComposer } from './avril';
import { BlockheadComposer } from './blockhead';
import { FlimComposer } from './flim';
import { XtalComposer } from './xtal';
import { SyroComposer } from './syro';
import { renderPhrase } from './performer';

const SECTION_ORDER: SectionType[] = ['intro', 'build', 'peak', 'breakdown', 'groove'];

const COMPOSERS: Partial<Record<Mood, () => MoodComposer>> = {
  plantasia: () => new PlantasiaComposer(),
  trance:    () => new TranceComposer(),
  ambient:   () => new AmbientComposer(),
  lofi:      () => new LofiComposer(),
  disco:     () => new DiscoComposer(),
  downtempo: () => new DowntempoComposer(),
  avril:     () => new AvrilComposer(),
  blockhead: () => new BlockheadComposer(),
  flim:      () => new FlimComposer(),
  xtal:      () => new XtalComposer(),
  syro:      () => new SyroComposer(),
};

/** True iff we have an engine2 composer for this mood */
export function hasEngine2(mood: Mood): boolean {
  return mood in COMPOSERS;
}

function buildPhrase(composer: MoodComposer, scaleType: string, sectionType: SectionType, phraseIdx: number, totalPhrases: number): Phrase {
  const prog = composer.buildProgression(scaleType as any);
  const motif = composer.buildMotif(scaleType as any);
  const bars = 4;                                      // phrase is always 4 bars for now
  const motifSlots = composer.motifSlots(bars);
  const cadence = composer.cadenceFor(sectionType, phraseIdx, totalPhrases);
  const pulse = composer.buildPulse?.(sectionType, phraseIdx, totalPhrases) ?? null;
  return {
    bars,
    barsPerChord: prog.barsPerChord,
    chordDegrees: prog.degrees,
    chordQualities: prog.qualities,
    motif,
    motifSlots,
    cadence,
    pulse,
  };
}

function buildSection(composer: MoodComposer, scaleType: string, type: SectionType): Section {
  const shape = composer.sectionShape(type);
  const phrasesPerSection = Math.max(1, Math.floor(shape.bars / 4));
  const phrases: Phrase[] = [];
  for (let i = 0; i < phrasesPerSection; i++) {
    phrases.push(buildPhrase(composer, scaleType, type, i, phrasesPerSection));
  }
  return { type, shape, phrases };
}

function buildPiece(composer: MoodComposer): Piece {
  const key = composer.pickKey();
  const tempo = composer.pickTempo();
  const voicing = composer.pickVoicing();
  const sections = SECTION_ORDER.map(type => buildSection(composer, key.scaleType, type));
  return {
    key,
    tempo,
    voicing,
    sections,
    currentSectionIdx: 0,
    currentPhraseIdx: 0,
    moodName: composer.name,
  };
}

export class Engine2 {
  private composer: MoodComposer;
  private piece: Piece;
  private cachedPattern: string | null = null;
  /** Fractional bars elapsed since the current phrase began */
  private phraseBarsElapsed = 0;

  constructor(mood: Mood) {
    const factory = COMPOSERS[mood];
    if (!factory) throw new Error(`engine2 has no composer for mood: ${mood}`);
    this.composer = factory();
    this.piece = buildPiece(this.composer);
  }

  /** Current piece state (for debugging / UI readout) */
  getPiece(): Piece {
    return this.piece;
  }

  /** Tempo in BPM — the controller uses this to set Strudel's cps */
  getTempo(): number {
    return this.piece.tempo;
  }

  /** Current key root + scale type */
  getKey(): { root: string; scaleType: string } {
    return { root: this.piece.key.root, scaleType: this.piece.key.scaleType };
  }

  /** Current section type — for UI highlighting */
  getSectionType(): SectionType {
    return this.piece.sections[this.piece.currentSectionIdx].type;
  }

  /**
   * Render the current phrase as a Strudel pattern string.
   * Cached — the same string is returned until the phrase advances.
   */
  getPattern(): string {
    if (this.cachedPattern !== null) return this.cachedPattern;
    const section = this.piece.sections[this.piece.currentSectionIdx];
    const phrase = section.phrases[this.piece.currentPhraseIdx];
    // Only include roles the current section has active
    const fullVoicing = this.piece.voicing;
    const activeVoicing: typeof fullVoicing = {};
    for (const [role, inst] of Object.entries(fullVoicing) as [keyof typeof fullVoicing, any][]) {
      if (section.shape.activeRoles.has(role as any)) {
        activeVoicing[role] = inst;
      }
    }
    this.cachedPattern = renderPhrase(phrase, this.piece.key.root, this.piece.key.scaleType as any, activeVoicing);
    return this.cachedPattern;
  }

  /**
   * Advance the piece by `dtSeconds` of elapsed wall-clock time. Internally
   * converts to bars using the piece's tempo, and advances the current phrase /
   * section when a full phrase has played. Returns true if the phrase changed
   * (so the caller knows to re-evaluate Strudel with the new pattern).
   *
   * Loops to handle large dt values that span multiple phrase boundaries.
   */
  advance(dtSeconds: number): boolean {
    const barDurationSec = (60 / this.piece.tempo) * 4;
    this.phraseBarsElapsed += dtSeconds / barDurationSec;

    let crossed = false;
    while (true) {
      const section = this.piece.sections[this.piece.currentSectionIdx];
      const currentPhrase = section.phrases[this.piece.currentPhraseIdx];
      if (this.phraseBarsElapsed < currentPhrase.bars) break;

      this.phraseBarsElapsed -= currentPhrase.bars;
      this.piece.currentPhraseIdx++;
      crossed = true;

      if (this.piece.currentPhraseIdx >= section.phrases.length) {
        this.piece.currentPhraseIdx = 0;
        this.piece.currentSectionIdx++;
        if (this.piece.currentSectionIdx >= this.piece.sections.length) {
          // After the final section, cycle back to build — intro plays once.
          const buildIdx = this.piece.sections.findIndex(s => s.type === 'build');
          this.piece.currentSectionIdx = buildIdx >= 0 ? buildIdx : 1;
        }
      }
    }

    if (crossed) this.cachedPattern = null;
    return crossed;
  }

  /** Replace the piece with a fresh one — used when the user switches moods or restarts */
  resetPiece(): void {
    this.piece = buildPiece(this.composer);
    this.cachedPattern = null;
    this.phraseBarsElapsed = 0;
  }
}
