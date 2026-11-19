"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";

// Game Session Configuration
export const TOTAL_GAME_SECONDS = 120; // 2 real-time minutes (12:00 AM to 6:00 AM)
export const SECONDS_PER_HOUR = 20; // 20 real-time seconds = 1 in-game hour
export const TOTAL_FLASHLIGHT_SECONDS = 30; // Flashlight usable duration: 30s only

export type CameraId = "cam1" | "cam2" | "cam3" | "cam4";

interface GameContextType {
  activeCam: CameraId;
  setActiveCam: (cam: CameraId) => void;
  battery: number; // 0 to 100 percentage
  isFlashlightOn: boolean;
  startFlashlight: () => void;
  stopFlashlight: () => void;
  playClickSound: () => void;
  gameTimeElapsed: number; // 0 to 120 seconds
  formattedClock: string; // e.g., "12:00 AM", "1:00 AM", ..., "6:00 AM"
  isGameRunning: boolean;
  resetGame: () => void;
  triggerGameOver: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Active Camera state in single game page
  const [activeCam, setActiveCam] = useState<CameraId>("cam1");

  // Gameplay timer & state
  const [gameTimeElapsed, setGameTimeElapsed] = useState<number>(0);
  const [battery, setBattery] = useState<number>(100);
  const [isFlashlightOn, setIsFlashlightOn] = useState<boolean>(false);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);

  // Audio References
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const flashOnAudioRef = useRef<HTMLAudioElement | null>(null);
  const flashJamAudioRef = useRef<HTMLAudioElement | null>(null);
  const jumpscareAudioRef = useRef<HTMLAudioElement | null>(null);

  const isGamePage = pathname === "/game";

  const stopAllAudio = useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }
    if (flashOnAudioRef.current) {
      flashOnAudioRef.current.pause();
      flashOnAudioRef.current.currentTime = 0;
    }
    if (flashJamAudioRef.current) {
      flashJamAudioRef.current.pause();
      flashJamAudioRef.current.currentTime = 0;
    }
  }, []);

  const triggerGameOver = useCallback(() => {
    setIsGameRunning(false);
    setIsFlashlightOn(false);
    stopAllAudio();

    // Play Jumpscare audio
    try {
      if (!jumpscareAudioRef.current) {
        jumpscareAudioRef.current = new Audio("/assets/audio/Jumpscare.mp3");
      }
      jumpscareAudioRef.current.currentTime = 0;
      jumpscareAudioRef.current.volume = 0.9;
      jumpscareAudioRef.current.play().catch(() => {});
    } catch {}

    router.push("/lose");
  }, [router, stopAllAudio]);

  const resetGame = useCallback(() => {
    setGameTimeElapsed(0);
    setBattery(100);
    setIsFlashlightOn(false);
    setActiveCam("cam1");
    setIsGameRunning(true);
  }, []);

  // Sync game running status when entering/leaving /game page
  useEffect(() => {
    if (isGamePage) {
      resetGame();
    } else {
      setIsGameRunning(false);
      setIsFlashlightOn(false);
      stopAllAudio();
    }
  }, [isGamePage, resetGame, stopAllAudio]);

  // Ambient Audio Management for /game page
  useEffect(() => {
    if (!ambientAudioRef.current) {
      const audio = new Audio("/assets/audio/Ambient.mp3");
      audio.loop = true;
      audio.volume = 0.5;
      ambientAudioRef.current = audio;
    }

    const ambient = ambientAudioRef.current;

    if (isGamePage && isGameRunning) {
      if (ambient.paused) {
        ambient.currentTime = 0;
        ambient.play().catch(() => {
          const resumeAmbient = () => {
            ambient.play().catch(() => {});
            window.removeEventListener("click", resumeAmbient);
            window.removeEventListener("keydown", resumeAmbient);
          };
          window.addEventListener("click", resumeAmbient);
          window.addEventListener("keydown", resumeAmbient);
        });
      }
    } else {
      if (!ambient.paused) {
        ambient.pause();
        ambient.currentTime = 0;
      }
    }
  }, [isGamePage, isGameRunning]);

  // Clock progression timer (2 real minutes = 120s)
  useEffect(() => {
    if (!isGamePage || !isGameRunning) return;

    const timer = setInterval(() => {
      setGameTimeElapsed((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_GAME_SECONDS) {
          clearInterval(timer);
          setIsGameRunning(false);
          stopAllAudio();
          router.push("/win");
          return TOTAL_GAME_SECONDS;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGamePage, isGameRunning, router, stopAllAudio]);

  // Turn off flashlight when battery reaches 0
  useEffect(() => {
    if (battery <= 0 && isFlashlightOn) {
      setIsFlashlightOn(false);
    }
  }, [battery, isFlashlightOn]);

  // Flashlight battery drain: exactly 30 seconds usable duration
  useEffect(() => {
    if (!isGamePage || !isFlashlightOn || battery <= 0) return;

    const intervalMs = 100;
    const drainPerTick = (100 / TOTAL_FLASHLIGHT_SECONDS) * (intervalMs / 1000);

    const timer = setInterval(() => {
      setBattery((prev) => {
        const next = prev - drainPerTick;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isGamePage, isFlashlightOn, battery]);

  // Convert gameTimeElapsed into in-game hours (12:00 AM -> 6:00 AM)
  const currentHourIndex = Math.min(
    6,
    Math.floor(gameTimeElapsed / SECONDS_PER_HOUR)
  );
  const hourNumber = currentHourIndex === 0 ? 12 : currentHourIndex;
  const formattedClock = `${hourNumber}:00 AM`;

  // Global button click sound helper
  const playClickSound = useCallback(() => {
    try {
      if (!clickAudioRef.current) {
        clickAudioRef.current = new Audio("/assets/audio/Click.mp3");
      }
      const sound = clickAudioRef.current.cloneNode() as HTMLAudioElement;
      sound.volume = 0.7;
      sound.play().catch(() => {});
    } catch {}
  }, []);

  // Global document listener for button/link clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("button, a, [role='button']");
      if (interactive) {
        playClickSound();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [playClickSound]);

  // Flashlight hold start handler
  const startFlashlight = useCallback(() => {
    if (battery <= 0) {
      try {
        if (!flashJamAudioRef.current) {
          flashJamAudioRef.current = new Audio("/assets/audio/FlashlightJam.mp3");
        }
        const jamSound = flashJamAudioRef.current.cloneNode() as HTMLAudioElement;
        jamSound.volume = 0.8;
        jamSound.play().catch(() => {});
      } catch {}
      setIsFlashlightOn(false);
      return;
    }

    setIsFlashlightOn(true);
    try {
      if (!flashOnAudioRef.current) {
        flashOnAudioRef.current = new Audio("/assets/audio/Flashlight.mp3");
      }
      const onSound = flashOnAudioRef.current.cloneNode() as HTMLAudioElement;
      onSound.volume = 0.8;
      onSound.play().catch(() => {});
    } catch {}
  }, [battery]);

  // Flashlight hold end handler
  const stopFlashlight = useCallback(() => {
    setIsFlashlightOn(false);
  }, []);

  return (
    <GameContext.Provider
      value={{
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
        resetGame,
        triggerGameOver,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
