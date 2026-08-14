/**
 * Pixel Quest — Ember Forge style.
 * Renderer: draws to a fixed 424x240 offscreen buffer then paints it
 * scaled to the canvas with image-rendering: pixelated for crisp pixels.
 */
import { GW, GH } from "./engine";

export class PixelRenderer {
  buffer: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  private scale = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.buffer = document.createElement("canvas");
    this.buffer.width = GW;
    this.buffer.height = GH;
    const bctx = this.buffer.getContext("2d")!;
    bctx.imageSmoothingEnabled = false;
    this.ctx = bctx;
    this.resize();
  }

  resize() {
    const target = window.devicePixelRatio > 1 && window.innerWidth < 900 ? 1.5 : 1;
    this.canvas.width = Math.floor(window.innerWidth * target);
    this.canvas.height = Math.floor(window.innerHeight * target);
    this.scale = Math.max(1, Math.floor(Math.min(this.canvas.width / GW, this.canvas.height / GH)));
    this.canvas.style.width = `${Math.floor(GW * this.scale)}px`;
    this.canvas.style.height = `${Math.floor(GH * this.scale)}px`;
    this.canvas.style.margin = "auto";
    this.canvas.style.position = "fixed";
    this.canvas.style.left = "50%";
    this.canvas.style.top = "50%";
    this.canvas.style.transform = "translate(-50%, -50%)";
  }

  begin(shake: number) {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.save();
    this.ctx.clearRect(0, 0, GW, GH);
    if (shake > 0) {
      this.ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
  }

  end() {
    this.ctx.restore();
    const ctx = this.canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#1e1420";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const dx = (this.canvas.width - GW * this.scale) / 2;
    const dy = (this.canvas.height - GH * this.scale) / 2;
    ctx.drawImage(this.buffer, dx, dy, GW * this.scale, GH * this.scale);
  }

  drawImage(img: CanvasImageSource, x: number, y: number, w: number, h: number, flip = false, alpha = 1) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    if (flip) {
      this.ctx.translate(x + w, y);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(img, 0, 0, w, h);
    } else {
      this.ctx.drawImage(img, x, y, w, h);
    }
    this.ctx.restore();
  }

  fillRect(x: number, y: number, w: number, h: number) {
    this.ctx.fillRect(x, y, w, h);
  }

  clearScreen(color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, GW, GH);
  }

  text(str: string, x: number, y: number, color: string, size = 6, align: CanvasTextAlign = "left", shadow = true) {
    this.ctx.save();
    this.ctx.font = `${size * 6}px "Press Start 2P", monospace`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = "top";
    this.ctx.imageSmoothingEnabled = false;
    if (shadow) {
      this.ctx.fillStyle = "#0a0610";
      this.ctx.fillText(str, x + 1, y + 2);
    }
    this.ctx.fillStyle = color;
    this.ctx.fillText(str, x, y);
    this.ctx.restore();
  }
}
