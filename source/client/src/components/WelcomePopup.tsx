/**
 * Pixel Quest — "Welcome Nitin." Transformers-style startup popup.
 * Hundreds of small numbers/letters/symbols fly in from ALL directions,
 * spinning and assembling into the giant glowing word "WELCOME NITIN.",
 * then a flash burst hands over to the game.
 * Ember Forge palette: golden (#ffd166), ember orange (#ff7a33), dark (#0a0610).
 */
import { useEffect, useMemo, useRef, useState } from "react";

const SYMBOLS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*<>+=~^|/?";
const MAIN = "WELCOME NITIN.";
const SUB = "GP Sonipat  •  Pixel Quest";
const ASSEMBLE_MS = 3600; // shards converge
const HOLD_MS = 700; // final word holds
const SHARDS = 260; // flying pieces

function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Compute the target position of shard index i on the giant word grid. */
function wordTarget(i: number, vw: number, vh: number) {
  const chars = MAIN.split("");
  const perChar = Math.ceil(SHARDS / chars.length);
  const charIdx = Math.floor(i / perChar);
  const within = i % perChar;
  // word geometry: big centered text block, chars as 5x7-ish dot cells
  const fontSize = Math.min(vw * 0.085, 74);
  const lineHeight = fontSize * 1.15;
  // place chars across two lines max? MAIN is one line with space.
  const charsPerLine = 8; // "WELCOME " occupies first 8, "NITIN." second 6
  const line = Math.floor(charIdx / charsPerLine);
  const col = charIdx % charsPerLine;
  const totalW = charsPerLine * fontSize * 0.62;
  const cx = vw / 2;
  const baseX = cx - totalW / 2 + col * fontSize * 0.62;
  const baseY = vh / 2 - lineHeight * 0.7 + line * lineHeight;
  // jitter within the character cell (dot-like scatter inside each glyph)
  const jx = (seeded(i * 37) - 0.5) * fontSize * 0.5;
  const jy = (seeded(i * 53) - 0.5) * fontSize * 0.55;
  return { x: baseX + jx, y: baseY + jy, delay: i * (ASSEMBLE_MS / SHARDS) * 0.55 };
}

export default function WelcomePopup({ onDone }: { onDone: () => void }) {
  const [viewport, setViewport] = useState({ vw: window.innerWidth, vh: window.innerHeight });
  const [phase, setPhase] = useState<"flying" | "locked" | "burst">("flying");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const onResize = () => setViewport({ vw: window.innerWidth, vh: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Shard configs computed once
  const shards = useMemo(() => {
    const { vw, vh } = viewport;
    const fontSize = Math.min(vw * 0.085, 74);
    return Array.from({ length: SHARDS }, (_, i) => {
      const r0 = seeded(i * 7); // spawn side
      const side = Math.floor(r0 * 4);
      const margin = 80;
      let x = 0, y = 0;
      if (side === 0) { x = -margin; y = seeded(i * 11) * vh; }
      else if (side === 1) { x = vw + margin; y = seeded(i * 13) * vh; }
      else if (side === 2) { y = -margin; x = seeded(i * 17) * vw; }
      else { y = vh + margin; x = seeded(i * 19) * vw; }
      const target = wordTarget(i, vw, vh);
      const dur = 1600 + seeded(i * 23) * 1800; // 1.6–3.4s staggered flights
      const char = SYMBOLS[Math.floor(seeded(i * 29) * SYMBOLS.length)];
      const size = 9 + seeded(i * 41) * 16;
      const spin = (seeded(i * 43) - 0.5) * 1440; // dramatic spin
      const color = seeded(i * 47) > 0.82 ? "#ff7a33" : seeded(i * 51) > 0.6 ? "#ffd166" : "#4a3a5c";
      return { i, x, y, target, dur, char, size, spin, color };
    });
  }, [viewport]);

  // Phase timing
  useEffect(() => {
    const tLock = setTimeout(() => setPhase("locked"), ASSEMBLE_MS);
    const tBurst = setTimeout(() => setPhase("burst"), ASSEMBLE_MS + HOLD_MS);
    const tDone = setTimeout(() => onDoneRef.current(), ASSEMBLE_MS + HOLD_MS + 340);
    // any-key skip for returning players (avoids accidental close while clicking canvas)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") onDoneRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(tLock); clearTimeout(tBurst); clearTimeout(tDone); window.removeEventListener("keydown", onKey); };
  }, []);

  const { vw, vh } = viewport;
  const wordFontSize = Math.min(vw * 0.085, 74);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0610", zIndex: 999, overflow: "hidden" }}>
      {/* flying shards: start at spawn point, transition to word position */}
      {phase !== "burst" && shards.map((s) => {
        const settled = phase === "locked";
        const delay = settled ? 0 : s.target.delay;
        return (
          <span
            key={s.i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              color: settled ? "#ffd166" : s.color,
              fontSize: settled ? Math.max(6, s.size * 0.7) : s.size,
              fontFamily: '"Press Start 2P", monospace',
              fontWeight: 700,
              opacity: settled ? 0.35 : 0.9,
              pointerEvents: "none",
              transform: settled ? "none" : `rotate(${s.spin}deg)`,
              transition: `left ${s.dur}ms cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms, top ${s.dur}ms cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms, transform ${s.dur}ms cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms, opacity 300ms ease, font-size ${s.dur}ms cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms, color ${s.dur}ms ease ${delay}ms`,
              ...(settled ? { left: s.target.x, top: s.target.y, transform: "none" } : {}),
            }}
          >
            {s.char}
          </span>
        );
      })}

      {/* final assembled word */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: phase === "locked" || phase === "burst" ? 1 : 0,
          transition: "opacity 320ms ease-out",
          transform: phase === "locked" || phase === "burst" ? "scale(1)" : "scale(0.94)",
          transitionProperty: "opacity, transform",
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
          transitionDuration: phase === "locked" ? "320ms" : "220ms",
          transitionDelay: "0ms",
        }}
      >
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: `clamp(${Math.max(26, wordFontSize * 0.55)}px, 9.5vw, 74px)`,
            color: "#ffd166",
            textShadow: "0 0 28px rgba(255, 209, 102, 0.85), 0 0 60px rgba(255, 122, 51, 0.55), 3px 3px 0 #0a0610",
            letterSpacing: "0.06em",
            textAlign: "center",
            whiteSpace: "nowrap",
            animation: "wk-pulse 900ms ease-in-out infinite alternate",
          }}
        >
          WELCOME NITIN.
        </div>
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(9px, 1.8vw, 13px)",
            color: "#ff7a33",
            marginTop: Math.max(12, wordFontSize * 0.28),
            textAlign: "center",
            whiteSpace: "nowrap",
            textShadow: "0 0 14px rgba(255, 122, 51, 0.8)",
          }}
        >
          {SUB}
        </div>
      </div>

      {/* metallic flash burst */}
      {phase === "burst" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#ffd166",
            animation: "wk-flash 340ms ease-in forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {/* skip button: bottom-right, pixel-styled golden button */}
      <button
        onClick={() => onDoneRef.current()}
        style={{
          position: "absolute",
          bottom: Math.max(18, vh * 0.04),
          right: Math.max(18, vw * 0.03),
          zIndex: 1001,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "clamp(10px, 1.6vw, 13px)",
          color: "#ffd166",
          background: "rgba(10, 6, 16, 0.75)",
          border: "2px solid #ff7a33",
          boxShadow: "0 0 12px rgba(255, 122, 51, 0.6), inset 0 0 8px rgba(255, 209, 102, 0.25)",
          padding: "10px 18px",
          letterSpacing: "0.1em",
          cursor: "pointer",
          opacity: phase === "burst" ? 0 : 0.9,
          transition: "opacity 200ms ease-out, transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms ease-out",
          animation: "wk-skipblink 1400ms ease-in-out infinite",
        }}
        onMouseEnter={(e) => {
          const t = e.currentTarget;
          t.style.boxShadow = "0 0 22px rgba(255, 122, 51, 0.9), inset 0 0 12px rgba(255, 209, 102, 0.45)";
          t.style.transform = "scale(1.06)";
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.boxShadow = "0 0 12px rgba(255, 122, 51, 0.6), inset 0 0 8px rgba(255, 209, 102, 0.25)";
          t.style.transform = "scale(1)";
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
      >
        SKIP ►
      </button>

      <style>{`
        @keyframes wk-pulse {
          from { text-shadow: 0 0 28px rgba(255,209,102,0.85), 0 0 60px rgba(255,122,51,0.55), 3px 3px 0 #0a0610; }
          to { text-shadow: 0 0 44px rgba(255,209,102,1), 0 0 90px rgba(255,122,51,0.8), 3px 3px 0 #0a0610; }
        }
        @keyframes wk-flash {
          0% { opacity: 0; }
          35% { opacity: 0.95; }
          100% { opacity: 1; }
        }
        @keyframes wk-skipblink {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
