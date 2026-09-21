import { useEffect, useRef } from "react";
import { Game } from "@/game/engine";

type TouchKey = "left" | "right" | "jump" | "attack";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameRef.current) return;

    const game = new Game(canvas);
    gameRef.current = game;
    game.start();
    canvas.focus();

    const onResize = () => game.handleResize();
    window.addEventListener("resize", onResize);
    game.handleResize();

    return () => {
      window.removeEventListener("resize", onResize);
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  const setTouch = (key: TouchKey, value: boolean) => {
    const game = gameRef.current;
    if (!game) return;
    game.touch[key] = value;
    if (value && key === "jump" && game.state !== "playing") game.pressAction();
  };

  const button = (key: TouchKey, label: string, className: string) => (
    <button
      type="button"
      aria-label={label}
      className={`pq-touch-button ${className}`}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        setTouch(key, true);
      }}
      onPointerUp={(event) => {
        event.preventDefault();
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setTouch(key, false);
      }}
      onPointerCancel={() => setTouch(key, false)}
      onLostPointerCapture={() => setTouch(key, false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );

  return (
    <div className="pq-game-shell">
      <canvas
        ref={canvasRef}
        aria-label="Pixel Quest game canvas"
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
      <div className="pq-touch-controls" aria-label="Touch controls">
        <div className="pq-touch-cluster pq-touch-movement">
          {button("left", "Move left", "pq-left")} {button("right", "Move right", "pq-right")}
        </div>
        <div className="pq-touch-cluster pq-touch-actions">
          {button("jump", "Jump or start", "pq-jump")} {button("attack", "Attack", "pq-attack")}
          <button
            type="button"
            aria-label="Pause or resume"
            className="pq-touch-button pq-pause"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              gameRef.current?.pressPause();
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            <span aria-hidden="true">Ⅱ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
