import { CameraId } from "@/components/game/GameContext";

export const GHOST_LIFETIME_MS = 20000; // 20 seconds independent timer per ghost
export const EXPOSURE_REQUIRED_MS = 1000; // 1 continuous second under flashlight
export const SPAWN_CHECK_INTERVAL_MS = 5000; // 5 seconds global probability check

export interface GhostState {
  camId: CameraId;
  active: boolean;
  spawnTime: number; // performance.now() / Date.now() timestamp
  opacity: number; // 0 to 1
  exposureProgress: number; // 0 to 1 (progress toward elimination)
  exposureStartTime: number | null; // timestamp when continuous flashlight exposure began
}

export type GhostMap = Record<CameraId, GhostState>;

export const INITIAL_GHOSTS: GhostMap = {
  cam1: {
    camId: "cam1",
    active: false,
    spawnTime: 0,
    opacity: 0,
    exposureProgress: 0,
    exposureStartTime: null,
  },
  cam2: {
    camId: "cam2",
    active: false,
    spawnTime: 0,
    opacity: 0,
    exposureProgress: 0,
    exposureStartTime: null,
  },
  cam3: {
    camId: "cam3",
    active: false,
    spawnTime: 0,
    opacity: 0,
    exposureProgress: 0,
    exposureStartTime: null,
  },
  cam4: {
    camId: "cam4",
    active: false,
    spawnTime: 0,
    opacity: 0,
    exposureProgress: 0,
    exposureStartTime: null,
  },
};

/**
 * Returns spawn chance based on in-game hour (0 to 6):
 * 12 AM - 2 AM (hour 0, 1): 5%
 * 2 AM - 3 AM (hour 2): 20%
 * 3 AM - 4 AM (hour 3): 25%
 * 4 AM - 5 AM (hour 4): 33%
 * 5 AM - 6 AM (hour 5): 50%
 */
export function getSpawnChance(hourIndex: number): number {
  if (hourIndex < 2) return 0.05; // 12 AM - 2 AM
  if (hourIndex === 2) return 0.20; // 2 AM - 3 AM
  if (hourIndex === 3) return 0.25; // 3 AM - 4 AM
  if (hourIndex === 4) return 0.33; // 4 AM - 5 AM
  return 0.50; // 5 AM - 6 AM
}
