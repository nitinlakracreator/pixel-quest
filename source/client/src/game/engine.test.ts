import { describe, expect, it, vi } from "vitest";
import type { Game } from "./engine";
import { Game as GameClass } from "./engine";

describe("Game action transitions", () => {
  function createHarness() {
    const game = Object.create(GameClass.prototype) as Game & {
      onActionPress: () => void;
      beginLevel: (level: number) => void;
      resetRun: () => void;
    };
    game.state = "notice";
    game.beginLevel = vi.fn((level: number) => {
      game.state = "playing";
      game.level = level;
    });
    game.resetRun = vi.fn();
    return game;
  }

  it("dismisses the notice before allowing the game to start", () => {
    const game = createHarness();
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });

    game.onActionPress();
    expect(game.state).toBe("title");
    expect(storage.get("pq_notice_seen")).toBe("1");

    game.onActionPress();
    expect(game.beginLevel).toHaveBeenCalledWith(1);
    expect(game.state).toBe("playing");
  });

  it("returns finished runs to the title screen and resets the run", () => {
    const game = createHarness();
    game.state = "gameover";

    game.onActionPress();

    expect(game.resetRun).toHaveBeenCalledOnce();
    expect(game.state).toBe("title");
  });
});
