# Real-Time Dashboard Panel Design

## Goal

A slide-out side panel with checkboxes, selects, and sliders to tweak every aspect of the generative music engine in real time: per-layer controls, musical parameters, mix/effects, and global settings.

## Layout

- **Trigger**: Gear icon button in top-right corner + `D` keyboard shortcut
- **Position**: 360px wide side panel sliding in from the right edge
- **Style**: Matches existing glassmorphism (frosted glass, dark theme, mood-colored accents)
- **Scrollable**: Panel body scrolls independently
- **Coexists**: Existing left-side controls panel stays visible

Four collapsible sections, each with a summary header when collapsed:

### 1. Layers Section

Six rows (drone, harmony, melody, texture, arp, atmosphere), each with:
- **Checkbox**: toggle layer on/off (maps to `activeLayers`)
- **Gain slider**: 0-150% (maps to `layerGainMultipliers`)
- **Instrument select**: curated dropdown + "show all" toggle

Curated instrument lists per layer:

| Layer | Curated Options |
|-------|----------------|
| Drone | sine, sawtooth, acoustic_bass, fretless_bass, electric_bass_finger, electric_bass_pick, slap_bass_1, synth_bass_1, synth_bass_2, contrabass |
| Harmony | triangle, epiano1, pad_choir, pad_warm, pad_polysynth, string_ensemble_1, rock_organ, celesta, electric_guitar_jazz, acoustic_guitar_nylon, brass_section, french_horn |
| Melody | sine, triangle, square, sawtooth, celesta, vibraphone, piano, music_box, clavinet, flute, clarinet, trumpet, lead_2_sawtooth, lead_4_chiff |
| Texture | (no instrument select — drums only) |
| Arp | sine, triangle, square, sawtooth, marimba, kalimba, glockenspiel, dulcimer, tubular_bells, clavinet, electric_guitar_clean, koto, shamisen, lead_1_square |
| Atmosphere | sine, sawtooth, triangle, pad_halo, pad_sweep, fx_crystal, fx_sci_fi, fx_echoes, fx_atmosphere, string_ensemble_1 |

"Show all" expands to all 171 GM instruments + 4 oscillators, grouped by category. Current mood default shown with indicator.

### 2. Musical Section

- **Scale Root**: select (C through B)
- **Scale Type**: select (major, minor, dorian, phrygian, lydian, mixolydian, locrian)
- **Tempo**: slider, 60-180 BPM (converts to CPS via BPM/240)
- **Force Chord**: button (triggers immediate chord change)
- **Force Section**: button (triggers immediate section transition)
- **Current state**: read-only chord, section, tension display

### 3. Mix Section

Six rows matching layers, each with:
- **Reverb**: slider 0-100% (room amount)
- **Delay**: slider 0-100% (delay feedback)
- **Filter**: slider 0-100% (LPF cutoff, 200Hz-12kHz)
- **Pan**: slider L-R (pan center, -1 to +1)

### 4. Global Section

- **Master Gain**: slider 0-150%
- **Reset to Defaults**: button, restores all overrides to current mood defaults

## Override Persistence

Overrides persist across mood switches. Reset button restores mood defaults. Current mood's default instrument is indicated in dropdowns.

## Implementation Approach

**Override state** — `DashboardOverrides` type on the controller:
```typescript
{
  layers: Record<LayerName, {
    enabled?: boolean,
    gain?: number,
    instrument?: string
  }>,
  mix: Record<LayerName, {
    room?: number,
    delay?: number,
    lpf?: number,
    pan?: number
  }>,
  musical: {
    scaleRoot?: string,
    scaleType?: string,
    tempo?: number
  },
  masterGain?: number
}
```

**How overrides apply:**
- Layer enable/gain: applied in controller when building `stack()`, hooks into existing `layerGainMultipliers`
- Instrument: post-processing regex replacement of `.sound("...")` in generated pattern strings
- Mix params: regex replacement of `.room(...)`, `.delay(...)`, `.lpf(...)`, `.pan(...)` in generated patterns
- Musical: calls existing/new controller methods (setScale, setTempo)
- Master gain: multiplied into final `stack()` output

This keeps the dashboard decoupled — post-processing overlay on generated patterns.

## Files

- New: `src/ui/dashboard.ts` — DOM creation, event handlers, override state
- New: `src/ui/dashboard.css` — dashboard-specific styles
- Modify: `src/ui/controls.ts` — gear icon button, dashboard toggle wiring
- Modify: `src/ui/styles.css` — gear button positioning
- Modify: `src/engine/generative-controller.ts` — accept/apply overrides in rebuildAll()
- Modify: `src/types.ts` — DashboardOverrides type
- Modify: `src/main.ts` — wire dashboard to controller
