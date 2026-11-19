"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GAME_IMAGES } from "@/config/assets";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // 1. Guard: Stop any lingering Alarm or Jumpscare sounds from Win/Lose screens
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      if (
        audio.src &&
        (audio.src.includes("Alarm.mp3") ||
          audio.src.includes("Jumpscare.mp3") ||
          audio.src.includes("Ambient.mp3") ||
          audio.src.includes("TeethGrind.mp3"))
      ) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = "";
      }
    });

    // 2. Setup Menu BGM
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.5;

    // Attempt autoplay, with user gesture fallback if blocked by browser policy
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          const handleFirstInteraction = () => {
            audio
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
          };
          window.addEventListener("click", handleFirstInteraction);
          window.addEventListener("keydown", handleFirstInteraction);
        });
    }

    // Cleanup: pause Menu audio when navigating away from the page
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleStartGame = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white selection:bg-red-900 selection:text-white">
      {/* Background Loop Audio */}
      <audio ref={audioRef} src="/assets/audio/Menu.mp3" loop preload="auto" />

      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src={GAME_IMAGES.ui.menu}
          alt="MFU CCTV Horror Menu Background"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center contrast-125"
        />
        {/* Dark vignette & scanline overlays */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/60 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-25 pointer-events-none" />
      </div>

      {/* Audio Indicator / Toggle Button */}
      <button
        onClick={toggleAudio}
        type="button"
        className="absolute top-6 right-6 z-20 flex items-center gap-2 border border-zinc-700/80 bg-black/60 px-3 py-1.5 font-mono text-xs tracking-wider text-zinc-400 backdrop-blur-sm transition-colors hover:border-zinc-500 hover:text-white"
        aria-label="Toggle Menu Audio"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isPlaying ? "bg-red-500 animate-pulse" : "bg-zinc-600"
          }`}
        />
        {isPlaying ? "AUDIO: PLAYING" : "AUDIO: MUTED (CLICK)"}
      </button>

      {/* Main Menu Center Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        {/* Game Title */}
        <div className="mb-12 space-y-2">
          <p className="font-mono text-xs tracking-[0.35em] text-red-500 uppercase drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">
            MFU CCTV Survival Horror
          </p>
          <h1 className="font-mono text-4xl sm:text-6xl font-extrabold uppercase tracking-widest text-zinc-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Anomaly Detection
          </h1>
          <p className="font-mono text-xs text-zinc-400 tracking-wider">
            SYSTEM STATUS: MONITORING ACTIVE
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-64 flex-col gap-4">
          <Link
            href="/game"
            onClick={handleStartGame}
            className="group relative flex h-13 w-full items-center justify-center border border-zinc-700 bg-black/70 font-mono text-sm font-semibold tracking-widest uppercase text-zinc-100 backdrop-blur-sm transition-all duration-200 hover:border-red-600 hover:bg-red-950/40 hover:text-red-400 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-98"
          >
            <span className="absolute left-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-red-500">
              ▶
            </span>
            Start
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 z-10 font-mono text-[11px] tracking-widest text-zinc-600">
        SURVIVE 12:00 AM – 6:00 AM • 4 CAMERAS
      </div>
    </main>
  );
}
