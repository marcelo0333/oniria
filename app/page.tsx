import { NightGradient } from "@/components/background/NightGradient";
import { Starfield } from "@/components/background/Starfield";
import Hero from "@/components/sections/Hero";
import SignIn from "@/app/auth/sign-in/page";
import { verifySession } from "@/lib/session";

export default async function Home() {
    const session = await verifySession();

    const user = session.isAuth ? {name: session.name, id: session.userId, email: session.email} : null;
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#05010D]/80 via-[#0B0620]/60 to-black">
        <Starfield />
        <NightGradient />
        <Hero user={user} />
    </div>
  );
}
