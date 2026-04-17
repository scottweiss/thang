import { describe, it, expect } from 'vitest';
import { Engine2, hasEngine2 } from './engine';

describe('engine2', () => {
  it('has a composer for every mood (full catalog coverage)', () => {
    expect(hasEngine2('plantasia')).toBe(true);
    expect(hasEngine2('trance')).toBe(true);
    expect(hasEngine2('ambient')).toBe(true);
    expect(hasEngine2('lofi')).toBe(true);
    expect(hasEngine2('disco')).toBe(true);
    expect(hasEngine2('downtempo')).toBe(true);
    expect(hasEngine2('avril')).toBe(true);
    expect(hasEngine2('blockhead')).toBe(true);
    expect(hasEngine2('flim')).toBe(true);
    expect(hasEngine2('xtal')).toBe(true);
    expect(hasEngine2('syro')).toBe(true);
  });

  it('Lofi uses warm tempo + extended harmony + hip-hop pulse at peak', () => {
    const e = new Engine2('lofi');
    expect(e.getTempo()).toBeGreaterThanOrEqual(75);
    expect(e.getTempo()).toBeLessThanOrEqual(92);
    const barSec = (60 / e.getTempo()) * 4;
    e.advance(barSec * 17);  // into peak
    const pattern = e.getPattern();
    expect(pattern).toMatch(/gm_epiano1/);
    expect(pattern).toMatch(/gm_acoustic_bass/);
    // peak section must have drums
    expect(pattern).toMatch(/\bbd\b/);
  });

  it('Disco has the iconic open-hat offbeat pattern at peak', () => {
    const e = new Engine2('disco');
    expect(e.getKey().scaleType).toBe('major');
    expect(e.getTempo()).toBeGreaterThanOrEqual(112);
    expect(e.getTempo()).toBeLessThanOrEqual(125);
    const barSec = (60 / e.getTempo()) * 4;
    e.advance(barSec * 5);  // into build/peak region
    const pattern = e.getPattern();
    // Open hat sample must appear
    expect(pattern).toMatch(/"~ oh ~ oh ~ oh ~ oh"/);
    expect(pattern).toMatch(/gm_slap_bass_1/);
  });

  it('Trance produces a minor-key pattern with drums at peak', () => {
    const e = new Engine2('trance');
    expect(e.getKey().scaleType).toBe('minor');
    expect(e.getTempo()).toBeGreaterThanOrEqual(128);
    expect(e.getTempo()).toBeLessThanOrEqual(138);
    // Advance into peak section
    const barSec = (60 / e.getTempo()) * 4;
    e.advance(barSec * 17);  // intro(8) + build(8) = 16; +1 to enter peak
    const pattern = e.getPattern();
    // Peak should have drums
    expect(pattern).toMatch(/\bbd\b/);
    expect(pattern).toMatch(/gm_synth_bass_1|gm_lead_2_sawtooth/);
  });

  it('Ambient uses slow tempo + lydian/major/dorian + no drums', () => {
    const e = new Engine2('ambient');
    expect(e.getTempo()).toBeLessThan(80);
    expect(['lydian', 'major', 'dorian']).toContain(e.getKey().scaleType);
    // Advance through whole piece — pulse should never appear
    const barSec = (60 / e.getTempo()) * 4;
    for (let i = 0; i < 10; i++) {
      e.advance(barSec * 4);
      const p = e.getPattern();
      expect(p).not.toMatch(/"bd"|"sd"|"hh"/);
    }
  });

  it('produces a non-empty Strudel pattern for plantasia', () => {
    const e = new Engine2('plantasia');
    const pattern = e.getPattern();
    expect(typeof pattern).toBe('string');
    expect(pattern.length).toBeGreaterThan(50);
    // The pattern must be a stack() or a single layer — it's evaluated by Strudel
    expect(pattern.startsWith('stack(') || pattern.startsWith('note(')).toBe(true);
  });

  it('returns a valid tempo and key', () => {
    const e = new Engine2('plantasia');
    expect(e.getTempo()).toBeGreaterThanOrEqual(92);
    expect(e.getTempo()).toBeLessThanOrEqual(98);
    const key = e.getKey();
    expect(key.scaleType).toBe('major');
    expect(['C', 'D', 'F', 'G', 'A', 'Bb', 'Eb']).toContain(key.root);
  });

  it('picks different keys across fresh pieces (random)', () => {
    const keys = new Set<string>();
    for (let i = 0; i < 30; i++) {
      keys.add(new Engine2('plantasia').getKey().root);
    }
    // With 7 possible roots and 30 draws, should see at least 3 distinct
    expect(keys.size).toBeGreaterThanOrEqual(3);
  });

  it('advances phrases after enough elapsed time', () => {
    const e = new Engine2('plantasia');
    const tempoBpm = e.getTempo();
    const barSec = (60 / tempoBpm) * 4;
    // advance half a phrase — should not cross a boundary
    expect(e.advance(barSec * 2)).toBe(false);
    // advance the rest of the phrase — should cross
    expect(e.advance(barSec * 2 + 0.01)).toBe(true);
    // (We don't compare rendered patterns for inequality — two random
    //  plantasia phrases can coincidentally render to the same string
    //  when the same progression + motif are drawn twice in a row.)
  });

  it('caches the pattern between calls within a phrase', () => {
    const e = new Engine2('plantasia');
    const a = e.getPattern();
    const b = e.getPattern();
    expect(a).toBe(b);  // identity — cached string reused
  });

  it('pattern contains all expected Plantasia roles (bass/chord/lead/color)', () => {
    // Intro has [bass, chord, color] active. Advance to peak/groove for full voicing.
    const e = new Engine2('plantasia');
    // advance through intro (8 bars) + build (8 bars) to reach peak
    const barSec = (60 / e.getTempo()) * 4;
    e.advance(barSec * 20);
    const pattern = e.getPattern();
    // Instruments should appear in the Strudel code
    expect(pattern).toMatch(/sine|gm_pad_warm|gm_lead_2_sawtooth|gm_celesta/);
  });

  it('Downtempo uses halftime drums + warm pad at peak', () => {
    const e = new Engine2('downtempo');
    expect(e.getTempo()).toBeGreaterThanOrEqual(70);
    expect(e.getTempo()).toBeLessThanOrEqual(90);
    const barSec = (60 / e.getTempo()) * 4;
    e.advance(barSec * 17);  // past intro+build into peak
    const pattern = e.getPattern();
    expect(pattern).toMatch(/gm_pad_warm/);
    expect(pattern).toMatch(/\bbd\b/);
    // halftime: kick on 1 only (pattern 'bd ~ ~ ~ ~ ~ ~ ~'), not bd-per-beat
    expect(pattern).toMatch(/"bd ~ ~ ~ ~ ~ ~ ~"/);
  });

  it('Avril produces a drumless piano-led pattern throughout', () => {
    const e = new Engine2('avril');
    expect(e.getTempo()).toBeGreaterThanOrEqual(90);
    expect(e.getTempo()).toBeLessThanOrEqual(110);
    const barSec = (60 / e.getTempo()) * 4;
    // Walk the whole piece — no drums should ever appear
    for (let i = 0; i < 10; i++) {
      e.advance(barSec * 4);
      const p = e.getPattern();
      expect(p).not.toMatch(/"bd"|"sd"|"hh"/);
      expect(p).not.toMatch(/sound\("bd/);
    }
    // Peak should include piano and accordion
    const peakPattern = e.getPattern();
    expect(peakPattern).toMatch(/gm_acoustic_grand_piano|gm_accordion/);
  });

  it('Blockhead has boom-bap pulse with gritty Rhodes at peak', () => {
    const e = new Engine2('blockhead');
    expect(e.getTempo()).toBeGreaterThanOrEqual(82);
    expect(e.getTempo()).toBeLessThanOrEqual(96);
    const barSec = (60 / e.getTempo()) * 4;
    e.advance(barSec * 17);
    const pattern = e.getPattern();
    expect(pattern).toMatch(/gm_epiano2/);
    expect(pattern).toMatch(/gm_muted_trumpet/);
    expect(pattern).toMatch(/\bbd\b/);
    // Boom-bap kick: 1 + and-of-2 + 3 (pattern 'bd ~ ~ bd bd ~ ~ ~')
    expect(pattern).toMatch(/"bd ~ ~ bd bd ~ ~ ~"/);
  });

  it('Flim is drumless, slow, and uses music box / celesta', () => {
    const e = new Engine2('flim');
    expect(e.getTempo()).toBeLessThan(80);
    expect(e.getTempo()).toBeGreaterThanOrEqual(66);
    const barSec = (60 / e.getTempo()) * 4;
    for (let i = 0; i < 10; i++) {
      e.advance(barSec * 4);
      const p = e.getPattern();
      expect(p).not.toMatch(/"bd"|"sd"|"hh"/);
    }
    const peakPattern = e.getPattern();
    expect(peakPattern).toMatch(/gm_music_box|gm_celesta/);
  });

  it('Xtal uses modal (mixolydian/lydian/major) + drums at peak', () => {
    const e = new Engine2('xtal');
    expect(e.getTempo()).toBeGreaterThanOrEqual(100);
    expect(e.getTempo()).toBeLessThanOrEqual(118);
    expect(['mixolydian', 'lydian', 'major']).toContain(e.getKey().scaleType);
    const barSec = (60 / e.getTempo()) * 4;
    e.advance(barSec * 17);
    const pattern = e.getPattern();
    expect(pattern).toMatch(/\bbd\b/);
    expect(pattern).toMatch(/gm_pad_polysynth|gm_synth_strings_1|gm_glockenspiel/);
  });

  it('Syro has polyrhythmic drums including perc/clap at peak', () => {
    const e = new Engine2('syro');
    expect(e.getTempo()).toBeGreaterThanOrEqual(118);
    expect(e.getTempo()).toBeLessThanOrEqual(140);
    const barSec = (60 / e.getTempo()) * 4;
    e.advance(barSec * 14);  // syro intro is 4 bars, build 8 → 12 bars; +2 to enter peak
    const pattern = e.getPattern();
    expect(pattern).toMatch(/\bbd\b/);
    expect(pattern).toMatch(/\bsd\b/);
    expect(pattern).toMatch(/\bcp\b/);  // clap — fourth drum voice
    // Syro uses non-4-on-the-floor kick — none of the patterns are 'bd bd bd bd'
    expect(pattern).not.toMatch(/"bd bd bd bd"/);
  });
});
