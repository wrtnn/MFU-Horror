import React from "react";

interface FlashlightButtonProps {
  isOn: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
  disabled?: boolean;
}

export function FlashlightButton({
  isOn,
  onPressStart,
  onPressEnd,
  disabled = false,
}: FlashlightButtonProps) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        onPressStart();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onPressEnd();
      }}
      onPointerLeave={(e) => {
        e.preventDefault();
        onPressEnd();
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`group relative flex items-center gap-3 rounded-sm border px-6 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 select-none backdrop-blur-md active:scale-95 touch-none ${
        isOn
          ? "border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_22px_rgba(251,191,36,0.55)] scale-98"
          : disabled
          ? "border-red-900/60 bg-red-950/20 text-red-500/70 hover:border-red-600 hover:text-red-400"
          : "border-zinc-700 bg-black/80 text-zinc-300 hover:border-zinc-400 hover:bg-zinc-900 hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]"
      }`}
      aria-label="Hold Flashlight"
    >
      {/* Light Icon / Glow Indicator */}
      <span
        className={`flex h-3 w-3 items-center justify-center rounded-full transition-all duration-150 ${
          isOn
            ? "bg-amber-300 shadow-[0_0_10px_#fde047] animate-pulse"
            : disabled
            ? "bg-red-800"
            : "bg-zinc-600 group-hover:bg-zinc-400"
        }`}
      />

      <span>{isOn ? "LIGHT: ACTIVE" : "HOLD FLASHLIGHT"}</span>

      {/* Keyboard Shortcut Hint */}
      <span
        className={`rounded px-1.5 py-0.5 text-[10px] font-normal transition-colors ${
          isOn
            ? "bg-amber-400/20 text-amber-300"
            : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200"
        }`}
      >
        [HOLD SPACE]
      </span>
    </button>
  );
}
