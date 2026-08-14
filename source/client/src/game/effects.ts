/**
 * Pixel Quest — Ember Forge style.
 * Effects: particle system, damage flash, screen-shake state.
 */
import { Game, GW, GH } from "./engine";
import { PixelRenderer } from "./render";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class Effects {
  private particles: Particle[] = [];
  private flashT = 0;
  private ambientT = 0;

  constructor(private game: Game) {}

  reset() {
    this.particles = [];
    this.flashT = 0;
  }

  flash(ms: number) {
    this.flashT = ms;
  }

  spawn(amount: number, x: number, y: number, vx: number, vy: number, colors: string[], life = 30, size = 2) {
    for (let i = 0; i < amount; i++) {
      this.particles.push({
        x,
        y,
        vx: vx + (Math.random() - 0.5) * 3,
        vy: vy + (Math.random() - 0.5) * 3,
        life,
        maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        size,
      });
    }
  }

  spawnAttackFx(x: number, y: number, facing: number) {
    this.spawn(8, x + facing * 8, y, facing * 2, 0, ["#ffd166", "#ff7a33", "#ffffff"], 10, 2);
  }

  spawnDeathBurst(x: number, y: number, color: string) {
    this.spawn(22, x, y, 0, -2, [color, "#ffd166", "#ff7a33"], 24, 2);
  }

  spawnBigBurst(x: number, y: number) {
    this.spawn(60, x, y, 0, -1, ["#ffd166", "#ff7a33", "#ff5c5c", "#ffffff"], 40, 3);
  }

  spawnCoinPop(x: number, y: number) {
    this.spawn(10, x, y, 0, -3, ["#ffd166", "#fff2cc"], 18, 2);
  }

  spawnGemPop(x: number, y: number) {
    this.spawn(14, x, y, 0, -3, ["#2dd4a8", "#d0fff4", "#ffd166"], 20, 2);
  }

  spawnJumpDust(x: number, y: number) {
    this.spawn(5, x, y, 0, 0.5, ["#6a5a72", "#4a3a52"], 14, 1);
  }

  spawnBounceDust(x: number, y: number) {
    this.spawn(6, x, y, 0, 0.5, ["#7ed957", "#4e9b32"], 14, 1);
  }

  update() {
    this.flashT = Math.max(0, this.flashT - 16.67);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life--;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  updateAmbient() {
    this.ambientT++;
    // floating embers on menus
    if (this.ambientT % 12 === 0) {
      this.particles.push({
        x: Math.random() * GW,
        y: GH + 4,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.6 - Math.random() * 0.8,
        life: 180,
        maxLife: 180,
        color: Math.random() < 0.5 ? "#ff7a33" : "#ffd166",
        size: 1 + Math.random() * 2,
      });
    }
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw(r: PixelRenderer) {
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      r.ctx.save();
      r.ctx.globalAlpha = a;
      r.ctx.fillStyle = p.color;
      r.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      r.ctx.restore();
    }
    if (this.flashT > 0) {
      r.ctx.save();
      r.ctx.globalAlpha = Math.min(0.6, this.flashT / 300);
      r.ctx.fillStyle = "#ff5c5c";
      r.ctx.fillRect(0, 0, GW, GH);
      r.ctx.restore();
    }
    void GH;
  }
}
