"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useGame, CameraId } from "@/components/game/GameContext";
import { BatteryIndicator } from "@/components/game/BatteryIndicator";
import { FlashlightButton } from "@/components/cctv/FlashlightButton";
import { useGhostSystem } from "@/hooks/useGhostSystem";
import { GhostRenderer } from "@/components/cctv/GhostRenderer";
import { TutorialModal } from "@/components/ui/TutorialModal";
import { GAME_IMAGES } from "@/config/assets";

const CAMERA_INFO: Record<CameraId, { label: string; name: string }> = {
  cam1: { label: "CAM 1", name: "CAM 1" },
  cam2: { label: "CAM 2", name: "CAM 2" },
  cam3: { label: "CAM 3", name: "CAM 3" },
  cam4: { label: "CAM 4", name: "CAM 4" },
};

export default function GamePage() {
  const {
    activeCam,
    setActiveCam,
    battery,
    isFlashlightOn,
    startFlashlight,
    stopFlashlight,
    playClickSound,
    gameTimeElapsed,
    formattedClock,
    isGameRunning,
    showTutorial,
    dismissTutorial,
    triggerGameOver,
  } = useGame();

  // State to manage 0.5s camera transition delay
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset isSwitching and stop lingering sounds when mounting a new game session
  useEffect(() => {
    setIsSwitching(false);

    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      if (
        audio.src &&
        (audio.src.includes("Menu.mp3") ||
          audio.src.includes("Alarm.mp3") ||
          audio.src.includes("Jumpscare.mp3"))
      ) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    return () => {
      setIsSwitching(false);
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
        switchTimeoutRef.current = null;
      }
    };
  }, []);

  // Ghost Mechanics Hook
  const { activeGhost } = useGhostSystem({
    isGameRunning,
    activeCam,
    isFlashlightOn,
    battery,
    gameTimeElapsed,
    onGameOver: triggerGameOver,
  });

  const currentCam = CAMERA_INFO[activeCam];
  const baseImage = GAME_IMAGES.cctv[activeCam];
  const lightImage = GAME_IMAGES.cctv[`${activeCam}Light` as keyof typeof GAME_IMAGES.cctv];

  // Delayed camera switch function with Click sound
  const handleCameraChange = useCallback(
    (targetCam: CameraId) => {
      if (targetCam === activeCam && !isSwitching) return;

      playClickSound();

      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }

      setIsSwitching(true);

      // 0.5 second (500ms) delay
      switchTimeoutRef.current = setTimeout(() => {
        setActiveCam(targetCam);
        setIsSwitching(false);
        switchTimeoutRef.current = null;
      }, 500);
    },
    [activeCam, isSwitching, playClickSound, setActiveCam]
  );

  // Hotkeys: Spacebar (Hold flashlight) and Keys 1, 2, 3, 4 (Switch cameras)
  useEffect(() => {
    // If tutorial is showing, keys are handled by TutorialModal to dismiss
    if (showTutorial) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Camera Hotkeys 1, 2, 3, 4
      if (e.key === "1") {
        e.preventDefault();
        handleCameraChange("cam1");
        return;
      }
      if (e.key === "2") {
        e.preventDefault();
        handleCameraChange("cam2");
        return;
      }
      if (e.key === "3") {
        e.preventDefault();
        handleCameraChange("cam3");
        return;
      }
      if (e.key === "4") {
        e.preventDefault();
        handleCameraChange("cam4");
        return;
      }

      // Flashlight Hotkey: Spacebar
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        startFlashlight();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        stopFlashlight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showTutorial, handleCameraChange, startFlashlight, stopFlashlight]);

  const cams: CameraId[] = ["cam1", "cam2", "cam3", "cam4"];

  return (
    <main className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-black text-white selection:bg-red-900 selection:text-white">
      {/* Tutorial Popup Modal (Shown once at the beginning of each new game) */}
      {showTutorial && <TutorialModal onDismiss={dismissTutorial} />}

      {/* CCTV Camera Background Feeds */}
      <div className="absolute inset-0 z-0">
        <Image
          src={baseImage}
          alt={`${currentCam.name} Feed`}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center brightness-90 contrast-110"
        />

        {/* Illuminated Overlay (Shown only when flashlight is ON and battery > 0 and not switching) */}
        {isFlashlightOn && battery > 0 && !isSwitching && (
          <div className="absolute inset-0 z-1 animate-in fade-in duration-75">
            <Image
              src={lightImage}
              alt={`${currentCam.name} Illuminated Feed`}
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-center brightness-105 contrast-110"
            />
            {/* Flashlight Center Beam Overlay Effect */}
            <div className="absolute inset-0 bg-radial from-amber-100/15 via-transparent to-black/60 pointer-events-none mix-blend-screen" />
          </div>
        )}

        {/* Ghost Renderer on Active Camera (only shown when not in middle of transition) */}
        {!isSwitching && <GhostRenderer ghost={activeGhost} />}

        {/* Camera Switching Static / Noise Overlay (0.5s transition effect) */}
        {isSwitching && (
          <div className="absolute inset-0 z-3 flex flex-col items-center justify-center bg-black/90 font-mono text-zinc-400">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-ping mb-2" />
            <p className="text-xs tracking-[0.3em] uppercase animate-pulse">
              SWITCHING SIGNAL...
            </p>
          </div>
        )}

        {/* CCTV Scanlines & Vignette */}
        <div className="absolute inset-0 z-2 bg-radial from-transparent via-black/40 to-black/85 pointer-events-none" />
        <div className="absolute inset-0 z-2 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[length:100%_4px] opacity-35 pointer-events-none" />
      </div>

      {/* Header Info Bar */}
      <header className="relative z-10 flex items-center justify-between p-6 font-mono text-sm tracking-wider backdrop-blur-[2px] bg-black/45 border-b border-zinc-800">
        {/* Left: Active Camera Status (LIVE FEED | CAM 1) */}
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-red-600 animate-pulse" />
          <span className="font-bold text-red-500">LIVE FEED</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-200 uppercase font-semibold">
            {isSwitching ? "CONNECTING..." : currentCam.name}
          </span>
        </div>

        {/* Right: In-Game Clock (12:00 AM - 6:00 AM) */}
        <div className="flex items-center gap-3 bg-black/60 border border-zinc-700/80 px-3.5 py-1.5 rounded-xs shadow-inner">
          <span className="text-[11px] text-zinc-400 uppercase tracking-widest">
            TIME
          </span>
          <span className="font-mono text-lg font-bold tracking-widest text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            {formattedClock}
          </span>
        </div>
      </header>

      {/* Footer Controls & HUD */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 backdrop-blur-[2px] bg-black/55 border-t border-zinc-800">
        {/* 1. Bottom-Left: Battery Indicator (4 segments, 25% each) */}
        <div className="w-full sm:w-auto flex justify-start">
          <BatteryIndicator battery={battery} />
        </div>

        {/* 2. Bottom-Center: Flashlight Hold Button */}
        <div className="w-full sm:w-auto flex justify-center">
          <FlashlightButton
            isOn={isFlashlightOn && battery > 0 && !isSwitching}
            onPressStart={startFlashlight}
            onPressEnd={stopFlashlight}
            disabled={battery <= 0 || isSwitching}
          />
        </div>

        {/* Bottom-Right: Camera Switcher Buttons (CAM 1 - 4 with hotkey hints) */}
        <div className="w-full sm:w-auto flex flex-wrap items-center justify-end gap-2 font-mono text-sm">
          {cams.map((camId, index) => {
            const isActive = camId === activeCam;
            return (
              <button
                key={camId}
                type="button"
                onClick={() => handleCameraChange(camId)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 transition-all text-xs font-bold tracking-wider uppercase border ${
                  isActive
                    ? "border-red-500 bg-red-950/70 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    : "border-zinc-700 bg-black/70 text-zinc-300 hover:border-zinc-400 hover:text-white"
                }`}
              >
                <span>{CAMERA_INFO[camId].label}</span>
                <span className="text-[10px] opacity-60">[{index + 1}]</span>
              </button>
            );
          })}
        </div>
      </footer>
    </main>
  );
}
