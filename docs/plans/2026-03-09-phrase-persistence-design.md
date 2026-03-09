# Phrase Persistence Design

## Problem

Music sounds random because layers regenerate entirely new content on every chord change. Real music has repeating bars and phrases — a melody plays the same rhythmic shape through multiple chord changes, drums hold a groove for 16+ bars, arps keep their pattern and just rotate chord tones.

## Core Mechanism

Each layer tracks a **rhythmic skeleton** (`boolean[]` of which steps play). This skeleton persists across chord changes and only refreshes after a mood-specific number of chord changes or on section/scale/mood transitions.

New per-layer state:
- `rhythmMask: boolean[]` — which steps play
- `phraseRepeatsRemaining: number` — countdown of chord changes before full regeneration

On `chordChanged`:
- If `phraseRepeatsRemaining > 0`: call `adaptToChord()` to re-pitch cached pattern, decrement counter
- If `phraseRepeatsRemaining === 0`: full regeneration, reset counter
- Section changes, scale changes, mood changes always force full regeneration

## Per-Layer Adaptation

### Melody — minimal clash adjustment
- Scan cached pattern's note names on chord change
- Keep notes that are chord tones or within 1 semitone of a chord tone
- Only nudge notes 2+ semitones from any chord tone → move to nearest chord tone
- Preserves 80-90% of melody verbatim across chord changes

### Arp — chord-tone rotation
- Keep rhythmic mask and arp pattern style (up/down/broken)
- Keep same octave spread and register
- Map old chord tones → new chord tones via voice-leading (nearest pitch)

### Drone — root swap
- Stop regenerating on chord change
- Regex replace root note name in cached pattern string

### Harmony — no structural change
- Keeps regenerating on chord changes (voicing the chord is its job)
- Comping rhythm pattern already persists separately

### Texture (drums) — extend loop duration
- Already ignores chord changes
- Increase loopTicks significantly (see table below)

### Atmosphere — no change
- Already regenerates slowly

## Phrase Repeat Counts (melody & arp)

| Mood | Repeats | Style |
|------|---------|-------|
| trance | 5-6 | Song-like loop |
| disco | 4-5 | Funky hooks |
| blockhead | 3-4 | Hip-hop loops |
| flim | 4-5 | Clockwork repetition |
| avril | 3-4 | Piano phrases |
| downtempo | 2-3 | Moderate repetition |
| lofi | 2-3 | Jazz drift |
| xtal | 2-3 | Evolving loops |
| syro | 1-2 | IDM restlessness |
| ambient | 1 | Always drifting |

## Texture Loop Duration (ticks)

| Mood | Current | Proposed | Seconds |
|------|---------|----------|---------|
| trance | 6 | 16 | 32s |
| disco | 6 | 16 | 32s |
| blockhead | 8 | 14 | 28s |
| lofi | 8 | 12 | 24s |
| downtempo | 8 | 12 | 24s |
| avril | 12 | 20 | 40s |
| flim | 10 | 16 | 32s |
| xtal | 10 | 14 | 28s |
| syro | 4 | 8 | 16s |
| ambient | always | always | always |

## Not In Scope

- No new theory modules
- No changes to motif memory (complements this — cross-section recall vs within-section repetition)
- No section manager, form trajectory, or tension changes
- No pattern bank / AABA form structure
- No CachingLayer post-processing pipeline changes

## Risk

Melody clash detection threshold (2+ semitones from chord tone) may need per-mood tuning.
