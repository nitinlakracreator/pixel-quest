import { describe, expect, it } from "vitest";
import { LEVELS, TILE } from "./world";

describe("Pixel Quest level data", () => {
  it("contains three ordered levels with valid dimensions", () => {
    expect(LEVELS).toHaveLength(3);
    for (const level of LEVELS) {
      expect(level.map).toHaveLength(level.height);
      expect(level.map.every((row) => Boolean(row))).toBe(true);
      expect(level.map.every((row) => row.length === level.width)).toBe(true);
      expect(level.exitX).toBeGreaterThan(level.playerStart[0]);
      expect(level.checkpoints.length).toBeGreaterThanOrEqual(3);
      expect(level.checkpoints.every((checkpoint) => checkpoint < level.exitX)).toBe(true);
    }
  });

  it("keeps the player start above a solid floor", () => {
    for (const level of LEVELS) {
      const [startX, startY] = level.playerStart;
      expect(level.map[startY + 2][startX]).toBeGreaterThanOrEqual(1);
      expect(startX * TILE).toBeLessThan(level.exitX * TILE);
    }
  });

  it("includes hazards and a boss in the final challenge", () => {
    expect(LEVELS.some((level) => level.map.flat().includes(3))).toBe(true);
    expect(LEVELS.some((level) => level.map.flat().includes(4))).toBe(true);
    expect(LEVELS[2].boss).toBe(true);
  });
});
