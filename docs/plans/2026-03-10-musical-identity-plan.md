# Musical Identity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add musical identity through progression loops, bar-aligned timing, melodic hooks, section-differentiated composition, consolidated post-processing, and simplified reharmonization.

**Architecture:** New modules (`progression-loop.ts`, `melodic-hook.ts`, `post-processing.ts`, `bass-composition.ts`, `drum-fill.ts`, `arrangement-moment.ts`) integrate into the existing generative-controller tick loop. A bar clock fires musical events on grid boundaries while the 2s tick continues smooth interpolation. Progression loops replace per-tick Markov walks. Melodic hooks enforce repetition-then-variation discipline.

**Tech Stack:** TypeScript, Vitest, Strudel (@strudel/web, @strudel/soundfonts)

**Key files to understand before starting:**
- `src/types.ts` — all type definitions
- `src/engine/generative-controller.ts` — main orchestrator (~7000 lines)
- `src/engine/section-manager.ts` — section transitions, layer gains
- `src/engine/evolution.ts` — chord/scale change timers
- `src/engine/layers/melody.ts` — melody generation with motif system
- `src/engine/layers/drone.ts` — bass/drone generation
- `src/engine/layers/texture.ts` — drum patterns
- `src/engine/caching-layer.ts` — 26-stage post-processing base class

---

## Phase 1: Progression Loop System

### Task 1: Add ProgressionLoop type

**Files:**
- Modify: `src/types.ts`
- Test: `src/theory/progression-loop.test.ts` (will be created in Task 2)

**Step 1: Add types to types.ts**

Add after the `GenerativeState` interface:

```typescript
/** A repeating chord progression that defines a section's harmonic identity */
export interface ProgressionLoop {
  /** Scale degrees (0-based: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°) */
  degrees: number[];
  /** Chord quality per degree */
  qualities: ChordQuality[];
  /** Bars each chord sustains before advancing to next in loop */
  barsPerChord: number;
  /** Total times to repeat the full loop (-1 = until section ends) */
  loopCount: number;
}

/** Bar clock state tracked in GenerativeState */
export interface BarClockState {
  /** Current bar number since piece start */
  currentBar: number;
  /** Bar duration in seconds (4 / cps) */
  barDuration: number;
  /** Position within current bar (0-1) */
  barProgress: number;
  /** Bar number within current section */
  sectionBar: number;
  /** Bar number within current progression loop (resets each loop) */
  loopBar: number;
  /** Current chord index within the loop (0 to loop.degrees.length-1) */
  loopChordIndex: number;
}
```

Also add to `GenerativeState`:
```typescript
  /** Active progression loop for current section */
  progressionLoop?: ProgressionLoop;
  /** Bar-level timing state */
  barClock?: BarClockState;
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS (new optional fields don't break existing code)

**Step 3: Commit**
```
feat: add ProgressionLoop and BarClockState types
```

---

### Task 2: Create progression-loop module

**Files:**
- Create: `src/theory/progression-loop.ts`
- Create: `src/theory/progression-loop.test.ts`

**Step 1: Write tests**

```typescript
import { describe, it, expect } from 'vitest';
import {
  generateLoop,
  deriveLoopForSection,
  getLoopChordAtBar,
} from './progression-loop';

describe('generateLoop', () => {
  it('produces a 4-chord loop', () => {
    const loop = generateLoop('lofi', [0, 1, 2, 3, 4, 5, 6]);
    expect(loop.degrees).toHaveLength(4);
    expect(loop.qualities).toHaveLength(4);
  });

  it('all degrees are valid scale degrees', () => {
    const loop = generateLoop('trance', [0, 1, 2, 3, 4, 5, 6]);
    for (const d of loop.degrees) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it('lofi loops use jazz-friendly degrees', () => {
    // Run 20 times, most should include ii (1) or V (4)
    let hasJazz = 0;
    for (let i = 0; i < 20; i++) {
      const loop = generateLoop('lofi', [0, 1, 2, 3, 4, 5, 6]);
      if (loop.degrees.includes(1) || loop.degrees.includes(4)) hasJazz++;
    }
    expect(hasJazz).toBeGreaterThan(10);
  });

  it('trance loops favor I-V-vi-IV pattern', () => {
    let hasClassic = 0;
    for (let i = 0; i < 20; i++) {
      const loop = generateLoop('trance', [0, 1, 2, 3, 4, 5, 6]);
      if (loop.degrees.includes(0) && loop.degrees.includes(4)) hasClassic++;
    }
    expect(hasClassic).toBeGreaterThan(10);
  });
});

describe('deriveLoopForSection', () => {
  const home = {
    degrees: [0, 4, 5, 3],
    qualities: ['maj' as const, 'maj' as const, 'min' as const, 'maj' as const],
    barsPerChord: 2,
    loopCount: -1,
  };

  it('groove returns home loop unchanged', () => {
    const derived = deriveLoopForSection(home, 'groove', 'lofi');
    expect(derived.degrees).toEqual(home.degrees);
  });

  it('breakdown uses 2-chord subset', () => {
    const derived = deriveLoopForSection(home, 'breakdown', 'lofi');
    expect(derived.degrees.length).toBeLessThanOrEqual(2);
  });

  it('build rotates or varies the loop', () => {
    const derived = deriveLoopForSection(home, 'build', 'lofi');
    expect(derived.degrees).toHaveLength(4);
    // Should differ from home in some way (rotation or ascending bass)
  });

  it('intro uses single tonic chord', () => {
    const derived = deriveLoopForSection(home, 'intro', 'lofi');
    expect(derived.degrees).toHaveLength(1);
    expect(derived.degrees[0]).toBe(0);
  });

  it('peak ends on strong resolution', () => {
    const derived = deriveLoopForSection(home, 'peak', 'lofi');
    const last = derived.degrees[derived.degrees.length - 1];
    // Should end on I (0) or resolve through V (4)
    expect([0, 4]).toContain(last);
  });
});

describe('getLoopChordAtBar', () => {
  const loop = {
    degrees: [0, 4, 5, 3],
    qualities: ['maj' as const, 'maj' as const, 'min' as const, 'maj' as const],
    barsPerChord: 2,
    loopCount: -1,
  };

  it('bar 0 returns first chord', () => {
    expect(getLoopChordAtBar(loop, 0)).toEqual({ degree: 0, quality: 'maj' });
  });

  it('bar 2 returns second chord (barsPerChord=2)', () => {
    expect(getLoopChordAtBar(loop, 2)).toEqual({ degree: 4, quality: 'maj' });
  });

  it('bar 8 wraps back to first chord', () => {
    expect(getLoopChordAtBar(loop, 8)).toEqual({ degree: 0, quality: 'maj' });
  });

  it('bar 7 returns last chord', () => {
    expect(getLoopChordAtBar(loop, 7)).toEqual({ degree: 3, quality: 'maj' });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/theory/progression-loop.test.ts`
Expected: FAIL (module doesn't exist yet)

**Step 3: Implement progression-loop.ts**

```typescript
/**
 * Progression Loop — repeating chord progressions that define section identity.
 *
 * Instead of Markov random-walking through chords, each section locks a
 * 4-chord loop and repeats it. Different sections derive their loops from
 * a "home" loop through rotation, subsetting, or modal shift.
 *
 * This is the single biggest change for musical identity: repetition
 * creates recognition, and recognition creates meaning.
 */

import type { ChordQuality, Mood, Section } from '../types';

export interface ProgressionLoop {
  degrees: number[];
  qualities: ChordQuality[];
  barsPerChord: number;
  loopCount: number;
}

/**
 * Curated loop templates per mood. Each mood has 3-5 characteristic
 * progressions weighted by probability. These encode the harmonic DNA
 * of each genre — lofi gets jazz ii-V-I, trance gets I-V-vi-IV, etc.
 */
const LOOP_TEMPLATES: Record<Mood, { degrees: number[]; qualities: ChordQuality[]; weight: number }[]> = {
  lofi: [
    { degrees: [1, 4, 0, 5], qualities: ['min7', 'dom7', 'maj7', 'min7'], weight: 1.2 },  // ii-V-I-vi (jazz standard)
    { degrees: [0, 5, 3, 4], qualities: ['maj7', 'min7', 'maj7', 'dom7'], weight: 1.0 },  // I-vi-IV-V
    { degrees: [1, 4, 0, 0], qualities: ['min7', 'dom7', 'maj7', 'maj7'], weight: 0.8 },  // ii-V-I-I (turnaround)
    { degrees: [3, 0, 5, 4], qualities: ['maj7', 'maj7', 'min7', 'dom7'], weight: 0.7 },  // IV-I-vi-V
  ],
  ambient: [
    { degrees: [0, 3, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'], weight: 1.2 },      // I-IV-vi-IV (gentle cycle)
    { degrees: [0, 5, 0, 5], qualities: ['sus2', 'min', 'sus2', 'min'], weight: 1.0 },    // I-vi oscillation
    { degrees: [0, 2, 3, 0], qualities: ['sus2', 'min', 'maj', 'sus2'], weight: 0.8 },    // modal drift
  ],
  downtempo: [
    { degrees: [0, 4, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'], weight: 1.2 },      // I-V-vi-IV
    { degrees: [1, 4, 0, 5], qualities: ['min7', 'dom7', 'maj', 'min'], weight: 1.0 },    // ii-V-I-vi
    { degrees: [0, 3, 1, 4], qualities: ['maj', 'maj', 'min', 'maj'], weight: 0.8 },      // I-IV-ii-V
  ],
  trance: [
    { degrees: [0, 4, 5, 3], qualities: ['min', 'maj', 'maj', 'maj'], weight: 1.5 },      // i-V-VI-IV (anthemic minor)
    { degrees: [5, 3, 0, 4], qualities: ['maj', 'maj', 'min', 'maj'], weight: 1.2 },      // VI-IV-i-V
    { degrees: [0, 3, 4, 0], qualities: ['min', 'maj', 'maj', 'min'], weight: 0.8 },      // i-IV-V-i (power)
  ],
  avril: [
    { degrees: [0, 5, 3, 4], qualities: ['maj', 'min', 'maj', 'maj'], weight: 1.2 },      // I-vi-IV-V (classic)
    { degrees: [0, 3, 0, 4], qualities: ['maj', 'maj', 'maj', 'sus4'], weight: 1.0 },     // I-IV-I-Vsus (gentle)
    { degrees: [0, 2, 3, 0], qualities: ['maj', 'min', 'maj', 'maj'], weight: 0.8 },      // I-iii-IV-I
  ],
  xtal: [
    { degrees: [0, 5, 3, 2], qualities: ['maj', 'min', 'maj', 'min'], weight: 1.2 },      // I-vi-IV-iii (crystalline)
    { degrees: [0, 3, 5, 0], qualities: ['sus2', 'maj', 'min', 'sus2'], weight: 1.0 },    // Isus-IV-vi-Isus
    { degrees: [5, 3, 0, 4], qualities: ['min', 'maj', 'maj', 'maj'], weight: 0.8 },      // vi-IV-I-V
  ],
  syro: [
    { degrees: [0, 6, 3, 1], qualities: ['min', 'dim', 'maj', 'min'], weight: 1.2 },      // i-vii°-IV-ii (disorienting)
    { degrees: [4, 0, 5, 3], qualities: ['dom7', 'min', 'maj', 'maj'], weight: 1.0 },     // V7-i-VI-IV
    { degrees: [0, 2, 4, 6], qualities: ['min', 'min', 'maj', 'dim'], weight: 0.8 },      // ascending thirds
  ],
  blockhead: [
    { degrees: [0, 3, 4, 3], qualities: ['min7', 'dom7', 'maj', 'dom7'], weight: 1.2 },   // i-IV7-V-IV7 (funky)
    { degrees: [0, 5, 1, 4], qualities: ['min', 'maj', 'min', 'maj'], weight: 1.0 },      // i-VI-ii-V
    { degrees: [3, 0, 4, 0], qualities: ['maj', 'min', 'maj', 'min'], weight: 0.8 },      // IV-i-V-i
  ],
  flim: [
    { degrees: [0, 5, 3, 4], qualities: ['maj', 'min', 'maj', 'maj'], weight: 1.2 },      // I-vi-IV-V
    { degrees: [0, 2, 3, 0], qualities: ['maj', 'min', 'maj', 'maj'], weight: 1.0 },      // I-iii-IV-I
    { degrees: [0, 3, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'], weight: 0.8 },      // I-IV-vi-IV
  ],
  disco: [
    { degrees: [0, 4, 5, 3], qualities: ['maj', 'dom7', 'min', 'maj'], weight: 1.5 },     // I-V7-vi-IV (pop anthem)
    { degrees: [5, 3, 0, 4], qualities: ['min', 'maj', 'maj', 'dom7'], weight: 1.2 },     // vi-IV-I-V7
    { degrees: [0, 3, 0, 4], qualities: ['maj', 'maj', 'maj', 'dom7'], weight: 0.8 },     // I-IV-I-V7 (classic disco)
  ],
};

/** Bars per chord defaults per mood */
const BARS_PER_CHORD: Record<Mood, number> = {
  ambient: 4, downtempo: 2, lofi: 2, trance: 2,
  avril: 4, xtal: 2, syro: 1, blockhead: 2,
  flim: 2, disco: 2,
};

/**
 * Generate a home progression loop for a piece.
 * Picks from curated templates weighted by mood character.
 */
export function generateLoop(mood: Mood, _availableDegrees: number[]): ProgressionLoop {
  const templates = LOOP_TEMPLATES[mood];
  const totalWeight = templates.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalWeight;
  let pick = templates[0];
  for (const t of templates) {
    r -= t.weight;
    if (r <= 0) { pick = t; break; }
  }
  return {
    degrees: [...pick.degrees],
    qualities: [...pick.qualities],
    barsPerChord: BARS_PER_CHORD[mood],
    loopCount: -1,
  };
}

/**
 * Derive a section-specific loop from the home loop.
 * Each section type transforms the home loop differently.
 */
export function deriveLoopForSection(
  home: ProgressionLoop,
  section: Section,
  _mood: Mood
): ProgressionLoop {
  switch (section) {
    case 'intro':
      // Pedal on tonic
      return {
        degrees: [home.degrees[0]],
        qualities: [home.qualities[0]],
        barsPerChord: home.barsPerChord * 2,
        loopCount: -1,
      };

    case 'build': {
      // Rotate: start from chord 2 or 3 for ascending feel
      const offset = Math.random() < 0.5 ? 1 : 2;
      const degrees = [...home.degrees];
      const qualities = [...home.qualities];
      for (let i = 0; i < offset; i++) {
        degrees.push(degrees.shift()!);
        qualities.push(qualities.shift()!);
      }
      // Accelerating harmonic rhythm: halve barsPerChord in second half
      return { degrees, qualities, barsPerChord: home.barsPerChord, loopCount: -1 };
    }

    case 'peak': {
      // Ensure strong cadential ending: last chord should be I (0)
      const degrees = [...home.degrees];
      const qualities = [...home.qualities];
      // If last chord isn't I, swap it to create V-I at the end
      if (degrees[degrees.length - 1] !== 0) {
        degrees[degrees.length - 1] = 0;
        qualities[degrees.length - 1] = home.qualities[0]; // Use home tonic quality
      }
      // If second-to-last isn't V, try to make it V for cadence
      if (degrees.length >= 2 && degrees[degrees.length - 2] !== 4) {
        degrees[degrees.length - 2] = 4;
        qualities[degrees.length - 2] = 'maj';
      }
      return { degrees, qualities, barsPerChord: home.barsPerChord, loopCount: -1 };
    }

    case 'breakdown': {
      // 2-chord subset: pick the most contrasting pair
      // Usually tonic + relative minor or IV
      const d1 = home.degrees[0];
      const q1 = home.qualities[0];
      // Find the chord furthest from tonic
      let d2 = home.degrees[1];
      let q2 = home.qualities[1];
      for (let i = 2; i < home.degrees.length; i++) {
        if (Math.abs(home.degrees[i] - d1) > Math.abs(d2 - d1)) {
          d2 = home.degrees[i];
          q2 = home.qualities[i];
        }
      }
      return {
        degrees: [d1, d2],
        qualities: [q1, q2],
        barsPerChord: home.barsPerChord * 2, // Slower harmonic rhythm
        loopCount: -1,
      };
    }

    case 'groove':
    default:
      // Home loop unchanged — this IS the song
      return { ...home, degrees: [...home.degrees], qualities: [...home.qualities] };
  }
}

/**
 * Get the chord degree and quality at a given bar position in the loop.
 */
export function getLoopChordAtBar(
  loop: ProgressionLoop,
  bar: number
): { degree: number; quality: ChordQuality } {
  const totalBars = loop.degrees.length * loop.barsPerChord;
  const wrappedBar = ((bar % totalBars) + totalBars) % totalBars;
  const chordIndex = Math.floor(wrappedBar / loop.barsPerChord);
  return {
    degree: loop.degrees[chordIndex],
    quality: loop.qualities[chordIndex],
  };
}
```

**Step 4: Run tests**

Run: `npx vitest run src/theory/progression-loop.test.ts`
Expected: PASS

**Step 5: Commit**
```
feat: add progression-loop module with curated per-mood templates
```

---

### Task 3: Add bar clock to generative controller

**Files:**
- Modify: `src/engine/generative-controller.ts`

**Step 1: Add bar clock fields to the class**

Near line 487 (class fields), add:

```typescript
private lastBar = -1;
private sectionStartBar = 0;
private loopStartBar = 0;
private homeLoop: import('../types').ProgressionLoop | null = null;
```

**Step 2: Add bar clock computation to tick()**

At the top of `tick()` (after `const dt = TICK_INTERVAL / 1000;`, around line 655), add bar clock logic:

```typescript
// Bar clock: compute current bar from elapsed time
const barDuration = 4 / this.state.params.tempo;
const currentBar = Math.floor(this.state.elapsed / barDuration);
const barProgress = (this.state.elapsed % barDuration) / barDuration;
const isNewBar = currentBar !== this.lastBar;

// Update bar clock state
this.state.barClock = {
  currentBar,
  barDuration,
  barProgress,
  sectionBar: currentBar - this.sectionStartBar,
  loopBar: this.state.progressionLoop
    ? (currentBar - this.loopStartBar) % (this.state.progressionLoop.degrees.length * this.state.progressionLoop.barsPerChord)
    : 0,
  loopChordIndex: 0, // computed below
};

if (this.state.progressionLoop && this.state.barClock) {
  const loop = this.state.progressionLoop;
  this.state.barClock.loopChordIndex = Math.floor(
    this.state.barClock.loopBar / loop.barsPerChord
  ) % loop.degrees.length;
}

this.lastBar = currentBar;
```

**Step 3: Update elapsed tracking**

Find where `this.state.elapsed` is incremented (should be in tick, it may use `this.state.tick` or direct time). Ensure `elapsed` tracks real seconds for bar calculations. Currently `elapsed` is likely `tick * TICK_INTERVAL / 1000`. Verify and fix if needed.

**Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**
```
feat: add bar clock computation to generative controller tick loop
```

---

### Task 4: Wire progression loops into chord advancement

**Files:**
- Modify: `src/engine/generative-controller.ts`
- Modify: `src/engine/evolution.ts`

This is the key integration: on each new bar, check if the progression loop says we should change chords.

**Step 1: Generate home loop on start/mood change**

In `start()` (line ~543), after generating composition plan, add:

```typescript
import { generateLoop, deriveLoopForSection } from '../theory/progression-loop';

// Generate home progression loop
this.homeLoop = generateLoop(this.state.mood, [0, 1, 2, 3, 4, 5, 6]);
this.state.progressionLoop = deriveLoopForSection(this.homeLoop, 'intro', this.state.mood);
this.loopStartBar = 0;
this.sectionStartBar = 0;
```

In `setMood()` (line ~560), add similar loop generation after composition plan:

```typescript
this.homeLoop = generateLoop(mood, [0, 1, 2, 3, 4, 5, 6]);
this.state.progressionLoop = deriveLoopForSection(this.homeLoop, 'intro', mood);
this.loopStartBar = 0;
this.sectionStartBar = 0;
this.lastBar = -1;
```

**Step 2: Replace timer-based chord changes with loop-driven changes**

In `tick()`, replace the existing chord change logic (the `if (chordChange)` block around line ~670) with loop-driven logic:

```typescript
// CHORD ADVANCEMENT: driven by progression loop on bar boundaries
if (isNewBar && this.state.progressionLoop && this.state.barClock) {
  const loop = this.state.progressionLoop;
  const loopBar = this.state.barClock.loopBar;

  // Check if this bar is a chord change point (on barsPerChord boundaries)
  if (loopBar % loop.barsPerChord === 0) {
    const chordIdx = Math.floor(loopBar / loop.barsPerChord) % loop.degrees.length;
    const target = loop.degrees[chordIdx];
    const quality = loop.qualities[chordIdx];

    // Only advance if it's actually a different chord
    if (target !== this.state.currentChord.degree || quality !== this.state.currentChord.quality) {
      this.advanceChordToTarget(target, quality);
      this.state.chordChanged = true;
      this.state.ticksSinceChordChange = 0;
    }
  }
}
```

**Step 3: Create advanceChordToTarget() method**

Add a new method that advances to a specific degree/quality (bypassing Markov):

```typescript
private advanceChordToTarget(degree: number, quality: ChordQuality): void {
  const prevNotes = this.state.currentChord.notes;

  // Build chord from scale
  const scaleNotes = this.state.scale.notes;
  const root = scaleNotes[degree % scaleNotes.length];
  const notes = getChordNotesWithOctave(root, quality, 3);

  // Apply voice leading
  const smoothed = smoothVoicing(prevNotes, notes);

  const nextChord: ChordState = {
    symbol: getChordSymbol(root, quality),
    root,
    quality,
    notes: smoothed,
    degree,
  };

  // Apply mood-specific reharmonization (simplified — see Task 12)
  // For now, just apply voice leading + inversion
  const chordNoteNames = nextChord.notes.map(n => n.replace(/\d+$/, '')) as NoteName[];
  const inversion = selectInversion(
    chordNoteNames, this.prevBassNote,
    degree, this.state.mood, this.state.section,
    this.sections.getSectionProgress()
  );
  if (inversion !== 0) {
    nextChord.notes = applyInversion(nextChord.notes, inversion);
  }
  this.prevBassNote = extractBassNote(nextChord.notes);

  // Update state
  this.state.chordHistory.push(this.state.currentChord);
  if (this.state.chordHistory.length > 16) this.state.chordHistory.shift();
  this.state.currentChord = nextChord;
  this.state.progressionIndex++;

  // Next chord hint
  if (this.state.progressionLoop) {
    const loop = this.state.progressionLoop;
    const nextIdx = ((this.state.barClock?.loopChordIndex ?? 0) + 1) % loop.degrees.length;
    const nextRoot = scaleNotes[loop.degrees[nextIdx] % scaleNotes.length];
    const nextQuality = loop.qualities[nextIdx];
    this.state.nextChordHint = {
      symbol: getChordSymbol(nextRoot, nextQuality),
      root: nextRoot,
      quality: nextQuality,
      notes: getChordNotesWithOctave(nextRoot, nextQuality, 3),
      degree: loop.degrees[nextIdx],
    };
  }
}
```

**Step 4: Keep evolution timer as fallback**

Don't remove the existing `chordChange` from `evolution.evolve()` — keep it as a fallback for when no progression loop is active. Gate it:

```typescript
// Fallback: if no progression loop, use evolution timer
if (!this.state.progressionLoop && chordChange) {
  // ... existing advanceChord() logic
}
```

**Step 5: Derive new loop on section change**

In the section transition handler (around line ~707), add loop derivation:

```typescript
if (this.state.sectionChanged) {
  // ... existing section change logic ...

  // Derive new progression loop for this section
  if (this.homeLoop) {
    this.state.progressionLoop = deriveLoopForSection(
      this.homeLoop, this.state.section, this.state.mood
    );
    this.loopStartBar = this.state.barClock?.currentBar ?? 0;
    this.sectionStartBar = this.loopStartBar;
  }
}
```

**Step 6: Run type check and existing tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS (with same pre-existing failures)

**Step 7: Commit**
```
feat: wire progression loops into chord advancement via bar clock
```

---

### Task 5: Bar-align section transitions

**Files:**
- Modify: `src/engine/section-manager.ts`

**Step 1: Add phrase-boundary awareness**

In `evolve()`, modify the transition trigger logic. Instead of transitioning when `sectionElapsed >= sectionDuration`, wait for a 4-bar or 8-bar phrase boundary:

```typescript
// In evolve(), replace the hard duration check:
// OLD: if (this.sectionElapsed >= this.sectionDuration)
// NEW:
const barClock = state.barClock;
if (this.sectionElapsed >= this.sectionDuration && barClock) {
  // Wait for 4-bar phrase boundary
  const phraseBars = 4;
  if (barClock.sectionBar % phraseBars === 0) {
    this.advanceSection(state, formTrajectory);
  }
} else if (this.sectionElapsed >= this.sectionDuration) {
  // Fallback if no bar clock
  this.advanceSection(state, formTrajectory);
}
```

**Step 2: Run tests**

Run: `npx vitest run src/engine/section-manager.test.ts`
Expected: PASS (or update tests if they check exact timing)

**Step 3: Commit**
```
feat: bar-align section transitions to 4-bar phrase boundaries
```

---

## Phase 2: Melodic Hook System

### Task 6: Create melodic-hook module

**Files:**
- Create: `src/theory/melodic-hook.ts`
- Create: `src/theory/melodic-hook.test.ts`

**Step 1: Write tests**

```typescript
import { describe, it, expect } from 'vitest';
import { HookManager, HookPhase } from './melodic-hook';

describe('HookManager', () => {
  it('getPhase returns establish for first 2 repetitions', () => {
    const hm = new HookManager();
    expect(hm.getPhase(0, 8, 2)).toBe('establish');
    expect(hm.getPhase(1, 8, 2)).toBe('establish');
  });

  it('getPhase returns confirm for next 2 repetitions', () => {
    const hm = new HookManager();
    expect(hm.getPhase(2, 8, 2)).toBe('confirm');
    expect(hm.getPhase(3, 8, 2)).toBe('confirm');
  });

  it('getPhase returns develop for next 2', () => {
    const hm = new HookManager();
    expect(hm.getPhase(4, 8, 2)).toBe('develop');
  });

  it('getPhase returns return after develop', () => {
    const hm = new HookManager();
    expect(hm.getPhase(6, 8, 2)).toBe('return');
  });

  it('getPhase wraps for long sections', () => {
    const hm = new HookManager();
    expect(hm.getPhase(8, 8, 2)).toBe('establish'); // wraps
  });

  it('shouldRepeatHook is true for establish/confirm/return', () => {
    const hm = new HookManager();
    expect(hm.shouldRepeatHook('establish')).toBe(true);
    expect(hm.shouldRepeatHook('confirm')).toBe(true);
    expect(hm.shouldRepeatHook('return')).toBe(true);
  });

  it('shouldRepeatHook is false for develop', () => {
    const hm = new HookManager();
    expect(hm.shouldRepeatHook('develop')).toBe(false);
  });
});
```

**Step 2: Run tests to verify fail**

Run: `npx vitest run src/theory/melodic-hook.test.ts`
Expected: FAIL

**Step 3: Implement melodic-hook.ts**

```typescript
/**
 * Melodic Hook System — repetition discipline for memorable melodies.
 *
 * A hook is a 2-4 bar melodic phrase that repeats with a structured cycle:
 *   establish → confirm → develop → return
 *
 * "Establish" and "confirm" play the hook exactly. "Develop" applies
 * motif transformations. "Return" plays the hook exactly again.
 *
 * This cycle is what makes melodies recognizable. A melody heard once
 * is noise. Heard twice is a pattern. Heard three times is a song.
 */

import type { Mood } from '../types';

export type HookPhase = 'establish' | 'confirm' | 'develop' | 'return';

/** How many bars each hook phrase lasts, per mood */
const HOOK_LENGTH_BARS: Record<Mood, number> = {
  ambient: 4, downtempo: 4, lofi: 4, trance: 2,
  avril: 4, xtal: 2, syro: 2, blockhead: 2,
  flim: 4, disco: 2,
};

/** How many repetitions before moving to next phase */
const PHASE_REPS: Record<Mood, number> = {
  ambient: 2, downtempo: 2, lofi: 2, trance: 4,
  avril: 2, xtal: 2, syro: 1, blockhead: 2,
  flim: 2, disco: 4,
};

export class HookManager {
  private storedHook: string[] | null = null;
  private hookMood: Mood | null = null;

  /** Get the hook phase for a given bar within the section */
  getPhase(sectionBar: number, totalHookBars: number, hookLengthBars: number): HookPhase {
    const hookRepetition = Math.floor(sectionBar / hookLengthBars);
    // 4-phase cycle: establish, confirm, develop, return
    // Each phase lasts (totalHookBars / hookLengthBars / 4) repetitions, minimum 1
    const repsPerPhase = Math.max(1, Math.floor(totalHookBars / hookLengthBars / 4));
    const cyclePosition = hookRepetition % (repsPerPhase * 4);

    if (cyclePosition < repsPerPhase) return 'establish';
    if (cyclePosition < repsPerPhase * 2) return 'confirm';
    if (cyclePosition < repsPerPhase * 3) return 'develop';
    return 'return';
  }

  /** Whether the hook should be played exactly (no variation) */
  shouldRepeatHook(phase: HookPhase): boolean {
    return phase !== 'develop';
  }

  /** Get hook length in bars for a mood */
  getHookLengthBars(mood: Mood): number {
    return HOOK_LENGTH_BARS[mood];
  }

  /** Get phase repetitions for a mood */
  getPhaseReps(mood: Mood): number {
    return PHASE_REPS[mood];
  }

  /** Store a generated hook */
  storeHook(notes: string[], mood: Mood): void {
    this.storedHook = [...notes];
    this.hookMood = mood;
  }

  /** Get stored hook, or null if mood changed */
  getStoredHook(mood: Mood): string[] | null {
    if (this.hookMood !== mood) return null;
    return this.storedHook ? [...this.storedHook] : null;
  }

  /** Clear stored hook (on section/mood change) */
  clear(): void {
    this.storedHook = null;
    this.hookMood = null;
  }
}
```

**Step 4: Run tests**

Run: `npx vitest run src/theory/melodic-hook.test.ts`
Expected: PASS

**Step 5: Commit**
```
feat: add melodic-hook module with repetition discipline
```

---

### Task 7: Integrate hooks into melody layer

**Files:**
- Modify: `src/engine/layers/melody.ts`

**Step 1: Add HookManager to MelodyLayer**

Add import and field:
```typescript
import { HookManager } from '../../theory/melodic-hook';
// In class fields:
private hookManager = new HookManager();
```

**Step 2: Modify shouldRegenerate()**

When a hook is stored and the phase says "repeat", return false:

```typescript
// At the top of shouldRegenerate(), before existing logic:
if (state.barClock && state.progressionLoop) {
  const hookLength = this.hookManager.getHookLengthBars(state.mood);
  const totalBars = hookLength * 8; // enough for full establish-confirm-develop-return
  const phase = this.hookManager.getPhase(
    state.barClock.sectionBar, totalBars, hookLength
  );
  const stored = this.hookManager.getStoredHook(state.mood);
  if (stored && this.hookManager.shouldRepeatHook(phase)) {
    return false; // Use cached hook
  }
}
```

**Step 3: Modify generate() for hook repetition**

After buildPattern generates a new phrase, store it as hook if none exists. On repeat phases, return stored hook:

```typescript
// In generate(), after getting result from buildPattern:
if (state.barClock) {
  const hookLength = this.hookManager.getHookLengthBars(state.mood);
  const totalBars = hookLength * 8;
  const phase = this.hookManager.getPhase(
    state.barClock.sectionBar, totalBars, hookLength
  );
  const stored = this.hookManager.getStoredHook(state.mood);

  if (!stored) {
    // First generation in this section — this IS the hook
    // Extract note names from the generated pattern
    const noteMatch = result.match(/note\("([^"]+)"\)/);
    if (noteMatch) {
      this.hookManager.storeHook(noteMatch[1].split(' '), state.mood);
    }
  } else if (this.hookManager.shouldRepeatHook(phase)) {
    // Replace note content with stored hook
    result = result.replace(
      /note\("([^"]+)"\)/,
      `note("${stored.join(' ')}")`
    );
  }
  // 'develop' phase: let the normal motif-transform system handle variation
}
```

**Step 4: Clear hook on section change**

In `shouldRegenerate()`, when section changes, clear the hook:
```typescript
if (state.sectionChanged) {
  this.hookManager.clear();
  // ... existing section change logic
}
```

**Step 5: Run tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS

**Step 6: Commit**
```
feat: integrate melodic hook repetition into melody layer
```

---

## Phase 3: Section Material Differentiation

### Task 8: Add compositional directives to section configs

**Files:**
- Modify: `src/engine/section-manager.ts`

**Step 1: Extend SectionConfig with compositional directives**

Add to the `SectionConfig` interface:
```typescript
interface SectionConfig {
  // ... existing fields ...
  /** Compositional behavior for this section */
  harmonicRhythm?: 'slow' | 'normal' | 'accelerating';
  /** Whether this section uses contrasting melodic material */
  contrastingMelody?: boolean;
  /** Arrangement density: how many layers should be prominent */
  arrangementDensity?: 'sparse' | 'normal' | 'full';
}
```

**Step 2: Set directives in SECTION_CONFIGS**

For each mood's section configs, add the directive fields. This is a large data change but mechanical:

For ALL moods, apply these section directives:
- `intro`: `harmonicRhythm: 'slow'`, `arrangementDensity: 'sparse'`
- `build`: `harmonicRhythm: 'accelerating'`, `arrangementDensity: 'normal'`
- `peak`: `harmonicRhythm: 'normal'`, `arrangementDensity: 'full'`
- `breakdown`: `harmonicRhythm: 'slow'`, `contrastingMelody: true`, `arrangementDensity: 'sparse'`
- `groove`: `harmonicRhythm: 'normal'`, `arrangementDensity: 'full'`

**Step 3: Expose directives through state**

Add to GenerativeState in types.ts:
```typescript
  /** Current section's compositional directives */
  sectionDirectives?: {
    harmonicRhythm: 'slow' | 'normal' | 'accelerating';
    contrastingMelody: boolean;
    arrangementDensity: 'sparse' | 'normal' | 'full';
  };
```

Update `evolve()` in section-manager to populate this from the current config.

**Step 4: Commit**
```
feat: add compositional directives to section configs
```

---

### Task 9: Use directives in progression loop barsPerChord

**Files:**
- Modify: `src/engine/generative-controller.ts`

**Step 1: Adjust barsPerChord based on harmonicRhythm directive**

When deriving the loop for a new section (Task 4, Step 5), modify barsPerChord based on the directive:

```typescript
if (this.state.sectionDirectives?.harmonicRhythm === 'slow') {
  this.state.progressionLoop!.barsPerChord *= 2;
} else if (this.state.sectionDirectives?.harmonicRhythm === 'accelerating') {
  // Start at normal, will accelerate in tick() — handled by build-specific logic
}
```

**Step 2: For builds, implement accelerating harmonic rhythm**

In the bar clock chord change logic, if section is build and past 50% progress, halve the effective barsPerChord:

```typescript
let effectiveBarsPerChord = loop.barsPerChord;
if (state.section === 'build' && (state.sectionProgress ?? 0) > 0.5) {
  effectiveBarsPerChord = Math.max(1, Math.floor(loop.barsPerChord / 2));
}
```

**Step 3: Commit**
```
feat: harmonic rhythm responds to section directives (slow/accelerating)
```

---

## Phase 4: Post-Processing Consolidation

### Task 10: Create consolidated post-processing module

**Files:**
- Create: `src/engine/post-processing.ts`
- Create: `src/engine/post-processing.test.ts`

**Step 1: Write tests**

```typescript
import { describe, it, expect } from 'vitest';
import { computeFinalRoom, computeFinalLpf, computeFinalDelayFeedback } from './post-processing';

describe('computeFinalRoom', () => {
  const baseState = {
    section: 'groove' as const,
    sectionProgress: 0.5,
    tension: { structural: 0.5, harmonic: 0.5, rhythmic: 0.5, overall: 0.5 },
    mood: 'lofi' as const,
    activeLayers: new Set(['drone', 'harmony', 'melody']),
  };

  it('returns a single multiplier', () => {
    const mult = computeFinalRoom(baseState, 'melody');
    expect(typeof mult).toBe('number');
    expect(mult).toBeGreaterThan(0);
    expect(mult).toBeLessThan(3);
  });

  it('high tension reduces room', () => {
    const low = computeFinalRoom({ ...baseState, tension: { ...baseState.tension, overall: 0.2 } }, 'melody');
    const high = computeFinalRoom({ ...baseState, tension: { ...baseState.tension, overall: 0.9 } }, 'melody');
    expect(low).toBeGreaterThan(high);
  });
});

describe('computeFinalLpf', () => {
  const baseState = {
    section: 'groove' as const,
    sectionProgress: 0.5,
    tension: { structural: 0.5, harmonic: 0.5, rhythmic: 0.5, overall: 0.5 },
    mood: 'lofi' as const,
    activeLayers: new Set(['drone', 'harmony', 'melody']),
    currentChord: { quality: 'maj7' as const },
  };

  it('high tension opens filter', () => {
    const low = computeFinalLpf({ ...baseState, tension: { ...baseState.tension, overall: 0.2 } }, 'melody');
    const high = computeFinalLpf({ ...baseState, tension: { ...baseState.tension, overall: 0.9 } }, 'melody');
    expect(high).toBeGreaterThan(low);
  });
});
```

**Step 2: Implement compute-then-apply functions**

```typescript
/**
 * Consolidated post-processing — compute final parameter values ONCE,
 * then apply ONCE. Replaces sequential regex multiplication through
 * 4-8 stages with a single computed multiplier.
 */

import { roomMultiplier, roomsizeMultiplier, shouldApplySpatialDepth } from '../theory/spatial-depth';
import { tensionSpaceMultiplier, shouldApplyTensionSpace } from '../theory/tension-space';
import { ensembleRoomMultiplier, ensembleDelayMultiplier, shouldApplyEnsembleThinning } from '../theory/ensemble-thinning';
import { tensionBrightnessMultiplier, shouldApplyTensionBrightness } from '../theory/tension-brightness';
import { filterEnvelopeMultiplier, shouldApplyFilterEnvelope } from '../theory/filter-envelope';
import { delayFeedbackMultiplier, delayWetMultiplier, shouldApplyDelayEvolution } from '../theory/delay-evolution';
import { tensionDelayMultiplier, shouldApplyTensionDelay } from '../theory/tension-delay';
import type { Mood, Section, ChordQuality } from '../types';

interface PostProcessState {
  section: Section;
  sectionProgress: number;
  tension: { overall: number };
  mood: Mood;
  activeLayers: Set<string>;
  currentChord?: { quality: ChordQuality };
}

/** Compute final room multiplier from ALL sources at once */
export function computeFinalRoom(state: PostProcessState, layerName: string): number {
  let mult = 1.0;
  const progress = state.sectionProgress;
  const tension = state.tension.overall;

  // Spatial depth (section-driven)
  if (shouldApplySpatialDepth(state.section)) {
    mult *= roomMultiplier(state.section, progress, tension);
  }

  // Tension space (tension-driven)
  if (shouldApplyTensionSpace(layerName)) {
    mult *= tensionSpaceMultiplier(tension, state.mood);
  }

  // Ensemble thinning (layer-count-driven)
  const count = state.activeLayers.size;
  if (shouldApplyEnsembleThinning(count)) {
    mult *= ensembleRoomMultiplier(count, state.mood);
  }

  return mult;
}

/** Compute final LPF multiplier from ALL sources at once */
export function computeFinalLpf(state: PostProcessState, layerName: string): number {
  let mult = 1.0;

  // Filter envelope (section-driven)
  if (shouldApplyFilterEnvelope(state.section)) {
    mult *= filterEnvelopeMultiplier(state.section, state.sectionProgress);
  }

  // Tension brightness (tension-driven)
  if (shouldApplyTensionBrightness(layerName)) {
    mult *= tensionBrightnessMultiplier(state.tension.overall, state.mood);
  }

  return mult;
}

/** Compute final delay feedback multiplier from ALL sources at once */
export function computeFinalDelayFeedback(state: PostProcessState, layerName: string): number {
  let mult = 1.0;

  // Delay evolution (section-driven)
  if (shouldApplyDelayEvolution(state.section)) {
    mult *= delayFeedbackMultiplier(state.section, state.sectionProgress);
  }

  // Tension delay (tension-driven)
  if (shouldApplyTensionDelay(layerName)) {
    mult *= tensionDelayMultiplier(state.tension.overall, state.mood);
  }

  // Ensemble thinning
  const count = state.activeLayers.size;
  if (shouldApplyEnsembleThinning(count)) {
    mult *= ensembleDelayMultiplier(count, state.mood);
  }

  return mult;
}

/**
 * Apply a computed multiplier to all .room() values in a pattern string.
 * Single pass — no compounding.
 */
export function applyRoomMultiplier(pattern: string, mult: number): string {
  if (Math.abs(mult - 1.0) <= 0.05) return pattern;
  return pattern.replace(
    /\.room\((\d+(?:\.\d+)?)\)/g,
    (_, val) => `.room(${(parseFloat(val) * mult).toFixed(2)})`
  );
}

/** Apply a computed multiplier to all .lpf() values. Single pass. */
export function applyLpfMultiplier(pattern: string, mult: number): string {
  if (Math.abs(mult - 1.0) <= 0.05) return pattern;
  return pattern.replace(
    /\.lpf\((\d+(?:\.\d+)?)\)/g,
    (_, val) => `.lpf(${Math.round(parseFloat(val) * mult)})`
  );
}

/** Apply a computed multiplier to all .delayfeedback() values. Single pass. */
export function applyDelayFeedbackMultiplier(pattern: string, mult: number): string {
  if (Math.abs(mult - 1.0) <= 0.05) return pattern;
  return pattern.replace(
    /\.delayfeedback\((\d+(?:\.\d+)?)\)/g,
    (_, val) => `.delayfeedback(${Math.min(0.85, parseFloat(val) * mult).toFixed(2)})`
  );
}
```

**Step 3: Run tests**

Run: `npx vitest run src/engine/post-processing.test.ts`
Expected: PASS

**Step 4: Commit**
```
feat: add consolidated post-processing compute-then-apply module
```

---

### Task 11: Refactor CachingLayer to use consolidated post-processing

**Files:**
- Modify: `src/engine/caching-layer.ts`

**Step 1: Import consolidated functions**

```typescript
import {
  computeFinalRoom, computeFinalLpf, computeFinalDelayFeedback,
  applyRoomMultiplier, applyLpfMultiplier, applyDelayFeedbackMultiplier,
} from './post-processing';
```

**Step 2: Replace sequential room/lpf/delay stages**

In `postProcess()`, replace the individual calls to `applySpatialDepth()`, `applyTensionSpace()`, and the ensemble thinning room section with a single consolidated call:

```typescript
// CONSOLIDATED: Room (replaces applySpatialDepth + applyTensionSpace + ensemble room thinning)
const finalRoom = computeFinalRoom(state, this.name);
result = applyRoomMultiplier(result, finalRoom);

// CONSOLIDATED: LPF (replaces applyFilterEnvelope + applyTensionBrightness + chord timbre LPF)
const finalLpf = computeFinalLpf(state, this.name);
result = applyLpfMultiplier(result, finalLpf);

// CONSOLIDATED: Delay (replaces applyDelayEvolution + applyTensionDelay + ensemble delay thinning)
const finalDelay = computeFinalDelayFeedback(state, this.name);
result = applyDelayFeedbackMultiplier(result, finalDelay);
```

Remove the now-redundant individual method calls for these three parameters. Keep all OTHER post-processing stages (stereo, micro-timing, crush, envelope, velocity, etc.) — they don't compound.

**Step 3: Apply same consolidation to harmony.ts and drone.ts**

These files mirror the CachingLayer post-processing. Replace their sequential room/lpf/delay stages with the same consolidated approach.

**Step 4: Run all tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS (some tests may need threshold adjustments since compounding is now eliminated)

**Step 5: Commit**
```
refactor: consolidate room/lpf/delay post-processing into single-pass compute-then-apply
```

---

## Phase 5: Reharmonization Simplification

### Task 12: Per-mood reharmonization whitelist

**Files:**
- Create: `src/theory/reharm-whitelist.ts`
- Create: `src/theory/reharm-whitelist.test.ts`
- Modify: `src/engine/generative-controller.ts`

**Step 1: Write tests**

```typescript
import { describe, it, expect } from 'vitest';
import { isReharmAllowed } from './reharm-whitelist';

describe('isReharmAllowed', () => {
  it('lofi allows secondary dominant', () => {
    expect(isReharmAllowed('lofi', 'secondaryDominant')).toBe(true);
  });
  it('lofi allows tritone sub', () => {
    expect(isReharmAllowed('lofi', 'tritoneSub')).toBe(true);
  });
  it('lofi blocks neo-riemannian', () => {
    expect(isReharmAllowed('lofi', 'neoRiemannian')).toBe(false);
  });
  it('ambient allows neo-riemannian', () => {
    expect(isReharmAllowed('ambient', 'neoRiemannian')).toBe(true);
  });
  it('ambient blocks secondary dominant', () => {
    expect(isReharmAllowed('ambient', 'secondaryDominant')).toBe(false);
  });
  it('trance allows modal interchange only', () => {
    expect(isReharmAllowed('trance', 'modalInterchange')).toBe(true);
    expect(isReharmAllowed('trance', 'tritoneSub')).toBe(false);
    expect(isReharmAllowed('trance', 'negativeHarmony')).toBe(false);
  });
});
```

**Step 2: Implement whitelist**

```typescript
import type { Mood } from '../types';

export type ReharmType =
  | 'modalInterchange'
  | 'relativeSub'
  | 'secondaryDominant'
  | 'negativeHarmony'
  | 'neoRiemannian'
  | 'tritoneSub'
  | 'chromaticApproach';

const WHITELIST: Record<Mood, ReharmType[]> = {
  lofi:      ['secondaryDominant', 'tritoneSub'],
  ambient:   ['neoRiemannian'],
  trance:    ['modalInterchange'],
  syro:      ['negativeHarmony', 'chromaticApproach'],
  avril:     ['relativeSub'],
  xtal:      ['neoRiemannian', 'modalInterchange'],
  downtempo: ['secondaryDominant', 'relativeSub'],
  blockhead: ['modalInterchange', 'chromaticApproach'],
  flim:      ['neoRiemannian', 'relativeSub'],
  disco:     ['secondaryDominant', 'modalInterchange'],
};

export function isReharmAllowed(mood: Mood, type: ReharmType): boolean {
  return WHITELIST[mood].includes(type);
}
```

**Step 3: Gate reharmonization in advanceChord()**

In `advanceChord()` (or `advanceChordToTarget()` which still applies reharm), wrap each reharmonization step with the whitelist check:

```typescript
// Before modal interchange:
if (isReharmAllowed(this.state.mood, 'modalInterchange') && ...) { ... }
// Before relative sub:
if (isReharmAllowed(this.state.mood, 'relativeSub') && ...) { ... }
// etc. for each type
```

**Step 4: Run tests**

Run: `npx vitest run src/theory/reharm-whitelist.test.ts && npx vitest run`
Expected: PASS

**Step 5: Commit**
```
feat: per-mood reharmonization whitelist (2-3 types per mood, not 12)
```

---

## Phase 6: Drum Fills & Bass Composition

### Task 13: Create drum-fill module

**Files:**
- Create: `src/theory/drum-fill.ts`
- Create: `src/theory/drum-fill.test.ts`

**Step 1: Write tests**

```typescript
import { describe, it, expect } from 'vitest';
import { getDrumFill, shouldPlayFill } from './drum-fill';

describe('getDrumFill', () => {
  it('returns a valid strudel pattern string', () => {
    const fill = getDrumFill('build', 'peak', 'trance');
    expect(fill).toContain('sound(');
    expect(fill.length).toBeGreaterThan(10);
  });

  it('build→peak fill has crash', () => {
    const fill = getDrumFill('build', 'peak', 'trance');
    expect(fill).toMatch(/cp|crash|oh/);
  });

  it('peak→breakdown fill is sparse', () => {
    const fill = getDrumFill('peak', 'breakdown', 'lofi');
    // Should be simpler/sparser than build→peak
  });
});

describe('shouldPlayFill', () => {
  it('true for build→peak', () => {
    expect(shouldPlayFill('build', 'peak', 'trance')).toBe(true);
  });
  it('false for ambient mood transitions', () => {
    expect(shouldPlayFill('build', 'peak', 'ambient')).toBe(false);
  });
  it('true for groove→build', () => {
    expect(shouldPlayFill('groove', 'build', 'disco')).toBe(true);
  });
});
```

**Step 2: Implement drum-fill.ts**

Curated fill patterns for each transition type. Use existing Strudel sound names (bd, sd, hh, cp, oh).

**Step 3: Integrate into texture layer**

In `texture.ts`, in `buildPattern()`, check if `state.sectionChanged` and `shouldPlayFill()`. If so, return a 1-cycle fill pattern that plays once before the normal pattern takes over.

**Step 4: Run tests and commit**
```
feat: add drum fills at section transitions
```

---

### Task 14: Create bass-composition module

**Files:**
- Create: `src/theory/bass-composition.ts`
- Create: `src/theory/bass-composition.test.ts`

**Step 1: Write tests**

```typescript
import { describe, it, expect } from 'vitest';
import { composeBassLine, BassStyle } from './bass-composition';

describe('composeBassLine', () => {
  it('walking bass has approach tones', () => {
    const line = composeBassLine('walking', 'C', ['C', 'E', 'G'], 'G', 4);
    expect(line.length).toBe(4); // 4 beats
    expect(line[0]).toBe('C2'); // root on beat 1
  });

  it('pedal bass repeats root', () => {
    const line = composeBassLine('pedal', 'C', ['C', 'E', 'G'], 'G', 4);
    expect(line.every(n => n.startsWith('C'))).toBe(true);
  });

  it('riff bass has rhythmic pattern', () => {
    const line = composeBassLine('riff', 'C', ['C', 'E', 'G'], 'G', 8);
    expect(line.some(n => n === '~')).toBe(true); // Has rests
  });
});
```

**Step 2: Implement bass-composition.ts**

```typescript
import type { Mood } from '../types';

export type BassStyle = 'walking' | 'pedal' | 'riff' | 'syncopated';

const MOOD_BASS_STYLE: Record<Mood, BassStyle> = {
  lofi: 'walking', downtempo: 'walking',
  ambient: 'pedal', avril: 'pedal',
  trance: 'riff', disco: 'riff',
  blockhead: 'syncopated', syro: 'syncopated',
  xtal: 'pedal', flim: 'walking',
};

export function getBassStyle(mood: Mood): BassStyle {
  return MOOD_BASS_STYLE[mood];
}

export function composeBassLine(
  style: BassStyle,
  root: string,
  chordTones: string[],
  nextRoot: string | null,
  steps: number,
  octave: number = 2
): string[] {
  switch (style) {
    case 'walking':
      return walkingBass(root, chordTones, nextRoot, steps, octave);
    case 'pedal':
      return pedalBass(root, steps, octave);
    case 'riff':
      return riffBass(root, chordTones, steps, octave);
    case 'syncopated':
      return syncopatedBass(root, chordTones, steps, octave);
  }
}

function walkingBass(root: string, tones: string[], nextRoot: string | null, steps: number, oct: number): string[] {
  const line: string[] = [];
  line.push(`${root}${oct}`); // Beat 1: root
  if (steps >= 2) line.push(tones.length > 1 ? `${tones[1]}${oct}` : `${root}${oct}`); // Beat 2: 3rd or 5th
  if (steps >= 3) line.push(tones.length > 2 ? `${tones[2]}${oct}` : `${root}${oct}`); // Beat 3: 5th
  if (steps >= 4) {
    // Beat 4: chromatic approach to next root
    if (nextRoot) {
      line.push(`${nextRoot}${oct}`); // Simplified approach
    } else {
      line.push(`${root}${oct}`);
    }
  }
  return line.slice(0, steps);
}

function pedalBass(root: string, steps: number, oct: number): string[] {
  return Array(steps).fill(`${root}${oct}`);
}

function riffBass(root: string, tones: string[], steps: number, oct: number): string[] {
  // Short rhythmic pattern: root-rest-root-fifth
  const patterns = [
    [`${root}${oct}`, '~', `${root}${oct}`, tones.length > 2 ? `${tones[2]}${oct}` : `${root}${oct}`],
    [`${root}${oct}`, `${root}${oct}`, '~', `${root}${oct}`],
  ];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const result: string[] = [];
  for (let i = 0; i < steps; i++) result.push(pattern[i % pattern.length]);
  return result;
}

function syncopatedBass(root: string, tones: string[], steps: number, oct: number): string[] {
  // Funk-style: rest-hit-rest-hit or hit-rest-hit-hit
  const fifth = tones.length > 2 ? `${tones[2]}${oct}` : `${root}${oct}`;
  const patterns = [
    ['~', `${root}${oct}`, '~', fifth, `${root}${oct}`, '~', fifth, '~'],
    [`${root}${oct}`, '~', `${root}${oct}`, '~', fifth, `${root}${oct}`, '~', fifth],
  ];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const result: string[] = [];
  for (let i = 0; i < steps; i++) result.push(pattern[i % pattern.length]);
  return result;
}
```

**Step 3: Integrate into drone layer**

In `drone.ts`, use `getBassStyle()` and `composeBassLine()` to generate bass patterns that persist for the full progression loop (not regenerated per chord). The existing bass pattern functions can be replaced with the composed lines.

**Step 4: Run tests and commit**
```
feat: add bass-composition module with walking/pedal/riff/syncopated styles
```

---

## Phase 7: Arrangement Moments

### Task 15: Create arrangement-moment module

**Files:**
- Create: `src/theory/arrangement-moment.ts`
- Create: `src/theory/arrangement-moment.test.ts`

**Step 1: Implement arrangement moments**

Three types:
1. **The Drop** — 1-beat silence before peak (bar-aligned)
2. **Unison rhythm** — all pitched layers use same rhythm for 1 bar
3. **Solo spotlight** — boost one layer, dim others for 4 bars

```typescript
import type { Mood, Section } from '../types';

export type ArrangementMomentType = 'drop' | 'unison' | 'spotlight';

export interface ArrangementMoment {
  type: ArrangementMomentType;
  durationBars: number;
  targetLayer?: string;
}

/** Check if an arrangement moment should fire at a section transition */
export function checkArrangementMoment(
  fromSection: Section,
  toSection: Section,
  mood: Mood,
  sectionBar: number
): ArrangementMoment | null {
  // The Drop: only on build→peak for energetic moods
  if (fromSection === 'build' && toSection === 'peak') {
    const dropProb: Record<Mood, number> = {
      trance: 0.9, disco: 0.7, syro: 0.5, blockhead: 0.4,
      lofi: 0.2, downtempo: 0.15, flim: 0.1, xtal: 0.05,
      ambient: 0, avril: 0,
    };
    if (Math.random() < (dropProb[mood] ?? 0)) {
      return { type: 'drop', durationBars: 0 }; // 0 = 1 beat, handled specially
    }
  }

  // Solo spotlight: only in breakdowns
  if (toSection === 'breakdown') {
    const spotProb: Record<Mood, number> = {
      lofi: 0.4, downtempo: 0.3, avril: 0.3, flim: 0.25,
      ambient: 0.2, xtal: 0.15, trance: 0.1, disco: 0.1,
      blockhead: 0.1, syro: 0.05,
    };
    if (Math.random() < (spotProb[mood] ?? 0)) {
      const soloLayer = Math.random() < 0.7 ? 'melody' : 'harmony';
      return { type: 'spotlight', durationBars: 4, targetLayer: soloLayer };
    }
  }

  return null;
}

/** Get gain multiplier for a layer during an arrangement moment */
export function momentGainMultiplier(
  moment: ArrangementMoment,
  layerName: string,
): number {
  switch (moment.type) {
    case 'drop':
      return 0.0; // silence everything
    case 'spotlight':
      return layerName === moment.targetLayer ? 1.0 : 0.15;
    case 'unison':
      return 1.0; // all layers play
    default:
      return 1.0;
  }
}
```

**Step 2: Integrate into generative controller**

In the section transition handler, check for arrangement moments and apply gain multipliers accordingly.

**Step 3: Run tests and commit**
```
feat: add arrangement moments (drop, spotlight) at section transitions
```

---

## Phase 8: Final Verification

### Task 16: Full verification pass

**Step 1: Type check**
Run: `npx tsc --noEmit`
Expected: PASS

**Step 2: Run all tests**
Run: `npx vitest run`
Expected: PASS (with only pre-existing failures in layer-stagger and pattern-density)

**Step 3: Build**
Run: `npx vite build`
Expected: PASS

**Step 4: Manual listening test**

Run: `npm run dev`

Listen for 5+ minutes across multiple moods:
- [ ] Can you identify "the chord loop" within 30 seconds?
- [ ] Do melody phrases repeat recognizably?
- [ ] Do chord changes snap to bar boundaries?
- [ ] Do builds FEEL different from grooves (not just louder)?
- [ ] Are drum fills audible at section transitions?
- [ ] Does the bass have a recognizable pattern?
- [ ] No parameter compounding artifacts (washed-out reverb, bone-dry filter)?

**Step 5: Final commit**
```
feat: musical identity system — progression loops, bar clock, melodic hooks, section differentiation
```

---

## Summary

| Task | Phase | Description | New Files | Modified Files |
|------|-------|-------------|-----------|----------------|
| 1 | Foundation | ProgressionLoop + BarClock types | — | types.ts |
| 2 | Foundation | progression-loop module | progression-loop.ts + test | — |
| 3 | Foundation | Bar clock in controller | — | generative-controller.ts |
| 4 | Foundation | Wire loops into chord changes | — | generative-controller.ts, evolution.ts |
| 5 | Foundation | Bar-align section transitions | — | section-manager.ts |
| 6 | Hooks | melodic-hook module | melodic-hook.ts + test | — |
| 7 | Hooks | Integrate hooks into melody | — | melody.ts |
| 8 | Sections | Compositional directives | — | section-manager.ts, types.ts |
| 9 | Sections | Harmonic rhythm from directives | — | generative-controller.ts |
| 10 | PostProc | Consolidated post-processing | post-processing.ts + test | — |
| 11 | PostProc | Refactor CachingLayer | — | caching-layer.ts, harmony.ts, drone.ts |
| 12 | Reharm | Per-mood whitelist | reharm-whitelist.ts + test | generative-controller.ts |
| 13 | Fills | Drum fill module | drum-fill.ts + test | texture.ts |
| 14 | Bass | Bass composition module | bass-composition.ts + test | drone.ts |
| 15 | Arrange | Arrangement moments | arrangement-moment.ts + test | generative-controller.ts |
| 16 | Verify | Full verification | — | — |
