import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/components/game/GameContext";

export const metadata: Metadata = {
  title: "MFU Horror Game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-red-900 selection:text-white">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
