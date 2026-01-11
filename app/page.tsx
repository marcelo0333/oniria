import { NightGradient } from "@/components/background/NightGradient";
import { Starfield } from "@/components/background/Starfield";
import Hero from "@/components/sections/Hero";

export default function Home() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#05010D]/80 via-[#0B0620]/60 to-black">
        <Starfield />
        <NightGradient />
        <Hero />
    </div>
  );
}
