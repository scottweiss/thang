import './dashboard.css';
import type { GenerativeController } from '../engine/generative-controller';
import type { GenerativeState, DashboardOverrides, LayerName, NoteName, ScaleType, Mood } from '../types';
import { evaluate, isReady } from '../strudel/bridge';

const LAYER_NAMES: LayerName[] = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];

const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_TYPES: ScaleType[] = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'];

const CURATED_INSTRUMENTS: Record<LayerName, string[]> = {
  drone: ['sine', 'sawtooth', 'acoustic_bass', 'fretless_bass', 'electric_bass_finger', 'electric_bass_pick', 'slap_bass_1', 'synth_bass_1', 'synth_bass_2', 'contrabass'],
  harmony: ['triangle', 'epiano1', 'pad_choir', 'pad_warm', 'pad_polysynth', 'string_ensemble_1', 'rock_organ', 'celesta', 'electric_guitar_jazz', 'acoustic_guitar_nylon', 'brass_section', 'french_horn'],
  melody: ['sine', 'triangle', 'square', 'sawtooth', 'celesta', 'vibraphone', 'piano', 'music_box', 'clavinet', 'flute', 'clarinet', 'trumpet', 'lead_2_sawtooth', 'lead_4_chiff'],
  texture: [],
  arp: ['sine', 'triangle', 'square', 'sawtooth', 'marimba', 'kalimba', 'glockenspiel', 'dulcimer', 'tubular_bells', 'clavinet', 'electric_guitar_clean', 'koto', 'shamisen', 'lead_1_square'],
  atmosphere: ['sine', 'sawtooth', 'triangle', 'pad_halo', 'pad_sweep', 'fx_crystal', 'fx_sci_fi', 'fx_echoes', 'fx_atmosphere', 'string_ensemble_1'],
};

const ALL_INSTRUMENTS: Record<string, string[]> = {
  'Oscillators': ['sine', 'triangle', 'square', 'sawtooth'],
  'Piano': ['acoustic_grand_piano', 'bright_acoustic_piano', 'electric_grand_piano', 'honky_tonk_piano', 'electric_piano_1', 'electric_piano_2', 'harpsichord', 'clavinet'],
  'Chromatic Perc': ['celesta', 'glockenspiel', 'music_box', 'vibraphone', 'marimba', 'xylophone', 'tubular_bells', 'dulcimer'],
  'Organ': ['drawbar_organ', 'percussive_organ', 'rock_organ', 'church_organ', 'reed_organ', 'accordion', 'harmonica', 'tango_accordion'],
  'Guitar': ['acoustic_guitar_nylon', 'acoustic_guitar_steel', 'electric_guitar_jazz', 'electric_guitar_clean', 'electric_guitar_muted', 'overdriven_guitar', 'distortion_guitar', 'guitar_harmonics'],
  'Bass': ['acoustic_bass', 'electric_bass_finger', 'electric_bass_pick', 'fretless_bass', 'slap_bass_1', 'slap_bass_2', 'synth_bass_1', 'synth_bass_2'],
  'Strings': ['violin', 'viola', 'cello', 'contrabass', 'tremolo_strings', 'pizzicato_strings', 'orchestral_harp', 'timpani'],
  'Ensemble': ['string_ensemble_1', 'string_ensemble_2', 'synth_strings_1', 'synth_strings_2', 'choir_aahs', 'voice_oohs', 'synth_choir', 'orchestra_hit'],
  'Brass': ['trumpet', 'trombone', 'tuba', 'muted_trumpet', 'french_horn', 'brass_section', 'synth_brass_1', 'synth_brass_2'],
  'Reed': ['soprano_sax', 'alto_sax', 'tenor_sax', 'baritone_sax', 'oboe', 'english_horn', 'bassoon', 'clarinet'],
  'Pipe': ['piccolo', 'flute', 'recorder', 'pan_flute', 'blown_bottle', 'shakuhachi', 'whistle', 'ocarina'],
  'Synth Lead': ['lead_1_square', 'lead_2_sawtooth', 'lead_3_calliope', 'lead_4_chiff', 'lead_5_charang', 'lead_6_voice', 'lead_7_fifths', 'lead_8_bass_lead'],
  'Synth Pad': ['pad_new_age', 'pad_warm', 'pad_polysynth', 'pad_choir', 'pad_bowed', 'pad_metallic', 'pad_halo', 'pad_sweep'],
  'Synth FX': ['fx_rain', 'fx_soundtrack', 'fx_crystal', 'fx_atmosphere', 'fx_brightness', 'fx_goblins', 'fx_echoes', 'fx_sci_fi'],
  'Ethnic': ['sitar', 'banjo', 'shamisen', 'koto', 'kalimba', 'bagpipe', 'fiddle', 'shanai'],
  'Percussive': ['tinkle_bell', 'agogo', 'steel_drums', 'woodblock', 'taiko_drum', 'melodic_tom', 'synth_drum', 'reverse_cymbal'],
};

const OSCILLATORS = new Set(['sine', 'triangle', 'square', 'sawtooth']);

interface Preset {
  name: string;
  description: string;
  mood: Mood;
  scaleRoot: NoteName;
  scaleType: ScaleType;
  tempo: number;
  overrides: DashboardOverrides;
}

const PRESETS: Preset[] = [
  {
    name: 'midnight',
    description: 'noir jazz \u2014 smoky bar, blue neon, rain on glass',
    mood: 'lofi',
    scaleRoot: 'D#',
    scaleType: 'dorian',
    tempo: 72,
    overrides: {
      layers: {
        drone:      { gain: 75, instrument: 'gm_fretless_bass' },
        harmony:    { gain: 65, instrument: 'gm_electric_piano_1' },
        melody:     { gain: 95, instrument: 'gm_muted_trumpet' },
        texture:    { gain: 40 },
        arp:        { gain: 50, instrument: 'gm_vibraphone' },
        atmosphere: { gain: 35, instrument: 'gm_pad_halo' },
      },
      mix: {
        drone:      { room: 40, delay: 0, lpf: 65, pan: 0 },
        harmony:    { room: 55, delay: 10, lpf: 70, pan: -0.3 },
        melody:     { room: 65, delay: 25, lpf: 80, pan: 0.15 },
        texture:    { room: 30, delay: 0, lpf: 60, pan: 0 },
        arp:        { room: 75, delay: 15, lpf: 85, pan: 0.35 },
        atmosphere: { room: 80, delay: 5, lpf: 55, pan: -0.2 },
      },
      musical: {},
      masterGain: 90,
    },
  },
  {
    name: 'cathedral',
    description: 'sacred minimalism \u2014 vast stone, voices, light through glass',
    mood: 'ambient',
    scaleRoot: 'F',
    scaleType: 'lydian',
    tempo: 66,
    overrides: {
      layers: {
        drone:      { gain: 80, instrument: 'gm_contrabass' },
        harmony:    { gain: 70, instrument: 'gm_pad_choir' },
        melody:     { gain: 85, instrument: 'gm_flute' },
        texture:    { enabled: false },
        arp:        { gain: 45, instrument: 'gm_celesta' },
        atmosphere: { gain: 50, instrument: 'gm_string_ensemble_1' },
      },
      mix: {
        drone:      { room: 85, delay: 0, lpf: 60, pan: 0 },
        harmony:    { room: 90, delay: 5, lpf: 75, pan: -0.25 },
        melody:     { room: 50, delay: 0, lpf: 90, pan: 0.1 },
        arp:        { room: 95, delay: 10, lpf: 95, pan: 0.4 },
        atmosphere: { room: 90, delay: 0, lpf: 70, pan: -0.35 },
      },
      musical: {},
      masterGain: 85,
    },
  },
  {
    name: 'neon',
    description: 'cyberpunk \u2014 rain-soaked streets, electric pulse, machine breath',
    mood: 'trance',
    scaleRoot: 'A',
    scaleType: 'phrygian',
    tempo: 128,
    overrides: {
      layers: {
        drone:      { gain: 90, instrument: 'gm_synth_bass_1' },
        harmony:    { gain: 55, instrument: 'gm_pad_polysynth' },
        melody:     { gain: 85, instrument: 'gm_lead_2_sawtooth' },
        texture:    { gain: 70 },
        arp:        { gain: 55, instrument: 'gm_lead_1_square' },
        atmosphere: { gain: 40, instrument: 'gm_fx_sci_fi' },
      },
      mix: {
        drone:      { room: 20, delay: 0, lpf: 50, pan: 0 },
        harmony:    { room: 60, delay: 10, lpf: 65, pan: -0.4 },
        melody:     { room: 15, delay: 5, lpf: 75, pan: 0.1 },
        texture:    { room: 10, delay: 0, lpf: 55, pan: 0 },
        arp:        { room: 30, delay: 30, lpf: 70, pan: 0.45 },
        atmosphere: { room: 70, delay: 20, lpf: 45, pan: -0.3 },
      },
      musical: {},
      masterGain: 95,
    },
  },
  {
    name: 'driftwood',
    description: 'pacific sunset \u2014 warm sand, salt air, golden hour fading',
    mood: 'downtempo',
    scaleRoot: 'G',
    scaleType: 'major',
    tempo: 84,
    overrides: {
      layers: {
        drone:      { gain: 70, instrument: 'gm_acoustic_bass' },
        harmony:    { gain: 75, instrument: 'gm_acoustic_guitar_nylon' },
        melody:     { gain: 85, instrument: 'gm_pan_flute' },
        texture:    { gain: 35 },
        arp:        { gain: 60, instrument: 'gm_kalimba' },
        atmosphere: { gain: 45, instrument: 'gm_fx_atmosphere' },
      },
      mix: {
        drone:      { room: 45, delay: 0, lpf: 70, pan: 0 },
        harmony:    { room: 50, delay: 5, lpf: 80, pan: -0.3 },
        melody:     { room: 55, delay: 10, lpf: 90, pan: 0.15 },
        texture:    { room: 25, delay: 0, lpf: 65, pan: 0 },
        arp:        { room: 60, delay: 0, lpf: 95, pan: 0.4 },
        atmosphere: { room: 70, delay: 15, lpf: 75, pan: -0.25 },
      },
      musical: {},
      masterGain: 90,
    },
  },
  {
    name: 'glass',
    description: 'minimalism \u2014 interlocking patterns, shifting phases, motoric pulse',
    mood: 'xtal',
    scaleRoot: 'C',
    scaleType: 'major',
    tempo: 138,
    overrides: {
      layers: {
        drone:      { gain: 55, instrument: 'sine' },
        harmony:    { gain: 70, instrument: 'gm_electric_piano_1' },
        melody:     { gain: 95, instrument: 'gm_marimba' },
        texture:    { gain: 30 },
        arp:        { gain: 65, instrument: 'gm_glockenspiel' },
        atmosphere: { enabled: false },
      },
      mix: {
        drone:      { room: 20, delay: 0, lpf: 55, pan: 0 },
        harmony:    { room: 25, delay: 0, lpf: 70, pan: -0.2 },
        melody:     { room: 15, delay: 0, lpf: 85, pan: 0 },
        texture:    { room: 10, delay: 0, lpf: 50, pan: 0 },
        arp:        { room: 30, delay: 0, lpf: 90, pan: 0.3 },
      },
      musical: {},
      masterGain: 100,
    },
  },
];

function createOverrides(): DashboardOverrides {
  return { layers: {}, mix: {}, musical: {} };
}

export class Dashboard {
  private panel: HTMLElement;
  private gearBtn: HTMLElement;
  private isOpen = false;
  private overrides: DashboardOverrides = createOverrides();
  private controller: GenerativeController;
  private showAllInstruments = false;
  private auditionInstrument = 'gm_acoustic_grand_piano';
  private auditionNote = 'C';
  private auditionOctave = 4;
  private auditionVolume = 60;

  constructor(controller: GenerativeController) {
    this.controller = controller;
    this.gearBtn = this.createGearButton();
    this.panel = this.createPanel();
    document.body.appendChild(this.gearBtn);
    document.body.appendChild(this.panel);
    this.setupKeyboardShortcut();
  }

  private createGearButton(): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'gear-btn';
    btn.innerHTML = '&#9881;';
    btn.title = 'Dashboard (D)';
    btn.addEventListener('click', () => this.toggle());
    return btn;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('open', this.isOpen);
    this.gearBtn.classList.toggle('active', this.isOpen);
  }

  private setupKeyboardShortcut(): void {
    document.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'd' || e.key === 'D') {
        this.toggle();
      }
    });
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'dashboard-panel';

    const header = document.createElement('div');
    header.className = 'dashboard-header';
    header.innerHTML = '<h2>dashboard</h2>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'dashboard-close';
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => this.toggle());
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'dashboard-body';

    body.appendChild(this.createPresetsSection());
    body.appendChild(this.createLayersSection());
    body.appendChild(this.createMusicalSection());
    body.appendChild(this.createMixSection());
    body.appendChild(this.createGlobalSection());
    body.appendChild(this.createAuditionSection());

    panel.appendChild(header);
    panel.appendChild(body);
    return panel;
  }

  private createSection(title: string, id: string): { section: HTMLElement; body: HTMLElement } {
    const section = document.createElement('div');
    section.className = 'dash-section';
    section.id = `dash-${id}`;

    const header = document.createElement('div');
    header.className = 'dash-section-header';
    header.innerHTML = `<span class="dash-section-arrow">\u25bc</span><span class="dash-section-title">${title}</span>`;
    header.addEventListener('click', () => {
      section.classList.toggle('collapsed');
    });

    const body = document.createElement('div');
    body.className = 'dash-section-body';

    section.appendChild(header);
    section.appendChild(body);
    return { section, body };
  }

  private createPresetsSection(): HTMLElement {
    const { section, body } = this.createSection('Presets', 'presets');

    for (const preset of PRESETS) {
      const btn = document.createElement('button');
      btn.className = 'dash-preset-btn';
      btn.innerHTML = `<span class="dash-preset-name">${preset.name}</span><span class="dash-preset-desc">${preset.description}</span>`;
      btn.addEventListener('click', () => this.loadPreset(preset));
      body.appendChild(btn);
    }

    return section;
  }

  private loadPreset(preset: Preset): void {
    // Set mood first (resets engine state)
    this.controller.setMood(preset.mood);

    // Update mood UI: accent color + active button
    document.body.setAttribute('data-mood', preset.mood);
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(b => {
      b.classList.toggle('active', (b as HTMLElement).dataset.mood === preset.mood);
    });

    // Set musical parameters
    this.controller.setScaleRoot(preset.scaleRoot);
    this.controller.setScaleType(preset.scaleType);
    this.controller.setTempo(preset.tempo);

    // Deep copy the preset overrides
    this.overrides = JSON.parse(JSON.stringify(preset.overrides));

    // Apply overrides to engine
    this.applyOverrides();

    // Sync all UI controls to reflect new state
    this.syncUIToOverrides();
  }

  private syncUIToOverrides(): void {
    // Layer checkboxes
    const checkboxes = this.panel.querySelectorAll('.dash-checkbox[data-layer]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => {
      const layer = cb.dataset.layer as LayerName;
      const ov = this.overrides.layers[layer];
      cb.checked = ov?.enabled !== false;
    });

    // Layer gain sliders
    const gainSliders = this.panel.querySelectorAll('.dash-slider[data-param="gain"]') as NodeListOf<HTMLInputElement>;
    gainSliders.forEach(s => {
      const layer = s.dataset.layer as LayerName;
      const ov = this.overrides.layers[layer];
      s.value = (ov?.gain ?? 100).toString();
    });

    // Instrument selects
    const selects = this.panel.querySelectorAll('select.dash-select[data-layer]') as NodeListOf<HTMLSelectElement>;
    selects.forEach(s => {
      const layer = s.dataset.layer as LayerName;
      const ov = this.overrides.layers[layer];
      s.value = ov?.instrument ?? '';
    });

    // Mix sliders
    const mixSliders = this.panel.querySelectorAll('.dash-slider[data-mix-param]') as NodeListOf<HTMLInputElement>;
    mixSliders.forEach(s => {
      const layer = s.dataset.layer as LayerName;
      const param = s.dataset.mixParam as 'room' | 'delay' | 'lpf' | 'pan';
      const ov = this.overrides.mix[layer];
      if (ov && ov[param] !== undefined) {
        if (param === 'pan') {
          s.value = Math.round(ov[param]! * 100).toString();
        } else {
          s.value = ov[param]!.toString();
        }
      } else {
        // Defaults
        if (param === 'room') s.value = '50';
        else if (param === 'delay') s.value = '0';
        else if (param === 'lpf') s.value = '100';
        else if (param === 'pan') s.value = '0';
      }
    });

    // Master gain
    const masterGain = this.panel.querySelector('#dash-master-gain') as HTMLInputElement | null;
    if (masterGain) masterGain.value = (this.overrides.masterGain ?? 100).toString();
    const masterGainVal = this.panel.querySelector('#dash-master-gain-val') as HTMLElement | null;
    if (masterGainVal) masterGainVal.textContent = (this.overrides.masterGain ?? 100) + '%';
  }

  private createLayersSection(): HTMLElement {
    const { section, body } = this.createSection('Layers', 'layers');

    for (const layer of LAYER_NAMES) {
      const row = document.createElement('div');
      row.className = 'dash-layer-row';

      const nameEl = document.createElement('span');
      nameEl.className = 'dash-layer-name';
      nameEl.textContent = layer;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'dash-checkbox';
      checkbox.checked = true;
      checkbox.dataset.layer = layer;
      checkbox.addEventListener('change', () => {
        if (!this.overrides.layers[layer]) this.overrides.layers[layer] = {};
        this.overrides.layers[layer]!.enabled = checkbox.checked;
        this.applyOverrides();
      });

      const gainSlider = document.createElement('input');
      gainSlider.type = 'range';
      gainSlider.className = 'dash-slider';
      gainSlider.min = '0';
      gainSlider.max = '150';
      gainSlider.value = '100';
      gainSlider.dataset.layer = layer;
      gainSlider.dataset.param = 'gain';
      gainSlider.addEventListener('input', () => {
        if (!this.overrides.layers[layer]) this.overrides.layers[layer] = {};
        this.overrides.layers[layer]!.gain = parseInt(gainSlider.value);
        this.applyOverrides();
      });

      const select = document.createElement('select');
      select.className = 'dash-select';
      select.dataset.layer = layer;
      if (layer === 'texture') {
        select.innerHTML = '<option value="">drums</option>';
        select.disabled = true;
      } else {
        this.populateInstrumentSelect(select, layer);
        select.addEventListener('change', () => {
          if (select.value === '') {
            if (this.overrides.layers[layer]) {
              delete this.overrides.layers[layer]!.instrument;
            }
          } else {
            if (!this.overrides.layers[layer]) this.overrides.layers[layer] = {};
            this.overrides.layers[layer]!.instrument = select.value;
          }
          this.applyOverrides();
        });
      }

      row.appendChild(nameEl);
      row.appendChild(checkbox);
      row.appendChild(gainSlider);
      row.appendChild(select);
      body.appendChild(row);
    }

    // Show all toggle
    const showAllRow = document.createElement('label');
    showAllRow.className = 'dash-show-all';
    const showAllCheck = document.createElement('input');
    showAllCheck.type = 'checkbox';
    showAllCheck.className = 'dash-checkbox';
    showAllCheck.addEventListener('change', () => {
      this.showAllInstruments = showAllCheck.checked;
      const selects = body.querySelectorAll('select.dash-select') as NodeListOf<HTMLSelectElement>;
      selects.forEach(sel => {
        const lyr = sel.dataset.layer as LayerName;
        if (lyr !== 'texture') {
          const currentVal = sel.value;
          this.populateInstrumentSelect(sel, lyr);
          sel.value = currentVal;
        }
      });
    });
    showAllRow.appendChild(showAllCheck);
    showAllRow.appendChild(document.createTextNode(' show all instruments'));
    body.appendChild(showAllRow);

    return section;
  }

  private populateInstrumentSelect(select: HTMLSelectElement, layer: LayerName): void {
    select.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '(mood default)';
    select.appendChild(defaultOpt);

    if (this.showAllInstruments) {
      for (const [category, instruments] of Object.entries(ALL_INSTRUMENTS)) {
        const group = document.createElement('optgroup');
        group.label = category;
        for (const inst of instruments) {
          const opt = document.createElement('option');
          opt.value = OSCILLATORS.has(inst) ? inst : `gm_${inst}`;
          opt.textContent = inst.replace(/_/g, ' ');
          group.appendChild(opt);
        }
        select.appendChild(group);
      }
    } else {
      const curated = CURATED_INSTRUMENTS[layer];
      for (const inst of curated) {
        const opt = document.createElement('option');
        opt.value = OSCILLATORS.has(inst) ? inst : `gm_${inst}`;
        opt.textContent = inst.replace(/_/g, ' ');
        select.appendChild(opt);
      }
    }
  }

  private createMusicalSection(): HTMLElement {
    const { section, body } = this.createSection('Musical', 'musical');

    // Scale root
    const rootRow = document.createElement('div');
    rootRow.className = 'dash-musical-row';
    rootRow.innerHTML = '<span class="dash-musical-label">root</span>';
    const rootSelect = document.createElement('select');
    rootSelect.className = 'dash-select';
    rootSelect.id = 'dash-scale-root';
    for (const note of NOTE_NAMES) {
      const opt = document.createElement('option');
      opt.value = note;
      opt.textContent = note;
      rootSelect.appendChild(opt);
    }
    rootSelect.addEventListener('change', () => {
      this.controller.setScaleRoot(rootSelect.value as NoteName);
    });
    rootRow.appendChild(rootSelect);
    body.appendChild(rootRow);

    // Scale type
    const typeRow = document.createElement('div');
    typeRow.className = 'dash-musical-row';
    typeRow.innerHTML = '<span class="dash-musical-label">scale</span>';
    const typeSelect = document.createElement('select');
    typeSelect.className = 'dash-select';
    typeSelect.id = 'dash-scale-type';
    for (const st of SCALE_TYPES) {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      typeSelect.appendChild(opt);
    }
    typeSelect.addEventListener('change', () => {
      this.controller.setScaleType(typeSelect.value as ScaleType);
    });
    typeRow.appendChild(typeSelect);
    body.appendChild(typeRow);

    // Tempo
    const tempoRow = document.createElement('div');
    tempoRow.className = 'dash-tempo-row';
    tempoRow.innerHTML = '<span class="dash-musical-label">tempo</span>';
    const tempoSlider = document.createElement('input');
    tempoSlider.type = 'range';
    tempoSlider.className = 'dash-slider';
    tempoSlider.id = 'dash-tempo';
    tempoSlider.min = '60';
    tempoSlider.max = '180';
    tempoSlider.value = '120';
    const tempoVal = document.createElement('span');
    tempoVal.className = 'dash-tempo-val';
    tempoVal.id = 'dash-tempo-val';
    tempoVal.textContent = '120';
    tempoSlider.addEventListener('input', () => {
      tempoVal.textContent = tempoSlider.value;
      this.controller.setTempo(parseInt(tempoSlider.value));
    });
    tempoRow.appendChild(tempoSlider);
    tempoRow.appendChild(tempoVal);
    body.appendChild(tempoRow);

    // Force buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'dash-btn-row';
    const forceChord = document.createElement('button');
    forceChord.className = 'dash-btn';
    forceChord.textContent = 'force chord';
    forceChord.addEventListener('click', () => this.controller.forceNextChord());
    const forceSection = document.createElement('button');
    forceSection.className = 'dash-btn';
    forceSection.textContent = 'force section';
    forceSection.addEventListener('click', () => this.controller.forceNextSection());
    btnRow.appendChild(forceChord);
    btnRow.appendChild(forceSection);
    body.appendChild(btnRow);

    // Current state readout
    const stateRow = document.createElement('div');
    stateRow.className = 'dash-state';
    stateRow.id = 'dash-musical-state';
    stateRow.innerHTML = 'chord: <span class="dash-state-val" id="dash-chord">\u2014</span> &nbsp; section: <span class="dash-state-val" id="dash-section">\u2014</span> &nbsp; tension: <span class="dash-state-val" id="dash-tension">\u2014</span>';
    body.appendChild(stateRow);

    return section;
  }

  private createMixSection(): HTMLElement {
    const { section, body } = this.createSection('Mix', 'mix');

    for (const layer of LAYER_NAMES) {
      const row = document.createElement('div');
      row.className = 'dash-mix-row';

      const nameEl = document.createElement('span');
      nameEl.className = 'dash-layer-name';
      nameEl.textContent = layer;

      const sliders = document.createElement('div');
      sliders.className = 'dash-mix-sliders';

      const mixParams: { param: 'room' | 'delay' | 'lpf' | 'pan'; label: string; min: string; max: string; value: string }[] = [
        { param: 'room', label: 'verb', min: '0', max: '100', value: '50' },
        { param: 'delay', label: 'dly', min: '0', max: '100', value: '0' },
        { param: 'lpf', label: 'filt', min: '0', max: '100', value: '100' },
        { param: 'pan', label: 'pan', min: '-100', max: '100', value: '0' },
      ];

      for (const mp of mixParams) {
        const control = document.createElement('div');
        control.className = 'dash-mix-control';

        const label = document.createElement('span');
        label.className = 'dash-mix-label';
        label.textContent = mp.label;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'dash-slider';
        slider.min = mp.min;
        slider.max = mp.max;
        slider.value = mp.value;
        slider.dataset.layer = layer;
        slider.dataset.mixParam = mp.param;
        slider.addEventListener('input', () => {
          if (!this.overrides.mix[layer]) this.overrides.mix[layer] = {};
          const val = parseInt(slider.value);
          if (mp.param === 'pan') {
            this.overrides.mix[layer]![mp.param] = val / 100;
          } else {
            this.overrides.mix[layer]![mp.param] = val;
          }
          this.applyOverrides();
        });

        control.appendChild(label);
        control.appendChild(slider);
        sliders.appendChild(control);
      }

      row.appendChild(nameEl);
      row.appendChild(sliders);
      body.appendChild(row);
    }

    return section;
  }

  private createGlobalSection(): HTMLElement {
    const { section, body } = this.createSection('Global', 'global');

    // Master gain
    const gainRow = document.createElement('div');
    gainRow.className = 'dash-global-row';
    gainRow.innerHTML = '<span class="dash-global-label">master gain</span>';
    const gainSlider = document.createElement('input');
    gainSlider.type = 'range';
    gainSlider.className = 'dash-slider';
    gainSlider.id = 'dash-master-gain';
    gainSlider.min = '0';
    gainSlider.max = '150';
    gainSlider.value = '100';
    const gainVal = document.createElement('span');
    gainVal.className = 'dash-global-val';
    gainVal.id = 'dash-master-gain-val';
    gainVal.textContent = '100%';
    gainSlider.addEventListener('input', () => {
      gainVal.textContent = gainSlider.value + '%';
      this.overrides.masterGain = parseInt(gainSlider.value);
      this.applyOverrides();
    });
    gainRow.appendChild(gainSlider);
    gainRow.appendChild(gainVal);
    body.appendChild(gainRow);

    // Reset button
    const resetRow = document.createElement('div');
    resetRow.className = 'dash-btn-row';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'dash-btn';
    resetBtn.textContent = 'reset to defaults';
    resetBtn.addEventListener('click', () => this.resetOverrides());
    resetRow.appendChild(resetBtn);
    body.appendChild(resetRow);

    return section;
  }

  private applyOverrides(): void {
    this.controller.setDashboardOverrides({ ...this.overrides });
  }

  private resetOverrides(): void {
    this.overrides = createOverrides();

    const checkboxes = this.panel.querySelectorAll('.dash-checkbox[data-layer]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => { cb.checked = true; });

    const gainSliders = this.panel.querySelectorAll('.dash-slider[data-param="gain"]') as NodeListOf<HTMLInputElement>;
    gainSliders.forEach(s => { s.value = '100'; });

    const selects = this.panel.querySelectorAll('select.dash-select[data-layer]') as NodeListOf<HTMLSelectElement>;
    selects.forEach(s => { s.value = ''; });

    const mixSliders = this.panel.querySelectorAll('.dash-slider[data-mix-param]') as NodeListOf<HTMLInputElement>;
    mixSliders.forEach(s => {
      const param = s.dataset.mixParam;
      if (param === 'room') s.value = '50';
      else if (param === 'delay') s.value = '0';
      else if (param === 'lpf') s.value = '100';
      else if (param === 'pan') s.value = '0';
    });

    const masterGain = this.panel.querySelector('#dash-master-gain') as HTMLInputElement | null;
    if (masterGain) masterGain.value = '100';
    const masterGainVal = this.panel.querySelector('#dash-master-gain-val') as HTMLElement | null;
    if (masterGainVal) masterGainVal.textContent = '100%';

    this.controller.setDashboardOverrides(this.overrides);
  }

  updateState(state: GenerativeState): void {
    const chordEl = this.panel.querySelector('#dash-chord') as HTMLElement | null;
    if (chordEl) chordEl.textContent = state.currentChord.symbol;

    const sectionEl = this.panel.querySelector('#dash-section') as HTMLElement | null;
    if (sectionEl) sectionEl.textContent = state.section;

    const tensionEl = this.panel.querySelector('#dash-tension') as HTMLElement | null;
    if (tensionEl) tensionEl.textContent = (state.tension?.overall ?? 0).toFixed(2);

    const rootSelect = this.panel.querySelector('#dash-scale-root') as HTMLSelectElement | null;
    if (rootSelect && rootSelect !== document.activeElement) {
      rootSelect.value = state.scale.root;
    }

    const typeSelect = this.panel.querySelector('#dash-scale-type') as HTMLSelectElement | null;
    if (typeSelect && typeSelect !== document.activeElement) {
      typeSelect.value = state.scale.type;
    }

    const tempoSlider = this.panel.querySelector('#dash-tempo') as HTMLInputElement | null;
    if (tempoSlider && tempoSlider !== document.activeElement) {
      const bpm = Math.round(state.params.tempo * 240);
      tempoSlider.value = bpm.toString();
      const tempoVal = this.panel.querySelector('#dash-tempo-val') as HTMLElement | null;
      if (tempoVal) tempoVal.textContent = bpm.toString();
    }
  }

  // ---- Audition section ----

  private createAuditionSection(): HTMLElement {
    const { section, body } = this.createSection('Audition', 'audition');
    section.classList.add('collapsed');

    // Instrument select
    const instRow = document.createElement('div');
    instRow.className = 'dash-audition-row';
    const instSelect = document.createElement('select');
    instSelect.className = 'dash-select';
    for (const [group, instruments] of Object.entries(ALL_INSTRUMENTS)) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group;
      for (const inst of instruments) {
        const opt = document.createElement('option');
        const isOsc = OSCILLATORS.has(inst);
        opt.value = isOsc ? inst : `gm_${inst}`;
        opt.textContent = inst.replace(/_/g, ' ');
        if (opt.value === this.auditionInstrument) opt.selected = true;
        optgroup.appendChild(opt);
      }
      instSelect.appendChild(optgroup);
    }
    instSelect.addEventListener('change', () => {
      this.auditionInstrument = instSelect.value;
    });
    instRow.appendChild(instSelect);
    body.appendChild(instRow);

    // Note + octave row
    const noteRow = document.createElement('div');
    noteRow.className = 'dash-audition-note-row';

    const noteSelect = document.createElement('select');
    noteSelect.className = 'dash-select';
    for (const n of NOTE_NAMES) {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      if (n === this.auditionNote) opt.selected = true;
      noteSelect.appendChild(opt);
    }
    noteSelect.addEventListener('change', () => {
      this.auditionNote = noteSelect.value;
    });

    const octSelect = document.createElement('select');
    octSelect.className = 'dash-select';
    for (let o = 2; o <= 5; o++) {
      const opt = document.createElement('option');
      opt.value = o.toString();
      opt.textContent = `oct ${o}`;
      if (o === this.auditionOctave) opt.selected = true;
      octSelect.appendChild(opt);
    }
    octSelect.addEventListener('change', () => {
      this.auditionOctave = parseInt(octSelect.value);
    });

    noteRow.appendChild(noteSelect);
    noteRow.appendChild(octSelect);
    body.appendChild(noteRow);

    // Volume slider
    const volRow = document.createElement('div');
    volRow.className = 'dash-global-row';
    const volLabel = document.createElement('span');
    volLabel.className = 'dash-global-label';
    volLabel.textContent = 'volume';
    const volSlider = document.createElement('input');
    volSlider.type = 'range';
    volSlider.className = 'dash-slider';
    volSlider.min = '0';
    volSlider.max = '100';
    volSlider.value = this.auditionVolume.toString();
    const volVal = document.createElement('span');
    volVal.className = 'dash-global-val';
    volVal.textContent = this.auditionVolume.toString();
    volSlider.addEventListener('input', () => {
      this.auditionVolume = parseInt(volSlider.value);
      volVal.textContent = volSlider.value;
    });
    volRow.appendChild(volLabel);
    volRow.appendChild(volSlider);
    volRow.appendChild(volVal);
    body.appendChild(volRow);

    // Buttons row
    const btnRow = document.createElement('div');
    btnRow.className = 'dash-btn-row';

    const noteBtn = document.createElement('button');
    noteBtn.className = 'dash-btn';
    noteBtn.textContent = 'note';
    noteBtn.addEventListener('click', () => this.auditionPlayNote());

    const scaleBtn = document.createElement('button');
    scaleBtn.className = 'dash-btn';
    scaleBtn.textContent = 'scale';
    scaleBtn.addEventListener('click', () => this.auditionPlayScale());

    const chordBtn = document.createElement('button');
    chordBtn.className = 'dash-btn';
    chordBtn.textContent = 'chord';
    chordBtn.addEventListener('click', () => this.auditionPlayChord());

    btnRow.appendChild(noteBtn);
    btnRow.appendChild(scaleBtn);
    btnRow.appendChild(chordBtn);
    body.appendChild(btnRow);

    // Status hint
    const status = document.createElement('div');
    status.className = 'dash-audition-status';
    status.id = 'audition-status';
    body.appendChild(status);

    return section;
  }

  private async auditionPlayNote(): Promise<void> {
    if (!isReady()) {
      this.showAuditionStatus('start playback first');
      return;
    }
    const note = `${this.auditionNote}${this.auditionOctave}`;
    const gain = (this.auditionVolume / 100).toFixed(2);
    const code = `note("${note}").sound("${this.auditionInstrument}").gain(${gain}).orbit(6)`;
    try {
      await evaluate(code);
      this.showAuditionStatus('');
    } catch (e) {
      console.warn('[audition] playback failed:', e);
      this.showAuditionStatus('playback error');
    }
  }

  private async auditionPlayScale(): Promise<void> {
    if (!isReady()) {
      this.showAuditionStatus('start playback first');
      return;
    }
    const NOTE_NAMES_FULL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIdx = NOTE_NAMES_FULL.indexOf(this.auditionNote);
    const intervals = [0, 2, 4, 5, 7, 9, 11, 12]; // major scale
    const notes = intervals.map(i => {
      const idx = (rootIdx + i) % 12;
      const oct = this.auditionOctave + Math.floor((rootIdx + i) / 12);
      return `${NOTE_NAMES_FULL[idx]}${oct}`;
    });
    const noteStr = notes.map(n => `"${n}"`).join(' ');
    const gain = (this.auditionVolume / 100).toFixed(2);
    const code = `note(${noteStr}).sound("${this.auditionInstrument}").gain(${gain}).slow(2).orbit(6)`;
    try {
      await evaluate(code);
      this.showAuditionStatus('');
    } catch (e) {
      console.warn('[audition] scale playback failed:', e);
      this.showAuditionStatus('playback error');
    }
  }

  private async auditionPlayChord(): Promise<void> {
    if (!isReady()) {
      this.showAuditionStatus('start playback first');
      return;
    }
    const NOTE_NAMES_FULL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIdx = NOTE_NAMES_FULL.indexOf(this.auditionNote);
    const third = NOTE_NAMES_FULL[(rootIdx + 4) % 12];
    const thirdOct = this.auditionOctave + (rootIdx + 4 >= 12 ? 1 : 0);
    const fifth = NOTE_NAMES_FULL[(rootIdx + 7) % 12];
    const fifthOct = this.auditionOctave + (rootIdx + 7 >= 12 ? 1 : 0);
    const gain = (this.auditionVolume / 100).toFixed(2);
    const code = `note("${this.auditionNote}${this.auditionOctave}","${third}${thirdOct}","${fifth}${fifthOct}").sound("${this.auditionInstrument}").gain(${gain}).orbit(6)`;
    try {
      await evaluate(code);
      this.showAuditionStatus('');
    } catch (e) {
      console.warn('[audition] chord playback failed:', e);
      this.showAuditionStatus('playback error');
    }
  }

  private showAuditionStatus(msg: string): void {
    const el = this.panel.querySelector('#audition-status') as HTMLElement | null;
    if (el) el.textContent = msg;
  }

  destroy(): void {
    this.gearBtn.remove();
    this.panel.remove();
  }
}
