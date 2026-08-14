# STRUCTURE — Pixel Quest

React shell (index.html → main.tsx → App.tsx) hosts a single full-screen `<GameCanvas />` component that creates one HTML5 Canvas 2D engine and mounts the game. All gameplay is plain TypeScript under `client/src/game/` with zero React coupling.

```
client/src/
  components/GameCanvas.tsx   — canvas lifecycle: init engine once (StrictMode guard), loop, resize, dispose
  game/
    engine.ts        — Game class: loop, fixed dt, input manager, state machine, screen shake
    render.ts        — pixel renderer: fixed 424x240 buffer, image-rendering pixelated scaling, drawPixel/drawSprite helpers
    sprites.ts       — procedural pixel sprite generation (player, enemies, tiles, coin, gems, particles)
    world.ts         — tilemap, level data (3 levels + boss), parallax background loader
    entities.ts      — Player, Enemy (Slime/Bat/Skull), Boss (EmberGuardian), Coin, Gem, hazards
    effects.ts       — particles, camera, screen shake, damage flash
    ui.ts            — HUD (hearts/coins/score), title/over/victory/pause screens, credit line
    demo.ts          — ?demo flag: deterministic autopilot for screenshot verification
```

Input: keyboard (arrows/WASD, space/X jump, Z/C attack, Esc pause) + auto touch overlay on touch devices.
State machine: title → playing → paused | gameover | victory.
High score persisted in localStorage.
