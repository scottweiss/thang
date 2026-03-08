import { Mood, GenerativeState } from '../types';

interface ControlsCallbacks {
  onPlay: () => Promise<void>;
  onStop: () => void;
  onMoodChange: (mood: Mood) => void;
  onDensity: (v: number) => void;
  onBrightness: (v: number) => void;
  onSpaciousness: (v: number) => void;
  onForceChord?: () => void;
  onForceSection?: () => void;
}

const MOODS: Mood[] = ['ambient', 'downtempo', 'lofi', 'trance'];

export function setupUI(app: HTMLElement, callbacks: ControlsCallbacks): {
  updateState: (state: GenerativeState) => void;
} {
  let playing = false;
  let immersive = false;
  let chordFlashTimer: ReturnType<typeof setTimeout> | null = null;

  // Set initial mood theme
  document.body.setAttribute('data-mood', 'downtempo');

  app.innerHTML = `
    <div class="header">
      <h1>thang</h1>
    </div>

    <button class="play-btn" id="playBtn">&#9654;</button>

    <div class="panel">
      <div class="mood-selector" id="moodSelector">
        ${MOODS.map(m => `<button class="mood-btn${m === 'downtempo' ? ' active' : ''}" data-mood="${m}">${m}</button>`).join('')}
      </div>

      <div class="control-group">
        <div class="control-label"><span>density</span><span class="value" id="densityVal">50</span></div>
        <input type="range" id="density" min="0" max="100" value="50" />
      </div>

      <div class="control-group">
        <div class="control-label"><span>brightness</span><span class="value" id="brightnessVal">50</span></div>
        <input type="range" id="brightness" min="0" max="100" value="50" />
      </div>

      <div class="control-group">
        <div class="control-label"><span>spaciousness</span><span class="value" id="spaciousnessVal">80</span></div>
        <input type="range" id="spaciousness" min="0" max="100" value="80" />
      </div>

      <div class="divider"></div>

      <div class="energy-bar-container">
        <div class="energy-bar" id="energyBar"></div>
      </div>

      <div class="state-display">
        <div class="state-item">
          <div class="state-label">scale</div>
          <div class="state-value" id="scaleDisplay">C min</div>
        </div>
        <div class="state-item">
          <div class="state-label">chord</div>
          <div class="state-value" id="chordDisplay">Cm7</div>
        </div>
        <div class="state-item">
          <div class="state-label">section</div>
          <div class="state-value" id="sectionDisplay">intro</div>
        </div>
        <div class="state-item">
          <div class="state-label">time</div>
          <div class="state-value" id="elapsedDisplay">0:00</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="shortcuts-hint" id="shortcutsHint">
        <span class="shortcut-key">space</span> play
        <span class="shortcut-key">1-4</span> mood
        <span class="shortcut-key">c</span> chord
        <span class="shortcut-key">s</span> section
        <span class="shortcut-key">&uarr;&darr;</span> density
        <span class="shortcut-key">&larr;&rarr;</span> bright
        <span class="shortcut-key">f</span> immersive
      </div>
    </div>

    <div class="immersive-hud" id="immersiveHud">
      <span class="hud-chord" id="hudChord">Cm7</span>
      <span class="hud-section" id="hudSection">intro</span>
      <span class="hud-mood" id="hudMood">downtempo</span>
    </div>
  `;

  const playBtn = app.querySelector('#playBtn') as HTMLButtonElement;
  const moodSelector = app.querySelector('#moodSelector') as HTMLElement;
  const densitySlider = app.querySelector('#density') as HTMLInputElement;
  const brightnessSlider = app.querySelector('#brightness') as HTMLInputElement;
  const spaciousnessSlider = app.querySelector('#spaciousness') as HTMLInputElement;

  playBtn.addEventListener('click', async () => {
    if (playing) {
      playing = false;
      playBtn.classList.remove('playing');
      playBtn.innerHTML = '&#9654;';
      callbacks.onStop();
    } else {
      playBtn.innerHTML = '&middot;&middot;&middot;';
      await callbacks.onPlay();
      playing = true;
      playBtn.classList.add('playing');
      playBtn.innerHTML = '&#9646;&#9646;';
    }
  });

  moodSelector.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.mood-btn') as HTMLElement | null;
    if (!btn) return;
    const mood = btn.dataset.mood as Mood;
    moodSelector.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.body.setAttribute('data-mood', mood);
    callbacks.onMoodChange(mood);
  });

  densitySlider.addEventListener('input', () => {
    const v = parseInt(densitySlider.value) / 100;
    (app.querySelector('#densityVal') as HTMLElement).textContent = densitySlider.value;
    callbacks.onDensity(v);
  });

  brightnessSlider.addEventListener('input', () => {
    const v = parseInt(brightnessSlider.value) / 100;
    (app.querySelector('#brightnessVal') as HTMLElement).textContent = brightnessSlider.value;
    callbacks.onBrightness(v);
  });

  spaciousnessSlider.addEventListener('input', () => {
    const v = parseInt(spaciousnessSlider.value) / 100;
    (app.querySelector('#spaciousnessVal') as HTMLElement).textContent = spaciousnessSlider.value;
    callbacks.onSpaciousness(v);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't capture when typing in inputs
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        playBtn.click();
        break;
      case '1': case '2': case '3': case '4': {
        const idx = parseInt(e.key) - 1;
        const mood = MOODS[idx];
        if (mood) {
          moodSelector.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
          const btn = moodSelector.querySelector(`[data-mood="${mood}"]`);
          btn?.classList.add('active');
          document.body.setAttribute('data-mood', mood);
          callbacks.onMoodChange(mood);
        }
        break;
      }
      case 'c':
      case 'C':
        callbacks.onForceChord?.();
        break;
      case 's':
      case 'S':
        callbacks.onForceSection?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        densitySlider.value = Math.min(100, parseInt(densitySlider.value) + 5).toString();
        densitySlider.dispatchEvent(new Event('input'));
        break;
      case 'ArrowDown':
        e.preventDefault();
        densitySlider.value = Math.max(0, parseInt(densitySlider.value) - 5).toString();
        densitySlider.dispatchEvent(new Event('input'));
        break;
      case 'ArrowRight':
        e.preventDefault();
        brightnessSlider.value = Math.min(100, parseInt(brightnessSlider.value) + 5).toString();
        brightnessSlider.dispatchEvent(new Event('input'));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        brightnessSlider.value = Math.max(0, parseInt(brightnessSlider.value) - 5).toString();
        brightnessSlider.dispatchEvent(new Event('input'));
        break;
      case 'f':
      case 'F':
        immersive = !immersive;
        document.body.classList.toggle('immersive', immersive);
        break;
    }
  });

  const sectionEnergyMap: Record<string, number> = {
    intro: 0.15, build: 0.4, peak: 1.0, breakdown: 0.25, groove: 0.7,
  };
  let smoothEnergy = 0.15;

  function updateState(state: GenerativeState): void {
    const scaleEl = app.querySelector('#scaleDisplay') as HTMLElement;
    const chordEl = app.querySelector('#chordDisplay') as HTMLElement;
    const sectionEl = app.querySelector('#sectionDisplay') as HTMLElement;
    const elapsedEl = app.querySelector('#elapsedDisplay') as HTMLElement;
    const energyBar = app.querySelector('#energyBar') as HTMLElement;

    // Smooth energy interpolation
    const targetEnergy = sectionEnergyMap[state.section] ?? 0.5;
    smoothEnergy += (targetEnergy - smoothEnergy) * 0.08;
    if (energyBar) {
      const pct = Math.round(smoothEnergy * 100);
      energyBar.style.width = `${pct}%`;
      energyBar.style.opacity = `${0.5 + smoothEnergy * 0.5}`;
    }

    if (scaleEl) {
      const shortType = state.scale.type.replace('minor', 'min').replace('major', 'maj');
      scaleEl.textContent = `${state.scale.root} ${shortType}`;
    }

    if (chordEl) {
      chordEl.textContent = state.currentChord.symbol;

      // Flash chord on change
      if (state.chordChanged) {
        chordEl.classList.add('chord-flash');
        if (chordFlashTimer) clearTimeout(chordFlashTimer);
        chordFlashTimer = setTimeout(() => chordEl.classList.remove('chord-flash'), 600);
      }
    }

    if (sectionEl) {
      sectionEl.textContent = state.section;
      if (state.sectionChanged) {
        sectionEl.classList.add('chord-flash');
        setTimeout(() => sectionEl.classList.remove('chord-flash'), 800);
      }
    }

    // Update immersive HUD
    const hudChord = app.querySelector('#hudChord') as HTMLElement;
    const hudSection = app.querySelector('#hudSection') as HTMLElement;
    const hudMood = app.querySelector('#hudMood') as HTMLElement;
    if (hudChord) hudChord.textContent = state.currentChord.symbol;
    if (hudSection) hudSection.textContent = state.section;
    if (hudMood) hudMood.textContent = state.mood;

    if (elapsedEl) {
      const mins = Math.floor(state.elapsed / 60);
      const secs = Math.floor(state.elapsed % 60);
      elapsedEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Update sliders to reflect drifted params
    densitySlider.value = Math.round(state.params.density * 100).toString();
    (app.querySelector('#densityVal') as HTMLElement).textContent = densitySlider.value;
    brightnessSlider.value = Math.round(state.params.brightness * 100).toString();
    (app.querySelector('#brightnessVal') as HTMLElement).textContent = brightnessSlider.value;
    spaciousnessSlider.value = Math.round(state.params.spaciousness * 100).toString();
    (app.querySelector('#spaciousnessVal') as HTMLElement).textContent = spaciousnessSlider.value;
  }

  return { updateState };
}
