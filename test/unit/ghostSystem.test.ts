import { describe, expect, it } from "vitest";
import {
  EXPOSURE_REQUIRED_MS,
  GHOST_LIFETIME_MS,
  INITIAL_GHOSTS,
  SPAWN_CHECK_INTERVAL_MS,
  getSpawnChance,
} from "@/systems/ghostSystem";
import type { CameraId } from "@/components/game/GameContext";

const CAMERAS: CameraId[] = ["cam1", "cam2", "cam3", "cam4"];

describe("ghost system constants", () => {
    // [TC-007] uses a 20 second ghost lifetime
  it("uses a 20 second ghost lifetime", () => {
    expect(GHOST_LIFETIME_MS).toBe(20_000);
  });

    // [TC-008] requires exactly one second of continuous exposure
  it("requires exactly one second of continuous exposure", () => {
    expect(EXPOSURE_REQUIRED_MS).toBe(1_000);
  });

    // [TC-009] checks for new spawns every five seconds
  it("checks for new spawns every five seconds", () => {
    expect(SPAWN_CHECK_INTERVAL_MS).toBe(5_000);
  });
});

describe("INITIAL_GHOSTS", () => {
    // [TC-010] contains an inactive ghost for every camera
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

    // [TC-011] uses independent objects so mutating one ghost does not affect another
  it("uses independent objects so mutating one ghost does not affect another", () => {
    const original = INITIAL_GHOSTS.cam2.active;
    INITIAL_GHOSTS.cam1.active = true;

    expect(INITIAL_GHOSTS.cam2.active).toBe(original);
    expect(INITIAL_GHOSTS.cam1).not.toBe(INITIAL_GHOSTS.cam2);

    INITIAL_GHOSTS.cam1.active = false;
  });
});

describe("getSpawnChance", () => {
  // [TC-012] returns the right chance for hour index -10
  it("returns the right chance for hour index -10", () => {
    expect(getSpawnChance(-10)).toBe(0.05);
  });

  // [TC-013] returns the right chance for hour index 0
  it("returns the right chance for hour index 0", () => {
    expect(getSpawnChance(0)).toBe(0.05);
  });

  // [TC-014] returns the right chance for hour index 1
  it("returns the right chance for hour index 1", () => {
    expect(getSpawnChance(1)).toBe(0.05);
  });

  // [TC-015] returns the right chance for hour index 2
  it("returns the right chance for hour index 2", () => {
    expect(getSpawnChance(2)).toBe(0.2);
  });

  // [TC-016] returns the right chance for hour index 3
  it("returns the right chance for hour index 3", () => {
    expect(getSpawnChance(3)).toBe(0.25);
  });

  // [TC-017] returns the right chance for hour index 4
  it("returns the right chance for hour index 4", () => {
    expect(getSpawnChance(4)).toBe(0.33);
  });

  // [TC-018] returns the right chance for hour index 5
  it("returns the right chance for hour index 5", () => {
    expect(getSpawnChance(5)).toBe(0.5);
  });

  // [TC-019] returns the right chance for hour index 6
  it("returns the right chance for hour index 6", () => {
    expect(getSpawnChance(6)).toBe(0.5);
  });

  // [TC-020] returns the right chance for hour index 100
  it("returns the right chance for hour index 100", () => {
    expect(getSpawnChance(100)).toBe(0.5);
  });

  // [TC-021] never decreases as the night progresses
  it("never decreases as the night progresses", () => {
    const chances = [0, 1, 2, 3, 4, 5].map(getSpawnChance);

    for (let i = 1; i < chances.length; i += 1) {
      expect(chances[i]).toBeGreaterThanOrEqual(chances[i - 1]);
    }
  });
});
