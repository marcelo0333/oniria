"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActionButton from "./ActionButton";
import { Textarea } from "@/components/ui/Field";
import { compatibilityAction, numerologyAction, threeCardTarotAction } from "@/actions/readings";
import { unlockDreamAction } from "@/actions/process-dream-action";

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

/** Gera a leitura completa (IA) de um par de signos já pré-visualizado. */
export function CompatReadingButton({ a, b }: { a: string; b: string }) {
  const router = useRouter();
  return (
    <ActionButton action={() => compatibilityAction(a, b)} pendingText="Cruzando os signos…" onDone={(id) => router.push(`/app/compatibilidade?a=${a}&b=${b}&r=${id}`)}>
      💞 Ver a leitura completa do casal
    </ActionButton>
  );
}

/** Gera a leitura completa (IA) dos números já calculados. */
export function NumerologyReadingButton({ name, date }: { name: string; date: string }) {
  const router = useRouter();
  return (
    <ActionButton action={() => numerologyAction(name, date)} pendingText="Interpretando seus números…" onDone={(id) => router.push(`/app/numerologia?r=${id}`)}>
      🔢 Ver a leitura completa
    </ActionButton>
  );
}

/** Desbloqueia (interpreta) um sonho salvo bloqueado usando a cota ou um crédito. */
export function UnlockDreamButton({ dreamId }: { dreamId: string }) {
  return (
    <ActionButton action={() => unlockDreamAction(dreamId)} pendingText="Os astros leem o seu sonho…">
      🔮 Interpretar este sonho
    </ActionButton>
  );
}
