"use client";

import { useActionState, useState, useTransition } from "react";
import { updateProfile } from "@/actions/profile";
import { searchPlaces, type Place } from "@/actions/geocode";
import { FormMessage, Input } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import Button from "@/components/ui/Button";

type Props = {
  user: { name: string; birthDate: string | null; birthTime: string | null; birthPlace: string | null; birthLat: number | null; birthLon: number | null; birthTz: string | null; dailyEmail: boolean };
};

export default function ProfileForm({ user }: Props) {
  const [state, action] = useActionState(updateProfile, undefined);
  const [place, setPlace] = useState({ label: user.birthPlace ?? "", lat: user.birthLat?.toString() ?? "", lon: user.birthLon?.toString() ?? "", tz: user.birthTz ?? "" });
  const [results, setResults] = useState<Place[]>([]);
  const [searching, startSearch] = useTransition();
  const [searched, setSearched] = useState(false);

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Input label="Nome" name="name" defaultValue={user.name} required error={state?.errors?.name} />

      <fieldset className="space-y-4 rounded-xl border border-white/10 p-4">
        <legend className="px-2 text-sm font-semibold text-purple-200">Dados de nascimento (mapa astral)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Data de nascimento" name="birthDate" type="date" defaultValue={user.birthDate ?? ""} max={new Date().toISOString().slice(0, 10)} error={state?.errors?.birthDate} />
          <Input label="Hora de nascimento (opcional)" name="birthTime" type="time" defaultValue={user.birthTime ?? ""} hint="Necessária para ascendente e casas." error={state?.errors?.birthTime} />
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input label="Cidade de nascimento" name="birthPlace" value={place.label} onChange={(e) => setPlace({ ...place, label: e.target.value, lat: "", lon: "", tz: "" })} placeholder="Ex.: São Paulo, Brasil" error={state?.errors?.birthPlace} hint={place.lat ? `✔ Coordenadas e fuso definidos (${place.tz})` : "Busque e selecione a cidade para calcular o ascendente."} />
            </div>
            <Button type="button" variant="outline" size="md" className="self-end" disabled={searching || place.label.trim().length < 3} onClick={() => startSearch(async () => { setResults(await searchPlaces(place.label)); setSearched(true); })}>
              {searching ? "Buscando…" : "Buscar"}
            </Button>
          </div>
          {results.length > 0 && (
            <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-black/40 text-sm">
              {results.map((r) => (
                <li key={`${r.latitude}${r.longitude}`}>
                  <button type="button" className="w-full px-4 py-2 text-left text-zinc-200 hover:bg-white/10" onClick={() => { setPlace({ label: r.label, lat: String(r.latitude), lon: String(r.longitude), tz: r.timezone }); setResults([]); }}>{r.label}</button>
                </li>
              ))}
            </ul>
          )}
          {searched && results.length === 0 && !place.lat && <p className="text-xs text-zinc-500">Nenhum resultado. Tente outro nome.</p>}
          <input type="hidden" name="birthLat" value={place.lat} />
          <input type="hidden" name="birthLon" value={place.lon} />
          <input type="hidden" name="birthTz" value={place.tz} />
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input type="checkbox" name="dailyEmail" defaultChecked={user.dailyEmail} className="mt-1 accent-purple-500" />
        <span>Receber por e-mail meu horóscopo diário e o lembrete para registrar sonhos.</span>
      </label>
      <SubmitButton pendingText="Salvando…">Salvar perfil</SubmitButton>
    </form>
  );
}
