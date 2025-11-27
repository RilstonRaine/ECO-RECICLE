<template>
  <div class="container-fluid px-0 home-wrap">
    <!-- Banner/Informativo -->
    <div class="container-fluid px-4">
      <InfoBanner
        titulo="Campanha • Outubro Verde"
        mensagem="Pontos de coleta com horário estendido e +20% de pontos para plásticos e eletrônicos até dia 30."
        cta-text="Regulamento"
        cta-href="https://www.gov.br/mma/pt-br"
        storage-key="ecor_info_banner_outubro"
        class="mb-4"
      />
    </div>

    <!-- Hero Section -->
    <div class="hero-section px-4 py-5 mb-5">
      <div class="container-fluid">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <p class="kicker text-uppercase fw-bold mb-2">Descarte Sustentável</p>
            <h1 class="display-3 fw-bold text-dark mb-3">
              Descarte Seus<br />
              Eletrônicos de Forma<br />
              <span class="text-primary">Sustentável</span>
            </h1>
            <p class="lead text-muted mb-4" style="max-width: 600px;">
              Evite impactos ambientais! Cadastre seus dispositivos eletrônicos e
              encontre o ponto de coleta mais próximo de você.
            </p>

            <div class="d-flex gap-3 flex-wrap">
              <router-link class="btn btn--primary btn-lg px-4" to="/cadastro-dispositivo">
                <i class="bi bi-recycle me-2"></i>
                Realizar Descarte
              </router-link>

              <router-link class="btn btn--ghost btn-lg px-4" to="/pontos">
                <i class="bi bi-geo-alt me-2"></i>
                Visualizar Pontos
              </router-link>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card glass border-0 shadow-lg p-4 p-md-5">
              <div class="d-flex align-items-center gap-3 mb-4">
                <div class="hero-icon">
                  <i class="bi bi-recycle"></i>
                </div>
                <h4 class="m-0 fw-bold">Como funciona?</h4>
              </div>
              
              <ol class="steps list-unstyled m-0 d-grid gap-3">
                <li>
                  <span class="step-num">1</span>
                  <div class="step-content">
                    <strong>Cadastre seu dispositivo</strong>
                    <div class="small text-muted">Informe o tipo e estado do item.</div>
                  </div>
                </li>
                <li>
                  <span class="step-num">2</span>
                  <div class="step-content">
                    <strong>Encontre um ponto de coleta</strong>
                    <div class="small text-muted">Veja o local mais próximo no mapa.</div>
                  </div>
                </li>
                <li>
                  <span class="step-num">3</span>
                  <div class="step-content">
                    <strong>Contribua com o meio ambiente</strong>
                    <div class="small text-muted">Ganhe pontos e ajude o planeta.</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Informativos -->
    <div class="container-fluid px-4 mb-5">
      <section class="row g-4">
        <div class="col-md-4">
          <article class="info-card h-100">
            <div class="icn"><i class="bi bi-puzzle"></i></div>
            <h3>O que pode descartar?</h3>
            <p>
              Celulares, notebooks, tablets, cabos, carregadores, TVs, roteadores e
              eletroportáteis. Em dúvida, consulte o ponto de coleta.
            </p>
          </article>
        </div>

        <div class="col-md-4">
          <article class="info-card h-100">
            <div class="icn"><i class="bi bi-shield-lock"></i></div>
            <h3>Proteja seus dados</h3>
            <p>
              Restaure para as configurações de fábrica e remova cartões SIM e SD.
              Nos pontos, há orientação para limpeza segura.
            </p>
          </article>
        </div>

        <div class="col-md-4">
          <article class="info-card h-100">
            <div class="icn"><i class="bi bi-trophy"></i></div>
            <h3>Ganhe pontos</h3>
            <p>
              Receba pontos por peso e tipo de material. Acompanhe no dashboard e
              troque por recompensas quando atingir a meta do seu ponto.
            </p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import InfoBanner from '@/components/InfoBanner.vue'
</script>

<style scoped>
.home-wrap {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
}

.kicker {
  color: var(--ecor-mint-600);
  letter-spacing: .05em;
}

.text-primary { color: var(--ecor-mint-600) !important; }

.hero-section {
  position: relative;
  overflow: hidden;
}

.btn--primary {
  background: var(--ecor-mint-600); color: white;
  border: none;
  box-shadow: 0 10px 20px rgba(16,185,129,.2);
}
.btn--primary:hover {
  background: var(--ecor-mint-700);
  transform: translateY(-2px);
}

.btn--ghost {
  background: white; color: var(--ecor-ink-800);
  border: 1px solid var(--ecor-mint-200);
}
.btn--ghost:hover {
  background: var(--ecor-mint-50);
  border-color: var(--ecor-mint-300);
}

.hero-icon {
  width: 56px; height: 56px; border-radius: 14px;
  display: grid; place-items: center;
  background: var(--ecor-mint-100);
  font-size: 1.5rem; color: var(--ecor-mint-700);
}

.steps li {
  background: white;
  border: 1px solid var(--ecor-mint-100);
  padding: 1rem; border-radius: 12px;
  display: flex; align-items: center; gap: 1rem;
  transition: transform .2s ease;
}
.steps li:hover { transform: translateX(4px); border-color: var(--ecor-mint-300); }

.step-num {
  width: 32px; height: 32px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--ecor-mint-600); color: white;
  font-weight: 700; font-size: .9rem; flex-shrink: 0;
}

.info-card {
  background: white; border: 1px solid var(--ecor-mint-100);
  border-radius: 16px; padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,.03);
  transition: transform .2s ease, box-shadow .2s ease;
}
.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,.06);
}

.icn {
  width: 48px; height: 48px; border-radius: 12px;
  display: grid; place-items: center;
  background: var(--ecor-mint-50);
  margin-bottom: 1rem; font-size: 1.25rem; color: var(--ecor-mint-600);
}

.info-card h3 { font-weight: 700; margin-bottom: 0.75rem; color: var(--ecor-ink-900); }
.info-card p { color: var(--ecor-ink-600); line-height: 1.6; margin: 0; }

@media (max-width: 991px) {
  .display-3 { font-size: 2.5rem; }
}
</style>
