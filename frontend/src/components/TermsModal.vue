<template>
  <div class="ecor-modal">
    <div class="ecor-backdrop" @click="$emit('close')"></div>
    <div class="ecor-panel">
      <button class="ecor-close" @click="$emit('close')">×</button>
      <h5 class="mb-3">Termo de Aceite, Privacidade e Segurança</h5>
      
      <div class="terms-content">
        <p class="fw-bold">Plataforma Eco Recile</p>
        <p class="text-muted small">Última atualização: 22/11/2025</p>

        <p>Ao criar uma conta ou utilizar a plataforma Eco Recile (site, aplicativo e demais canais digitais), você declara que leu, entendeu e concorda com os termos abaixo, especialmente quanto ao tratamento de dados pessoais nos termos da Lei nº 13.709/2018 (LGPD), ao uso e eventual venda de insights gerados a partir dos dados e às regras de segurança e prevenção a fraudes.</p>

        <h6>1. Controlador dos dados</h6>
        <p>1.1. Para fins da LGPD, o controlador dos dados pessoais é a responsável pela operação da plataforma Eco Recile:<br>
        [INSERIR RAZÃO SOCIAL/CPF DO RESPONSÁVEL PELA ECO RECILE], doravante denominada simplesmente “Eco Recile”.</p>

        <h6>2. Tratamento de dados pessoais (LGPD)</h6>
        <p>2.1. Para funcionamento da plataforma, a Eco Recile poderá coletar e tratar, dentre outros:</p>
        <ul>
          <li><strong>Dados cadastrais:</strong> nome/razão social, CPF/CNPJ, e-mail, telefone, endereço, dados de contato do responsável (no caso de PJ);</li>
          <li><strong>Dados de acesso e uso:</strong> data e hora de acesso, IP, tipo de dispositivo, navegador, páginas acessadas, ações realizadas na plataforma;</li>
          <li><strong>Dados de operação:</strong> registros de descartes, pontos acumulados e resgatados, recompensas resgatadas, interações com pontos de coleta, histórico de suporte;</li>
          <li><strong>Dados de localização:</strong> quando necessários para mostrar pontos de coleta próximos ou registrar o local de descarte, observadas as permissões do dispositivo.</li>
        </ul>

        <p>2.2. Os dados poderão ser tratados com as seguintes bases legais da LGPD, conforme o caso:</p>
        <ul>
          <li>Execução de contrato ou de procedimentos preliminares;</li>
          <li>Cumprimento de obrigação legal ou regulatória;</li>
          <li>Legítimo interesse da Eco Recile, com avaliação de impacto e respeito aos direitos do titular;</li>
          <li>Consentimento do usuário, quando aplicável.</li>
        </ul>

        <p>2.3. Os dados pessoais serão utilizados, entre outros fins, para:</p>
        <ul>
          <li>Permitir o cadastro, login e autenticação de pessoas físicas e jurídicas;</li>
          <li>Operar o sistema de descartes, pontuação, recompensas e relatórios;</li>
          <li>Cumprir obrigações legais, fiscais, ambientais e de prestação de contas;</li>
          <li>Melhorar a experiência de uso, incluindo suporte, comunicação e novas funcionalidades;</li>
          <li>Prevenir fraudes, uso indevido e violações de segurança;</li>
          <li>Gerar estatísticas, métricas e insights sobre o uso da plataforma.</li>
        </ul>

        <h6>3. Uso e venda de insights e dados agregados</h6>
        <p>3.1. A Eco Recile poderá gerar relatórios, indicadores e insights a partir dos dados coletados, incluindo:</p>
        <ul>
          <li>Volume de descartes por tipo de resíduo;</li>
          <li>Engajamento de usuários (PF e PJ);</li>
          <li>Desempenho de pontos de coleta;</li>
          <li>Impactos ambientais estimados (ex.: kg de resíduos desviados de aterro, CO₂ evitado, etc.).</li>
        </ul>

        <p>3.2. Sempre que possível, esses dados serão tratados de forma agregada e/ou anonimizada, de modo que não permitam a identificação direta de um usuário individual, em conformidade com a LGPD.</p>

        <p>3.3. Esses insights e dados agregados poderão ser:</p>
        <ul>
          <li>Utilizados internamente para aprimorar a plataforma;</li>
          <li>Compartilhados com parceiros, empresas, instituições de ensino e órgãos públicos que utilizem a Eco Recile para fins de logística reversa, ESG ou relatórios ambientais;</li>
          <li>Comercializados ou licenciados como dashboards, relatórios, estudos ou indicadores, priorizando sempre a anonimização.</li>
        </ul>

        <p>3.4. Ao aceitar este Termo, você autoriza o uso dos dados para geração e eventual venda de insights, respeitados os limites da LGPD, com prioridade para uso agregado/anonimizado e sem prejuízo dos seus direitos como titular de dados.</p>

        <h6>4. Compartilhamento de dados pessoais</h6>
        <p>4.1. Dados pessoais poderão ser compartilhados com:</p>
        <ul>
          <li>Fornecedores de tecnologia: hospedagem, banco de dados, ferramentas de analytics, serviços de e-mail, notificações e segurança;</li>
          <li>Parceiros institucionais: empresas, instituições de ensino e pontos de coleta que utilizem a Eco Recile para gestão de descartes e comprovação de metas ambientais, quando necessário para a operação do serviço;</li>
          <li>Meios de pagamento, quando houver transações financeiras;</li>
          <li>Prestadores de serviços de prevenção a fraudes e análise de risco;</li>
          <li>Autoridades públicas e órgãos reguladores, quando houver obrigação legal, ordem judicial ou requisição oficial.</li>
        </ul>

        <p>4.2. Nesses casos, a Eco Recile buscará firmar compromissos contratuais para que os terceiros tratem os dados em conformidade com a LGPD e com este Termo.</p>

        <h6>5. Segurança da informação</h6>
        <p>5.1. A Eco Recile adota medidas razoáveis de segurança técnica e organizacional para proteção dos dados, tais como:</p>
        <ul>
          <li>Controle de acesso e autenticação de usuários;</li>
          <li>Criptografia em trânsito e, quando aplicável, em repouso;</li>
          <li>Registros de logs de acesso e de ações relevantes;</li>
          <li>Procedimentos internos de segurança da informação.</li>
        </ul>

        <p>5.2. Embora sejam adotados esforços para proteção dos dados, nenhum sistema é totalmente imune a incidentes. Em caso de incidente de segurança que possa acarretar risco ou dano relevante, a Eco Recile seguirá os procedimentos previstos na LGPD, podendo comunicar os titulares e a Autoridade Nacional de Proteção de Dados (ANPD), quando exigido.</p>

        <h6>6. Prevenção a fraudes e medidas em caso de suspeita</h6>
        <p>6.1. A Eco Recile poderá realizar análises automáticas e manuais para prevenir e identificar fraudes, uso indevido, criação de contas falsas, acúmulo irregular de pontos, uso de automações não autorizadas e outras condutas ilícitas ou contrárias a este Termo.</p>

        <p>6.2. Essas análises podem incluir, por exemplo:</p>
        <ul>
          <li>Verificação de consistência dos dados cadastrais;</li>
          <li>Avaliação de padrões de uso considerados atípicos ou incompatíveis com o uso normal;</li>
          <li>Cruzamento de informações internas sobre descartes, pontos e resgates;</li>
          <li>Contato com o usuário para validação de identidade ou esclarecimento de operações.</li>
        </ul>

        <p>6.3. Caso sejam identificados indícios ou evidências de fraude, uso indevido ou violação deste Termo, a Eco Recile poderá, a seu critério:</p>
        <ul>
          <li>Bloquear temporariamente a conta do usuário;</li>
          <li>Suspender provisoriamente o acesso ao saldo de pontos e recompensas;</li>
          <li>Solicitar documentos e informações adicionais para confirmação de identidade e análise do caso.</li>
        </ul>

        <p>6.4. Se o usuário não cooperar com a equipe de suporte, recusando-se de forma injustificada a fornecer as informações solicitadas, não respondendo aos contatos ou fornecendo dados sabidamente falsos ou contraditórios, a Eco Recile poderá:</p>
        <ul>
          <li>Suspender a conta por prazo indeterminado; e/ou</li>
          <li>Encerrar definitivamente a conta, com bloqueio preventivo de novos cadastros vinculados a dados relacionados (e-mail, CPF/CNPJ, telefone, etc.), respeitada a legislação aplicável.</li>
        </ul>

        <p>6.5. Confirmada a fraude ou o uso ilícito, a Eco Recile poderá ainda:</p>
        <ul>
          <li>Cancelar pontos, benefícios, recompensas ou vantagens obtidas de forma irregular;</li>
          <li>Informar o fato a parceiros diretamente impactados;</li>
          <li>Comunicar o caso às autoridades competentes e adotar medidas judiciais ou extrajudiciais cabíveis.</li>
        </ul>

        <h6>7. Direitos do titular de dados</h6>
        <p>7.1. Nos termos da LGPD, o titular de dados (pessoa física) poderá exercer, a qualquer tempo, os seguintes direitos, entre outros:</p>
        <ul>
          <li>Confirmação da existência de tratamento;</li>
          <li>Acesso aos dados pessoais;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
          <li>Portabilidade dos dados a outro fornecedor de serviço, quando aplicável;</li>
          <li>Informação sobre compartilhamento de dados;</li>
          <li>Revogação do consentimento, quando o tratamento se basear nele.</li>
        </ul>

        <p>7.2. Para exercer seus direitos, o titular poderá entrar em contato pelos canais oficiais da Eco Recile:<br>
        E-mail de contato/DPO: [INSERIR E-MAIL OFICIAL]</p>

        <h6>8. Atualizações deste Termo</h6>
        <p>8.1. Este Termo poderá ser atualizado periodicamente, em razão de ajustes na plataforma, mudanças legislativas ou necessidades operacionais.</p>
        <p>8.2. Quando houver alterações relevantes, a Eco Recile poderá informar o usuário por meio da própria plataforma, e-mail ou outro canal adequado, indicando a data de início de vigência da nova versão.</p>
        <p>8.3. A continuidade de uso da plataforma após a entrada em vigor da nova versão será considerada como aceite às alterações.</p>

        <h6>9. Aceite eletrônico</h6>
        <p>9.1. Ao marcar a opção “Li e aceito o Termo de Aceite, Privacidade e Segurança da Eco Recile” e/ou ao utilizar a plataforma, o usuário declara que:</p>
        <ul>
          <li>Leu atentamente o conteúdo deste Termo;</li>
          <li>Está ciente das regras de tratamento de dados pessoais, conforme a LGPD;</li>
          <li>Concorda com o uso e a eventual venda de insights gerados a partir dos dados, nos limites aqui descritos;</li>
          <li>Entende que, em caso de suspeita ou confirmação de fraude, uso indevido ou descumprimento deste Termo, sua conta poderá ser bloqueada, suspensa ou encerrada, especialmente se não houver cooperação com a equipe de suporte.</li>
        </ul>
      </div>

      <div class="mt-3 text-end">
        <button class="btn btn-secondary" @click="$emit('close')">Fechar</button>
        <button class="btn btn--primary ms-2" @click="$emit('accept')">Li e Concordo</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close', 'accept'])
</script>

<style scoped>
.ecor-modal { position: fixed; inset: 0; z-index: 1050; display: grid; place-items: center; isolation: isolate; }
.ecor-backdrop { position: absolute; inset: 0; background: rgba(15, 23, 42, .35); backdrop-filter: blur(6px); z-index: 0; }
.ecor-panel {
  position: relative; z-index: 1;
  width: min(800px, calc(100vw - 32px));
  background: #fff; color: #111827;
  border-radius: 12px; box-shadow: 0 24px 48px rgba(16, 24, 40, .18);
  padding: 24px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  animation: pop .14s ease-out;
}
.ecor-close { position: absolute; top: 12px; right: 16px; font-size: 24px; border: 0; background: transparent; cursor: pointer; color: #6b7280; }
@keyframes pop { from { transform: scale(.985); opacity: 0 } to { transform: scale(1); opacity: 1 } }

.terms-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.terms-content h6 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 700; color: #111827; }
.terms-content p { margin-bottom: 0.75rem; }
.terms-content ul { margin-bottom: 0.75rem; padding-left: 1.5rem; }
.terms-content li { margin-bottom: 0.25rem; }

.btn--primary {
  background: linear-gradient(135deg, #12b886 0%, #0ca678 100%) !important;
  color: white !important;
}
.btn--primary:hover { filter: brightness(0.95); }
</style>
