import { useEffect, useRef, useState } from "react";

type Platform = { x: number; y: number; w: number; h: number; accent?: boolean };
type Coin = { x: number; y: number; taken?: boolean };
type Enemy = { x: number; y: number; w: number; h: number; min: number; max: number; dir: number; speed: number; dead?: boolean };
type Level = {
  name: string;
  sector: string;
  subtitle: string;
  sky: [string, string];
  platforms: Platform[];
  coins: Coin[];
  enemies: Enemy[];
  goal: { x: number; y: number };
  spawn: { x: number; y: number };
};
type Player = { x: number; y: number; w: number; h: number; vx: number; vy: number; onGround: boolean; facing: number };

type GameUi = {
  level: number;
  score: number;
  shards: number;
  lives: number;
  progress: number;
  phase: "playing" | "transition" | "won" | "gameover";
  message: string;
  submessage: string;
};

const WIDTH = 1200;
const HEIGHT = 640;
const GRAVITY = 1450;
const MOVE_SPEED = 235;
const JUMP_SPEED = 545;

const makeLevels = (): Level[] => [
  {
    name: "NEON MEADOW",
    sector: "SECTOR 01 / SUNRISE CIRCUIT",
    subtitle: "The first signal is waiting beyond the ridge.",
    sky: ["#101c3c", "#3a1d54"],
    spawn: { x: 72, y: 480 },
    goal: { x: 1115, y: 458 },
    platforms: [
      { x: 0, y: 560, w: 1200, h: 80 },
      { x: 180, y: 475, w: 142, h: 22 },
      { x: 390, y: 405, w: 150, h: 22, accent: true },
      { x: 608, y: 470, w: 136, h: 22 },
      { x: 808, y: 382, w: 142, h: 22, accent: true },
      { x: 1004, y: 492, w: 150, h: 22 },
    ],
    coins: [
      { x: 236, y: 430 }, { x: 430, y: 360 }, { x: 478, y: 360 }, { x: 658, y: 425 }, { x: 854, y: 338 }, { x: 1063, y: 447 },
    ],
    enemies: [
      { x: 285, y: 520, w: 34, h: 40, min: 250, max: 460, dir: 1, speed: 45 },
      { x: 724, y: 520, w: 34, h: 40, min: 650, max: 900, dir: -1, speed: 52 },
    ],
  },
  {
    name: "CHROME CANYON",
    sector: "SECTOR 02 / MAGNETIC DUST",
    subtitle: "Gravity feels different here. Trust your boots.",
    sky: ["#181442", "#5b204c"],
    spawn: { x: 60, y: 480 },
    goal: { x: 1130, y: 420 },
    platforms: [
      { x: 0, y: 560, w: 210, h: 80 },
      { x: 286, y: 500, w: 145, h: 22, accent: true },
      { x: 500, y: 420, w: 128, h: 22 },
      { x: 692, y: 505, w: 148, h: 22, accent: true },
      { x: 890, y: 430, w: 132, h: 22 },
      { x: 1072, y: 490, w: 160, h: 22 },
    ],
    coins: [
      { x: 118, y: 510 }, { x: 330, y: 455 }, { x: 550, y: 375 }, { x: 736, y: 460 }, { x: 944, y: 385 }, { x: 1145, y: 445 },
    ],
    enemies: [
      { x: 340, y: 460, w: 34, h: 40, min: 286, max: 431, dir: 1, speed: 53 },
      { x: 734, y: 465, w: 34, h: 40, min: 692, max: 840, dir: -1, speed: 58 },
      { x: 928, y: 390, w: 34, h: 40, min: 890, max: 1022, dir: 1, speed: 42 },
    ],
  },
  {
    name: "VOID FOUNDRY",
    sector: "SECTOR 03 / CORE ACCESS",
    subtitle: "One last run. The core is almost online.",
    sky: ["#0d132e", "#33164a"],
    spawn: { x: 64, y: 480 },
    goal: { x: 1115, y: 383 },
    platforms: [
      { x: 0, y: 560, w: 160, h: 80 },
      { x: 240, y: 465, w: 115, h: 22, accent: true },
      { x: 420, y: 360, w: 125, h: 22 },
      { x: 610, y: 460, w: 115, h: 22, accent: true },
      { x: 775, y: 330, w: 130, h: 22 },
      { x: 970, y: 425, w: 128, h: 22, accent: true },
      { x: 1090, y: 450, w: 170, h: 22 },
    ],
    coins: [
      { x: 100, y: 510 }, { x: 280, y: 420 }, { x: 465, y: 315 }, { x: 650, y: 415 }, { x: 830, y: 285 }, { x: 1018, y: 380 }, { x: 1150, y: 405 },
    ],
    enemies: [
      { x: 270, y: 425, w: 34, h: 40, min: 240, max: 355, dir: 1, speed: 58 },
      { x: 652, y: 420, w: 34, h: 40, min: 610, max: 725, dir: -1, speed: 62 },
      { x: 1010, y: 385, w: 34, h: 40, min: 970, max: 1098, dir: 1, speed: 55 },
    ],
  },
];

const cloneLevel = (level: Level): Level => ({
  ...level,
  platforms: level.platforms.map((platform) => ({ ...platform })),
  coins: level.coins.map((coin) => ({ ...coin })),
  enemies: level.enemies.map((enemy) => ({ ...enemy })),
  goal: { ...level.goal },
  spawn: { ...level.spawn },
});

const rectsOverlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const levelsRef = useRef<Level[]>(makeLevels());
  const currentLevelRef = useRef(0);
  const playerRef = useRef<Player>({ x: 72, y: 480, w: 32, h: 44, vx: 0, vy: 0, onGround: false, facing: 1 });
  const cameraRef = useRef(0);
  const scoreRef = useRef(0);
  const shardsRef = useRef(0);
  const livesRef = useRef(3);
  const jumpBufferRef = useRef(0);
  const coyoteRef = useRef(0);
  const lastTimeRef = useRef(0);
  const phaseRef = useRef<"playing" | "transition" | "won" | "gameover">("playing");
  const frameRef = useRef(0);
  const [introDone, setIntroDone] = useState(false);
  const [ui, setUi] = useState<GameUi>({ level: 1, score: 0, shards: 0, lives: 3, progress: 0, phase: "playing", message: "RUN THE SIGNAL", submessage: "Reach the portal at the end of the sector" });
  const [muted, setMuted] = useState(false);

  const resetPlayer = (levelIndex = currentLevelRef.current) => {
    const spawn = levelsRef.current[levelIndex].spawn;
    playerRef.current = { x: spawn.x, y: spawn.y, w: 32, h: 44, vx: 0, vy: 0, onGround: false, facing: 1 };
    cameraRef.current = 0;
  };

  const startLevel = (levelIndex: number) => {
    currentLevelRef.current = levelIndex;
    levelsRef.current[levelIndex] = cloneLevel(makeLevels()[levelIndex]);
    resetPlayer(levelIndex);
    phaseRef.current = "playing";
    setUi((previous) => ({ ...previous, level: levelIndex + 1, score: scoreRef.current, shards: shardsRef.current, lives: livesRef.current, progress: 0, phase: "playing", message: levelsRef.current[levelIndex].name, submessage: levelsRef.current[levelIndex].subtitle }));
  };

  const loseLife = () => {
    livesRef.current -= 1;
    if (livesRef.current <= 0) {
      phaseRef.current = "gameover";
      setUi((previous) => ({ ...previous, lives: 0, phase: "gameover", message: "SIGNAL LOST", submessage: "Your run is over. Reboot the sector and try again." }));
    } else {
      resetPlayer();
      setUi((previous) => ({ ...previous, lives: livesRef.current, message: "REBOOTING SUIT", submessage: `${livesRef.current} retries remain in this run` }));
    }
  };

  const finishLevel = () => {
    if (phaseRef.current !== "playing") return;
    phaseRef.current = "transition";
    const nextLevel = currentLevelRef.current + 1;
    if (nextLevel >= levelsRef.current.length) {
      phaseRef.current = "won";
      setUi((previous) => ({ ...previous, progress: 100, phase: "won", message: "CORE ONLINE", submessage: "You restored the Pixel Quest signal" }));
      return;
    }
    setUi((previous) => ({ ...previous, progress: 100, phase: "transition", message: "SECTOR CLEARED", submessage: `Loading ${levelsRef.current[nextLevel].name}` }));
    window.setTimeout(() => startLevel(nextLevel), 900);
  };

  useEffect(() => {
    const finishIntro = window.setTimeout(() => setIntroDone(true), 4400);
    return () => window.clearTimeout(finishIntro);
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const accepted = ["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW"];
      if (!accepted.includes(event.code)) return;
      event.preventDefault();
      if ((event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") && !keysRef.current.has(event.code)) {
        jumpBufferRef.current = 0.14;
      }
      keysRef.current.add(event.code);
    };
    const up = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrame = 0;

    const drawBackground = (level: Level, camera: number) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, level.sky[0]);
      gradient.addColorStop(1, level.sky[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.save();
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < 44; i += 1) {
        const x = (i * 173 - camera * (0.08 + (i % 3) * 0.035)) % (WIDTH + 80);
        const y = 42 + ((i * 79) % 310);
        ctx.fillStyle = i % 5 === 0 ? "#ffcf70" : "#d8d7ff";
        ctx.fillRect(x < -4 ? x + WIDTH + 80 : x, y, i % 4 === 0 ? 3 : 2, i % 4 === 0 ? 3 : 2);
      }
      ctx.restore();

      ctx.save();
      ctx.translate(-(camera * 0.18), 0);
      ctx.fillStyle = "#171843";
      ctx.beginPath();
      ctx.moveTo(-50, 520);
      for (let x = 0; x <= WIDTH + 500; x += 90) ctx.lineTo(x, 430 + Math.sin(x * 0.011) * 42 + Math.sin(x * 0.03) * 18);
      ctx.lineTo(WIDTH + 500, HEIGHT);
      ctx.lineTo(-50, HEIGHT);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#232053";
      ctx.beginPath();
      ctx.moveTo(-50, 570);
      for (let x = 0; x <= WIDTH + 500; x += 110) ctx.lineTo(x, 500 + Math.sin(x * 0.014 + 1) * 36);
      ctx.lineTo(WIDTH + 500, HEIGHT);
      ctx.lineTo(-50, HEIGHT);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawPlatform = (platform: Platform, camera: number) => {
      const x = platform.x - camera;
      if (x + platform.w < -30 || x > WIDTH + 30) return;
      ctx.fillStyle = "#101327";
      ctx.fillRect(x, platform.y + 7, platform.w, platform.h);
      ctx.fillStyle = platform.accent ? "#ffcc66" : "#7c72b8";
      ctx.fillRect(x, platform.y, platform.w, 7);
      ctx.fillStyle = platform.accent ? "#ffed9a" : "#a6a0e4";
      for (let stripe = 0; stripe < platform.w; stripe += 26) ctx.fillRect(x + stripe + 4, platform.y + 11, 11, 4);
      ctx.fillStyle = "#252544";
      ctx.fillRect(x + 4, platform.y + 22, Math.max(0, platform.w - 8), Math.max(0, platform.h - 24));
    };

    const drawCoin = (coin: Coin, camera: number, time: number) => {
      if (coin.taken) return;
      const x = coin.x - camera;
      const bob = Math.sin(time * 0.006 + coin.x) * 4;
      ctx.save();
      ctx.translate(x, coin.y + bob);
      ctx.fillStyle = "rgba(255, 211, 104, .2)";
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffde73";
      ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(9, -5); ctx.lineTo(9, 7); ctx.lineTo(0, 14); ctx.lineTo(-9, 7); ctx.lineTo(-9, -5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff4b0"; ctx.fillRect(-2, -9, 4, 17);
      ctx.restore();
    };

    const drawEnemy = (enemy: Enemy, camera: number, time: number) => {
      if (enemy.dead) return;
      const x = enemy.x - camera;
      const bounce = Math.sin(time * 0.009 + enemy.x) * 2;
      ctx.save(); ctx.translate(x, enemy.y + bounce);
      ctx.fillStyle = "#0c1022"; ctx.fillRect(3, 9, 28, 30);
      ctx.fillStyle = "#fc5579"; ctx.fillRect(0, 13, 34, 23);
      ctx.fillStyle = "#ff90a3"; ctx.fillRect(5, 7, 24, 10);
      ctx.fillStyle = "#151833"; ctx.fillRect(8, 17, 5, 5); ctx.fillRect(21, 17, 5, 5);
      ctx.fillStyle = "#ffc86d"; ctx.fillRect(4, 35, 9, 6); ctx.fillRect(21, 35, 9, 6);
      ctx.restore();
    };

    const drawPlayer = (player: Player, camera: number, time: number) => {
      const x = player.x - camera;
      const legShift = player.onGround ? Math.sin(time * 0.02) * 2 : 0;
      ctx.save(); ctx.translate(x, player.y);
      if (player.facing < 0) ctx.scale(-1, 1);
      ctx.fillStyle = "rgba(101, 231, 255, .22)"; ctx.fillRect(1, 3, 34, 43);
      ctx.fillStyle = "#0b1022"; ctx.fillRect(4, 5, 25, 25);
      ctx.fillStyle = "#53e4f2"; ctx.fillRect(7, 7, 20, 16);
      ctx.fillStyle = "#dafcff"; ctx.fillRect(9, 11, 16, 5);
      ctx.fillStyle = "#f2f3ff"; ctx.fillRect(8, 25, 18, 12);
      ctx.fillStyle = "#7675b6"; ctx.fillRect(5, 35, 10, 8 + legShift); ctx.fillRect(20, 35, 10, 8 - legShift);
      ctx.fillStyle = "#ffcc66"; ctx.fillRect(3, 41 + legShift, 13, 4); ctx.fillRect(19, 41 - legShift, 13, 4);
      ctx.fillStyle = "#ffcc66"; ctx.fillRect(0, 24, 7, 8);
      ctx.restore();
    };

    const drawGoal = (goal: Level["goal"], camera: number, time: number) => {
      const x = goal.x - camera;
      const pulse = 1 + Math.sin(time * 0.006) * 0.08;
      ctx.save(); ctx.translate(x, goal.y); ctx.scale(pulse, pulse);
      ctx.fillStyle = "rgba(107, 242, 255, .16)"; ctx.beginPath(); ctx.arc(0, 24, 52, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#64f0ff"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 24, 30, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#ffcf70"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 24, 39, 0.5, Math.PI + 0.5); ctx.stroke();
      ctx.fillStyle = "#e9ffff"; ctx.fillRect(-4, -16, 8, 80);
      ctx.fillStyle = "#64f0ff"; ctx.fillRect(-20, 9, 40, 30);
      ctx.restore();
    };

    const draw = (time: number) => {
      const level = levelsRef.current[currentLevelRef.current];
      const camera = cameraRef.current;
      drawBackground(level, camera);
      level.platforms.forEach((platform) => drawPlatform(platform, camera));
      level.coins.forEach((coin) => drawCoin(coin, camera, time));
      level.enemies.forEach((enemy) => drawEnemy(enemy, camera, time));
      drawGoal(level.goal, camera, time);
      drawPlayer(playerRef.current, camera, time);
      ctx.fillStyle = "rgba(255,255,255,.04)";
      for (let y = 0; y < HEIGHT; y += 4) ctx.fillRect(0, y, WIDTH, 1);
    };

    const tick = (time: number) => {
      const elapsed = Math.min((time - lastTimeRef.current) / 1000 || 0, 0.032);
      lastTimeRef.current = time;
      const player = playerRef.current;
      const level = levelsRef.current[currentLevelRef.current];
      const inputLeft = keysRef.current.has("ArrowLeft") || keysRef.current.has("KeyA");
      const inputRight = keysRef.current.has("ArrowRight") || keysRef.current.has("KeyD");
      const direction = inputRight ? 1 : inputLeft ? -1 : 0;

      if (phaseRef.current === "playing") {
        jumpBufferRef.current = Math.max(0, jumpBufferRef.current - elapsed);
        coyoteRef.current = player.onGround ? 0.11 : Math.max(0, coyoteRef.current - elapsed);
        const targetVelocity = direction * MOVE_SPEED;
        player.vx += (targetVelocity - player.vx) * Math.min(1, elapsed * 13);
        if (!direction) player.vx *= Math.max(0, 1 - elapsed * 10);
        if (direction) player.facing = direction;
        if (jumpBufferRef.current > 0 && (player.onGround || coyoteRef.current > 0)) {
          player.vy = -JUMP_SPEED;
          player.onGround = false;
          coyoteRef.current = 0;
          jumpBufferRef.current = 0;
        }
        const previousX = player.x;
        const previousY = player.y;
        player.x += player.vx * elapsed;
        player.x = Math.max(0, Math.min(1190, player.x));
        for (const platform of level.platforms) {
          if (!rectsOverlap(player, platform)) continue;
          if (player.vx > 0 && previousX + player.w <= platform.x + 2) player.x = platform.x - player.w;
          else if (player.vx < 0 && previousX >= platform.x + platform.w - 2) player.x = platform.x + platform.w;
        }
        player.vy += GRAVITY * elapsed;
        player.y += player.vy * elapsed;
        player.onGround = false;
        for (const platform of level.platforms) {
          if (!rectsOverlap(player, platform)) continue;
          if (player.vy >= 0 && previousY + player.h <= platform.y + 5) {
            player.y = platform.y - player.h;
            player.vy = 0;
            player.onGround = true;
          } else if (player.vy < 0 && previousY >= platform.y + platform.h - 4) {
            player.y = platform.y + platform.h;
            player.vy = 0;
          }
        }
        if (player.y > HEIGHT + 100) loseLife();
        for (const coin of level.coins) {
          if (!coin.taken && rectsOverlap(player, { x: coin.x - 13, y: coin.y - 13, w: 26, h: 26 })) {
            coin.taken = true;
            shardsRef.current += 1;
            scoreRef.current += 50;
          }
        }
        for (const enemy of level.enemies) {
          if (enemy.dead) continue;
          enemy.x += enemy.dir * enemy.speed * elapsed;
          if (enemy.x < enemy.min || enemy.x > enemy.max) { enemy.dir *= -1; enemy.x = Math.max(enemy.min, Math.min(enemy.max, enemy.x)); }
          if (!rectsOverlap(player, enemy)) continue;
          if (player.vy > 0 && previousY + player.h <= enemy.y + 14) {
            enemy.dead = true;
            player.y = enemy.y - player.h;
            player.vy = -330;
            scoreRef.current += 100;
          } else {
            loseLife();
            break;
          }
        }
        const goalRect = { x: level.goal.x - 30, y: level.goal.y - 20, w: 60, h: 100 };
        if (rectsOverlap(player, goalRect)) finishLevel();
        const targetCamera = Math.max(0, Math.min(640, player.x - 260));
        cameraRef.current += (targetCamera - cameraRef.current) * Math.min(1, elapsed * 7);
        const progress = Math.min(99, Math.round((player.x / level.goal.x) * 100));
        if (frameRef.current % 6 === 0) setUi((previous) => ({ ...previous, score: scoreRef.current, shards: shardsRef.current, lives: livesRef.current, progress }));
      }
      frameRef.current += 1;
      draw(time);
      animationFrame = window.requestAnimationFrame(tick);
    };
    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const pressControl = (code: string) => {
    if (code === "Space") jumpBufferRef.current = 0.14;
    keysRef.current.add(code);
  };
  const releaseControl = (code: string) => keysRef.current.delete(code);
  const restartGame = () => {
    scoreRef.current = 0; shardsRef.current = 0; livesRef.current = 3;
    levelsRef.current = makeLevels();
    startLevel(0);
  };

  return (
    <main className="game-shell">
      {!introDone && (
        <section className="intro-sequence" aria-label="Pixel Quest title animation">
          <div className="intro-grid" />
          <div className="intro-scanline" />
          <div className="intro-kicker"><span>PX-01</span><span>TRANSMISSION INCOMING</span><span>04.20 SEC</span></div>
          <div className="title-lockup">
            <div className="title-overline">AN ADVENTURE IN PIXEL MOTION</div>
            <h1 className="transformer-title" aria-label="Pixel Quest"><span>PIXEL</span><span>QUEST</span></h1>
            <div className="title-rule"><i /><b>PLAY THE SIGNAL</b><i /></div>
          </div>
          <div className="intro-footer"><span>SYNCING CHARACTER CORE</span><span className="loading-blocks"><i /><i /><i /><i /><i /></span></div>
          <button className="skip-intro" onClick={() => setIntroDone(true)}>SKIP INTRO <span>↗</span></button>
        </section>
      )}

      <div className="game-container">
        <header className="topbar">
          <div className="brand-lockup"><div className="brand-mark">PQ</div><div><strong>PIXEL QUEST</strong><small>ARCADE RUNNER / BUILD 01</small></div></div>
          <div className="topbar-meta"><span className="live-dot" /> SIGNAL ONLINE <span className="topbar-divider" /> {ui.level.toString().padStart(2, "0")} / 03</div>
          <button className="sound-toggle" onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute" : "Mute"}>{muted ? "SOUND OFF" : "SOUND ON"}<span className={muted ? "sound-bars muted" : "sound-bars"}><i /><i /><i /><i /></span></button>
        </header>

        <section className="game-layout">
          <aside className="side-panel left-panel">
            <div className="panel-label">RUN STATUS</div>
            <div className="stat-card accent-card"><span className="stat-label">SCORE</span><strong>{ui.score.toString().padStart(6, "0")}</strong><small>+50 SHARD / +100 STOMP</small></div>
            <div className="stat-card"><span className="stat-label">SHARDS</span><strong className="cyan-text">{ui.shards.toString().padStart(2, "0")} <em>/ {levelsRef.current[currentLevelRef.current]?.coins.length.toString().padStart(2, "0")}</em></strong><div className="shard-meter"><i style={{ width: `${Math.min(100, (ui.shards / (levelsRef.current[currentLevelRef.current]?.coins.length || 1)) * 100)}%` }} /></div></div>
            <div className="stat-card"><span className="stat-label">LIVES</span><div className="lives"><i /><i /><i className={ui.lives < 3 ? "empty" : ""} /></div><small>{ui.lives} RETRIES REMAINING</small></div>
            <div className="side-tip"><span className="tip-icon">✦</span><p><b>FIELD NOTE</b> Tap jump early at ledges. Your suit has a little forgiveness.</p></div>
          </aside>

          <section className="play-column">
            <div className="level-heading"><div><span className="eyebrow">{levelsRef.current[currentLevelRef.current]?.sector}</span><h2>{ui.message}</h2><p>{ui.submessage}</p></div><div className="progress-wrap"><span>SECTOR PROGRESS</span><strong>{ui.progress}%</strong><div className="progress-line"><i style={{ width: `${ui.progress}%` }} /></div></div></div>
            <div className="canvas-frame">
              <div className="canvas-corner corner-tl" /><div className="canvas-corner corner-tr" /><div className="canvas-corner corner-bl" /><div className="canvas-corner corner-br" />
              <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Pixel Quest platformer game" />
              {ui.phase === "won" && <div className="win-overlay"><div className="win-stamp">SIGNAL RESTORED</div><h3>QUEST<br /><span>COMPLETE</span></h3><p>The core is humming. Nice run, pilot.</p><button onClick={restartGame}>RUN IT BACK <span>↗</span></button></div>}
              {ui.phase === "gameover" && <div className="win-overlay"><div className="win-stamp">ALL RETRIES USED</div><h3>RUN<br /><span>OVER</span></h3><p>The sector is still waiting. Start a fresh run and keep moving.</p><button onClick={restartGame}>REBOOT RUN <span>↗</span></button></div>}
              <div className="canvas-hint"><span className="keyboard-dot" /> ARROWS / A D TO MOVE <span className="hint-divider" /> SPACE / W / ↑ TO JUMP</div>
            </div>
            <div className="mobile-controls"><button onPointerDown={() => pressControl("ArrowLeft")} onPointerUp={() => releaseControl("ArrowLeft")} onPointerLeave={() => releaseControl("ArrowLeft")} aria-label="Move left">←</button><button className="jump-control" onPointerDown={() => pressControl("Space")} onPointerUp={() => releaseControl("Space")} onPointerLeave={() => releaseControl("Space")} aria-label="Jump">JUMP</button><button onPointerDown={() => pressControl("ArrowRight")} onPointerUp={() => releaseControl("ArrowRight")} onPointerLeave={() => releaseControl("ArrowRight")} aria-label="Move right">→</button></div>
            <div className="bottom-controls"><span><kbd>←</kbd><kbd>→</kbd> MOVE</span><span><kbd>SPACE</kbd> JUMP</span><button onClick={() => resetPlayer()}>RESTART POSITION <span>↻</span></button></div>
          </section>

          <aside className="side-panel right-panel">
            <div className="panel-label">MISSION MAP</div>
            <div className="map-card"><div className="map-lines" /><div className="map-node start"><i />01</div><div className={`map-node node-two ${ui.level >= 2 ? "active" : ""}`}><i />02</div><div className={`map-node node-three ${ui.level >= 3 ? "active" : ""}`}><i />03</div><div className="map-path path-one" /><div className="map-path path-two" /></div>
            <div className="level-list">{levelsRef.current.map((level, index) => <div className={`level-row ${ui.level === index + 1 ? "current" : ui.level > index + 1 ? "complete" : "locked"}`} key={level.name}><span>0{index + 1}</span><div><b>{level.name}</b><small>{ui.level > index + 1 ? "CLEARED" : ui.level === index + 1 ? "IN PROGRESS" : "LOCKED"}</small></div><i>{ui.level > index + 1 ? "✓" : ui.level === index + 1 ? "•" : "—"}</i></div>)}</div>
            <button className="reset-button" onClick={restartGame}>RESET RUN <span>↻</span></button>
          </aside>
        </section>
        <footer className="site-footer"><span>© 2026 PIXEL QUEST LABS</span><span>BUILT FOR QUICK HANDS + BRAVE HEARTS</span><span>V.01.03 <b>●</b></span></footer>
      </div>
    </main>
  );
}

export { makeLevels };
