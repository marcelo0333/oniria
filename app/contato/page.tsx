import type { Metadata } from "next";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Card from "@/components/ui/Card";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Suporte e contato", description: "Fale com o suporte da Oniria.", alternates: { canonical: "/contato" } };

const FAQ = [
  ["Como cancelo minha assinatura?", "Em Meu painel → Assinatura → Gerenciar assinatura. O cancelamento vale ao fim do período já pago. No teste grátis, cancele antes do fim e nada é cobrado."],
  ["Comprei uma consulta e não apareceu.", "Pagamentos por Pix podem levar alguns instantes. Abra Minhas consultas e atualize a página; o crédito aparece assim que o pagamento é confirmado."],
  ["Posso pedir reembolso?", "Sim, em até 7 dias após a primeira compra (CDC, art. 49). Escreva para o e-mail de suporte com o e-mail da sua conta."],
  ["Como excluo meus dados?", "Em Perfil → Zona de perigo você exporta uma cópia e exclui a conta definitivamente."],
  ["A interpretação é uma previsão?", "Não. É um conteúdo de entretenimento e autoconhecimento, que combina simbolismo, psicologia e astrologia."],
  ["Esqueci minha senha.", "Use “Esqueci minha senha” na tela de login; enviaremos um link válido por 1 hora."],
];

export default function Page() {
  return (
    <SiteShell stars={false}>
      <PageContainer narrow>
        <h1 className="mb-2 text-3xl font-semibold">Suporte</h1>
        <p className="mb-8 text-zinc-400">Quase tudo se resolve sozinho pelo app (assinatura, cancelamento, dados). Para o resto, atendimento por e-mail em até 3 dias úteis: <a className="text-purple-300 hover:underline" href={`mailto:${env.supportEmail()}`}>{env.supportEmail()}</a>.</p>
        <div className="space-y-4">
          {FAQ.map(([q, a]) => (
            <Card key={q}>
              <h2 className="mb-1 text-lg font-semibold">{q}</h2>
              <p className="text-sm text-zinc-400">{a}</p>
            </Card>
          ))}
        </div>
      </PageContainer>
    </SiteShell>
  );
}
