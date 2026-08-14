# PLAN — Pixel Quest: The Ember Tunnels

## Goal
Fully developed pixel art browser game (HTML5 Canvas + TypeScript, pure 2D engine, no heavy dependency) hosted in the webdev React shell. Credit line "Powered and created by Nitin." is the ONLY extra text on the game page. User requested adding "GP Sonipat" to the credit — line becomes "GP Sonipat • Powered and created by Nitin."

## Art assets (generated, /manus-storage/ URLs)
- title-art_e1422e3c.png — title screen hero art
- logo-mark_a388d943.png — PQ flame-gem logo (transparent)
- bg-parallax-far_4e92de9b.png — far parallax layer
- bg-parallax-mid_965e67a2.png — mid parallax layer
- gameover-art_b177573e.png — game over art
All characters, tiles, and effects are drawn procedurally via canvas pixel rendering (authentic pixel art via sprite drawing to offscreen canvases), so no extra image generation needed.

## Risk slices (build first)
- [x] Pixel-perfect canvas renderer: fixed internal resolution (424x240) scaled by CSS with image-rendering: pixelated; integer pixel sprite drawing.
- [x] Physics: gravity, jump, double-jump, coyote time, jump buffering, AABB collision with tilemap.
- [ ] Camera with smooth follow + screen shake.
- [ ] Animated player sprite (run/jump/attack/idle) drawn procedurally.
- [ ] Enemy AI: slime patrol+bounce, bat sine flight, skull shooter, Ember Guardian boss pattern.

## Main build
- [ ] Tilemap loader (2D array), 3 hand-crafted levels + boss chamber.
- [ ] Parallax backgrounds using generated images.
- [ ] Particles: ember sparks, coin pop, death burst, attack whoosh.
- [ ] HUD: hearts, coins, score, level name in Press Start 2P font.
- [ ] Game states: Title → Playing → GameOver → Victory, pause with ESC.
- [ ] LocalStorage high score.
- [ ] Touch controls (mobile) + keyboard (arrows/WASD, space/X = jump, Z/C = attack).
- [ ] Credit line "Powered and created by Nitin." on title screen + in-game pause.

## Verification
- pnpm check clean; webdev_take_screenshot with ?demo autoplay flag showing title, gameplay, and game-over states.
- Only text visible = game text + "Powered and created by Nitin."
