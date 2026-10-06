import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import Card, { SectionTitle } from "@/components/ui/Card";
import ProfileForm from "@/components/app/ProfileForm";
import DeleteAccount from "@/components/app/DeleteAccount";
import { getSign } from "@/lib/mystic/signs";

export const metadata: Metadata = { title: "Perfil" };

export default async function Page({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser();
  const { welcome } = await searchParams;
  const sign = getSign(user.sunSign);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{welcome ? "Bem-vindo(a) à Oniria ✨" : "Seu perfil"}</h1>
        <p className="mt-1 text-zinc-400">{welcome ? "Complete seus dados de nascimento para destravar o mapa astral e o horóscopo personalizado — ou pule e registre seu primeiro sonho." : user.email}</p>
        {sign && <p className="mt-2 text-sm text-purple-200">Seu signo solar: {sign.glyph} {sign.name}</p>}
      </header>
      <Card>
        <ProfileForm user={{ name: user.name, birthDate: user.birthDate, birthTime: user.birthTime, birthPlace: user.birthPlace, birthLat: user.birthLat, birthLon: user.birthLon, birthTz: user.birthTz, dailyEmail: user.dailyEmail }} />
      </Card>
      <Card>
        <SectionTitle sub="Seus direitos pela LGPD">Privacidade e dados</SectionTitle>
        <DeleteAccount />
      </Card>
    </div>
  );
}
