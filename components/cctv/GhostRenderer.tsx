import React from "react";
import Image from "next/image";
import { GhostState } from "@/systems/ghostSystem";

interface GhostRendererProps {
  ghost: GhostState;
}

export function GhostRenderer({ ghost }: GhostRendererProps) {
  if (!ghost.active) return null;

  const ghostImageSrc = `/assets/images/anomalies/ghost${
    ghost.camId.charAt(0).toUpperCase() + ghost.camId.slice(1)
  }.png`;

  // During exposure, transition color from normal towards deep red
  const redFactor = Math.min(1, Math.max(0, ghost.exposureProgress));

  return (
    <div
      className="absolute inset-0 z-1 pointer-events-none flex items-center justify-center transition-opacity duration-75"
      style={{
        opacity: ghost.opacity,
      }}
    >
      {/* Ghost container sized to 40% of camera viewport */}
      <div
        className="relative h-[40%] w-[40%]"
        style={{
          filter:
            redFactor > 0
              ? `sepia(${redFactor * 100}%) saturate(${100 + redFactor * 800}%) hue-rotate(${
                  -50 * redFactor
                }deg) drop-shadow(0 0 ${15 * redFactor}px rgba(239, 68, 68, ${redFactor}))`
              : "none",
          transition: "filter 0.05s linear",
        }}
      >
        <Image
          src={ghostImageSrc}
          alt={`Ghost on ${ghost.camId}`}
          fill
          priority
          sizes="40vw"
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}
