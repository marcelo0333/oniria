import type { Metadata } from "next";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Prose from "@/components/layout/Prose";
import { company } from "@/lib/env";

export const metadata: Metadata = { title: "Política de Privacidade", description: "Como a Oniria trata seus dados pessoais, conforme a LGPD.", alternates: { canonical: "/privacidade" } };

export default function Page() {
  const dpo = company.dpoEmail();
  return (
    <SiteShell stars={false}>
      <PageContainer narrow>
        <Prose title="Política de Privacidade" updated="06/10/2026">
          <p>Esta política explica como a <strong>{company.name()}</strong> (“Oniria”) trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018).</p>

          <h2>1. Controlador e contato (DPO)</h2>
          <p>Controladora: {company.name()}{company.cnpj() ? <>, CNPJ {company.cnpj()}</> : null}. Encarregado/contato de privacidade: <a href={`mailto:${dpo}`}>{dpo}</a>.</p>

          <h2>2. Dados que coletamos</h2>
          <ul>
            <li><strong>Conta:</strong> nome, e-mail, senha (armazenada apenas como hash).</li>
            <li><strong>Conteúdo que você informa:</strong> descrições de sonhos, cenários, emoções e perguntas de tarot.</li>
            <li><strong>Dados de nascimento (opcionais):</strong> data, hora e cidade — usados para calcular seu mapa astral. Podem ser considerados dados sensíveis em alguns contextos; por isso o fornecimento é opcional e baseado em seu consentimento.</li>
            <li><strong>Assinatura:</strong> identificadores do cliente e da assinatura na Stripe, plano e status. Os dados de cartão são tratados exclusivamente pela Stripe.</li>
            <li><strong>Uso e segurança:</strong> contagem de usos, endereço IP e registros técnicos para prevenção de fraude e limites de taxa.</li>
          </ul>

          <h2>3. Para que usamos (finalidades e bases legais)</h2>
          <ul>
            <li>Prestar o serviço contratado e gerar interpretações — execução de contrato (art. 7º, V).</li>
            <li>Calcular o mapa astral com seus dados de nascimento — consentimento (art. 7º, I / art. 11, I).</li>
            <li>Cobrança e prevenção a fraudes — execução de contrato e legítimo interesse (art. 7º, IX).</li>
            <li>E-mails transacionais (confirmação, senha, recibos) — execução de contrato.</li>
            <li>E-mail matinal opcional (horóscopo) — consentimento; você pode desativar no perfil a qualquer momento.</li>
            <li>Cumprimento de obrigações legais e fiscais — art. 7º, II.</li>
          </ul>
          <p>Não vendemos seus dados e não usamos o conteúdo dos seus sonhos para publicidade.</p>

          <h2>4. Com quem compartilhamos (operadores)</h2>
          <ul>
            <li><strong>Google (Gemini API):</strong> recebe o texto do sonho/consulta para gerar a interpretação. Usamos a API em modo pago, no qual os dados não são usados para treinar modelos.</li>
            <li><strong>Pollinations:</strong> recebe apenas o <em>prompt de imagem</em> gerado (sem nome, e-mail ou identificadores).</li>
            <li><strong>Stripe:</strong> processamento de pagamentos.</li>
            <li><strong>Resend:</strong> envio de e-mails.</li>
            <li><strong>Open-Meteo:</strong> busca de coordenadas da cidade informada (apenas o nome da cidade).</li>
            <li><strong>Provedores de hospedagem e banco de dados</strong> (infraestrutura em nuvem).</li>
          </ul>
          <p>Alguns desses provedores estão fora do Brasil; a transferência internacional ocorre com cláusulas contratuais e garantias compatíveis com a LGPD (art. 33).</p>

          <h2>5. Compartilhamento público opcional</h2>
          <p>Se você gerar um link público de um sonho, qualquer pessoa com o link verá o título, a interpretação e as imagens daquele sonho (nunca seu e-mail). Você pode revogar o link quando quiser.</p>

          <h2>6. Cookies</h2>
          <p>Usamos apenas um cookie essencial de sessão (<code>oniria_session</code>, httpOnly), necessário para manter você conectado(a). Não usamos cookies de publicidade. Se adicionarmos ferramentas de análise, este documento será atualizado e solicitaremos consentimento quando necessário.</p>

          <h2>7. Retenção</h2>
          <p>Mantemos seus dados enquanto sua conta existir. Ao excluir a conta, apagamos seus dados em até 30 dias, exceto registros que devamos guardar por obrigação legal (ex.: fiscais, por até 5 anos) ou para defesa em processos.</p>

          <h2>8. Seus direitos (art. 18 da LGPD)</h2>
          <p>Você pode: confirmar a existência de tratamento; acessar, corrigir e <strong>exportar</strong> seus dados; solicitar anonimização, bloqueio ou <strong>eliminação</strong>; revogar consentimentos; obter informação sobre compartilhamentos; e peticionar à ANPD. No aplicativo, em <em>Perfil</em>, você pode editar dados, baixar uma cópia (JSON) e excluir a conta. Outras solicitações: <a href={`mailto:${dpo}`}>{dpo}</a>.</p>

          <h2>9. Segurança</h2>
          <p>Adotamos medidas como HTTPS, senhas com hash (bcrypt), cookies httpOnly, limitação de tentativas, controle de acesso e backups. Nenhum sistema é 100% seguro; em caso de incidente relevante, comunicaremos você e a ANPD conforme a lei.</p>

          <h2>10. Menores de idade</h2>
          <p>O serviço é destinado a maiores de 18 anos. Se identificarmos dados de menores sem autorização dos responsáveis, os excluiremos.</p>

          <h2>11. Alterações</h2>
          <p>Esta política pode ser atualizada; mudanças relevantes serão informadas no aplicativo ou por e-mail.</p>
        </Prose>
      </PageContainer>
    </SiteShell>
  );
}
