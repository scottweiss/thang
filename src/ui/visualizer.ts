import { GenerativeState, Mood } from '../types';

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
  private pulseIntensity = 0;
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

    if (state.chordChanged) {
      this.pulseIntensity = 1;
      const palette = MOOD_PALETTES[state.mood];
      this.targetHue = palette.hues[state.progressionIndex % palette.hues.length];
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
    this.pulseIntensity *= 0.97;

    // Background fade (creates trails)
    const fadeAlpha = this.currentMood === 'trance' ? 0.12 : 0.06;
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

    // Draw central glow on chord pulse
    if (this.pulseIntensity > 0.05) {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.4);
      gradient.addColorStop(0, `hsla(${this.currentHue}, ${palette.saturation}%, ${palette.lightness}%, ${this.pulseIntensity * 0.15})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // Cap particle count
    if (this.particles.length > 500) {
      this.particles.splice(0, this.particles.length - 500);
    }
  }

  private getSpawnRate(): number {
    const base = {
      ambient: 0.3,
      downtempo: 0.8,
      lofi: 1.2,
      trance: 2.5,
    }[this.currentMood];
    return Math.ceil(base * (0.5 + this.currentDensity) + this.pulseIntensity * 3);
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
    }

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
    }

    p.x += p.vx;
    p.y += p.vy;
    p.alpha = (p.life / p.maxLife) * (1 - Math.pow(1 - p.life / p.maxLife, 3));
  }

  private drawParticle(ctx: CanvasRenderingContext2D, p: Particle, palette: typeof MOOD_PALETTES[Mood]): void {
    const brightness = palette.lightness + this.currentBrightness * 20;
    const alpha = p.alpha * (0.3 + this.currentBrightness * 0.4);

    ctx.beginPath();

    if (this.currentMood === 'trance' && p.size > 2) {
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
