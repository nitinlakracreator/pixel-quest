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
      if (this.t > 25) k["Enter"] = true;
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
      // hop and keep going right
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
    if (this.t % 60 < 14 || hazardAhead || wallAhead || (p.grounded && (noFloorAhead || nearEnemy))) k["Space"] = true;
    else k["Space"] = false;

    // attack when an enemy is close
    for (const e of this.game.world.enemies) {
      if (!e.dead && Math.abs(e.x - wx) < 70) {
        k["KeyZ"] = true;
        return;
      }
    }
    k["KeyZ"] = false;
  }
}
