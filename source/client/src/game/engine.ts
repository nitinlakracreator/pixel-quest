/**
 * Pixel Quest — Ember Forge style.
 * Engine: fixed-step loop, input manager, state machine, screen shake.
 * All gameplay lives in plain TS; only the canvas DOM element is passed in.
 */
import { PixelRenderer } from "./render";
import { SpriteAtlas } from "./sprites";
import { World } from "./world";
import { Effects } from "./effects";
import { UI } from "./ui";
import { DemoPilot } from "./demo";

export type GameState = "title" | "playing" | "paused" | "gameover" | "victory" | "notice";

export const GW = 424; // internal game width
export const GH = 240; // internal game height

export interface GameEvents {
  shake(amount: number): void;
  restart(): void;
}

export class Game {
  private rendererRef: PixelRenderer
  private atlas: SpriteAtlas;
  private _world: World;
  private effectsRef: Effects
  private ui: UI;
  private demoRef: DemoPilot

  get world() {
    return this._world;
  }

  get effects() {
    return this.effectsRef;
  }

  get renderer() {
    return this.rendererRef;
  }

  get demo() {
    return this.demoRef;
  }

  state: GameState = "title";
  private raf = 0;
  private lastTime = 0;
  private acc = 0;
  private readonly dt = 1000 / 60;
  private demoMode = false;

  shakeAmount = 0;
  score = 0;
  coins = 0;
  lives = 3;
  level = 1;
  highScore = parseInt(localStorage.getItem("pq_highscore") || "0", 10);

  keys: Record<string, boolean> = {};
  touch = { left: false, right: false, jump: false, attack: false };

  constructor(private canvas: HTMLCanvasElement) {
    this.rendererRef = new PixelRenderer(canvas);
    this.atlas = new SpriteAtlas();
    this._world = new World(this);
    this.effectsRef = new Effects(this);
    this.ui = new UI(this);
    this.demoRef = new DemoPilot(this);
    this.demoMode = new URLSearchParams(window.location.search).has("demo");
    if (!localStorage.getItem("pq_notice_seen")) this.state = "notice";
    this.attachInput();
  }

  private attachInput() {
    const down = (e: KeyboardEvent) => {
      this.keys[e.code] = true;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      if (e.code === "Escape") this.togglePause();
      if (e.code === "KeyN") this.showNotice();
      if (e.code === "Enter" || e.code === "Space") this.onActionPress();
      if (e.code === "KeyZ" || e.code === "KeyC" || e.code === "KeyX") this.onAttackPress();
    };
    const up = (e: KeyboardEvent) => {
      this.keys[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    this._cleanupInput = () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }
  private _cleanupInput: () => void = () => {};

  startAction(): boolean {
    return this.keys["Space"] || this.keys["Enter"] || this.keys["ArrowUp"] || this.keys["KeyW"] || this.keys["KeyX"] || this.touch.jump;
  }
  startAttack(): boolean {
    return this.keys["KeyZ"] || this.keys["KeyC"] || this.keys["ControlLeft"] || this.touch.attack;
  }
  dir(): number {
    let d = 0;
    if (this.keys["ArrowLeft"] || this.keys["KeyA"] || this.touch.left) d -= 1;
    if (this.keys["ArrowRight"] || this.keys["KeyD"] || this.touch.right) d += 1;
    return d;
  }

  private onActionPress() {
    if (this.state === "notice") {
      // mark notice as seen for this browser, then go to title
      localStorage.setItem("pq_notice_seen", "1");
      this.state = "title";
    } else if (this.state === "title") {
      this.beginLevel(1);
    } else if (this.state === "gameover" || this.state === "victory") {
      this.resetRun();
      this.state = "title";
    }
  }

  /** Opens the ownership & legal notice (available any time via N key). */
  showNotice() {
    this.state = "notice";
  }

  private onAttackPress() {
    if (this.state === "playing") this.world.player?.attack();
  }

  togglePause() {
    if (this.state === "playing") this.state = "paused";
    else if (this.state === "paused") this.state = "playing";
    else if (this.state === "notice") this.state = "title";
  }

  beginLevel(n: number) {
    this.level = n;
    this.world.loadLevel(n);
    this.effectsRef.reset();
    this.state = "playing";
    this.canvas.focus();
  }

  playerDied() {
    this.lives -= 1;
    this.shakeAmount = 8;
    if (this.lives <= 0) {
      this.saveHighScore();
      this.state = "gameover";
    } else {
      this.world.respawnPlayer();
      this.effectsRef.flash(300);
    }
  }

  restart() {
    this.resetRun();
    this.state = "title";
  }

  private resetRun() {
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.level = 1;
  }

  finalizeRun() {
    this.saveHighScore();
    this.state = "victory";
  }

  private saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("pq_highscore", String(this.score));
    }
  }

  handleResize() {
    this.renderer.resize();
  }

  private loop = (t: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const delta = Math.min(t - this.lastTime, 50);
    this.lastTime = t; // notice: intentional

    // Demo autopilot drives inputs deterministically
    if (this.demoMode) this.demoRef.tick(this.state);

    this.acc += delta;
    while (this.acc >= this.dt) {
      this.update();
      this.acc -= this.dt;
    }
    this.render();
  };

  start() {
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private update() {
    if (this.state === "playing") {
      this.world.update();
      this.effectsRef.update();
      if (this.shakeAmount > 0) this.shakeAmount = Math.max(0, this.shakeAmount - 0.4);
    } else if (this.state === "title" || this.state === "gameover" || this.state === "victory" || this.state === "notice") {
      this.effectsRef.updateAmbient();
    }
  }

  private render() {
    const r = this.renderer;
    r.begin(this.shakeAmount);
    if (this.state === "title") this.ui.drawTitle();
    else if (this.state === "notice") this.ui.drawNotice();
    else if (this.state === "playing") {
      this.world.draw(r);
      this.ui.drawHUD();
      this.effectsRef.draw(r);
    } else if (this.state === "paused") {
      this.world.draw(r);
      this.ui.drawHUD();
      this.ui.drawPause();
    } else if (this.state === "gameover") this.ui.drawGameOver();
    else if (this.state === "victory") this.ui.drawVictory();
    r.end();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this._cleanupInput();
    this.world.dispose();
    this.atlas.dispose();
  }
}
