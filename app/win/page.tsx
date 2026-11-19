"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { GAME_IMAGES } from "@/config/assets";

export default function WinPage() {
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isCleanedUp = false;

    // Play Alarm sound effect on Win
    const audio = new Audio("/assets/audio/Alarm.mp3");
    audio.volume = 0.7;
    alarmAudioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback for browser autoplay policies
        const playOnInteraction = () => {
          if (!isCleanedUp && audio) {
            audio.play().catch(() => {});
          }
          window.removeEventListener("click", playOnInteraction);
          window.removeEventListener("keydown", playOnInteraction);
        };
        window.addEventListener("click", playOnInteraction);
        window.addEventListener("keydown", playOnInteraction);
      });
    }

    // Cleanup: IMMEDIATELY stop and detach audio when navigating away from Win page
    return () => {
      isCleanedUp = true;
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      alarmAudioRef.current = null;
    };
  }, []);

  const handleReturnToMenu = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.src = "";
      alarmAudioRef.current = null;
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white selection:bg-emerald-900 selection:text-white">
      {/* Background Win Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={GAME_IMAGES.ui.win}
          alt="Night Survived"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center brightness-50 contrast-110"
        />
        {/* Subtle vignette overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80 pointer-events-none" />
      </div>

      {/* Center Victory Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 space-y-3">
          <p className="font-mono text-sm tracking-[0.3em] text-emerald-400 uppercase drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
            6:00 AM — SHIFT COMPLETED
          </p>
          <h1 className="font-mono text-4xl sm:text-6xl font-extrabold uppercase tracking-widest text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            You Survived
          </h1>
          <p className="font-mono text-xs text-zinc-300 tracking-wider">
            ALL ANOMALIES CONTAINED • POWER SECURED
          </p>
        </div>

        {/* Action Button */}
        <div className="flex w-64 flex-col gap-4">
          <Link
            href="/"
            onClick={handleReturnToMenu}
            className="group relative flex h-13 w-full items-center justify-center border border-emerald-600 bg-black/75 font-mono text-sm font-semibold tracking-widest uppercase text-emerald-300 backdrop-blur-sm transition-all duration-200 hover:bg-emerald-950/50 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-98"
          >
            Return to Menu
          </Link>
        </div>
      </div>
    </main>
  );
}
