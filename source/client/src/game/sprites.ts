/**
 * Pixel Quest — Ember Forge style.
 * SpriteAtlas: generates every character sprite procedurally as tiny
 * pixel grids, upscaled 1:1 into offscreen canvases. Authentic chunky pixels.
 */

// 8-bit style 12x16 player, drawn as a pixel grid (1 = outline, 2 = armor, 3 = ember gold, 4 = skin)
// Palette for sprites
const C = {
  outline: "#120a14",
  stone: "#4a3450",
  stoneDk: "#33223a",
  lava: "#ff7a33",
  ember: "#ffd166",
  skin: "#f2c9a0",
  dark: "#241a28",
  slime: "#7ed957",
  slimeDk: "#4e9b32",
  bat: "#5b2b6e",
  bone: "#e8dcc8",
  gold: "#ffd166",
  goldDk: "#c99a2b",
  boss: "#b33a2c",
};

type Grid = (string | string[])[];

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

/** Paint a grid of palette-key chars into a canvas at 1px each. */
function gridToCanvas(grid: Grid, palette: Record<string, string>): HTMLCanvasElement {
  const rows: string[][] = grid.map((row) => (Array.isArray(row) ? row : row.split("")));
  const h = rows.length;
  const w = rows[0].length;
  const { canvas, ctx } = makeCanvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch !== "." && palette[ch]) {
        ctx.fillStyle = palette[ch];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return canvas;
}

// ---- KNIGHT (10 wide x 14 tall) ----
// . = empty, O = outline, A = armor, G = gold trim, S = skin, E = ember accent
const knightPalette: Record<string, string> = {
  O: C.outline,
  A: C.stone,
  G: C.ember,
  S: C.skin,
  E: C.ember,
  D: C.dark,
};

const knightIdle: Grid = [
  "....OOO.....",
  "...OOGGGO...",
  "..OAAGGGAO..",
  "..OASSSSAO..",
  "..OASSSSAO..",
  "...OOOOO....",
  "..OAAGGGAO..",
  ".OAAGGGGAAO.",
  "GOAAGGGGAAOG",
  "GO..AAAA..OG",
  "G...AAAA...G",
  "....AAAA....",
  "...OO..OO...",
  "...OO..OO...",
];
const knightRun1: Grid = [
  "....OOO.....",
  "...OOGGGO...",
  "..OAAGGGAO..",
  "..OASSSSAO..",
  "..OASSSSAO..",
  "...OOOOO....",
  "..OAAGGGAO..",
  ".OAAGGGGAAO.",
  "GOAAGGGGAAOG",
  "O...AAAA..O.",
  "...OAASA....",
  "...AAAA.....",
  "..OO........",
  ".....OO.....",
];
const knightRun2: Grid = [
  "....OOO.....",
  "...OOGGGO...",
  "..OAAGGGAO..",
  "..OASSSSAO..",
  "..OASSSSAO..",
  "...OOOOO....",
  "..OAAGGGAO..",
  ".OAAGGGGAAO.",
  "GOAAGGGGAAOG",
  "O...AAAA..O.",
  "....AASAO...",
  ".....AAAA...",
  "........OO..",
  "....OO......",
];
const knightJump: Grid = [
  "....OOO.....",
  "...OOGGGO...",
  "..OAAGGGAO..",
  "..OASSSSAO..",
  "..OASSSSAO..",
  "...OOOOO....",
  "GOAAGGGGAOG.",
  "GOAAGGGGAOG.",
  "G..OAAAAO..G",
  "G...AAAA...G",
  "....AAAA....",
  "...AAAA.....",
  "..OO........",
  ".....OO.....",
];
const knightAttack: Grid = [
  "....OOO.........",
  "...OOGGGO.......",
  "..OAAGGGAO......",
  "..OASSSSAO......",
  "..OASSSSAO......",
  "...OOOOO........",
  "..OOGGGGAO......",
  ".OGGGGGGGAAOOOOO",
  "OGGGGGGGGGGAAAGG",
  "GG..AAAAAAAA..G.",
  "...OAAAA........",
  "....AAAA........",
  "...OO..OO.......",
  "...OO..OO.......",
];

const knightSlash: Grid = [
  "....OOO.......OOO",
  "...OOGGGO.....OGG",
  "..OAAGGGAO....OGG",
  "..OASSSSAO...OGG.",
  "..OASSSSAO..OGG..",
  "...OOOOO....OG...",
  "..OAAGGGAO..OG...",
  ".OAAGGGGAAOOOG...",
  "GOAAGGGGAAOOG....",
  "GOGGAAAAAAAA.....",
  ".OGGGGAAA........",
  "....AAAA.........",
  "...OO..OO........",
  "...OO..OO........",
];

function sprite(grid: Grid, palette: Record<string, string>): HTMLCanvasElement {
  return gridToCanvas(grid, palette);
}

// ---- SLIME (12x8) ----
const slimePalette: Record<string, string> = { O: C.outline, B: C.slime, D: C.slimeDk, E: "#ffffff" };
const slimeGrid: Grid = [
  ".....OOOO.....",
  "....OOBBBOO...",
  "...OOBBBBBOO..",
  "..OOBBDBBDBBO.",
  "..OBBEBBBBEBO.",
  ".OBBBBBBBBBBBO",
  ".ODBBBBBBBBBDO",
  "OOOOOOOOOOOOOO",
];

// ---- BAT (12x8) ----
const batPalette: Record<string, string> = { O: C.outline, B: C.bat, D: "#3a1a4a", E: "#ff5c5c" };
const batGrid: Grid = [
  "O..............O",
  "OO............OO",
  "BOOO........OOOB",
  "BBOOO......OOOBB",
  "BBBOOOO..OOOOBBB",
  "BBBBBOOBBBOOBBBB",
  "BBBBBEOBEOBBBBBB",
  ".BBBBBBBBBBBBBB.",
];

// ---- SKULL (10x10) ----
const skullPalette: Record<string, string> = { O: C.outline, B: C.bone, D: "#8a7a60", E: C.lava };
const skullGrid: Grid = [
  "...OOOOOO...",
  "..OBBBBBBO..",
  ".OBBBBBBBBO.",
  ".OBBDBBDBBO.",
  ".OBBBBBBBBO.",
  ".OBBEEBBEEO.",
  "..OBBBBBBO..",
  "...OBOBOBO..",
  "....OBOBO...",
  ".....OOO....",
];

// ---- EMBER GUARDIAN BOSS (16x16) ----
const bossPalette: Record<string, string> = { O: C.outline, B: C.boss, D: "#7a2420", G: C.ember, E: C.gold };
const bossGrid: Grid = [
  ".....OOOO......",
  "....OGGGGO.....",
  "...OGGGGGGO....",
  "..OBBBBBBBBBO..",
  "..OBGBBGBBGBBO.",
  "..OBBBBBBBBBBO.",
  ".OBBBGGGGGBBBO.",
  ".OBBBBBBBBBBBO.",
  "OGGGGGGGGGGGGGO",
  "GBBBBBBBBBBBBGG",
  "GGBBBBBBBBBBG.G",
  ".GGBBBBBBBGG...",
  "..GGGGGGGG.....",
  ".GG......GG....",
  "GG........GG...",
  "OO........OO...",
];

// ---- COIN (8x8) ----
const coinPalette: Record<string, string> = { O: C.goldDk, B: C.gold, E: "#fff2cc" };
const coinGrid: Grid = [
  ".OOOO..",
  "OBBBBO.",
  "OBEBBO.",
  "OBBBBO.",
  "OBBBBO.",
  "OBBEBO.",
  "OBBBBO.",
  ".OOOO..",
];

// ---- GEM (8x8) ----
const gemPalette: Record<string, string> = { O: "#1a5a50", B: "#2dd4a8", D: "#118a6e", E: "#d0fff4" };
const gemGrid: Grid = [
  "...OO...",
  "..OBBO..",
  ".OBBBBO.",
  "OBBBDBBO",
  "OBDBBBBO",
  "OBBDDBBO",
  ".OBBBBO.",
  "..O..O..",
];

// ---- TILES (16x16) ----
const tilePalette: Record<string, string> = { O: "#120a14", B: "#3a2a42", D: "#2b1f33", L: C.lava, G: "#5a4460", E: C.ember, T: "#66506e" };
const tileGrid: Grid = [
  "OOOOOOOOOOOOOOOO",
  "OBBBBBBBBBBBBBBO",
  "OBBDBBDBBBBDBBBO",
  "OBBBBBBBBBBBBBBO",
  "OBBBDBBBDBBBDBBO",
  "OBBBBBBBBBBBBBBO",
  "OBBBBDBBBBDBBBBO",
  "OBBBBBBBBBBBBBBO",
];
const tileGridTop: Grid = [
  "OBBBBBBBBBBBBBBO",
  "OBBGGBBBGGBBBGGO",
  "OBBDBBDBBBBDBBBO",
  "OBBBBBBBBBBBBBBO",
  "OBBBDBBBDBBBDBBO",
  "OBBBBBBBBBBBBBBO",
  "OBBBBDBBBBDBBBBO",
  "OBBBBBBBBBBBBBBO",
];
const lavaGrid: Grid = [
  "OOOOOOOOOOOOOOOO",
  "OLLLOLLLLLOLLLLO",
  "OLLLLLLLLLLLLLLO",
  "OLLLLLLLLLLLLLLO",
  "OELLLLLOLLLLLLEO",
  "OLLLLLLLLLLLLLLO",
  "OLLLLLLLLLLLLLLO",
  "OLLLLLLLLLLLLLLO",
];
const spikeGrid: Grid = [
  "................",
  "......O.........",
  ".....OBO........",
  "....OBOBO.......",
  "...OBOBOBO......",
  "..OBOBOBOBO.....",
  ".OBOBOBOBOBO....",
  "OBOBOBOBOBOBO...",
];
const pillarGrid: Grid = [
  "OOOOOO",
  "OTTTTT",
  "OTDDTT",
  "OTDDTT",
  "OTTTTT",
  "OTTTTT",
  "OTTTTT",
  "OOOOOO",
];

const torchPalette: Record<string, string> = { O: C.outline, B: "#6a4a34", G: C.ember, E: C.gold };
const torchGrid: Grid = [
  "....GG..",
  "...GGGG.",
  "..GGEEG.",
  "...GGG..",
  "...OBO..",
  "...OBO..",
  "..OBOBO.",
  "..OOOOO.",
];

export class SpriteAtlas {
  knight = {
    idle: sprite(knightIdle, knightPalette),
    run1: sprite(knightRun1, knightPalette),
    run2: sprite(knightRun2, knightPalette),
    jump: sprite(knightJump, knightPalette),
    attack: sprite(knightAttack, knightPalette),
    slash: sprite(knightSlash, knightPalette),
  };
  slime = sprite(slimeGrid, slimePalette);
  bat = sprite(batGrid, batPalette);
  skull = sprite(skullGrid, skullPalette);
  boss = sprite(bossGrid, bossPalette);
  coin = sprite(coinGrid, coinPalette);
  gem = sprite(gemGrid, gemPalette);
  tile = sprite(tileGrid, tilePalette);
  tileTop = sprite(tileGridTop, tilePalette);
  lava = sprite(lavaGrid, tilePalette);
  spike = sprite(spikeGrid, { O: "#9aa8bc", B: "#c8d4e4" });
  pillar = sprite(pillarGrid, { O: C.outline, B: "#3a2a42", D: "#2b1f33", T: "#4a3a52" });
  torch = sprite(torchGrid, torchPalette);

  dispose() {
    // GC-owned canvases: nothing to release explicitly
  }
}
