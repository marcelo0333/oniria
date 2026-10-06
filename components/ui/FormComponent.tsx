"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import OfferLinks from "@/components/app/OfferLinks";
import Button from "./Button";
import Loading from "./Loading";
import { SelectField, Textarea } from "./Field";
import { Slider } from "./Slider";
import { DREAM_EMOTIONS, DREAM_TYPES } from "@/lib/constants";
import { createDreamAction } from "@/actions/process-dream-action";

/** Formulário de novo sonho: envia, aguarda a interpretação e abre o resultado. */
export function FormComponent() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<{ message: string; upgrade?: boolean; offer?: { id: string; name: string; price: string }; fields?: Record<string, string[] | undefined> } | null>(null);
  const [form, setForm] = useState({ description: "", type: "lucid", emotion: "calm", scenerie: "", intensity: 5 });

  if (pending) return <Loading text="Os astros leem o seu sonho… isso leva alguns segundos." />;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await createDreamAction(form);
          if (res.ok) router.push(`/app/sonhos/${res.id}`);
          else setError({ message: res.error, upgrade: res.upgrade, offer: res.offer, fields: res.fieldErrors });
        });
      }}
    >
      {error && (
        <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error.message}
          {error.upgrade && <OfferLinks offer={error.offer} />}
        </div>
      )}
      <Textarea label="Conte seu sonho" name="description" required minLength={15} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva o que viu, quem estava lá, o que aconteceu e como terminou…" error={error?.fields?.description} hint={`${form.description.length}/2000`} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Tipo do sonho" name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {DREAM_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>)}
        </SelectField>
        <SelectField label="Emoção dominante" name="emotion" value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value })}>
          {DREAM_EMOTIONS.map((t) => <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>)}
        </SelectField>
      </div>
      <Textarea label="Cenário (opcional)" name="scenerie" maxLength={500} value={form.scenerie} onChange={(e) => setForm({ ...form, scenerie: e.target.value })} placeholder="Ex.: uma floresta à noite, uma cidade antiga, uma praia vazia…" className="min-h-20" error={error?.fields?.scenerie} />
      <Slider label="Nível de surrealismo da imagem" value={form.intensity} min={0} max={10} onChange={(v) => setForm({ ...form, intensity: v })} />
      <div className="flex justify-end">
        <Button type="submit" size="lg">✨ Interpretar meu sonho</Button>
      </div>
    </form>
  );
}
