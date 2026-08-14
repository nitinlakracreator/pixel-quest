/**
 * Pixel Quest — Ember Forge style.
 * Entities: Player (knight), Enemy (slime/bat/skull), Boss, Coin, Gem, Projectile.
 */
import { Game, GW } from "./engine";
import { PixelRenderer } from "./render";
import { overlaps, World, TILE } from "./world";

const GRAVITY = 0.42;
const WALK = 2.4;
const JUMP_V = -7.4;

export class Player {
  x = 0;
  y = 0;
  w = 12;
  h = 16;
  vx = 0;
  vy = 0;
  facing = 1;
  grounded = false;
  invincible = 0;
  attackT = 0;
  jumpsLeft = 2;
  private coyote = 0;
  private jumpBuf = 0;
  private animT = 0;
  private squash = 1;

  constructor(private game: Game, x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  attack() {
    if (this.attackT <= 0) {
      this.attackT = 14;
      this.game.effects.spawnAttackFx(this.x + this.w / 2, this.y + this.h / 2, this.facing);
      // hit enemies in arc
      const arc = { x: this.facing > 0 ? this.x + this.w - 2 : this.x - 14, y: this.y - 2, w: 16, h: this.h + 4 };
      for (const e of this.game.world.enemies) {
        if (!e.dead && overlaps(arc, e)) e.die(this.game);
      }
      if (this.game.world.boss?.alive && this.game.world.boss && overlaps(arc, this.game.world.boss)) {
        this.game.world.boss.hit(this.game);
      }
    }
  }

  update(w: World) {
    const g = this.game;
    this.animT++;
    this.invincible = Math.max(0, this.invincible - 1);
    this.attackT = Math.max(0, this.attackT - 1);

    const d = g.dir();
    this.vx = d * WALK;
    if (d !== 0) this.facing = d;

    // Jump buffering + coyote time
    if (g.startAction()) {
      if (this.jumpBuf <= 0) this.jumpBuf = 8;
    }
    this.jumpBuf = Math.max(0, this.jumpBuf - 1);
    this.coyote = this.grounded ? 7 : Math.max(0, this.coyote - 1);

    if (this.jumpBuf > 0 && (this.coyote > 0 || this.jumpsLeft > 0)) {
      this.vy = JUMP_V;
      this.jumpsLeft = this.coyote > 0 ? 1 : this.jumpsLeft - 1;
      this.jumpBuf = 0;
      this.coyote = 0;
      this.squash = 1.3;
      this.game.effects.spawnJumpDust(this.x + this.w / 2, this.y + this.h);
    }
    if (!g.startAction() && this.vy < -3) this.vy *= 0.82; // variable jump height

    this.vy = Math.min(GRAVITY * 1.6, this.vy + GRAVITY);
    this.squash += (1 - this.squash) * 0.3;

    // Move X with collision
    this.x += this.vx;
    this.collideX(w);
    // Move Y with collision
    this.y += this.vy;
    const beforeG = this.grounded;
    this.collideY(w);

    const t = w.tileAt(this.x + this.w / 2, this.y + this.h - 2);
    this.grounded = t === 1 || t === 2 || t === 5;
    if (this.grounded && !beforeG) {
      this.jumpsLeft = 2;
      this.squash = 0.8;
    }

    // Hazards
    const probe = w.solidTest(this.x, this.y, this.w, this.h);
    if (probe.onLava || probe.onSpike || this.y > w.level.height * TILE - 20) {
      this.game.playerDied();
    }

    // Enemy contact damage
    if (this.invincible <= 0 && this.attackT <= 0) {
      for (const e of w.enemies) {
        if (!e.dead && overlaps(this, e)) this.takeHit();
      }
      if (w.boss?.alive && overlaps(this, w.boss)) this.takeHit();
    }

    // Clamp to level
    this.x = Math.max(0, Math.min(w.level.width * TILE - this.w, this.x));
  }

  private collideX(w: World) {
    if (w.isSolid(this.x + (this.vx > 0 ? this.w : 0), this.y + 2)) {
      this.x = this.vx > 0
        ? Math.floor((this.x + this.w) / TILE) * TILE - this.w
        : Math.floor(this.x / TILE) * TILE + TILE;
      this.vx = 0;
    }
  }

  private collideY(w: World) {
    const head = w.isSolid(this.x + 2, this.y + (this.vy < 0 ? 0 : this.h));
    if (this.vy > 0 && w.isSolid(this.x + 2, this.y + this.h)) {
      this.y = Math.floor((this.y + this.h) / TILE) * TILE - this.h;
      this.vy = 0;
    } else if (this.vy < 0 && w.isSolid(this.x + 2, this.y)) {
      this.y = Math.floor(this.y / TILE) * TILE + TILE;
      this.vy = 0;
    }
    void head;
  }

  private takeHit() {
    this.invincible = 75;
    this.game.playerDied();
  }

  draw(r: PixelRenderer, cam: number) {
    const a = this.atlas;
    let frame = a.knight.idle;
    if (this.attackT > 8) frame = a.knight.slash;
    else if (this.attackT > 0) frame = a.knight.attack;
    else if (!this.grounded) frame = a.knight.jump;
    else if (Math.abs(this.vx) > 0.5) frame = this.animT % 12 < 6 ? a.knight.run1 : a.knight.run2;

    const flicker = this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0;
    if (flicker) return;

    const sx = Math.floor(this.x - cam);
    const sy = Math.floor(this.y + (1 - this.squash) * this.h * 0.5);
    const sw = Math.round(this.w * (2 - this.squash));
    const sh = Math.round(this.h * this.squash);
    const flip = this.facing < 0;
    // draw sprite taller than entity box (14px sprite for 16px entity)
    r.drawImage(frame, sx + (this.w - sw) / 2 - (flip ? 0 : 0), sy, sw, sh, flip);
  }

  get atlas() {
    return (this.game as unknown as { atlas: { knight: Record<string, HTMLCanvasElement> } }).atlas;
  }
}

export class Enemy {
  dead = false;
  w = 14;
  h = 10;
  vx = 0.8;
  vy = 0;
  private t = 0;
  private baseY: number;
  private flashT = 0;

  constructor(private game: Game, x: number, y: number, private kind: "slime" | "bat" | "skull") {
    this.x = x;
    this.y = y;
    this.baseY = y;
  }
  x: number;
  y: number;

  update(w: World) {
    if (this.dead) return;
    this.t++;
    if (this.flashT > 0) this.flashT--;
    if (this.kind === "slime") {
      this.vy = Math.min(6, this.vy + GRAVITY);
      this.x += this.vx;
      if (w.isSolid(this.x + (this.vx > 0 ? this.w : 0), this.y + this.h - 2)) this.vx *= -1;
      this.y += this.vy;
      if (w.isSolid(this.x + this.w / 2, this.y + this.h)) {
        this.y = Math.floor((this.y + this.h) / TILE) * TILE - this.h;
        if (this.vy > 3) this.game.effects.spawnBounceDust(this.x + this.w / 2, this.y + this.h);
        this.vy = -4.5;
      }
    } else if (this.kind === "bat") {
      this.x += Math.sin(this.t * 0.05) * 1.1;
      this.y = this.baseY + Math.sin(this.t * 0.08) * 14;
    } else {
      // skull: float + shoot at player
      this.y = this.baseY + Math.sin(this.t * 0.06) * 6;
      const p = w.player;
      if (this.t % 120 === 0 && Math.abs(p.x - this.x) < GW * 0.8) {
        const dx = p.x - this.x;
        const dy = p.y - this.y;
        const len = Math.hypot(dx, dy) || 1;
        w.projectiles.push(
          new Projectile(this.game, this.x + this.w / 2, this.y + this.h / 2, (dx / len) * 2.2, (dy / len) * 2.2, "ember"),
        );
      }
    }
    // stomp from above
    const p = w.player;
    if (!this.dead && p.vy > 0 && overlaps(p, this) && p.y + p.h - this.y < 8) {
      p.vy = -5.5;
      this.die(this.game);
      p.jumpsLeft = 1;
    }
    if (this.y > w.level.height * TILE) this.dead = true;
  }

  die(g: Game) {
    if (this.dead) return;
    this.dead = true;
    g.score += this.kind === "skull" ? 75 : 50;
    g.effects.spawnDeathBurst(this.x + this.w / 2, this.y + this.h / 2, "#7ed957");
    g.shakeAmount = Math.max(g.shakeAmount, 3);
  }

  draw(r: PixelRenderer, cam: number) {
    if (this.dead) return;
    const a = (this.game as unknown as { atlas: { slime: HTMLCanvasElement; bat: HTMLCanvasElement; skull: HTMLCanvasElement } }).atlas;
    const sprite = this.kind === "slime" ? a.slime : this.kind === "bat" ? a.bat : a.skull;
    const flash = this.flashT > 0 && this.flashT % 4 < 2;
    if (flash) return;
    r.drawImage(sprite, Math.floor(this.x - cam), Math.floor(this.y), this.w, this.h);
  }
}

export class Boss {
  alive = true;
  w = 32;
  h = 32;
  hp = 6;
  maxHp = 6;
  private t = 0;
  private phaseT = 0;
  private vx = 0.6;
  flashT = 0;

  constructor(private game: Game, x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  x: number;
  y: number;

  get world(): World {
    return this.game.world;
  }

  update(_w: World) {
    if (!this.alive) return;
    this.t++;
    this.phaseT++;
    this.flashT = Math.max(0, this.flashT - 1);

    // patrol
    this.x += this.vx;
    if (this.x < this.world.level.width * TILE - 600 || this.x > this.world.level.width * TILE - 200) this.vx *= -1;
    this.y = 7 * TILE + Math.sin(this.t * 0.04) * 10;

    // attack patterns
    if (this.phaseT % 150 === 0) {
      const p = this.world.player;
      for (let i = -1; i <= 1; i++) {
        const angle = Math.atan2(p.y - this.y, p.x - this.x) + i * 0.3;
        this.world.projectiles.push(
          new Projectile(this.game, this.x + 16, this.y + 16, Math.cos(angle) * 2.4, Math.sin(angle) * 2.4, "ember"),
        );
      }
      this.game.shakeAmount = 5;
    }
    if (this.phaseT % 240 === 0) {
      // ring burst
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        this.world.projectiles.push(
          new Projectile(this.game, this.x + 16, this.y + 16, Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, "fire"),
        );
      }
      this.game.shakeAmount = 8;
    }

    // projectile hit on player handled in Projectile.update
    void _w;
  }

  hit(g: Game) {
    if (!this.alive || this.flashT > 0) return;
    this.hp--;
    this.flashT = 20;
    g.shakeAmount = 6;
    g.effects.spawnDeathBurst(this.x + 16, this.y + 16, "#ff7a33");
    if (this.hp <= 0) {
      this.alive = false;
      g.effects.spawnBigBurst(this.x + 16, this.y + 16);
    }
  }

  draw(r: PixelRenderer, cam: number) {
    if (!this.alive) return;
    const a = (this.game as unknown as { atlas: { boss: HTMLCanvasElement } }).atlas;
    if (this.flashT > 0 && this.flashT % 4 < 2) return;
    r.drawImage(a.boss, Math.floor(this.x - cam), Math.floor(this.y), this.w, this.h);
    // HP bar
    const bx = Math.floor(this.x - cam);
    r.ctx.save();
    r.ctx.fillStyle = "#2b1f33";
    r.ctx.fillRect(bx, this.y - 8, this.w, 3);
    r.ctx.fillStyle = "#ff5c5c";
    r.ctx.fillRect(bx, this.y - 8, Math.round((this.hp / this.maxHp) * this.w), 3);
    r.ctx.restore();
    r.text("EMBER GUARDIAN", bx, this.y - 16, "#ff7a33", 2, "center");
  }
}

export class Projectile {
  life = 120;
  w = 6;
  h = 6;
  constructor(private game: Game, x: number, y: number, public vx: number, public vy: number, private kind: "ember" | "fire") {
    this.x = x;
    this.y = y;
  }
  x: number;
  y: number;

  update(_w: World) {
    this.life--;
    this.x += this.vx;
    this.y += this.vy;
    if (this.game.world.tileAt(this.x, this.y) === 1) this.life = 0;
    if (overlaps(this, this.game.world.player) && this.game.world.player.invincible <= 0) {
      this.life = 0;
      this.game.world.player["takeHit"]();
    }
  }

  draw(r: PixelRenderer, cam: number) {
    r.ctx.save();
    r.ctx.fillStyle = this.kind === "ember" ? "#ffd166" : "#ff7a33";
    r.ctx.fillRect(Math.floor(this.x - cam), Math.floor(this.y), this.w, this.h);
    r.ctx.restore();
  }
}

export class Coin {
  dead = false;
  w = 8;
  h = 8;
  private t = Math.random() * 100;
  constructor(public x: number, public y: number) {}

  update() {
    this.t++;
  }

  draw(r: PixelRenderer, cam: number) {
    if (this.dead) return;
    const a = (r as unknown as { game?: Game }).game;
    void a;
    const bob = Math.sin(this.t * 0.08) * 2;
    r.drawImage((globalThis as unknown as { __atlas?: { coin: HTMLCanvasElement } }).__atlas?.coin ?? this.sprite(), Math.floor(this.x - cam), Math.floor(this.y + bob), 8, 8);
  }

  sprite(): HTMLCanvasElement {
    // fallback: created lazily
    const c = document.createElement("canvas");
    c.width = 8; c.height = 8;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(1, 0, 6, 8);
    ctx.fillStyle = "#fff2cc";
    ctx.fillRect(2, 1, 2, 2);
    return c;
  }
}

export class Gem {
  dead = false;
  w = 8;
  h = 8;
  private t = Math.random() * 100;
  constructor(public x: number, public y: number) {}

  update() {
    this.t++;
  }

  draw(r: PixelRenderer, cam: number) {
    if (this.dead) return;
    const bob = Math.sin(this.t * 0.1) * 2;
    r.drawImage(this.sprite(), Math.floor(this.x - cam), Math.floor(this.y + bob), 8, 8);
  }

  sprite(): HTMLCanvasElement {
    const c = document.createElement("canvas");
    c.width = 8; c.height = 8;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#2dd4a8";
    ctx.fillRect(3, 0, 2, 8);
    ctx.fillRect(1, 2, 6, 4);
    ctx.fillStyle = "#d0fff4";
    ctx.fillRect(2, 2, 2, 2);
    return c;
  }
}

export class Hazard {
  constructor(public x: number, public y: number, public w: number, public h: number) {}
}
