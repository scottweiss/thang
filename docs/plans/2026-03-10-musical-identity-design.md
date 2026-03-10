# Musical Identity & Compositional Depth Design

**Date**: 2026-03-10
**Goal**: Transform Thang from "impressive generative ambient texture" into "something that sounds like a song" by adding musical identity through repetition, grid-aligned timing, and section-differentiated composition.

---

## Problem Statement

Thang has 590+ music theory modules but lacks the fundamentals that make music memorable:
1. No harmonic identity — Markov chains random-walk through chords
2. No melodic identity — melodies regenerate every chord change, nothing repeats
3. No musical grid — 2-second ticks don't align to bars/beats
4. Sections differ only in mix parameters, not compositional behavior
5. Post-processing compounds values through 4-8 sequential stages per parameter
6. Reharmonization pipeline applies 12 stages regardless of mood

## Design

### 1. Progression Loop System

**New module**: `src/theory/progression-loop.ts`

At section start, generate a 4-chord loop from the Markov chain (or per-mood curated patterns). Lock it for the section's duration. Repeat N times. Different sections derive loops from the home loop through rotation, subset, or modal shift.

```ts
interface ProgressionLoop {
  chords: number[];           // scale degrees [1, 5, 6, 4]
  qualities: ChordQuality[];  // ['maj', 'maj', 'min', 'maj']
  barsPerChord: number;       // bars each chord sustains
}
```

Anti-repetition logic disabled within a loop. Reharmonization applies once at generation time, not per chord change.

**Section-specific loop derivation**:
- Groove: home loop as-is
- Build: rotate home loop to start from a different degree, or ascending bass variant
- Peak: home loop with strong cadential ending (V→I on last 2 chords)
- Breakdown: 2-chord subset of home loop
- Intro: pedal on tonic (single-chord "loop")

### 2. Bar-Grid Clock

Add bar-level timing alongside the existing 2s tick. The tick continues for smooth parameter interpolation. A bar clock fires musical events on bar/phrase boundaries.

```ts
// In generative-controller.ts
private lastBar = -1;

// Inside tick():
const barDuration = 4 / this.state.params.tempo;
const currentBar = Math.floor(this.state.elapsed / barDuration);
if (currentBar !== this.lastBar) {
  this.onBarBoundary(currentBar);
  this.lastBar = currentBar;
}
```

Musical events that move to bar clock:
- Chord changes (advance through progression loop on bar boundaries)
- Section transitions (wait for 4-bar or 8-bar phrase completion)
- Hook phrase boundaries

Events that stay on 2s tick (smooth interpolation):
- Gain fading, density/brightness/spaciousness drift
- Tension computation and response
- Post-processing parameter updates

### 3. Melodic Hook System

**New module**: `src/theory/melodic-hook.ts`

At section start, generate a 2-4 bar melodic phrase with defined rhythm AND pitch using existing melodic-gravity. Store as the section's hook. Follow a repetition discipline:

- Bars 1-4: hook exactly (establish)
- Bars 5-8: hook exactly (confirm recognition)
- Bars 9-12: hook variation (motif-transform: transpose, fragment, invert)
- Bars 13-16: hook exactly (return)

Melody layer checks bar position within the hook cycle and returns cached hook or developed variant. Hook generation uses melodic-gravity (already good at note selection). Variations use existing motif-transform system.

Per-mood hook character:
- Ambient/avril: longer hooks (4 bars), fewer notes, more space
- Trance/disco: shorter hooks (2 bars), rhythmically driven, exact repetition dominant
- Lofi/downtempo: medium hooks (2-4 bars), ornamental variations
- Syro/xtal: shorter hooks with aggressive transformation

### 4. Section Material Differentiation

Each section type gets distinct compositional directives beyond gain/density targets:

**Groove**: Home progression loop + hook melody. Full arrangement. This IS the song.

**Build**: Ascending bass motion or rotated home loop. Stripped arrangement (drone + texture + building arp). Harmonic rhythm accelerates (4 bars → 2 bars → 1 bar per chord).

**Peak**: Full arrangement at maximum energy. Hook at most triumphant. Strong V→I cadential resolution. Possible octave doubling of melody.

**Breakdown**: Contrasting material. 2-chord subset of home loop. New melodic idea (counter-hook) or hook fragments. Sparse — drone + atmosphere + melody only.

**Intro**: Tonic pedal. Atmosphere + drone. Hook fragments (first 2-3 notes only, previewing what's coming).

Implemented as compositional directives in `SectionManager` section configs alongside existing gain/density targets.

### 5. Post-Processing Consolidation

Replace sequential regex multiplication with compute-then-apply. Instead of 4 passes multiplying `.room()`, compute the final value once from all inputs, then do one replacement.

**New module**: `src/engine/post-processing.ts`

```ts
function computeFinalRoom(state, layerName): number {
  let mult = 1.0;
  if (shouldApplySpatialDepth(state.section))
    mult *= roomMultiplier(state.section, progress, tension);
  if (shouldApplyTensionSpace(layerName))
    mult *= tensionSpaceMultiplier(tension, mood);
  if (shouldApplyEnsembleThinning(count))
    mult *= ensembleRoomMultiplier(count, mood);
  return mult;
}
```

Target: 26 stages → 10 consolidated stages:
1. Filter (LPF from tension + section + chord quality + spectral balance)
2. Space (room + roomsize from tension + section + ensemble)
3. Delay (feedback + wet from tension + section + ensemble)
4. Dynamics (gain arc + envelope + velocity — one pass)
5. Stereo (pan + width — one pass)
6. Timbre (FM morph + chorus + harmonic color)
7. Frequency bands (HPF/LPF separation, spectral balance)
8. Density (pattern degrade + breathing)
9. Rhythm (acceleration + metric accent + hemiola)
10. Expression (articulation + crush + resolution glow)

### 6. Reharmonization Simplification

Per-mood whitelist of 2-3 substitution types. All others disabled:

| Mood | Substitutions |
|---|---|
| lofi | secondary dominant, tritone sub |
| ambient | neo-Riemannian |
| trance | modal interchange |
| syro | negative harmony, chromatic approach |
| avril | relative sub |
| xtal | neo-Riemannian, modal interchange |
| downtempo | secondary dominant, relative sub |
| blockhead | modal interchange, chromatic approach |
| flim | neo-Riemannian, relative sub |
| disco | secondary dominant, modal interchange |

Voice leading and inversion always apply (they're not substitutions, they're voicing choices).

### 7. Drum Fills & Arrangement Moments

**Drum fills** at section boundaries (last 1-2 bars of outgoing section):
- Build → Peak: snare density increase, crash on beat 1 of peak
- Peak → Breakdown: elements strip away over 2 bars
- Breakdown → Groove: kick pattern builds back over 1 bar

**Arrangement moments** (bar-aligned, rare):
- The Drop: 1-beat silence before peak (uses existing strategic-silence, bar-aligned)
- Unison rhythm: all pitched layers share rhythm for 1 bar at section peak
- Solo spotlight: one layer at full, others at 20%, for 4 bars in breakdown

### 8. Bass Line Composition

Per-mood bass behaviors replacing simple root notes:

- **Walking** (lofi, downtempo): chord tone beat 1, scale tone beat 2, approach tones beats 3-4
- **Pedal** (ambient, avril): hold root, harmony moves above
- **Riff** (trance, disco): short repeating rhythmic pattern synced to kick
- **Syncopated** (blockhead, syro): sixteenth patterns with ghost notes and rests

Bass line persists for the full progression loop. Bass hooks are as important as melodic hooks.

---

## Files Changed

**New files** (~6):
- `src/theory/progression-loop.ts` — loop generation and section derivation
- `src/theory/melodic-hook.ts` — hook generation, repetition cycle, variation timing
- `src/engine/post-processing.ts` — consolidated compute-then-apply functions
- `src/theory/drum-fill.ts` — transitional fill patterns
- `src/theory/arrangement-moment.ts` — drop/unison/spotlight events
- `src/theory/bass-composition.ts` — per-mood composed bass lines

**Modified files** (~10):
- `src/engine/generative-controller.ts` — bar clock, progression loop integration, section directives
- `src/engine/section-manager.ts` — compositional directives per section, bar-aligned transitions
- `src/engine/evolution.ts` — chord timing defers to progression loop bar clock
- `src/engine/caching-layer.ts` — consolidated post-processing pipeline
- `src/engine/layers/harmony.ts` — consolidated post-processing, loop-aware chord changes
- `src/engine/layers/melody.ts` — hook system integration
- `src/engine/layers/drone.ts` — bass composition integration, consolidated post-processing
- `src/engine/layers/texture.ts` — drum fill integration
- `src/engine/layers/arp.ts` — hook-aware accompaniment
- `src/types.ts` — ProgressionLoop type, bar clock state fields

## Risks

- generative-controller.ts is 7000 lines; bar clock integration needs surgical precision
- Existing 6000+ tests may break due to changed chord timing behavior
- Post-processing consolidation is a large refactor touching the most critical code paths
- Progression loops may feel too rigid for ambient/syro moods (mitigate with per-mood loop lengths and variation rates)

## Success Criteria

- A listener can identify "the chord loop" after 30 seconds
- Melody phrases repeat recognizably across a section
- Chord changes snap to bar boundaries (no mid-bar harmonic shifts)
- Section transitions feel purposeful (build BUILDS, breakdown CONTRASTS)
- No parameter compounding artifacts (room/filter/delay values predictable)
