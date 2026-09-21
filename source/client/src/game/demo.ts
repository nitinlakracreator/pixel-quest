/**
 * Pixel Quest — Ember Forge style.
 * Demo autopilot: deterministic input driver activated via ?demo URL flag.
 * Makes the title screen playable and runs around level 1 for screenshots.
 */
import { Game } from "./engine";

export class DemoPilot {
  private t = 0;
  private stuckT = 0;
  private lastX = 0;

  constructor(private game: Game) {}

  tick(state: string) {
    this.t++;
    const k = this.game.keys;
    if (state === "title") {
      // Synthetic key state alone cannot trigger edge-triggered menu actions;
      // call the same semantic action used by keyboard and touch controls.
      if (this.t > 25) this.game.pressAction();
      return;
    }
    if (state !== "playing") return;

    // stuck recovery: reset keys briefly so fresh heuristics apply
    const px = this.game.world.player;
    if (Math.abs(px.x - this.lastX) < 0.5) this.stuckT++;
    else this.stuckT = 0;
    this.lastX = px.x;
    if (this.stuckT > 90) {
      this.stuckT = 0;
      // QA recovery only: move to the next checkpoint when geometry defeats
      // the autopilot. Normal players still use the physical route.
      const next = this.game.world.level.checkpoints.find((x) => x * 16 > px.x + 24);
      if (next !== undefined) {
        px.x = next * 16 - 12;
        px.y = this.game.world.level.playerStart[1] * 16;
        px.vx = 0;
        px.vy = 0;
        px.invincible = 90;
      }
      // hop and keep going right after the recovery
      k["Space"] = true;
      k["ArrowRight"] = true;
      return;
    }

    // deterministic wandering: run right, jump over gaps, attack enemies
    k["ArrowRight"] = true;
    k["ArrowLeft"] = false;

    // jump periodically and when near lava gaps or spikes
    const wx = this.game.world.player.x;
    const wy = this.game.world.player.y;
    const ahead = this.game.world.tileAt(wx + 40, wy + 10);
    const floorAhead = this.game.world.tileAt(wx + 28, wy + 24);
    const hazardAhead = ahead === 3 || ahead === 4;
    const noFloorAhead = floorAhead === 3 || floorAhead === 4 || floorAhead === 2 || floorAhead === 0;
    const wallAhead = this.game.world.isSolid(wx + 24, wy + 8) && !this.game.world.isSolid(wx + 24, wy - 20);
    const p = this.game.world.player;
    const nearEnemy = this.game.world.enemies.some((e) => !e.dead && Math.abs(e.x - wx) < 60);
    const boss = this.game.world.boss;
    const nearBoss = Boolean(boss?.alive && Math.abs(boss.x - wx) < 92);
    if (this.game.level === 3 && boss?.alive && this.t % 30 === 0) {
      // Keep the QA pilot in the readable melee range of the Guardian. This
      // exercises the real attack, hit flash, HP bar, defeat, and victory code.
      px.x = boss.x - 20;
      px.y = boss.y + 8;
      px.vx = 0;
      px.vy = 0;
      px.invincible = 90;
    }
    if (this.t % 60 < 14 || hazardAhead || wallAhead || nearBoss || (p.grounded && (noFloorAhead || nearEnemy))) k["Space"] = true;
    else k["Space"] = false;

    // attack when an enemy is close
    for (const e of this.game.world.enemies) {
      if (!e.dead && Math.abs(e.x - wx) < 70) {
        k["KeyZ"] = true;
        return;
      }
    }
    // Keep attacking while closing on the Guardian. The jump cadence above
    // prevents contact damage while the attack cooldown chips through all six
    // boss hit points and lets the normal victory transition run.
    if (nearBoss) {
      k["KeyZ"] = true;
      return;
    }
    k["KeyZ"] = false;
  }
}
