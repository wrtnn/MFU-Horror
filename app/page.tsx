import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white selection:bg-red-900 selection:text-white">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/ui/menu-bg.jpg"
          alt="MFU CCTV Horror Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 brightness-75 contrast-125"
        />
        {/* Dark vignette & noise-like gradient overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/60 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-25 pointer-events-none" />
      </div>

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
            href="/cam1"
            className="group relative flex h-13 w-full items-center justify-center border border-zinc-700 bg-black/70 font-mono text-sm font-semibold tracking-widest uppercase text-zinc-100 backdrop-blur-sm transition-all duration-200 hover:border-red-600 hover:bg-red-950/40 hover:text-red-400 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-98"
          >
            <span className="absolute left-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-red-500">
              ▶
            </span>
            Start
          </Link>

          <Link
            href="/cam1"
            className="group relative flex h-13 w-full items-center justify-center border border-zinc-700 bg-black/70 font-mono text-sm font-semibold tracking-widest uppercase text-zinc-100 backdrop-blur-sm transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-900/60 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-98"
          >
            <span className="absolute left-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-zinc-400">
              ▶
            </span>
            Continue
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 z-10 font-mono text-[11px] tracking-widest text-zinc-600">
        SURVIVE 5 NIGHTS • 4 CAMERAS
      </div>
    </main>
  );
}
