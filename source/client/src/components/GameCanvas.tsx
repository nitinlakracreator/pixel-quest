/**
 * Pixel Quest — Ember Forge style
 * Full-screen HTML5 Canvas 2D pixel game host.
 * Rules: init engine exactly once (StrictMode double-mount guard),
 * dispose on unmount, handle resize, attach listeners on canvas/window.
 */
import { useEffect, useRef, useState } from "react";
import { Game, type GameState } from "@/game/engine";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [gameState, setGameState] = useState<GameState>("notice");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (gameRef.current) return; // StrictMode guard: init once

    const game = new Game(canvas);
    gameRef.current = game;
    game.start();
    setGameState(game.state);
    const stateTimer = window.setInterval(() => setGameState(game.state), 100);

    const onResize = () => game.handleResize();
    window.addEventListener("resize", onResize);
    game.handleResize();

    return () => {
      window.clearInterval(stateTimer);
      window.removeEventListener("resize", onResize);
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  const canActivate = gameState === "notice" || gameState === "title" || gameState === "gameover" || gameState === "victory";
  const actionLabel = gameState === "notice" ? "Continue" : gameState === "title" ? "Start Game" : "Restart";

  return (
    <>
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
      data-game-state={gameState}
      aria-label={`Pixel Quest game canvas, ${gameState}`}
    />
    {canActivate && (
      <button
        type="button"
        aria-label={actionLabel}
        onClick={() => gameRef.current?.activate()}
        style={{
          position: "fixed",
          left: "50%",
          bottom: "12vh",
          transform: "translateX(-50%)",
          zIndex: 20,
          padding: "0.75rem 1.5rem",
          border: "2px solid #ffd166",
          borderRadius: 4,
          background: "#1e1420",
          color: "#ffd166",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: "0.08em",
          cursor: "pointer",
        }}
      >
        {actionLabel}
      </button>
    )}
    </>
  );
}
