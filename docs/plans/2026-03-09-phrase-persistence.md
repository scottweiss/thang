# Phrase Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make music sound composed rather than random by persisting rhythmic skeletons across chord changes and only re-pitching notes that clash with the new harmony.

**Architecture:** Each pitched layer (melody, arp, drone) stops fully regenerating on chord changes. Instead, the cached pattern is adapted: melody nudges clashing notes, arp rotates chord tones, drone swaps root. Drums hold their groove much longer. Phrase repetition counts are mood-specific (trance=5-6 repeats, ambient=1).

**Tech Stack:** TypeScript, Vitest, Strudel pattern syntax (note strings like `"C4 E4 ~ G4"`)

---

### Task 1: Create `phrase-persistence.ts` utility module

**Files:**
- Create: `src/theory/phrase-persistence.ts`
- Create: `src/theory/phrase-persistence.test.ts`

This module provides the core utilities: extracting notes from pattern strings, detecting clashes, nudging pitches, and re-mapping chord tones. All other tasks depend on it.

**Step 1: Write failing tests for note extraction and clash detection**

```typescript
// src/theory/phrase-persistence.test.ts
import { describe, it, expect } from 'vitest';
import {
  extractNotes,
  isClash,
  nudgeNote,
  remapChordTones,
  phraseRepeatCount,
} from './phrase-persistence';

describe('extractNotes', () => {
  it('extracts note names from a pattern string', () => {
    const code = 'note("C4 E4 ~ G4 ~ A4 ~ ~")';
    const result = extractNotes(code);
    expect(result).toEqual([
      { index: 0, note: 'C4' },
      { index: 1, note: 'E4' },
      { index: 3, note: 'G4' },
      { index: 5, note: 'A4' },
    ]);
  });

  it('handles multi-note patterns with rests', () => {
    const code = 'note("Bb3 ~ ~ Eb4")';
    expect(extractNotes(code)).toEqual([
      { index: 0, note: 'Bb3' },
      { index: 3, note: 'Eb4' },
    ]);
  });

  it('returns empty for no note() call', () => {
    expect(extractNotes('sound("bd")')).toEqual([]);
  });
});

describe('isClash', () => {
  it('chord tone is not a clash', () => {
    expect(isClash('C', ['C', 'E', 'G'])).toBe(false);
    expect(isClash('E', ['C', 'E', 'G'])).toBe(false);
  });

  it('note 1 semitone from chord tone is not a clash', () => {
    // B is 1 semitone from C
    expect(isClash('B', ['C', 'E', 'G'])).toBe(false);
    // F is 1 semitone from E
    expect(isClash('F', ['C', 'E', 'G'])).toBe(false);
  });

  it('note 2+ semitones from any chord tone is a clash', () => {
    // F# is 2 semitones from E and G — clashes
    expect(isClash('F#', ['C', 'E', 'G'])).toBe(true);
    // Bb is 2 semitones from both A and C — depends on chord
    expect(isClash('Bb', ['C', 'E', 'G'])).toBe(true);
  });
});

describe('nudgeNote', () => {
  it('moves to nearest chord tone', () => {
    // F# is between E and G — should go to G (closer)
    expect(nudgeNote('F#', ['C', 'E', 'G'])).toBe('G');
  });

  it('preserves octave', () => {
    expect(nudgeNote('F#4', ['C', 'E', 'G'])).toBe('G4');
  });

  it('returns original if already a chord tone', () => {
    expect(nudgeNote('E4', ['C', 'E', 'G'])).toBe('E4');
  });
});

describe('remapChordTones', () => {
  it('maps old chord tones to nearest new chord tones', () => {
    const oldNotes = ['C4', 'E4', 'G4', 'C5'];
    const oldChord = ['C', 'E', 'G'];
    const newChord = ['D', 'F#', 'A'];
    const result = remapChordTones(oldNotes, oldChord, newChord);
    // C→D (nearest), E→F# (nearest), G→A (nearest up), C5→D5
    expect(result).toEqual(['D4', 'F#4', 'A4', 'D5']);
  });

  it('handles same chord (identity)', () => {
    const notes = ['C4', 'E4', 'G4'];
    expect(remapChordTones(notes, ['C', 'E', 'G'], ['C', 'E', 'G'])).toEqual(notes);
  });
});

describe('phraseRepeatCount', () => {
  it('trance gets high repeat count', () => {
    const count = phraseRepeatCount('trance');
    expect(count).toBeGreaterThanOrEqual(5);
    expect(count).toBeLessThanOrEqual(6);
  });

  it('ambient gets 1', () => {
    expect(phraseRepeatCount('ambient')).toBe(1);
  });

  it('lofi gets moderate count', () => {
    const count = phraseRepeatCount('lofi');
    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(3);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/theory/phrase-persistence.test.ts`
Expected: FAIL — module not found

**Step 3: Write implementation**

```typescript
// src/theory/phrase-persistence.ts
import type { Mood } from '../types';

const NOTE_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function pitchClass(note: string): number {
  const name = note.replace(/\d+$/, '');
  return NOTE_INDEX[name] ?? -1;
}

function octaveOf(note: string): string {
  const m = note.match(/(\d+)$/);
  return m ? m[1] : '';
}

function noteName(note: string): string {
  return note.replace(/\d+$/, '');
}

function semitoneDist(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 12 - d);
}

/** Extract positioned notes from a Strudel note("...") string. */
export function extractNotes(code: string): { index: number; note: string }[] {
  const m = code.match(/note\("([^"]*)"\)/);
  if (!m) return [];
  const steps = m[1].split(/\s+/);
  const result: { index: number; note: string }[] = [];
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] !== '~' && steps[i] !== '') {
      result.push({ index: i, note: steps[i] });
    }
  }
  return result;
}

/** Check if a note clashes with a chord (2+ semitones from any chord tone). */
export function isClash(note: string, chordTones: string[]): boolean {
  const pc = pitchClass(note);
  if (pc < 0) return false;
  for (const ct of chordTones) {
    const ctPc = pitchClass(ct);
    if (ctPc < 0) continue;
    if (semitoneDist(pc, ctPc) <= 1) return false;
  }
  return true;
}

/** Nudge a clashing note to the nearest chord tone, preserving octave. */
export function nudgeNote(note: string, chordTones: string[]): string {
  const pc = pitchClass(note);
  if (pc < 0) return note;
  const oct = octaveOf(note);

  let bestDist = Infinity;
  let bestTone = noteName(note);
  for (const ct of chordTones) {
    const ctPc = pitchClass(ct);
    if (ctPc < 0) continue;
    const d = semitoneDist(pc, ctPc);
    if (d < bestDist) {
      bestDist = d;
      bestTone = ct;
    }
  }
  return bestTone + oct;
}

/** Remap notes from old chord tones to nearest new chord tones (for arp). */
export function remapChordTones(
  notes: string[],
  oldChord: string[],
  newChord: string[],
): string[] {
  return notes.map(note => {
    const pc = pitchClass(note);
    const oct = octaveOf(note);
    if (pc < 0) return note;

    // Find which old chord tone this note is closest to
    let bestOldIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < oldChord.length; i++) {
      const d = semitoneDist(pc, pitchClass(oldChord[i]));
      if (d < bestDist) { bestDist = d; bestOldIdx = i; }
    }

    // Map to the same index in the new chord, wrapping if needed
    const newIdx = bestOldIdx % newChord.length;
    return newChord[newIdx] + oct;
  });
}

/** Apply minimal-clash adjustment to a cached pattern string. */
export function adaptMelodyToChord(
  cachedCode: string,
  newChordTones: string[],
): string {
  const m = cachedCode.match(/note\("([^"]*)"\)/);
  if (!m) return cachedCode;
  const steps = m[1].split(/\s+/);
  const adapted = steps.map(step => {
    if (step === '~' || step === '') return step;
    if (isClash(step, newChordTones)) {
      return nudgeNote(step, newChordTones);
    }
    return step;
  });
  return cachedCode.replace(m[0], `note("${adapted.join(' ')}")`);
}

/** Apply chord-tone rotation to a cached arp pattern string. */
export function adaptArpToChord(
  cachedCode: string,
  oldChordTones: string[],
  newChordTones: string[],
): string {
  const m = cachedCode.match(/note\("([^"]*)"\)/);
  if (!m) return cachedCode;
  const steps = m[1].split(/\s+/);
  const noteSteps = steps.filter(s => s !== '~' && s !== '');
  const remapped = remapChordTones(noteSteps, oldChordTones, newChordTones);
  let remapIdx = 0;
  const adapted = steps.map(step => {
    if (step === '~' || step === '') return step;
    return remapped[remapIdx++] ?? step;
  });
  return cachedCode.replace(m[0], `note("${adapted.join(' ')}")`);
}

/** Swap root note in a drone pattern string. */
export function adaptDroneToChord(
  cachedCode: string,
  oldRoot: string,
  newRoot: string,
): string {
  if (oldRoot === newRoot) return cachedCode;
  // Replace note names in the note("...") section
  const m = cachedCode.match(/note\("([^"]*)"\)/);
  if (!m) return cachedCode;
  const steps = m[1].split(/\s+/);
  const adapted = steps.map(step => {
    if (step === '~' || step === '') return step;
    const name = noteName(step);
    const oct = octaveOf(step);
    if (name === oldRoot) return newRoot + oct;
    // Also handle 5th swaps for bass patterns
    return step;
  });
  return cachedCode.replace(m[0], `note("${adapted.join(' ')}")`);
}

const PHRASE_REPEATS: Record<Mood, [number, number]> = {
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

/** Get phrase repeat count for a mood (random within range). */
export function phraseRepeatCount(mood: Mood): number {
  const [min, max] = PHRASE_REPEATS[mood] ?? [2, 3];
  if (min === max) return min;
  return min + Math.floor(Math.random() * (max - min + 1));
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/theory/phrase-persistence.test.ts`
Expected: PASS — all tests green

**Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: Clean

**Step 6: Commit**

```bash
git add src/theory/phrase-persistence.ts src/theory/phrase-persistence.test.ts
git commit -m "feat: add phrase-persistence utility module — note extraction, clash detection, re-pitching"
```

---

### Task 2: Add phrase persistence to melody layer

**Files:**
- Modify: `src/engine/layers/melody.ts:95-114` (shouldRegenerate)
- Modify: `src/engine/layers/melody.ts:116-124` (buildPattern — store chord for later adaptation)

**Step 1: Add phrase state fields and import**

Add to the top of `MelodyLayer` class (around line 85-90):

```typescript
import { adaptMelodyToChord, phraseRepeatCount } from '../../theory/phrase-persistence';
```

Add instance fields to the class:

```typescript
private phraseRepeatsRemaining = 0;
private lastChordTones: string[] = [];
```

**Step 2: Modify `shouldRegenerate` to skip chord changes when repeats remain**

Replace `melody.ts:95-114`:

```typescript
protected shouldRegenerate(state: GenerativeState): boolean {
  if (state.mood === 'ambient') return true;
  if (this.moodChanged(state)) {
    this.motifMemory.clear();
    this.rhythmMemory.clear();
    this.recentContours = [];
    this.lastNoteName = null;
    this.gestureHistory = [];
    this.recentIntervals = [];
    this.phraseRepeatsRemaining = 0;
    return true;
  }
  if (state.scaleChanged) { this.phraseRepeatsRemaining = 0; return true; }
  if (state.sectionChanged) { this.phraseRepeatsRemaining = 0; return true; }

  // Chord changed: adapt instead of regenerating if repeats remain
  if (state.chordChanged) {
    if (this.phraseRepeatsRemaining > 0) {
      this.phraseRepeatsRemaining--;
      return false; // will be adapted in generate()
    }
    return true;
  }

  const maxTicks = { downtempo: 10, lofi: 8, trance: 6, avril: 12, xtal: 14, syro: 4, blockhead: 10, flim: 12, disco: 6 }[state.mood] ?? 8;
  if (this.ticksSinceLastGeneration(state) >= maxTicks) return true;

  return false;
}
```

**Step 3: Override `generate()` to handle chord adaptation**

In the `buildPattern` method (around line 116-124), after the pattern is built, store chord tones and reset the repeat counter:

At the end of `buildPattern`, before the return, add:

```typescript
this.lastChordTones = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
this.phraseRepeatsRemaining = phraseRepeatCount(state.mood);
```

Then override `generate()` in MelodyLayer to apply adaptation when the cache is reused on chord change:

```typescript
generate(state: GenerativeState): string {
  const wasChordChange = state.chordChanged && this.cachedPattern && this.phraseRepeatsRemaining >= 0;
  const result = super.generate(state);

  // If we skipped regeneration due to phrase persistence, adapt the cached pattern
  if (wasChordChange && this.phraseRepeatsRemaining >= 0 && this.cachedPattern) {
    const newChordTones = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
    this.cachedPattern = adaptMelodyToChord(this.cachedPattern, newChordTones);
    this.lastChordTones = newChordTones;
    return super.generate(state); // re-run post-processing on adapted pattern
  }

  return result;
}
```

Note: `cachedPattern` is private in `CachingLayer`. We need to either make it `protected` or add a protected setter. See Task 5 for the CachingLayer modification.

**Step 4: Run tests**

Run: `npx vitest run && npx tsc --noEmit`
Expected: All 6045+ tests pass, clean compile

**Step 5: Commit**

```bash
git add src/engine/layers/melody.ts
git commit -m "feat: melody phrase persistence — keep rhythmic skeleton across chord changes, nudge clashing notes"
```

---

### Task 3: Add phrase persistence to arp layer

**Files:**
- Modify: `src/engine/layers/arp.ts:71-80` (shouldRegenerate)
- Modify: `src/engine/layers/arp.ts:82+` (buildPattern — store chord, add generate override)

**Step 1: Add imports and state fields**

```typescript
import { adaptArpToChord, phraseRepeatCount } from '../../theory/phrase-persistence';
```

Add to class:

```typescript
private phraseRepeatsRemaining = 0;
private lastChordTones: string[] = [];
```

**Step 2: Modify `shouldRegenerate`**

Replace `arp.ts:71-80` with the same pattern as melody — skip chord changes when repeats remain:

```typescript
protected shouldRegenerate(state: GenerativeState): boolean {
  if (state.mood === 'ambient') return true;
  if (this.moodChanged(state)) { this.phraseRepeatsRemaining = 0; return true; }
  if (state.scaleChanged) { this.phraseRepeatsRemaining = 0; return true; }
  if (state.sectionChanged) { this.phraseRepeatsRemaining = 0; return true; }

  if (state.chordChanged) {
    if (this.phraseRepeatsRemaining > 0) {
      this.phraseRepeatsRemaining--;
      return false;
    }
    return true;
  }

  const maxTicks = { downtempo: 10, lofi: 8, trance: 6, avril: 12, xtal: 14, syro: 3, blockhead: 10, flim: 14, disco: 6 }[state.mood] ?? 8;
  return this.ticksSinceLastGeneration(state) >= maxTicks;
}
```

**Step 3: Store chord and add generate override**

At end of `buildPattern`, add:

```typescript
this.lastChordTones = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
this.phraseRepeatsRemaining = phraseRepeatCount(state.mood);
```

Add `generate()` override with arp-specific adaptation:

```typescript
generate(state: GenerativeState): string {
  const wasChordChange = state.chordChanged && this.cachedPattern && this.phraseRepeatsRemaining >= 0;
  const result = super.generate(state);

  if (wasChordChange && this.phraseRepeatsRemaining >= 0 && this.cachedPattern) {
    const newChordTones = state.currentChord.notes.map(n => n.replace(/\d+$/, ''));
    this.cachedPattern = adaptArpToChord(this.cachedPattern, this.lastChordTones, newChordTones);
    this.lastChordTones = newChordTones;
    return super.generate(state);
  }

  return result;
}
```

**Step 4: Run tests**

Run: `npx vitest run && npx tsc --noEmit`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/engine/layers/arp.ts
git commit -m "feat: arp phrase persistence — keep rhythmic pattern, rotate chord tones on changes"
```

---

### Task 4: Add phrase persistence to drone layer

**Files:**
- Modify: `src/engine/layers/drone.ts:32-37` (generate method)

The drone uses `Layer` directly (not `CachingLayer`), so it regenerates every tick via `generate()` → `buildPattern()`. The fix is simpler: cache the result string and only call `buildPattern` when needed.

**Step 1: Add caching state to DroneLayer**

```typescript
import { adaptDroneToChord, phraseRepeatCount } from '../../theory/phrase-persistence';
```

Add fields:

```typescript
private cachedResult: string | null = null;
private lastRoot: string = '';
private phraseRepeatsRemaining = 0;
private lastMood: Mood | null = null;
```

**Step 2: Modify `generate()` to cache and adapt**

Wrap the existing generate logic: only call `buildPattern` when mood/section/scale changes or repeats exhausted. On chord change with repeats remaining, do a root swap.

```typescript
generate(state: GenerativeState): string {
  const needsRegen =
    !this.cachedResult ||
    state.mood !== this.lastMood ||
    state.scaleChanged ||
    state.sectionChanged ||
    (state.chordChanged && this.phraseRepeatsRemaining <= 0);

  if (needsRegen) {
    this.cachedResult = this.buildPatternAndPostProcess(state);
    this.lastRoot = state.currentChord?.root ?? state.scale.root;
    this.lastMood = state.mood;
    this.phraseRepeatsRemaining = phraseRepeatCount(state.mood);
  } else if (state.chordChanged && this.phraseRepeatsRemaining > 0) {
    const newRoot = state.currentChord?.root ?? state.scale.root;
    this.cachedResult = adaptDroneToChord(this.cachedResult!, this.lastRoot, newRoot);
    this.lastRoot = newRoot;
    this.phraseRepeatsRemaining--;
  }

  return this.cachedResult!;
}
```

Extract the existing `generate()` body (lines 37-206) into a private `buildPatternAndPostProcess(state)` method. The existing `buildPattern` (line 209) stays as-is.

**Step 3: Run tests**

Run: `npx vitest run && npx tsc --noEmit`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/engine/layers/drone.ts
git commit -m "feat: drone phrase persistence — cache pattern, swap root on chord changes"
```

---

### Task 5: Make CachingLayer.cachedPattern accessible to subclasses

**Files:**
- Modify: `src/engine/caching-layer.ts:50` (change `private` to `protected`)

**Step 1: Change access modifier**

At line 50, change:

```typescript
private cachedPattern: string | null = null;
```

to:

```typescript
protected cachedPattern: string | null = null;
```

This lets MelodyLayer and ArpLayer's `generate()` overrides read and write the cached pattern for chord adaptation.

**Step 2: Run tests**

Run: `npx vitest run && npx tsc --noEmit`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/engine/caching-layer.ts
git commit -m "refactor: make CachingLayer.cachedPattern protected for subclass adaptation"
```

---

### Task 6: Extend drum loop durations

**Files:**
- Modify: `src/engine/layers/texture.ts:186` (loopTicks values)

**Step 1: Update loopTicks**

At line 186, change:

```typescript
const loopTicks = { downtempo: 8, lofi: 8, trance: 6, avril: 12, xtal: 10, syro: 4, blockhead: 8, flim: 10, disco: 6 }[state.mood] ?? 8;
```

to:

```typescript
const loopTicks = { downtempo: 12, lofi: 12, trance: 16, avril: 20, xtal: 14, syro: 8, blockhead: 14, flim: 16, disco: 16 }[state.mood] ?? 12;
```

**Step 2: Run tests**

Run: `npx vitest run && npx tsc --noEmit`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/engine/layers/texture.ts
git commit -m "feat: extend drum loop durations — trance/disco 32s, lofi 24s for stable grooves"
```

---

### Task 7: Integration test and final verification

**Files:**
- Create: `src/theory/phrase-persistence-integration.test.ts`

**Step 1: Write integration test**

```typescript
import { describe, it, expect } from 'vitest';
import { adaptMelodyToChord, adaptArpToChord, adaptDroneToChord } from './phrase-persistence';

describe('phrase persistence integration', () => {
  it('melody adaptation preserves most notes on similar chord', () => {
    const pattern = 'note("C4 E4 ~ G4 B4 ~ D5 ~").sound("sine").gain(0.1)';
    // Move from C major to A minor (C E G → A C E) — C and E are shared
    const adapted = adaptMelodyToChord(pattern, ['A', 'C', 'E']);
    // C4 is chord tone (keep), E4 is chord tone (keep), G4 clashes (→ A nearest?)
    // B4 is 1 semitone from C (keep), D5 is 2 semitones from C and E (→ C or E)
    expect(adapted).toContain('C4');
    expect(adapted).toContain('E4');
    expect(adapted).not.toContain('G4'); // G clashes with Am
  });

  it('arp adaptation rotates all chord tones', () => {
    const pattern = 'note("C4 E4 G4 C5 ~ ~ ~ ~").sound("square").gain(0.1)';
    const adapted = adaptArpToChord(pattern, ['C', 'E', 'G'], ['D', 'F#', 'A']);
    expect(adapted).toContain('D4');
    expect(adapted).toContain('F#4');
    expect(adapted).toContain('A4');
    expect(adapted).toContain('D5');
  });

  it('drone root swap works', () => {
    const pattern = 'note("C2").sound("sine").gain(0.1).lpf(200)';
    const adapted = adaptDroneToChord(pattern, 'C', 'G');
    expect(adapted).toContain('G2');
    expect(adapted).not.toContain('C2');
  });

  it('drone pattern with multiple root occurrences', () => {
    const pattern = 'note("C2 ~ G2 C2").sound("gm_acoustic_bass")';
    const adapted = adaptDroneToChord(pattern, 'C', 'F');
    expect(adapted).toContain('F2');
    // G2 is the fifth — stays as G2 (not the root)
    expect(adapted).toContain('G2');
  });
});
```

**Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (6045+ original + new tests)

**Step 3: Type check everything**

Run: `npx tsc --noEmit`
Expected: Clean

**Step 4: Commit**

```bash
git add src/theory/phrase-persistence-integration.test.ts
git commit -m "test: add phrase persistence integration tests"
```

---

## Implementation Order

Tasks 1 and 5 are prerequisites. Then 2, 3, 4, 6 are independent and can be done in parallel. Task 7 is the final verification.

```
Task 5 (cachedPattern protected) ──┐
Task 1 (utility module) ───────────┤
                                    ├─→ Task 2 (melody)
                                    ├─→ Task 3 (arp)
                                    ├─→ Task 4 (drone)
                                    ├─→ Task 6 (drums)
                                    └─→ Task 7 (integration test)
```
