import React from "react";

interface BatteryIndicatorProps {
  battery: number; // 0 to 100
}

export function BatteryIndicator({ battery }: BatteryIndicatorProps) {
  // 4 segments: each represents 25%
  // Segment 1: > 0%
  // Segment 2: > 25%
  // Segment 3: > 50%
  // Segment 4: > 75%
  const segments = [
    battery > 0,
    battery > 25,
    battery > 50,
    battery > 75,
  ];

  // Visual status color
  const isCritical = battery <= 25 && battery > 0;
  const isDead = battery <= 0;

  return (
    <div className="flex flex-col items-start gap-1 font-mono select-none">
      <div className="flex items-center gap-1.5 text-xs tracking-wider text-zinc-300">
        <span
          className={`h-2 w-2 rounded-full ${
            isDead
              ? "bg-red-600 animate-ping"
              : isCritical
              ? "bg-amber-500 animate-pulse"
              : "bg-emerald-500"
          }`}
        />
        <span className="font-bold tracking-widest text-zinc-200">BATTERY</span>
        <span
          className={`text-[11px] font-semibold ${
            isDead
              ? "text-red-500"
              : isCritical
              ? "text-amber-400"
              : "text-zinc-400"
          }`}
        >
          {Math.ceil(battery)}%
        </span>
      </div>

      {/* Battery Body Outline */}
      <div className="flex items-center">
        <div
          className={`relative flex h-8 w-28 items-center gap-1.5 rounded-sm border-2 px-1.5 py-1 backdrop-blur-md transition-colors ${
            isDead
              ? "border-red-600 bg-red-950/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              : isCritical
              ? "border-amber-500 bg-amber-950/30"
              : "border-zinc-500 bg-black/75 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          }`}
        >
          {segments.map((active, index) => (
            <div
              key={index}
              className={`h-full flex-1 rounded-2xs transition-all duration-200 ${
                active
                  ? isCritical
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : "bg-zinc-800/60 opacity-30"
              }`}
            />
          ))}
        </div>

        {/* Battery Nipple / Terminal */}
        <div
          className={`h-4 w-1.5 rounded-r-xs border-y-2 border-r-2 ${
            isDead
              ? "border-red-600 bg-red-700"
              : isCritical
              ? "border-amber-500 bg-amber-600"
              : "border-zinc-500 bg-zinc-600"
          }`}
        />
      </div>
    </div>
  );
}
