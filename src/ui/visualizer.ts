import { GenerativeState, Mood, Section } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  hue: number;
}

const MOOD_PALETTES: Record<Mood, { bg: string; hues: number[]; saturation: number; lightness: number }> = {
  ambient: { bg: '#06060f', hues: [220, 260, 280, 200], saturation: 40, lightness: 25 },
  downtempo: { bg: '#0a0808', hues: [20, 35, 280, 320], saturation: 35, lightness: 30 },
  lofi: { bg: '#0c0a08', hues: [330, 20, 40, 350], saturation: 25, lightness: 35 },
  trance: { bg: '#040810', hues: [190, 210, 240, 170], saturation: 60, lightness: 40 },
  avril: { bg: '#0a0806', hues: [35, 45, 25, 15], saturation: 25, lightness: 35 },
  xtal: { bg: '#04060e', hues: [200, 220, 240, 260], saturation: 45, lightness: 30 },
  syro: { bg: '#0a0410', hues: [280, 300, 320, 340], saturation: 55, lightness: 40 },
};

export class Visualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animId: number | null = null;
  private state: GenerativeState | null = null;

  // Smoothly interpolated values
  private currentHue = 220;
  private targetHue = 220;
  private currentDensity = 0.5;
  private currentBrightness = 0.5;
  private currentSpaciousness = 0.8;
  private currentMood: Mood = 'downtempo';
  private currentSection: Section = 'intro';
  private sectionEnergy = 0; // 0-1, how intense the current section is
  private targetSectionEnergy = 0;
  private pulseIntensity = 0;
  private sectionFlash = 0; // horizontal wipe on section change
  private time = 0;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'visualizer-canvas';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  update(state: GenerativeState): void {
    const prevMood = this.state?.mood;
    this.state = state;

    this.currentDensity += (state.params.density - this.currentDensity) * 0.1;
    this.currentBrightness += (state.params.brightness - this.currentBrightness) * 0.1;
    this.currentSpaciousness += (state.params.spaciousness - this.currentSpaciousness) * 0.1;

    if (state.mood !== prevMood) {
      this.currentMood = state.mood;
    }

    // Map section to visual energy level
    const sectionEnergyMap: Record<Section, number> = {
      intro: 0.15,
      build: 0.4,
      peak: 1.0,
      breakdown: 0.25,
      groove: 0.7,
    };
    this.currentSection = state.section;
    this.targetSectionEnergy = sectionEnergyMap[state.section];

    if (state.chordChanged) {
      this.pulseIntensity = 1;
      const palette = MOOD_PALETTES[state.mood];
      this.targetHue = palette.hues[state.progressionIndex % palette.hues.length];
    }

    // Big pulse on section changes + horizontal flash
    if (state.sectionChanged) {
      this.pulseIntensity = Math.max(this.pulseIntensity, 1.5);
      this.sectionFlash = 1;
    }
  }

  start(): void {
    if (this.animId !== null) return;
    const loop = () => {
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  private render(): void {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const palette = MOOD_PALETTES[this.currentMood];

    this.time += 0.016;
    this.currentHue += (this.targetHue - this.currentHue) * 0.02;
    this.sectionEnergy += (this.targetSectionEnergy - this.sectionEnergy) * 0.03;
    this.pulseIntensity *= 0.97;
    this.sectionFlash *= 0.94;

    // Background fade (creates trails)
    const fadeAlpha = this.currentMood === 'trance' ? 0.12 : this.currentMood === 'syro' ? 0.14 : this.currentMood === 'avril' ? 0.04 : this.currentMood === 'xtal' ? 0.03 : 0.06;
    ctx.fillStyle = palette.bg;
    ctx.globalAlpha = fadeAlpha + this.pulseIntensity * 0.05;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // Spawn particles
    const spawnRate = this.getSpawnRate();
    for (let i = 0; i < spawnRate; i++) {
      this.particles.push(this.createParticle(w, h, palette));
    }

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      this.updateParticle(p, w, h);
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.drawParticle(ctx, p, palette);
    }

    // Draw connection lines between nearby particles (ambient/downtempo only)
    if ((this.currentMood === 'ambient' || this.currentMood === 'downtempo' || this.currentMood === 'avril' || this.currentMood === 'xtal') && this.particles.length > 2) {
      const connectDist = 80 + this.sectionEnergy * 60;
      ctx.strokeStyle = `hsla(${this.currentHue}, ${palette.saturation}%, ${palette.lightness + 10}%, 0.06)`;
      ctx.lineWidth = 0.5;
      const maxConnections = Math.min(this.particles.length, 80);
      for (let i = 0; i < maxConnections; i++) {
        const a = this.particles[i];
        for (let j = i + 1; j < maxConnections; j++) {
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = dx * dx + dy * dy;
          if (dist < connectDist * connectDist) {
            const lineAlpha = (1 - Math.sqrt(dist) / connectDist) * 0.08 * a.alpha * b.alpha;
            ctx.strokeStyle = `hsla(${this.currentHue}, ${palette.saturation}%, ${palette.lightness + 10}%, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw central glow on chord pulse
    if (this.pulseIntensity > 0.05) {
      const glowSize = 0.3 + this.sectionEnergy * 0.2;
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * glowSize);
      gradient.addColorStop(0, `hsla(${this.currentHue}, ${palette.saturation}%, ${palette.lightness}%, ${this.pulseIntensity * 0.15})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // Subtle ambient background glow that breathes with section energy
    if (this.sectionEnergy > 0.3) {
      const breathe = Math.sin(this.time * 0.3) * 0.5 + 0.5;
      const glowAlpha = (this.sectionEnergy - 0.3) * 0.04 * breathe;
      const gradient = ctx.createRadialGradient(w / 2, h * 0.6, 0, w / 2, h * 0.6, w * 0.6);
      gradient.addColorStop(0, `hsla(${this.currentHue}, ${palette.saturation}%, ${palette.lightness * 0.5}%, ${glowAlpha})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // Section transition flash — horizontal wipe of light
    if (this.sectionFlash > 0.05) {
      const flashProgress = 1 - this.sectionFlash;
      const flashX = flashProgress * w * 1.4 - w * 0.2;
      const flashWidth = w * 0.15;
      const gradient = ctx.createLinearGradient(flashX - flashWidth, 0, flashX + flashWidth, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, `hsla(${this.currentHue}, ${palette.saturation}%, ${palette.lightness + 20}%, ${this.sectionFlash * 0.12})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // Edge vignette — darkens corners, intensifies during peak
    const vignetteAlpha = 0.15 + this.sectionEnergy * 0.1;
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.75);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, `rgba(0, 0, 0, ${vignetteAlpha})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Cap particle count — higher during peak sections
    const maxParticles = 300 + Math.floor(this.sectionEnergy * 300);
    if (this.particles.length > maxParticles) {
      this.particles.splice(0, this.particles.length - maxParticles);
    }
  }

  private getSpawnRate(): number {
    const base = {
      ambient: 0.3,
      downtempo: 0.8,
      lofi: 1.2,
      trance: 2.5,
      avril: 0.2,
      xtal: 0.4,
      syro: 3.0,
    }[this.currentMood];
    // Section energy modulates spawn rate — intro is sparse, peak floods particles
    const sectionMult = 0.4 + this.sectionEnergy * 0.8;
    return Math.ceil(base * (0.5 + this.currentDensity) * sectionMult + this.pulseIntensity * 3);
  }

  private createParticle(w: number, h: number, palette: typeof MOOD_PALETTES[Mood]): Particle {
    const spread = this.currentSpaciousness;
    const cx = w / 2;
    const cy = h / 2;

    let x: number, y: number, vx: number, vy: number, size: number, maxLife: number;

    switch (this.currentMood) {
      case 'ambient': {
        // Slow drifting from edges
        const angle = Math.random() * Math.PI * 2;
        const dist = w * 0.3 + Math.random() * w * 0.3 * spread;
        x = cx + Math.cos(angle) * dist;
        y = cy + Math.sin(angle) * dist;
        vx = (Math.random() - 0.5) * 0.3;
        vy = (Math.random() - 0.5) * 0.3;
        size = 2 + Math.random() * 6;
        maxLife = 200 + Math.random() * 300;
        break;
      }
      case 'downtempo': {
        // Rise from bottom
        x = Math.random() * w;
        y = h + 10;
        vx = (Math.random() - 0.5) * 0.8;
        vy = -(0.3 + Math.random() * 0.8);
        size = 1.5 + Math.random() * 4;
        maxLife = 150 + Math.random() * 200;
        break;
      }
      case 'lofi': {
        // Floating grain/dust — random positions
        x = Math.random() * w;
        y = Math.random() * h;
        vx = (Math.random() - 0.5) * 0.4;
        vy = -(0.1 + Math.random() * 0.3);
        size = 1 + Math.random() * 2.5;
        maxLife = 100 + Math.random() * 150;
        break;
      }
      case 'trance': {
        // Burst from center
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        x = cx + (Math.random() - 0.5) * 60;
        y = cy + (Math.random() - 0.5) * 60;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        size = 1 + Math.random() * 3;
        maxLife = 60 + Math.random() * 100;
        break;
      }
      case 'avril': {
        // Very slow dust motes drifting gently downward in warm light
        x = Math.random() * w;
        y = Math.random() * h * 0.3;
        vx = (Math.random() - 0.5) * 0.15;
        vy = 0.05 + Math.random() * 0.15;
        size = 0.8 + Math.random() * 1.8;
        maxLife = 300 + Math.random() * 400;
        break;
      }
      case 'xtal': {
        // Slow wide orbital drift — like ambient but wider, deeper blue
        const angle = Math.random() * Math.PI * 2;
        const dist = w * 0.2 + Math.random() * w * 0.4 * spread;
        x = cx + Math.cos(angle) * dist;
        y = cy + Math.sin(angle) * dist;
        vx = (Math.random() - 0.5) * 0.2;
        vy = (Math.random() - 0.5) * 0.2;
        size = 2.5 + Math.random() * 7;
        maxLife = 250 + Math.random() * 400;
        break;
      }
      case 'syro': {
        // Fast chaotic bursts from random points
        const spawnX = Math.random() * w;
        const spawnY = Math.random() * h;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        x = spawnX;
        y = spawnY;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        size = 0.8 + Math.random() * 2.5;
        maxLife = 40 + Math.random() * 80;
        break;
      }
    }

    // Section energy scales particle size — peak sections get bigger, more visible particles
    size *= (0.7 + this.sectionEnergy * 0.5);

    const hue = palette.hues[Math.floor(Math.random() * palette.hues.length)];

    return { x, y, vx, vy, size, alpha: 1, life: maxLife, maxLife, hue };
  }

  private updateParticle(p: Particle, w: number, h: number): void {
    switch (this.currentMood) {
      case 'ambient': {
        // Gentle orbital drift
        const dx = p.x - w / 2;
        const dy = p.y - h / 2;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
        p.vx += (-dy / dist) * 0.01;
        p.vy += (dx / dist) * 0.01;
        p.vx *= 0.998;
        p.vy *= 0.998;
        break;
      }
      case 'downtempo': {
        // Gentle sway
        p.vx += Math.sin(this.time * 0.5 + p.y * 0.01) * 0.02;
        p.vx *= 0.99;
        break;
      }
      case 'lofi': {
        // Jitter
        p.vx += (Math.random() - 0.5) * 0.08;
        p.vy += (Math.random() - 0.5) * 0.06;
        p.vx *= 0.98;
        p.vy *= 0.98;
        break;
      }
      case 'trance': {
        // Accelerate outward slightly
        const dx = p.x - w / 2;
        const dy = p.y - h / 2;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
        p.vx += (dx / dist) * 0.02;
        p.vy += (dy / dist) * 0.02;
        break;
      }
      case 'avril': {
        // Gentle downward drift with very slight horizontal sway
        p.vx += Math.sin(this.time * 0.2 + p.x * 0.005) * 0.005;
        p.vx *= 0.995;
        p.vy *= 0.999;
        break;
      }
      case 'xtal': {
        // Wide gentle orbital — like ambient but slower and wider radius
        const dx = p.x - w / 2;
        const dy = p.y - h / 2;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
        p.vx += (-dy / dist) * 0.008;
        p.vy += (dx / dist) * 0.008;
        p.vx *= 0.997;
        p.vy *= 0.997;
        break;
      }
      case 'syro': {
        // Fast, jittery, random direction changes — chaotic
        p.vx += (Math.random() - 0.5) * 0.3;
        p.vy += (Math.random() - 0.5) * 0.3;
        p.vx *= 0.96;
        p.vy *= 0.96;
        break;
      }
    }

    p.x += p.vx;
    p.y += p.vy;
    p.alpha = (p.life / p.maxLife) * (1 - Math.pow(1 - p.life / p.maxLife, 3));
  }

  private drawParticle(ctx: CanvasRenderingContext2D, p: Particle, palette: typeof MOOD_PALETTES[Mood]): void {
    const brightness = palette.lightness + this.currentBrightness * 20;
    const alpha = p.alpha * (0.3 + this.currentBrightness * 0.4);

    ctx.beginPath();

    if ((this.currentMood === 'trance' || this.currentMood === 'syro') && p.size > 2) {
      // Diamond shape for trance
      ctx.moveTo(p.x, p.y - p.size);
      ctx.lineTo(p.x + p.size * 0.6, p.y);
      ctx.lineTo(p.x, p.y + p.size);
      ctx.lineTo(p.x - p.size * 0.6, p.y);
      ctx.closePath();
    } else {
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    }

    ctx.fillStyle = `hsla(${p.hue}, ${palette.saturation}%, ${brightness}%, ${alpha})`;
    ctx.fill();

    // Glow effect for larger particles
    if (p.size > 3 && this.currentMood !== 'lofi') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, ${palette.saturation}%, ${brightness}%, ${alpha * 0.1})`;
      ctx.fill();
    }
  }
}
