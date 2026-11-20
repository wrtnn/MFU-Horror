import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGhostSystem } from "./useGhostSystem";
import type { CameraId } from "@/components/game/GameContext";
import {
  EXPOSURE_REQUIRED_MS,
  GHOST_LIFETIME_MS,
  SPAWN_CHECK_INTERVAL_MS,
} from "@/systems/ghostSystem";

const CAMERAS: CameraId[] = ["cam1", "cam2", "cam3", "cam4"];

class MockAudio {
  static instances: MockAudio[] = [];

  src: string;
  loop = false;
  volume = 1;
  currentTime = 0;
  paused = true;

  play = vi.fn(() => {
    this.paused = false;
    return Promise.resolve();
  });

  pause = vi.fn(() => {
    this.paused = true;
  });

  constructor(src?: string) {
    this.src = src ?? "";
    MockAudio.instances.push(this);
  }

  cloneNode() {
    return new MockAudio(this.src);
  }
}

type HookProps = Parameters<typeof useGhostSystem>[0];

let now = 0;
let rafMap = new Map<number, FrameRequestCallback>();
let nextRafId = 0;
let randomValue = 0.99;

function setNow(value: number) {
  now = value;
}

function flushFrame() {
  const callbacks = [...rafMap.values()];
  rafMap.clear();

  act(() => {
    callbacks.forEach((callback) => callback(now));
  });
}

function renderGhostHook(overrides: Partial<HookProps> = {}) {
  const onGameOver = vi.fn();
  const props: HookProps = {
    isGameRunning: true,
    activeCam: "cam1",
    isFlashlightOn: false,
    battery: 100,
    gameTimeElapsed: 0,
    onGameOver,
    ...overrides,
  };

  const view = renderHook((current: HookProps) => useGhostSystem(current), {
    initialProps: props,
  });

  return { ...view, onGameOver };
}

function spawnGhostAtFiveSeconds(overrides: Partial<HookProps> = {}) {
  randomValue = 0;
  const view = renderGhostHook(overrides);
  setNow(SPAWN_CHECK_INTERVAL_MS);
  flushFrame();
  randomValue = 0.99;
  return view;
}

beforeEach(() => {
  now = 0;
  rafMap = new Map();
  nextRafId = 0;
  randomValue = 0.99;
  MockAudio.instances = [];

  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.spyOn(Math, "random").mockImplementation(() => randomValue);

  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    nextRafId += 1;
    rafMap.set(nextRafId, callback);
    return nextRafId;
  });

  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    rafMap.delete(id);
  });

  vi.stubGlobal("Audio", MockAudio);
});

describe("useGhostSystem", () => {
  it("starts with every ghost inactive", () => {
    const { result } = renderGhostHook();

    for (const camId of CAMERAS) {
      expect(result.current.ghosts[camId].active).toBe(false);
      expect(result.current.ghosts[camId].opacity).toBe(0);
      expect(result.current.ghosts[camId].exposureProgress).toBe(0);
    }

    expect(result.current.activeGhost).toBe(result.current.ghosts.cam1);
  });

  it("does not check for a spawn before the five second interval", () => {
    const { result } = renderGhostHook();

    setNow(SPAWN_CHECK_INTERVAL_MS - 1);
    flushFrame();

    expect(result.current.ghosts.cam1.active).toBe(false);
  });

  it("spawns a ghost when the probability check succeeds", () => {
    randomValue = 0;
    const { result } = renderGhostHook();

    setNow(SPAWN_CHECK_INTERVAL_MS);
    flushFrame();

    expect(result.current.ghosts.cam1.active).toBe(true);
    expect(result.current.ghosts.cam1.spawnTime).toBe(SPAWN_CHECK_INTERVAL_MS);
    expect(result.current.ghosts.cam1.opacity).toBe(0);
    expect(result.current.ghosts.cam2.active).toBe(false);
  });

  it("does not spawn when the probability check fails", () => {
    randomValue = 0.99;
    const { result } = renderGhostHook();

    setNow(SPAWN_CHECK_INTERVAL_MS);
    flushFrame();

    for (const camId of CAMERAS) {
      expect(result.current.ghosts[camId].active).toBe(false);
    }
  });

  it("uses the later, higher spawn chance as the night progresses", () => {
    randomValue = 0.4;

    const early = renderGhostHook({ gameTimeElapsed: 0 });
    setNow(SPAWN_CHECK_INTERVAL_MS);
    flushFrame();
    expect(early.result.current.ghosts.cam1.active).toBe(false);
    early.unmount();

    now = 0;
    rafMap = new Map();
    randomValue = 0.4;

    const late = renderGhostHook({ gameTimeElapsed: 100 });
    setNow(SPAWN_CHECK_INTERVAL_MS);
    flushFrame();
    expect(late.result.current.ghosts.cam2.active).toBe(true);
  });

  it("fades a ghost in over its 20 second lifetime", () => {
    const { result } = spawnGhostAtFiveSeconds();

    setNow(SPAWN_CHECK_INTERVAL_MS + GHOST_LIFETIME_MS / 2);
    flushFrame();

    expect(result.current.ghosts.cam1.opacity).toBeCloseTo(0.5);
  });

  it("ends the game when a ghost survives its full lifetime", () => {
    const { result, onGameOver } = spawnGhostAtFiveSeconds();

    setNow(SPAWN_CHECK_INTERVAL_MS + GHOST_LIFETIME_MS);
    flushFrame();

    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(result.current.ghosts.cam1.active).toBe(true);
    expect(rafMap.size).toBe(0);
  });

  it("does not trigger game over more than once", () => {
    const { onGameOver } = spawnGhostAtFiveSeconds();

    setNow(SPAWN_CHECK_INTERVAL_MS + GHOST_LIFETIME_MS);
    flushFrame();
    setNow(SPAWN_CHECK_INTERVAL_MS + GHOST_LIFETIME_MS + 5_000);
    flushFrame();

    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it("eliminates a ghost after one continuous second of flashlight exposure", () => {
    const { result, onGameOver } = spawnGhostAtFiveSeconds({
      isFlashlightOn: true,
    });

    setNow(SPAWN_CHECK_INTERVAL_MS + EXPOSURE_REQUIRED_MS / 2);
    flushFrame();
    expect(result.current.ghosts.cam1.active).toBe(true);
    expect(result.current.ghosts.cam1.exposureProgress).toBeCloseTo(0.5);

    setNow(SPAWN_CHECK_INTERVAL_MS + EXPOSURE_REQUIRED_MS);
    flushFrame();

    expect(result.current.ghosts.cam1.active).toBe(false);
    expect(result.current.ghosts.cam1.opacity).toBe(0);
    expect(result.current.ghosts.cam1.exposureProgress).toBe(0);
    expect(result.current.ghosts.cam1.exposureStartTime).toBeNull();
    expect(onGameOver).not.toHaveBeenCalled();
  });

  it("resets exposure progress when the flashlight is released", () => {
    const { result, rerender } = spawnGhostAtFiveSeconds({
      isFlashlightOn: true,
    });

    setNow(SPAWN_CHECK_INTERVAL_MS + EXPOSURE_REQUIRED_MS / 2);
    flushFrame();
    expect(result.current.ghosts.cam1.exposureProgress).toBeCloseTo(0.5);

    rerender({
      isGameRunning: true,
      activeCam: "cam1",
      isFlashlightOn: false,
      battery: 100,
      gameTimeElapsed: 0,
      onGameOver: vi.fn(),
    });

    expect(result.current.ghosts.cam1.exposureProgress).toBe(0);
    expect(result.current.ghosts.cam1.exposureStartTime).toBeNull();

    setNow(SPAWN_CHECK_INTERVAL_MS + EXPOSURE_REQUIRED_MS);
    flushFrame();
    expect(result.current.ghosts.cam1.active).toBe(true);
  });

  it("resets exposure progress when the active camera changes", () => {
    const { result, rerender } = spawnGhostAtFiveSeconds({
      isFlashlightOn: true,
    });

    setNow(SPAWN_CHECK_INTERVAL_MS + EXPOSURE_REQUIRED_MS / 2);
    flushFrame();
    expect(result.current.ghosts.cam1.exposureProgress).toBeCloseTo(0.5);

    rerender({
      isGameRunning: true,
      activeCam: "cam2",
      isFlashlightOn: true,
      battery: 100,
      gameTimeElapsed: 0,
      onGameOver: vi.fn(),
    });

    expect(result.current.ghosts.cam1.exposureProgress).toBe(0);
    expect(result.current.ghosts.cam1.exposureStartTime).toBeNull();
    expect(result.current.ghosts.cam1.active).toBe(true);
  });

  it("does not eliminate a ghost that is not on the active camera", () => {
    const { result } = spawnGhostAtFiveSeconds({
      activeCam: "cam2",
      isFlashlightOn: true,
    });

    setNow(SPAWN_CHECK_INTERVAL_MS + EXPOSURE_REQUIRED_MS);
    flushFrame();
    setNow(SPAWN_CHECK_INTERVAL_MS + EXPOSURE_REQUIRED_MS + 500);
    flushFrame();

    expect(result.current.ghosts.cam1.active).toBe(true);
    expect(result.current.ghosts.cam1.exposureProgress).toBe(0);
  });

  it("does not eliminate a ghost when the battery is empty", () => {
    const { result } = spawnGhostAtFiveSeconds({
      isFlashlightOn: true,
      battery: 0,
    });

    setNow(SPAWN_CHECK_INTERVAL_MS + EXPOSURE_REQUIRED_MS);
    flushFrame();

    expect(result.current.ghosts.cam1.active).toBe(true);
    expect(result.current.ghosts.cam1.exposureProgress).toBe(0);
  });

  it("resets all ghosts when the game stops", () => {
    const { result, rerender } = spawnGhostAtFiveSeconds();

    expect(result.current.ghosts.cam1.active).toBe(true);

    rerender({
      isGameRunning: false,
      activeCam: "cam1",
      isFlashlightOn: false,
      battery: 100,
      gameTimeElapsed: 0,
      onGameOver: vi.fn(),
    });

    for (const camId of CAMERAS) {
      expect(result.current.ghosts[camId].active).toBe(false);
    }
  });

  it("returns the ghost of the currently active camera", () => {
    const { result, rerender } = spawnGhostAtFiveSeconds();

    expect(result.current.activeGhost.camId).toBe("cam1");

    rerender({
      isGameRunning: true,
      activeCam: "cam3",
      isFlashlightOn: false,
      battery: 100,
      gameTimeElapsed: 0,
      onGameOver: vi.fn(),
    });

    expect(result.current.activeGhost.camId).toBe("cam3");
    expect(result.current.activeGhost.active).toBe(false);
  });

  it("plays the dog howl once at 2 AM and once at 4 AM", () => {
    const { rerender } = renderGhostHook({ gameTimeElapsed: 39 });

    const howls = () =>
      MockAudio.instances.filter((audio) => audio.src.includes("Dog Howl"));

    rerender({
      isGameRunning: true,
      activeCam: "cam1",
      isFlashlightOn: false,
      battery: 100,
      gameTimeElapsed: 40,
      onGameOver: vi.fn(),
    });
    expect(howls()).toHaveLength(1);

    rerender({
      isGameRunning: true,
      activeCam: "cam1",
      isFlashlightOn: false,
      battery: 100,
      gameTimeElapsed: 41,
      onGameOver: vi.fn(),
    });
    expect(howls()).toHaveLength(1);

    rerender({
      isGameRunning: true,
      activeCam: "cam1",
      isFlashlightOn: false,
      battery: 100,
      gameTimeElapsed: 80,
      onGameOver: vi.fn(),
    });
    expect(howls()).toHaveLength(2);
  });

  it("loops the teeth grinding audio only for a visible ghost with 10 seconds left", () => {
    const { rerender } = spawnGhostAtFiveSeconds();

    const teeth = MockAudio.instances.find((audio) =>
      audio.src.includes("TeethGrind")
    );
    expect(teeth).toBeDefined();
    expect(teeth?.paused).toBe(true);

    setNow(SPAWN_CHECK_INTERVAL_MS + GHOST_LIFETIME_MS - 10_000);
    flushFrame();
    expect(teeth?.paused).toBe(false);
    expect(teeth?.play).toHaveBeenCalled();

    rerender({
      isGameRunning: true,
      activeCam: "cam2",
      isFlashlightOn: false,
      battery: 100,
      gameTimeElapsed: 0,
      onGameOver: vi.fn(),
    });
    flushFrame();
    expect(teeth?.paused).toBe(true);
    expect(teeth?.pause).toHaveBeenCalled();
  });
});
