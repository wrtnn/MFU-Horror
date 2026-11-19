import Image from "next/image";
import Link from "next/link";
import { GAME_IMAGES } from "@/config/assets";

export default function LosePage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white selection:bg-red-900 selection:text-white">
      {/* Background Lose Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={GAME_IMAGES.ui.lose}
          alt="Signal Terminated"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center brightness-90 contrast-125"
        />
        {/* Red vignette & scanline overlays */}
        <div className="absolute inset-0 bg-radial from-transparent via-red-950/30 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] opacity-40 pointer-events-none" />
      </div>

      {/* Center Game Over Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 space-y-3">
          <p className="font-mono text-sm tracking-[0.35em] text-red-600 uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
            SIGNAL LOST — BREACH DETECTED
          </p>
          <h1 className="font-mono text-4xl sm:text-6xl font-extrabold uppercase tracking-widest text-red-500 drop-shadow-[0_4px_20px_rgba(220,38,38,0.8)]">
            Game Over
          </h1>
          <p className="font-mono text-xs text-zinc-400 tracking-wider">
            ANOMALY REACHED SECURITY OFFICE
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-64 flex-col gap-4">
          <Link
            href="/game"
            className="group relative flex h-13 w-full items-center justify-center border border-red-700 bg-black/75 font-mono text-sm font-semibold tracking-widest uppercase text-red-400 backdrop-blur-sm transition-all duration-200 hover:border-red-500 hover:bg-red-950/60 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-98"
          >
            Retry
          </Link>
          <Link
            href="/"
            className="group relative flex h-13 w-full items-center justify-center border border-zinc-700 bg-black/75 font-mono text-sm font-semibold tracking-widest uppercase text-zinc-400 backdrop-blur-sm transition-all duration-200 hover:border-zinc-500 hover:text-white active:scale-98"
          >
            Main Menu
          </Link>
        </div>
      </div>
    </main>
  );
}
