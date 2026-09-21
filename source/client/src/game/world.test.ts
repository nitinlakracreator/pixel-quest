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

  it("places every respawn checkpoint on a safe, forward path", () => {
    for (const level of LEVELS) {
      let previous = level.playerStart[0];
      for (const checkpoint of level.checkpoints) {
        expect(checkpoint).toBeGreaterThan(previous);
        expect(checkpoint).toBeLessThan(level.exitX);
        const feetRow = level.playerStart[1] + 2;
        expect(level.map[feetRow][checkpoint]).toBeGreaterThanOrEqual(1);
        expect(level.map[level.playerStart[1]][checkpoint]).not.toBe(3);
        expect(level.map[level.playerStart[1]][checkpoint]).not.toBe(4);
        previous = checkpoint;
      }
    }
  });

  it("keeps exits reachable from a safe floor", () => {
    for (const level of LEVELS) {
      const floorRow = level.playerStart[1] + 2;
      expect(level.map[floorRow][level.exitX - 1]).toBeGreaterThanOrEqual(1);
      expect(level.map[floorRow][level.exitX]).toBeGreaterThanOrEqual(1);
    }
  });

  it("includes hazards and a boss in the final challenge", () => {
    expect(LEVELS.some((level) => level.map.flat().includes(3))).toBe(true);
    expect(LEVELS.some((level) => level.map.flat().includes(4))).toBe(true);
    expect(LEVELS[2].boss).toBe(true);
  });
});
