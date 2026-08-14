# Pixel Quest — Design Brainstorm

User requirement: a fully developed pixel art game playable in the browser (HTML/JS), with a visible credit line: **"Powered and created by Nitin."** — nothing extra beyond that on the game.

## Three Stylistic Approaches

1. **Theme Name: Ember Forge**
   - Intro: Warm, molten fantasy — orange embers, volcanic stone, torchlit dungeons. Feels like a classic action-platformer with a fiery soul.
   - Probability: 0.04

2. **Theme Name: Crystal Vale**
   - Intro: Serene pastel-landscape platformer — mint skies, lavender hills, sparkling gemstones. Gentle, whimsical, and friendly.
   - Probability: 0.07

3. **Theme Name: Neon Byte Arcade**
   - Intro: Retro 80s arcade synthwave — dark scanline CRT look with hot pink and cyan neon pixels. Pure nostalgia energy.
   - Probability: 0.03

## CHOSEN: Ember Forge (expanded)

- **Design Movement**: 16-bit SNES-era action platformer (think Castlevania / Celeste warm palettes) blended with modern game-jam polish.
- **Core Principles**:
  1. Authentic pixel art — crisp, scaled-up integer pixels with image-rendering: pixelated; no blurring.
  2. Warm-and-dark contrast — glowing embers against deep volcanic stone.
  3. Juicy feedback — screen shake, hit flashes, coin pop, particle sparks.
  4. Simple one-session loop — pick up and play, no tutorials, no menus beyond play/pause.
- **Color Philosophy**: Deep charcoal-magenta stone (#1e1420, #2a1c2f) as the ground; molten orange (#ff7a33) and ember gold (#ffd166) as life/signals. Warmth = safety, darkness = danger. High contrast keeps pixel silhouettes readable.
- **Layout Paradigm**: Full-screen fixed-aspect canvas centered with a thin dark frame (CRT arcade cabinet feel); UI overlays (score, hearts) sit inside the canvas edges, not floating HTML chrome.
- **Signature Elements**:
  1. Flickering torch/ember particle trails.
  2. Lava pools at the bottom of levels (hazard + ambient glow).
  3. Pixel-drawn heart health and coin counters.
- **Interaction Philosophy**: One-keystroke feel — responsive jump/attack with coyote time & jump buffering so it feels fair. Touch controls auto-appear on mobile.
- **Animation**: Squash/stretch on jumps, walk bobbing, blink idles, enemy bounce. UI pop-in for score (scale 0.95→1, 150ms ease-out).
- **Typography System**: "Press Start 2P" (Google Fonts) for HUD/headings — authentic pixel font. No body font needed (game-only page).
- **Brand Essence**: A retro adventure platformer for quick play sessions — bold, nostalgic, juicy.
- **Brand Voice**: Retro arcady. Examples: "PRESS START TO QUEST", "LEVEL 1 — THE EMBER TUNNELS".
- **Wordmark & Logo**: Pixel-forged "PQ" flame-gem mark (generated PNG, transparent).
- **Signature Brand Color**: Ember Orange #ff7a33.
- **Credit line (mandatory)**: "Powered and created by Nitin." rendered in pixel font on the game page — the ONLY extra text allowed.

## Game Spec (Pixel Quest: The Ember Tunnels)

- HTML5 Canvas 2D engine written in pure TypeScript (no engine dependency needed — keeps it lightweight "HTML game").
- Player: pixel knight with run, jump, double-jump, attack slash.
- Levels: 3 hand-crafted levels with parallax backgrounds, lava hazards, spikes, pits.
- Enemies: slimes (bounce patrol), bats (sine-flight), skulls (stationary shooters).
- Collectibles: coins + gems; score + high score in localStorage.
- Boss: Ember Guardian at end of level 3 (simple pattern).
- HUD: hearts, coins, score, level name. Title screen + Game Over + Victory screens.
- Credit: "Powered and created by Nitin." on title screen and paused frame.
