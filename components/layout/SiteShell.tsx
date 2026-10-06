import type { ReactNode } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Starfield } from "@/components/background/Starfield";
import { NightGradient } from "@/components/background/NightGradient";

export default function SiteShell({ children, stars = true }: { children: ReactNode; stars?: boolean }) {
  return (
    <div className="relative min-h-screen">
      <NightGradient />
      {stars && <Starfield />}
      <Header />
      <main className="relative z-10 pt-14">{children}</main>
      <Footer />
    </div>
  );
}

export function PageContainer({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto px-4 py-12 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>{children}</div>;
}
