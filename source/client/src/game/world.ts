/**
 * Pixel Quest — Ember Forge style.
 * World: tilemap, levels (3 + boss), parallax background, camera, entities.
 */
import { Game, GW, GH } from "./engine";
import { PixelRenderer } from "./render";
import { SpriteAtlas } from "./sprites";
import { Player, Enemy, Boss, Coin, Gem, Hazard, Projectile } from "./entities";
import { Effects } from "./effects";

export const TILE = 16; // tile size in pixels (1x1 sprite px scaled x1)

export interface LevelData {
  name: string;
  width: number; // tiles
  height: number; // tiles
  map: number[][]; // 0 air, 1 stone, 2 top-stone, 3 lava, 4 spike, 5 pillar, 6 torch
  playerStart: [number, number];
  exitX: number; // tile x of level exit
  enemies: { kind: "slime" | "bat" | "skull"; x: number; y: number }[];
  coins: [number, number][];
  gems: [number, number][];
  boss?: boolean;
}

function fillMap(w: number, h: number, kind: number): number[][] {
  return Array.from({ length: h }, () => Array(w).fill(kind));
}

function carve(map: number[][], x: number, y: number, kind: number) {
  if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) map[y][x] = kind;
}

function platform(map: number[][], x0: number, x1: number, y: number, kind = 2) {
  for (let x = x0; x <= x1; x++) {
    carve(map, x, y, kind);
    carve(map, x, y + 1, 1);
    carve(map, x, y + 2, 1);
  }
}

function floorRow(map: number[][], h: number, y: number) {
  for (let x = 0; x < map[0].length; x++) {
    carve(map, x, y, y === 0 ? 2 : 1);
    carve(map, x, y + 1, 1);
  }
}

/**
 * Levels are 120 tiles wide x 15 tall.
 * Legend while building: 1=stone, 2=top, 3=lava, 4=spike, 5=pillar, 6=torch, 0=air
 */
function buildLevel1(): LevelData {
  const W = 120, H = 15;
  const map = fillMap(W, H, 0);
  // floor with gaps
  floorRow(map, H, 13);
  for (const [a, b] of [[18, 21], [44, 47], [72, 74], [100, 103]] as [number, number][]) {
    for (let x = a; x <= b; x++) {
      map[13][x] = 3;
      map[14][x] = 3;
    }
  }
  // platforms (low single-step steps, reachable in one jump from the floor)
  platform(map, 12, 16, 11);
  platform(map, 24, 28, 10);
  platform(map, 34, 38, 11);
  platform(map, 48, 54, 11);
  platform(map, 60, 66, 10);
  platform(map, 76, 82, 11);
  platform(map, 88, 94, 10);
  platform(map, 105, 112, 11);
  platform(map, 113, 119, 13, 2);
  // spikes over one lava pit
  for (let x = 72; x <= 74; x++) carve(map, x, 12, 4);
  // pillars / torches
  for (const x of [40, 52, 68, 90]) {
    for (let y = 9; y <= 12; y++) carve(map, x, y, 5);
    carve(map, x, 8, 6);
  }
  return {
    name: "THE EMBER TUNNELS",
    width: W,
    height: H,
    map,
    playerStart: [2, 11],
    exitX: 117,
    enemies: [
      { kind: "slime", x: 15, y: 12 },
      { kind: "slime", x: 27, y: 8 },
      { kind: "bat", x: 36, y: 5 },
      { kind: "slime", x: 50, y: 8 },
      { kind: "bat", x: 62, y: 4 },
      { kind: "slime", x: 79, y: 8 },
      { kind: "bat", x: 91, y: 5 },
      { kind: "slime", x: 108, y: 8 },
    ],
    coins: [
      [9, 9], [10, 9], [25, 8], [26, 8], [35, 7], [50, 8], [52, 8],
      [62, 6], [78, 8], [80, 8], [90, 6], [107, 8], [109, 8],
    ],
    gems: [
      [63, 5], [92, 5],
    ],
  };
}

function buildLevel2(): LevelData {
  const W = 130, H = 15;
  const map = fillMap(W, H, 0);
  floorRow(map, H, 13);
  for (const [a, b] of [[12, 15], [30, 34], [52, 55], [76, 80], [102, 105]] as [number, number][]) {
    for (let x = a; x <= b; x++) {
      map[13][x] = 3;
      map[14][x] = 3;
    }
  }
  platform(map, 6, 12, 10);
  platform(map, 18, 26, 8);
  platform(map, 29, 36, 6);
  platform(map, 40, 47, 8);
  platform(map, 50, 57, 10);
  platform(map, 62, 70, 7);
  platform(map, 73, 81, 5);
  platform(map, 84, 92, 8);
  platform(map, 96, 104, 10);
  platform(map, 108, 116, 8);
  platform(map, 118, 129, 13, 2);
  for (let x = 52; x <= 55; x++) carve(map, x, 12, 4);
  for (let x = 76; x <= 80; x++) carve(map, x, 12, 4);
  for (const x of [22, 34, 44, 66, 77, 88, 100, 112]) {
    for (let y = 9; y <= 12; y++) carve(map, x, y, 5);
    carve(map, x, 8, 6);
  }
  return {
    name: "ASHEN CAVERNS",
    width: W,
    height: H,
    map,
    playerStart: [2, 11],
    exitX: 126,
    enemies: [
      { kind: "bat", x: 20, y: 5 },
      { kind: "slime", x: 22, y: 7 },
      { kind: "bat", x: 32, y: 4 },
      { kind: "skull", x: 42, y: 7 },
      { kind: "bat", x: 54, y: 6 },
      { kind: "slime", x: 64, y: 6 },
      { kind: "bat", x: 76, y: 3 },
      { kind: "skull", x: 86, y: 7 },
      { kind: "bat", x: 98, y: 5 },
      { kind: "slime", x: 110, y: 7 },
      { kind: "bat", x: 120, y: 4 },
    ],
    coins: [
      [8, 9], [20, 7], [22, 7], [31, 5], [43, 7], [52, 9], [64, 6],
      [76, 4], [86, 7], [98, 7], [110, 7], [112, 7], [122, 12],
    ],
    gems: [[33, 4], [78, 3]],
  };
}

function buildLevel3(): LevelData {
  const W = 140, H = 15;
  const map = fillMap(W, H, 0);
  floorRow(map, H, 13);
  for (const [a, b] of [[10, 14], [28, 32], [50, 54], [70, 74], [92, 96], [116, 120]] as [number, number][]) {
    for (let x = a; x <= b; x++) {
      map[13][x] = 3;
      map[14][x] = 3;
    }
  }
  platform(map, 4, 10, 10);
  platform(map, 16, 24, 8);
  platform(map, 27, 34, 6);
  platform(map, 38, 46, 9);
  platform(map, 48, 56, 11);
  platform(map, 58, 66, 8);
  platform(map, 68, 76, 6);
  platform(map, 78, 86, 9);
  platform(map, 88, 98, 11);
  platform(map, 100, 110, 8);
  platform(map, 112, 122, 6);
  platform(map, 124, 139, 13, 2);
  for (const [a, b] of [[10, 14], [50, 54], [92, 96]] as [number, number][]) {
    for (let x = a; x <= b; x++) carve(map, x, 12, 4);
  }
  for (const x of [20, 42, 62, 82, 104, 118]) {
    for (let y = 9; y <= 12; y++) carve(map, x, y, 5);
    carve(map, x, 8, 6);
  }
  return {
    name: "THE GUARDIAN'S HALL",
    width: W,
    height: H,
    map,
    playerStart: [2, 11],
    exitX: 136,
    enemies: [
      { kind: "bat", x: 18, y: 5 },
      { kind: "skull", x: 30, y: 5 },
      { kind: "bat", x: 42, y: 4 },
      { kind: "slime", x: 60, y: 7 },
      { kind: "bat", x: 72, y: 4 },
      { kind: "skull", x: 82, y: 8 },
      { kind: "bat", x: 94, y: 5 },
      { kind: "slime", x: 106, y: 7 },
      { kind: "bat", x: 118, y: 3 },
    ],
    coins: [
      [6, 9], [18, 7], [30, 5], [40, 8], [50, 10], [60, 7], [70, 5],
      [80, 8], [92, 10], [104, 7], [116, 5], [128, 12],
    ],
    gems: [[72, 4], [106, 6]],
    boss: true,
  };
}

const LEVELS: LevelData[] = [buildLevel1(), buildLevel2(), buildLevel3()];

export class World {
  player: Player;
  enemies: Enemy[] = [];
  boss: Boss | null = null;
  coins: Coin[] = [];
  gems: Gem[] = [];
  hazards: Hazard[] = [];
  projectiles: Projectile[] = [];
  level: LevelData;
  private images: { far?: HTMLImageElement; mid?: HTMLImageElement; title?: HTMLImageElement; over?: HTMLImageElement } = {};
  private cameraX = 0;
  private exitFlag = 0; // exit portal animation
  private bossDefeated = false;
  private levelIntroT = 0;

  constructor(private game: Game) {
    this.level = LEVELS[0];
    this.player = new Player(this.game, 2 * TILE, 11 * TILE);
    this.loadImages();
  }

  private loadImages() {
    const load = (src: string): Promise<HTMLImageElement> =>
      new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(img); // render nothing rather than break
        img.src = src;
      });
    load("/manus-storage/bg-parallax-far_4e92de9b.png").then((i) => (this.images.far = i));
    load("/manus-storage/bg-parallax-mid_965e67a2.png").then((i) => (this.images.mid = i));
    load("/manus-storage/title-art_e1422e3c.png").then((i) => (this.images.title = i));
    load("/manus-storage/gameover-art_b177573e.png").then((i) => (this.images.over = i));
  }

  get atlas(): SpriteAtlas {
    return this.game["atlas"] as SpriteAtlas;
  }
  get effects(): Effects {
    return this.game["effects"] as Effects;
  }

  loadLevel(n: number) {
    this.level = LEVELS[n - 1];
    this.enemies = this.level.enemies.map(
      (e) => new Enemy(this.game, e.x * TILE, e.y * TILE, e.kind),
    );
    this.coins = this.level.coins.map((c) => new Coin(c[0] * TILE, c[1] * TILE));
    this.gems = this.level.gems.map((g) => new Gem(g[0] * TILE, g[1] * TILE));
    this.hazards = [];
    this.projectiles = [];
    this.boss = this.level.boss ? new Boss(this.game, (this.level.width - 10) * TILE, 7 * TILE) : null;
    this.bossDefeated = false;
    this.player = new Player(this.game, this.level.playerStart[0] * TILE, this.level.playerStart[1] * TILE);
    this.player.invincible = 120; // 2s spawn shield
    this.cameraX = 0;
    this.levelIntroT = 120; // 2s level intro overlay
  }

  respawnPlayer() {
    this.player.x = this.level.playerStart[0] * TILE;
    this.player.y = this.level.playerStart[1] * TILE;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.invincible = 90;
    this.cameraX = 0;
    this.projectiles = [];
  }

  /** Tile at pixel coordinates */
  tileAt(px: number, py: number): number {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (ty < 0 || ty >= this.level.height) return 0;
    if (tx < 0 || tx >= this.level.width) return 1; // walls at edges
    return this.level.map[ty][tx];
  }
  isSolid(px: number, py: number): boolean {
    const t = this.tileAt(px, py);
    return t === 1 || t === 2 || t === 5;
  }

  solidTest(x: number, y: number, w: number, h: number): { grounded: boolean; blocked: boolean; onLava: boolean; onSpike: boolean } {
    const pts: [number, number][] = [
      [x + 2, y + h - 2], [x + w - 3, y + h - 2],
      [x + 2, y + h / 2], [x + w - 3, y + h / 2],
      [x + 2, y + 2], [x + w - 3, y + 2],
      [x + w / 2, y + h - 2], [x + w / 2, y + h - 6],
    ];
    let grounded = false, blocked = false, onLava = false, onSpike = false;
    for (const [px, py] of pts) {
      const t = this.tileAt(px, py);
      if (t === 1 || t === 2 || t === 5) {
        if (py >= this.player.y + this.player.h - 10) grounded = true;
        blocked = true;
      } else if (t === 3) onLava = true;
      else if (t === 4) onSpike = true;
    }
    return { grounded, blocked, onLava, onSpike };
  }

  update() {
    const g = this.game;
    this.levelIntroT = Math.max(0, this.levelIntroT - 1);

    // Spawn boss when player nears exit of level 3
    if (this.level.boss && !this.boss && !this.bossDefeated) {
      // boss already exists from load; no-op
    }

    this.player.update(this);
    for (const e of this.enemies) e.update(this);
    if (this.boss && this.boss.alive) {
      this.boss.update(this);
    } else if (this.boss && !this.boss.alive && !this.bossDefeated) {
      this.bossDefeated = true;
      g.score += 500;
      g.shakeAmount = 14;
    }
    for (const p of this.projectiles) p.update(this);
    this.projectiles = this.projectiles.filter((p) => p.life > 0);

    // Coin / gem pickup
    for (const c of this.coins) if (!c.dead) c.update();
    for (const gm of this.gems) if (!gm.dead) gm.update();
    for (const c of this.coins) {
      if (!c.dead && overlaps(this.player, c)) {
        c.dead = true;
        g.coins += 1;
        g.score += 10;
        this.effects.spawnCoinPop(c.x + 4, c.y);
      }
    }
    for (const gm of this.gems) {
      if (!gm.dead && overlaps(this.player, gm)) {
        gm.dead = true;
        g.score += 100;
        g.lives = Math.min(g.lives + 1, 5);
        this.effects.spawnGemPop(gm.x + 4, gm.y);
      }
    }

    // Exit check
    const exitPx = this.level.exitX * TILE;
    if (this.player.x > exitPx) {
      if (this.level.boss && !this.bossDefeated) {
        this.player.x = exitPx - 8;
      } else if (g.level < 3) {
        g.score += 200;
        g.beginLevel(g.level + 1);
        return;
      } else {
        g.score += 500;
        g.finalizeRun();
      }
    }
    if (this.exitFlag < 60) this.exitFlag++;

    // Camera
    const target = Math.max(0, Math.min(this.player.x - GW / 2, this.level.width * TILE - GW));
    this.cameraX += (target - this.cameraX) * 0.12;
  }

  draw(r: PixelRenderer) {
    const cam = this.cameraX;

    // Parallax backgrounds
    r.clearScreen("#1e1420");
    if (this.images.far) r.drawImage(this.images.far, -(cam * 0.2) % (GW * 2), 0, GW * 2, GH);
    if (this.images.mid) r.drawImage(this.images.mid, -(cam * 0.45) % (GW * 2) + GW * 0.2, 40, GW * 2, GH - 40);

    // Level intro overlay
    if (this.levelIntroT > 0) {
      r.clearScreen("#1e1420");
      if (this.images.far) r.drawImage(this.images.far, 0, 0, GW, GH);
      const a = Math.min(1, this.levelIntroT / 60);
      r.ctx.save();
      r.ctx.globalAlpha = 1 - a * 0.4;
      r.text(`LEVEL ${this.game.level}`, GW / 2, 92, "#ffd166", 10, "center");
      r.text(this.level.name, GW / 2, 112, "#ff7a33", 5, "center");
      r.ctx.restore();
    }

    // Tiles
    const startX = Math.floor(cam / TILE);
    const endX = Math.min(this.level.width, startX + Math.ceil(GW / TILE) + 2);
    for (let ty = 0; ty < this.level.height; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const t = this.level.map[ty][tx];
        const x = tx * TILE - cam;
        const y = ty * TILE;
        if (t === 1) r.drawImage(this.atlas.tile, x, y, TILE, TILE);
        else if (t === 2) r.drawImage(this.atlas.tileTop, x, y, TILE, TILE);
        else if (t === 3) r.drawImage(this.atlas.lava, x, y, TILE, TILE);
        else if (t === 4) r.drawImage(this.atlas.spike, x, y, TILE, TILE);
        else if (t === 5) r.drawImage(this.atlas.pillar, x, y, TILE, TILE);
        else if (t === 6) {
          r.drawImage(this.atlas.tileTop, x, y - TILE, TILE, TILE);
          r.drawImage(this.atlas.torch, x + 4, y - 8, 8, 8);
        }
      }
    }

    // Exit portal
    const ex = this.level.exitX * TILE - cam;
    const portalOpen = !this.level.boss || this.bossDefeated;
    r.ctx.save();
    r.ctx.globalAlpha = portalOpen ? 0.5 + 0.4 * Math.sin(this.exitFlag * 0.15) : 0.25;
    r.ctx.fillStyle = portalOpen ? "#ffd166" : "#5a4460";
    r.fillRect(ex, 8 * TILE, TILE, 5 * TILE);
    r.ctx.restore();
    r.text(portalOpen ? "EXIT" : "BOSS", ex - 4, 7 * TILE - 6, portalOpen ? "#ffd166" : "#ff5c5c", 2);

    for (const c of this.coins) if (!c.dead) c.draw(r, cam);
    for (const gm of this.gems) if (!gm.dead) gm.draw(r, cam);
    for (const e of this.enemies) e.draw(r, cam);
    if (this.boss) this.boss.draw(r, cam);
    for (const p of this.projectiles) p.draw(r, cam);
    this.player.draw(r, cam);
  }

  dispose() {
    // no listeners
  }
}

export function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
