"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActionButton from "./ActionButton";
import { SelectField, Input, Textarea } from "@/components/ui/Field";
import { compatibilityAction, numerologyAction, threeCardTarotAction } from "@/actions/readings";
import { SIGNS } from "@/lib/mystic/signs";

export function TarotThreeForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  return (
    <div className="space-y-3">
      <Textarea label="Sua pergunta ou tema (opcional)" name="question" maxLength={300} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex.: o que preciso saber sobre minha carreira neste momento?" className="min-h-20" />
      <ActionButton action={() => threeCardTarotAction(question)} pendingText="Embaralhando e interpretando…" onDone={(id) => router.push(`/app/tarot?r=${id}`)}>🔮 Tirar 3 cartas</ActionButton>
    </div>
  );
}

export function CompatForm({ defaultA }: { defaultA?: string }) {
  const router = useRouter();
  const [a, setA] = useState(defaultA ?? "aries");
  const [b, setB] = useState("libra");
  const opts = SIGNS.map((s) => <option key={s.slug} value={s.slug} className="bg-zinc-900">{s.glyph} {s.name}</option>);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Signo 1" name="a" value={a} onChange={(e) => setA(e.target.value)}>{opts}</SelectField>
        <SelectField label="Signo 2" name="b" value={b} onChange={(e) => setB(e.target.value)}>{opts}</SelectField>
      </div>
      <ActionButton action={() => compatibilityAction(a, b)} pendingText="Cruzando os signos…" onDone={(id) => router.push(`/app/compatibilidade?r=${id}`)}>💞 Analisar compatibilidade</ActionButton>
    </div>
  );
}

export function NumerologyForm({ defaultName, defaultDate }: { defaultName: string; defaultDate: string }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [date, setDate] = useState(defaultDate);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nome completo (de nascimento)" name="fullName" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        <Input label="Data de nascimento" name="birth" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <ActionButton action={() => numerologyAction(name, date)} disabled={!name.trim() || !date} pendingText="Calculando seus números…" onDone={(id) => router.push(`/app/numerologia?r=${id}`)}>🔢 Revelar meus números</ActionButton>
    </div>
  );
}
