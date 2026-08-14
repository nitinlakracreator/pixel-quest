/**
 * Pixel Quest — Ember Forge style.
 * UI: HUD (hearts, coins, score), title / pause / gameover / victory screens.
 * The ONLY extra text on the game is the credit line:
 * "GP Sonipat • Powered and created by Nitin."
 */
import { Game, GW, GH } from "./engine";
import { PixelRenderer } from "./render";

const CREDIT = "GP Sonipat • Powered and created by Nitin.";

const TITLE_ART = "/manus-storage/title-art_e1422e3c.png";
const LOGO = "/manus-storage/logo-mark_a388d943.png";
const OVER_ART = "/manus-storage/gameover-art_b177573e.png";

export class UI {
  private titleArt?: HTMLImageElement;
  private logo?: HTMLImageElement;
  private overArt?: HTMLImageElement;
  private blinkT = 0;
  private bannerT = 0;

  /**
   * Highlighted credit banner drawn at the TOP of every screen.
   * A pulsing golden band with large bold text so it cannot be missed.
   */
  private drawCreditBanner() {
    const r = this.game.renderer;
    this.bannerT++;
    const pulse = 0.55 + 0.45 * Math.sin(this.bannerT * 0.08);
    const bandH = 16;

    r.ctx.save();
    // glow band
    r.ctx.fillStyle = `rgba(255, 140, 20, ${0.35 + 0.3 * pulse})`;
    r.ctx.fillRect(0, 0, GW, bandH);
    r.ctx.fillStyle = `rgba(255, 190, 80, ${0.5 + 0.4 * pulse})`;
    r.ctx.fillRect(0, bandH, GW, 2);
    // text shadow + main text
    r.ctx.shadowColor = "#ffd166";
    r.ctx.shadowBlur = 8;
    r.ctx.fillStyle = "#ffe9a0";
    r.text(CREDIT, GW / 2, 5, "#ffd166", 1, "center", false);
    r.ctx.shadowBlur = 0;
    r.ctx.restore();
  }

  constructor(private game: Game) {
    const load = (src: string) =>
      new Promise<HTMLImageElement>((res) => {
        const img = new Image();
        img.onload = img.onerror = () => res(img);
        img.src = src;
      });
    load(TITLE_ART).then((i) => (this.titleArt = i));
    load(LOGO).then((i) => (this.logo = i));
    load(OVER_ART).then((i) => (this.overArt = i));
  }

  private hearts(r: PixelRenderer) {
    for (let i = 0; i < 5; i++) {
      r.ctx.save();
      r.ctx.globalAlpha = i < this.game.lives ? 1 : 0.25;
      const hx = 12 + i * 12;
      // pixel heart 9x8
      r.ctx.fillStyle = "#ff5c5c";
      const heart = [
        "011000110",
        "111101111",
        "111111111",
        "111111111",
        "011111110",
        "001111100",
        "000111000",
        "000010000",
      ];
      for (let y = 0; y < heart.length; y++) {
        for (let x = 0; x < 9; x++) {
          if (heart[y][x] === "1") r.ctx.fillRect(hx + x, 12 + y, 1, 1);
        }
      }
      r.ctx.restore();
    }
  }

  drawHUD() {
    const r = this.game.renderer;
    r.ctx.save();
    // HUD bar
    r.ctx.fillStyle = "rgba(10, 6, 16, 0.55)";
    r.ctx.fillRect(0, 16, GW, 26);
    this.hearts(r);
    r.text(`x${String(this.game.coins).padStart(3, "0")}`, 80, 26, "#ffd166", 2);
    r.text(`SCORE ${this.game.score}`, GW / 2 + 20, 26, "#ffffff", 2);
    r.text(`LV.${this.game.level}`, GW - 64, 26, "#ff7a33", 2);
    r.ctx.restore();
    this.drawCreditBanner();
  }

  drawTitle() {
    const r = this.game.renderer;
    this.blinkT++;

    if (this.titleArt) {
      // cover-fit draw: scale to cover then center-crop
      const iw = this.titleArt.width;
      const ih = this.titleArt.height;
      const scale = Math.max(GW / iw, GH / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      r.drawImage(this.titleArt, (GW - dw) / 2, (GH - dh) / 2, dw, dh);
      // darken for text readability
      r.ctx.save();
      r.ctx.fillStyle = "rgba(10, 6, 16, 0.45)";
      r.ctx.fillRect(0, 0, GW, GH);
      r.ctx.restore();
    } else {
      r.clearScreen("#1e1420");
    }

    // logo + title
    if (this.logo) r.drawImage(this.logo, GW / 2 - 12, 26, 24, 24);
    r.text("PIXEL QUEST", GW / 2, 54, "#ffd166", 4, "center");
    r.text("THE EMBER TUNNELS", GW / 2, 96, "#ff7a33", 3, "center");

    const blink = Math.floor(this.blinkT / 30) % 2 === 0;
    if (blink) r.text("PRESS ENTER OR SPACE", GW / 2, 136, "#ffffff", 3, "center");

    if (this.game.highScore > 0) r.text(`BEST ${this.game.highScore}`, GW / 2, 158, "#ffd166", 2, "center");

    r.text("ARROWS MOVE  SPACE JUMP  Z ATTACK", GW / 2, 180, "#8a7a8e", 2, "center");
    r.text("ESC PAUSE", GW / 2, 192, "#8a7a8e", 2, "center");

    this.drawCreditBanner();
  }

  drawPause() {
    const r = this.game.renderer;
    r.ctx.save();
    r.ctx.fillStyle = "rgba(10, 6, 16, 0.7)";
    r.ctx.fillRect(0, 0, GW, GH);
    r.text("PAUSED", GW / 2, 88, "#ffd166", 5, "center");
    r.text("PRESS ESC TO RESUME", GW / 2, 118, "#ffffff", 3, "center");
    r.ctx.restore();
    this.drawCreditBanner();
  }

  drawGameOver() {
    const r = this.game.renderer;
    if (this.overArt) {
      const iw = this.overArt.width;
      const ih = this.overArt.height;
      const scale = Math.max(GW / iw, GH / ih);
      r.drawImage(this.overArt, (GW - iw * scale) / 2, (GH - ih * scale) / 2, iw * scale, ih * scale);
      r.ctx.save();
      r.ctx.fillStyle = "rgba(10, 6, 16, 0.5)";
      r.ctx.fillRect(0, 0, GW, GH);
      r.ctx.restore();
    } else {
      r.clearScreen("#1e1420");
    }
    r.text("GAME OVER", GW / 2, 60, "#ff5c5c", 5, "center");
    r.text(`SCORE ${this.game.score}`, GW / 2, 110, "#ffd166", 3, "center");
    if (this.game.score >= this.game.highScore && this.game.score > 0) {
      r.text("NEW BEST!", GW / 2, 142, "#ff7a33", 2, "center");
    }
    const blink = Math.floor(this.blinkT++ / 30) % 2 === 0;
    if (blink) r.text("PRESS ENTER OR SPACE", GW / 2, 164, "#ffffff", 3, "center");
    this.drawCreditBanner();
  }

  drawNotice() {
    const r = this.game.renderer;
    // dark legal-overlay
    r.ctx.save();
    r.ctx.fillStyle = "#120c16";
    r.ctx.fillRect(0, 0, GW, GH);

    // ornamental border
    r.ctx.strokeStyle = "#ff7a33";
    r.ctx.lineWidth = 1;
    r.ctx.strokeRect(10, 10, GW - 20, GH - 20);
    r.ctx.strokeRect(12, 12, GW - 24, GH - 24);
    r.ctx.restore();

    r.text("OFFICIAL NOTICE", GW / 2, 24, "#ffd166", 2, "center");

    const lines = [
      "This game, PIXEL QUEST: THE",
      "EMBER TUNNELS, is the original",
      "property of NITIN LAKRA of GP",
      "SONIPAT POLYTECHNIC.",
      "",
      "All rights reserved.",
      "",
      "It is NOT for experimental use,",
      "modification, copying or",
      "redistribution by others. Any",
      "unauthorized use is prohibited."
    ];
    let y = 46;
    for (const line of lines) {
      const color = line === "" ? "#1e1420" : line.includes("NOT") || line.includes("prohibited") || line.includes("reserved") ? "#ff5c5c" : "#e8dcc8";
      r.text(line, GW / 2, y, color, 1, "center", false);
      y += 12;
    }

    const blink = Math.floor(this.blinkT++ / 30) % 2 === 0;
    if (blink) r.text("PRESS ENTER OR SPACE", GW / 2, 208, "#ffd166", 1, "center", false);
    r.text("GP Sonipat • Powered and created by Nitin.", GW / 2, 224, "#ff7a33", 1, "center", false);
  }

  drawVictory() {
    const r = this.game.renderer;
    r.clearScreen("#1e1420");
    if (this.titleArt) {
      const iw = this.titleArt.width;
      const ih = this.titleArt.height;
      const scale = Math.max(GW / iw, GH / ih);
      r.drawImage(this.titleArt, (GW - iw * scale) / 2, (GH - ih * scale) / 2, iw * scale, ih * scale);
      r.ctx.save();
      r.ctx.fillStyle = "rgba(10, 6, 16, 0.45)";
      r.ctx.fillRect(0, 0, GW, GH);
      r.ctx.restore();
    }
    r.text("VICTORY!", GW / 2, 50, "#ffd166", 5, "center");
    r.text("THE EMBER TUNNELS ARE FREE", GW / 2, 80, "#ff7a33", 3, "center");
    r.text(`FINAL SCORE ${this.game.score}`, GW / 2, 120, "#ffffff", 3, "center");
    if (this.game.score >= this.game.highScore) r.text("NEW BEST!", GW / 2, 150, "#ffd166", 2, "center");
    const blink = Math.floor(this.blinkT++ / 30) % 2 === 0;
    if (blink) r.text("PRESS ENTER OR SPACE", GW / 2, 170, "#ffffff", 3, "center");
    this.drawCreditBanner();
  }
}
