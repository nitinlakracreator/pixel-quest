/**
 * Pixel Quest — Ember Forge style
 * Full-screen HTML5 Canvas 2D pixel game host.
 * Rules: init engine exactly once (StrictMode double-mount guard),
 * dispose on unmount, handle resize, attach listeners on canvas/window.
 */
import { useEffect, useRef } from "react";
import { Game } from "@/game/engine";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (gameRef.current) return; // StrictMode guard: init once

    const game = new Game(canvas);
    gameRef.current = game;
    game.start();

    const onResize = () => game.handleResize();
    window.addEventListener("resize", onResize);
    game.handleResize();

    return () => {
      window.removeEventListener("resize", onResize);
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={() => gameRef.current?.activate()}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        imageRendering: "pixelated",
        background: "#1e1420",
        display: "block",
        touchAction: "none",
      }}
      tabIndex={0}
    />
  );
}
