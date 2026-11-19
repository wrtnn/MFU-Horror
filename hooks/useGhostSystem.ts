"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CameraId } from "@/components/game/GameContext";
import {
  GhostMap,
  INITIAL_GHOSTS,
  GHOST_LIFETIME_MS,
  EXPOSURE_REQUIRED_MS,
  SPAWN_CHECK_INTERVAL_MS,
  getSpawnChance,
} from "@/systems/ghostSystem";

interface UseGhostSystemProps {
  isGameRunning: boolean;
  activeCam: CameraId;
  isFlashlightOn: boolean;
  battery: number;
  gameTimeElapsed: number; // in real seconds (0 to 120)
  onGameOver: () => void;
}

export function useGhostSystem({
  isGameRunning,
  activeCam,
  isFlashlightOn,
  battery,
  gameTimeElapsed,
  onGameOver,
}: UseGhostSystemProps) {
  const [ghosts, setGhosts] = useState<GhostMap>(INITIAL_GHOSTS);

  // Audio refs
  const teethGrindAudioRef = useRef<HTMLAudioElement | null>(null);
  const dogHowlAudioRef = useRef<HTMLAudioElement | null>(null);

  // Flags to ensure DogHowl plays exactly once at 2 AM and 4 AM
  const playedDogHowl2AM = useRef(false);
  const playedDogHowl4AM = useRef(false);

  // Refs for tracking mutable loop state
  const ghostsRef = useRef<GhostMap>(INITIAL_GHOSTS);
  const lastSpawnCheckTimeRef = useRef<number>(0);
  const isGameOverTriggeredRef = useRef(false);

  // Keep state and ref in sync
  const updateGhosts = (newMap: GhostMap) => {
    ghostsRef.current = newMap;
    setGhosts({ ...newMap });
  };

  // Helper to stop all ghost audio immediately
  const stopAllGhostAudio = useCallback(() => {
    if (teethGrindAudioRef.current) {
      teethGrindAudioRef.current.pause();
      teethGrindAudioRef.current.currentTime = 0;
    }
  }, []);

  // Initialize TeethGrind audio element
  useEffect(() => {
    if (!teethGrindAudioRef.current) {
      const audio = new Audio("/assets/audio/TeethGrind.mp3");
      audio.loop = true;
      audio.volume = 0.3; // Approximately 30% volume
      teethGrindAudioRef.current = audio;
    }
    return () => {
      stopAllGhostAudio();
    };
  }, [stopAllGhostAudio]);

  // Reset states when a new game session starts or stops
  useEffect(() => {
    if (isGameRunning) {
      isGameOverTriggeredRef.current = false;
      playedDogHowl2AM.current = false;
      playedDogHowl4AM.current = false;
      lastSpawnCheckTimeRef.current = performance.now();
      updateGhosts(INITIAL_GHOSTS);
    } else {
      stopAllGhostAudio();
      updateGhosts(INITIAL_GHOSTS);
    }
  }, [isGameRunning, stopAllGhostAudio]);

  // DogHowl sound trigger at 2 AM and 4 AM
  // 2 AM starts at gameTimeElapsed >= 40s
  // 4 AM starts at gameTimeElapsed >= 80s
  useEffect(() => {
    if (!isGameRunning || isGameOverTriggeredRef.current) return;

    const playDogHowl = () => {
      try {
        const howl = new Audio("/assets/audio/Dog Howl.mp3");
        howl.volume = 0.6;
        howl.play().catch(() => {});
      } catch {}
    };

    if (gameTimeElapsed >= 40 && !playedDogHowl2AM.current) {
      playedDogHowl2AM.current = true;
      playDogHowl();
    }

    if (gameTimeElapsed >= 80 && !playedDogHowl4AM.current) {
      playedDogHowl4AM.current = true;
      playDogHowl();
    }
  }, [isGameRunning, gameTimeElapsed]);

  // Reset exposure progress if active camera switches
  useEffect(() => {
    if (!isGameRunning) return;
    const current = { ...ghostsRef.current };
    let changed = false;

    (["cam1", "cam2", "cam3", "cam4"] as CameraId[]).forEach((id) => {
      if (current[id].exposureProgress > 0 || current[id].exposureStartTime !== null) {
        current[id] = {
          ...current[id],
          exposureProgress: 0,
          exposureStartTime: null,
        };
        changed = true;
      }
    });

    if (changed) {
      updateGhosts(current);
    }
  }, [activeCam, isGameRunning]);

  // Reset exposure progress if flashlight turns OFF
  useEffect(() => {
    if (!isGameRunning) return;
    if (!isFlashlightOn || battery <= 0) {
      const current = { ...ghostsRef.current };
      let changed = false;

      (["cam1", "cam2", "cam3", "cam4"] as CameraId[]).forEach((id) => {
        if (current[id].exposureProgress > 0 || current[id].exposureStartTime !== null) {
          current[id] = {
            ...current[id],
            exposureProgress: 0,
            exposureStartTime: null,
          };
          changed = true;
        }
      });

      if (changed) {
        updateGhosts(current);
      }
    }
  }, [isFlashlightOn, battery, isGameRunning]);

  // Main Ghost Lifecycle, Spawn & Elimination Engine (High frequency loop)
  useEffect(() => {
    if (!isGameRunning) return;

    let animFrameId: number;

    const tick = () => {
      if (isGameOverTriggeredRef.current) return;

      const now = performance.now();
      const currentGhosts = { ...ghostsRef.current };
      let hasChanges = false;

      // 1. Check Global Spawn System every 5 seconds
      if (now - lastSpawnCheckTimeRef.current >= SPAWN_CHECK_INTERVAL_MS) {
        lastSpawnCheckTimeRef.current = now;

        // Determine inactive ghosts
        const camList: CameraId[] = ["cam1", "cam2", "cam3", "cam4"];
        const inactiveCams = camList.filter((id) => !currentGhosts[id].active);

        if (inactiveCams.length > 0) {
          // Current in-game hour (0: 12AM, 1: 1AM, 2: 2AM, 3: 3AM, 4: 4AM, 5: 5AM)
          const hourIndex = Math.min(5, Math.floor(gameTimeElapsed / 20));
          const spawnChance = getSpawnChance(hourIndex);

          if (Math.random() < spawnChance) {
            // Pick a random inactive ghost
            const chosenCam = inactiveCams[Math.floor(Math.random() * inactiveCams.length)];
            currentGhosts[chosenCam] = {
              camId: chosenCam,
              active: true,
              spawnTime: now,
              opacity: 0,
              exposureProgress: 0,
              exposureStartTime: null,
            };
            hasChanges = true;
          }
        }
      }

      // 2. Process each Ghost's 20-second independent countdown and exposure
      let activeViewingGhostHasLowTime = false;

      const camKeys: CameraId[] = ["cam1", "cam2", "cam3", "cam4"];
      for (const id of camKeys) {
        const ghost = currentGhosts[id];
        if (!ghost.active) continue;

        const elapsedLifetime = now - ghost.spawnTime;
        const remainingLifetime = GHOST_LIFETIME_MS - elapsedLifetime;

        // If player fails to eliminate ghost before 20s expires: Player Loses Immediately
        if (remainingLifetime <= 0) {
          isGameOverTriggeredRef.current = true;
          stopAllGhostAudio();
          onGameOver();
          return;
        }

        // Opacity increases from 0% to 100% over the 20 seconds
        const newOpacity = Math.min(1, Math.max(0, elapsedLifetime / GHOST_LIFETIME_MS));
        if (Math.abs(ghost.opacity - newOpacity) > 0.005) {
          hasChanges = true;
        }

        // Check if viewing camera with ghost has <= 10 seconds remaining for TeethGrind audio
        if (id === activeCam && remainingLifetime <= 10000) {
          activeViewingGhostHasLowTime = true;
        }

        // 3. Flashlight Elimination Logic
        // Must be on the same camera, flashlight ON, and battery > 0
        const isBeingExposed =
          id === activeCam && isFlashlightOn && battery > 0;

        let newExposureStartTime = ghost.exposureStartTime;
        let newExposureProgress = ghost.exposureProgress;

        if (isBeingExposed) {
          if (!newExposureStartTime) {
            newExposureStartTime = now;
          }
          const exposureDuration = now - newExposureStartTime;
          newExposureProgress = Math.min(1, exposureDuration / EXPOSURE_REQUIRED_MS);

          // Eliminate ghost if continuous exposure reaches 1000ms (1 second)
          if (newExposureProgress >= 1) {
            currentGhosts[id] = {
              ...ghost,
              active: false,
              opacity: 0,
              exposureProgress: 0,
              exposureStartTime: null,
            };
            hasChanges = true;
            continue;
          }
        } else {
          // Reset progress if flashlight is released or interrupted
          newExposureStartTime = null;
          newExposureProgress = 0;
        }

        if (
          ghost.opacity !== newOpacity ||
          ghost.exposureProgress !== newExposureProgress ||
          ghost.exposureStartTime !== newExposureStartTime
        ) {
          currentGhosts[id] = {
            ...ghost,
            opacity: newOpacity,
            exposureProgress: newExposureProgress,
            exposureStartTime: newExposureStartTime,
          };
          hasChanges = true;
        }
      }

      // 4. Manage TeethGrind loop audio
      const teethAudio = teethGrindAudioRef.current;
      if (teethAudio) {
        if (activeViewingGhostHasLowTime && !isGameOverTriggeredRef.current) {
          if (teethAudio.paused) {
            teethAudio.currentTime = 0;
            teethAudio.play().catch(() => {});
          }
        } else {
          if (!teethAudio.paused) {
            teethAudio.pause();
            teethAudio.currentTime = 0;
          }
        }
      }

      if (hasChanges) {
        updateGhosts(currentGhosts);
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [
    isGameRunning,
    activeCam,
    isFlashlightOn,
    battery,
    gameTimeElapsed,
    onGameOver,
    stopAllGhostAudio,
  ]);

  return {
    ghosts,
    activeGhost: ghosts[activeCam],
  };
}
