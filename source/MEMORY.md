# MEMORY — Pixel Quest

## 2026-09-21 upgrade

The game uses a fixed 424×240 simulation with a bounded fixed-step loop, so gameplay speed remains stable across desktop and mobile frame rates. The engine now ignores duplicate death signals within the same hazard/enemy overlap window, clears the cooldown during run reset, and restarts directly from a single Enter/Space/touch action after game-over or victory. `R` restarts the current run from the title flow. Touch controls use pointer capture and release their held state on pointer-up, pointer-cancel, lost capture, blur, and visibility changes.

Automated level tests now verify ordered forward checkpoints, safe respawn-floor tiles, exit-floor coverage, hazards, and the final boss. The root `assets/` bundle must be regenerated from `source/dist/public` after every source change because GitHub Pages serves the committed root bundle.
