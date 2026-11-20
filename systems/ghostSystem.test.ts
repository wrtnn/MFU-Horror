import { describe, expect, it } from "vitest";
import {
  EXPOSURE_REQUIRED_MS,
  GHOST_LIFETIME_MS,
  INITIAL_GHOSTS,
  SPAWN_CHECK_INTERVAL_MS,
  getSpawnChance,
} from "./ghostSystem";
import type { CameraId } from "@/components/game/GameContext";

const CAMERAS: CameraId[] = ["cam1", "cam2", "cam3", "cam4"];

describe("ghost system constants", () => {
  it("uses a 20 second ghost lifetime", () => {
    expect(GHOST_LIFETIME_MS).toBe(20_000);
  });

  it("requires exactly one second of continuous exposure", () => {
    expect(EXPOSURE_REQUIRED_MS).toBe(1_000);
  });

  it("checks for new spawns every five seconds", () => {
    expect(SPAWN_CHECK_INTERVAL_MS).toBe(5_000);
  });
});

describe("INITIAL_GHOSTS", () => {
  it("contains an inactive ghost for every camera", () => {
    for (const camId of CAMERAS) {
      expect(INITIAL_GHOSTS[camId]).toEqual({
        camId,
        active: false,
        spawnTime: 0,
        opacity: 0,
        exposureProgress: 0,
        exposureStartTime: null,
      });
    }
  });

  it("uses independent objects so mutating one ghost does not affect another", () => {
    const original = INITIAL_GHOSTS.cam2.active;
    INITIAL_GHOSTS.cam1.active = true;

    expect(INITIAL_GHOSTS.cam2.active).toBe(original);
    expect(INITIAL_GHOSTS.cam1).not.toBe(INITIAL_GHOSTS.cam2);

    INITIAL_GHOSTS.cam1.active = false;
  });
});

describe("getSpawnChance", () => {
  it.each([
    [-10, 0.05],
    [0, 0.05],
    [1, 0.05],
    [2, 0.2],
    [3, 0.25],
    [4, 0.33],
    [5, 0.5],
    [6, 0.5],
    [100, 0.5],
  ])("returns the right chance for hour index %i", (hourIndex, expected) => {
    expect(getSpawnChance(hourIndex)).toBe(expected);
  });

  it("never decreases as the night progresses", () => {
    const chances = [0, 1, 2, 3, 4, 5].map(getSpawnChance);

    for (let i = 1; i < chances.length; i += 1) {
      expect(chances[i]).toBeGreaterThanOrEqual(chances[i - 1]);
    }
  });
});
