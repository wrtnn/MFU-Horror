"use client";

import React, { useEffect } from "react";

interface TutorialModalProps {
  onDismiss: () => void;
}

export function TutorialModal({ onDismiss }: TutorialModalProps) {
  useEffect(() => {
    const handleKeyDown = () => {
      onDismiss();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none cursor-pointer animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Gameplay Instructions"
    >
      <div
        onClick={(e) => {
          // Clicking anywhere inside also dismisses
          onDismiss();
        }}
        className="relative max-w-lg w-full border border-zinc-700/80 bg-zinc-950/95 p-6 sm:p-8 font-mono text-zinc-300 shadow-[0_0_35px_rgba(0,0,0,0.9)] rounded-xs"
      >
        {/* Header */}
        <div className="mb-6 border-b border-zinc-800 pb-3 text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-red-500 font-bold">
            SECURITY PROTOCOL MANUAL
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-widest text-white mt-1">
            Night Duty Instructions
          </h2>
        </div>

        {/* Content list */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-300">
          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-red-950/80 border border-red-800/80 text-[11px] font-bold text-red-400">
              1
            </span>
            <div>
              <p className="font-semibold text-zinc-100 uppercase tracking-wide">
                Camera Controls
              </p>
              <p className="text-zinc-400 text-[11px] sm:text-xs">
                Press keys <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold">1</kbd> to <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold">4</kbd> or click the camera buttons to switch CCTV feeds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-red-950/80 border border-red-800/80 text-[11px] font-bold text-red-400">
              2
            </span>
            <div>
              <p className="font-semibold text-zinc-100 uppercase tracking-wide">
                Ghost Detection & Timer
              </p>
              <p className="text-zinc-400 text-[11px] sm:text-xs">
                Anomalies appear on cameras and gradually become visible over <span className="text-amber-400 font-semibold">20 seconds</span>. Eliminate them before their timer expires, or you lose immediately.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-red-950/80 border border-red-800/80 text-[11px] font-bold text-red-400">
              3
            </span>
            <div>
              <p className="font-semibold text-zinc-100 uppercase tracking-wide">
                Flashlight Usage & Battery
              </p>
              <p className="text-zinc-400 text-[11px] sm:text-xs">
                Hold <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold">SPACE</kbd> or hold the flashlight button for <span className="text-amber-400 font-semibold">1 continuous second</span> to eliminate the ghost. You have <span className="text-emerald-400 font-semibold">30 seconds</span> of total battery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-red-950/80 border border-red-800/80 text-[11px] font-bold text-red-400">
              4
            </span>
            <div>
              <p className="font-semibold text-zinc-100 uppercase tracking-wide">
                Survival Objective
              </p>
              <p className="text-zinc-400 text-[11px] sm:text-xs">
                Survive the shift from <span className="text-white font-bold">12:00 AM</span> to <span className="text-white font-bold">6:00 AM</span> (2 real minutes) to win.
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Dismiss hint */}
        <div className="mt-8 pt-4 border-t border-zinc-800/80 text-center">
          <p className="text-[11px] uppercase tracking-widest text-zinc-400 animate-pulse">
            [ Click anywhere or press any key to begin ]
          </p>
        </div>
      </div>
    </div>
  );
}
