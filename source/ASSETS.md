# ASSETS — Pixel Quest

The game-facing artwork is committed in the repository under `assets/` and `hi-res-assets/` for the GitHub Pages build. The editable engine also supports the generated parallax and title artwork through relative `./assets/` paths.

| Asset | Use |
|---|---|
| `bg-parallax-far.png` | Far cave parallax layer |
| `bg-parallax-mid.png` | Mid cave parallax layer |
| `title-art.png` | Title and victory art |
| `gameover-art.png` | Game-over background |
| `logo-mark.png` | Title-screen logo |

Characters, tiles, hazards, enemies, boss, particles, and HUD elements are procedurally rendered as crisp pixel canvases to keep the bundle responsive on mobile and desktop.
