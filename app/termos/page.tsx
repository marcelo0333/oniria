import type { Metadata } from "next";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Prose from "@/components/layout/Prose";
import { company, env } from "@/lib/env";

export const metadata: Metadata = { title: "Termos de Uso", description: "Termos de Uso da plataforma Oniria.", alternates: { canonical: "/termos" } };

export default function Page() {
  const name = company.name();
  const cnpj = company.cnpj();
  return (
    <SiteShell stars={false}>
      <PageContainer narrow>
        <Prose title="Termos de Uso" updated="06/10/2026">
          <p>Bem-vindo(a) à Oniria. Ao criar uma conta ou usar o serviço, você concorda com estes Termos. Se não concordar, não utilize a plataforma.</p>

          <h2>1. Quem somos</h2>
          <p>A Oniria é operada por <strong>{name}</strong>{cnpj ? <>, CNPJ {cnpj}</> : null}{company.address() ? <>, {company.address()}</> : null}. Contato: <a href={`mailto:${env.supportEmail()}`}>{env.supportEmail()}</a>.</p>

          <h2>2. O que oferecemos</h2>
          <p>Ferramentas de interpretação de sonhos, mapa astral, tarot, numerologia, compatibilidade e horóscopo, geradas com apoio de inteligência artificial e cálculos astronômicos.</p>
          <p><strong>Natureza do conteúdo:</strong> tudo o que a Oniria apresenta tem finalidade de <strong>entretenimento e autoconhecimento</strong>. Não constitui diagnóstico, tratamento ou aconselhamento médico, psicológico, jurídico ou financeiro, nem garante resultados ou previsões. Em caso de sofrimento emocional, procure um profissional de saúde; no Brasil, o CVV atende 24h pelo telefone 188.</p>
          <p>Conteúdo gerado por IA pode conter imprecisões. Você é responsável pelo uso que fizer dele.</p>

          <h2>3. Conta e elegibilidade</h2>
          <ul>
            <li>Você deve ter 18 anos ou mais, ou a autorização de seus responsáveis legais.</li>
            <li>Os dados informados devem ser verdadeiros. Você é responsável por manter sua senha em sigilo.</li>
            <li>Podemos suspender contas que violem estes Termos ou a lei.</li>
          </ul>

          <h2>4. Planos, pagamento e renovação</h2>
          <ul>
            <li>Há um plano gratuito de degustação (com recursos limitados e uma interpretação de sonho de boas-vindas) e o plano pago Místico, em assinatura mensal ou anual.</li>
            <li><strong>Teste grátis:</strong> quando oferecido, o teste do plano Místico exige cartão e vale uma vez por pessoa. Se você não cancelar antes do fim do teste, a assinatura começa e é cobrada automaticamente. Durante o teste os limites de uso são reduzidos.</li>
            <li>Os pagamentos são processados pela Stripe. Não armazenamos dados completos de cartão.</li>
            <li>A assinatura <strong>renova automaticamente</strong> ao fim de cada período até ser cancelada. Você pode cancelar a qualquer momento em <em>Assinatura → Gerenciar</em>; o acesso continua até o fim do período já pago.</li>
            <li>Limites mensais de uso do plano Místico (interpretações, leituras etc.) renovam no primeiro dia de cada mês. Os benefícios do plano gratuito não renovam.</li>
            <li>O atendimento é feito por e-mail, em até 3 dias úteis. Assinatura, cancelamento, exportação e exclusão de dados são feitos diretamente no aplicativo.</li>
            <li>Preços podem ser reajustados mediante aviso prévio; o reajuste não afeta o período já pago.</li>
          </ul>

          <h3>4.1 Consultas avulsas</h3>
          <ul>
            <li>Consultas avulsas (ex.: Revolução Solar, leitura do mapa astral, pacotes de sonhos) são <strong>pagamentos únicos</strong>, por Pix ou cartão, sem renovação automática.</li>
            <li>Cada compra gera créditos na sua conta, que <strong>não expiram</strong> enquanto a conta existir e são usados depois que a cota do seu plano acabar. Assinantes do Místico têm desconto nas consultas avulsas.</li>
            <li>Créditos são pessoais, não transferíveis e não conversíveis em dinheiro. Se a geração falhar por erro nosso, o crédito é devolvido automaticamente.</li>
          </ul>

          <h2>5. Arrependimento e reembolso</h2>
          <p>Em contratações online, você pode desistir em até <strong>7 dias</strong> corridos após a primeira compra (art. 49 do Código de Defesa do Consumidor), com reembolso integral. Solicite por e-mail em <a href={`mailto:${env.supportEmail()}`}>{env.supportEmail()}</a>. Para consultas avulsas, o reembolso em 7 dias se aplica aos créditos ainda <strong>não utilizados</strong>, já que o conteúdo digital é entregue imediatamente ao ser usado (ao reembolsar, os créditos restantes são removidos). Após esse prazo, o cancelamento interrompe renovações futuras, sem reembolso proporcional do período em curso, salvo obrigação legal.</p>

          <h2>6. Uso aceitável</h2>
          <p>É proibido: usar a plataforma para fins ilícitos; tentar burlar limites, fraudar pagamentos ou acessar contas de terceiros; automatizar o acesso (bots/scraping) sem autorização; inserir conteúdo que viole direitos de terceiros ou seja ilegal, ofensivo ou envolva menores de forma imprópria; tentar manipular a IA para gerar conteúdo proibido.</p>

          <h2>7. Seu conteúdo</h2>
          <p>Os sonhos e textos que você insere continuam sendo seus. Você nos concede licença limitada, não exclusiva, apenas para processá-los e exibi-los a você e, se você optar por compartilhar um sonho por link público, para quem tiver o link. Você pode revogar o link ou excluir seus dados a qualquer momento.</p>
          <p>Interpretações e imagens geradas podem ser usadas por você para fins pessoais e para compartilhamento em redes sociais.</p>

          <h2>8. Propriedade intelectual</h2>
          <p>Marca, layout, código, textos e bases de dados da Oniria pertencem a {name}. É vedada a reprodução comercial sem autorização.</p>

          <h2>9. Disponibilidade e responsabilidade</h2>
          <p>Buscamos manter o serviço disponível, mas ele é fornecido “como está”, podendo haver interrupções e dependência de serviços de terceiros. Na máxima extensão permitida pela lei, nossa responsabilidade limita-se ao valor pago por você nos 12 meses anteriores ao evento, sem prejuízo de direitos do consumidor previstos em lei.</p>

          <h2>10. Privacidade</h2>
          <p>O tratamento de dados pessoais segue nossa <a href="/privacidade">Política de Privacidade</a> e a LGPD (Lei 13.709/2018).</p>

          <h2>11. Alterações</h2>
          <p>Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas por e-mail ou no aplicativo. O uso continuado após a atualização indica concordância.</p>

          <h2>12. Lei e foro</h2>
          <p>Estes Termos são regidos pelas leis do Brasil. Fica eleito o foro do domicílio do consumidor para dirimir controvérsias.</p>
        </Prose>
      </PageContainer>
    </SiteShell>
  );
}
