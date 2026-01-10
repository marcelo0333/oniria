"use client";

import { Starfield } from "@/public/components/Starfield";
import { useState } from "react";

export default function Home() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#05010D]/80 via-[#0B0620]/60 to-black">
        <Starfield />
      <main className="flex min-h-screen w-full z-10 max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <h1 className="font-[var(--font-playfair)] text-5xl  text-zinc-900 dark:text-zinc-100 sm:text-6xl">
          Welcome to Oniria
        </h1>
        <button className="mt-6 rounded bg-[#7B5CFA] px-4 py-2 font-semibold text-zinc-100 hover:bg-[#6A4FF1] focus:outline-none focus:ring-2 focus:ring-[#7B5CFA] focus:ring-offset-2 dark:ring-offset-black">
          Let&apos;s Dream together
        </button>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Your journey into the world of dreams starts here, explore and create!
        </p>
      </main>
    </div>
  );
}
