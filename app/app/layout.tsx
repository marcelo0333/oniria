import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { effectivePlan, PLANS } from "@/lib/plans";
import SiteShell from "@/components/layout/SiteShell";
import AppNav from "@/components/app/AppNav";
import VerifyBanner from "@/components/app/VerifyBanner";
import { Badge } from "@/components/ui/Card";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const plan = effectivePlan(user);
  return (
    <SiteShell stars={false}>
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 pb-24 lg:pb-12">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <p className="truncate font-medium text-zinc-100">{user.name}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <Badge tone={plan === "FREE" ? "zinc" : "purple"}>{PLANS[plan].name}</Badge>
                {plan === "FREE" && <Link href="/precos" className="text-xs text-purple-300 hover:underline">Fazer upgrade</Link>}
              </div>
            </div>
            <AppNav variant="desktop" />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <AppNav variant="mobile" />
          {!user.emailVerifiedAt && <VerifyBanner />}
          {children}
        </div>
      </div>
    </SiteShell>
  );
}
