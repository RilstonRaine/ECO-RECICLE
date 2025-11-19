<template>
  <div class="container home-wrap">
    <!-- Banner/Informativo -->
    <InfoBanner
      titulo="Campanha • Outubro Verde"
      mensagem="Pontos de coleta com horário estendido e +20% de pontos para plásticos e eletrônicos até dia 30."
      cta-text="Regulamento"
      cta-href="https://www.gov.br/mma/pt-br"
      storage-key="ecor_info_banner_outubro"
      class="mb-20"
    />

    <!-- Breadcrumb/lead -->
    <p class="kicker">Descarte Sustentável</p>

    <div class="hero">
      <div class="hero__left">
        <h1 class="hero__title">
          Descarte Seus<br />
          Eletrônicos de Forma<br />
          Sustentável
        </h1>
        <p class="hero__desc">
          Evite impactos ambientais! Cadastre seus dispositivos eletrônicos e
          encontre o ponto de coleta mais próximo.
        </p>

        <div class="hero__actions">
          <router-link class="btn btn--primary" to="/cadastro-dispositivo">
            <i class="bi bi-recycle"></i>
            <span>Realizar Descarte</span>
          </router-link>

          <router-link class="btn btn--ghost" to="/pontos">
            <i class="bi bi-geo-alt"></i>
            <span>Visualizar Pontos de Descarte</span>
          </router-link>
        </div>
      </div>

      <div class="hero__right card glass">
        <div class="hero-icon">
          <i class="bi bi-recycle"></i>
        </div>
        <ol class="steps">
          <li><span>1</span> Cadastre seu dispositivo</li>
          <li><span>2</span> Encontre um ponto de coleta</li>
          <li><span>3</span> Contribua com o meio ambiente</li>
        </ol>
      </div>
    </div>

    <!-- Informativos -->
    <section class="info-grid">
      <article class="info-card">
        <div class="icn"><i class="bi bi-puzzle"></i></div>
        <h3>O que pode descartar?</h3>
        <p>
          Celulares, notebooks, tablets, cabos, carregadores, TVs, roteadores e
          eletroportáteis. Em dúvida, consulte o ponto de coleta.
        </p>
      </article>

      <article class="info-card">
        <div class="icn"><i class="bi bi-shield-lock"></i></div>
        <h3>Proteja seus dados</h3>
        <p>
          Restaure para as configurações de fábrica e remova cartões SIM e SD.
          Nos pontos, há orientação para limpeza segura.
        </p>
      </article>

      <article class="info-card">
        <div class="icn"><i class="bi bi-trophy"></i></div>
        <h3>Ganhe pontos</h3>
        <p>
          Receba pontos por peso e tipo de material. Acompanhe no dashboard e
          troque por recompensas quando atingir a meta do seu ponto.
        </p>
      </article>
    </section>
  </div>
</template>

<script setup>
import InfoBanner from '@/components/InfoBanner.vue'
</script>

<style scoped>
.home-wrap { padding-block: 18px 36px; }

.kicker {
  color: var(--ecor-ink-500);
  font-weight: 600;
  letter-spacing: .02em;
  margin: 6px 0 10px;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr .9fr;
  gap: 28px;
  align-items: center;
}
@media (max-width: 920px){ .hero { grid-template-columns: 1fr; } }

.hero__title {
  font-size: clamp(2rem, 4.2vw, 3.2rem);
  line-height: 1.08;
  color: var(--ecor-ink-900);
  margin: 6px 0 10px;
}
.hero__desc { font-size: 1.05rem; color: var(--ecor-ink-600); max-width: 48ch; }
.hero__actions { display: flex; gap: 12px; margin-top: 18px; }

.btn {
  display: inline-flex; align-items: center; gap: .55rem;
  border-radius: 12px; padding: .8rem 1.05rem; font-weight: 600;
  text-decoration: none; transition: .18s ease-in-out;
  border: 1px solid transparent;
}
.btn--primary {
  background: var(--ecor-mint-600); color: white;
  box-shadow: 0 12px 28px rgba(16,185,129,.18);
}
.btn--primary:hover { filter: brightness(.96); transform: translateY(-1px); }
.btn--ghost { background: white; color: var(--ecor-ink-800); border-color: var(--ecor-mint-200); }
.btn--ghost:hover { background: var(--ecor-mint-50); }

.hero__right { padding: 22px 22px 12px; }
.hero-icon {
  width: 62px; height: 62px; border-radius: 16px; display: grid; place-items: center;
  margin-bottom: 8px; background: var(--ecor-mint-100); font-size: 1.6rem; color: var(--ecor-mint-700);
}
.steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.steps li {
  background: white; border: 1px solid var(--ecor-mint-150);
  padding: .85rem 1rem; border-radius: 12px;
  display: flex; align-items: center; gap: .7rem; color: var(--ecor-ink-700);
}
.steps li span {
  width: 28px; height: 28px; border-radius: 10px; display: grid; place-items: center;
  background: var(--ecor-mint-600); color: white; font-weight: 700; font-size: .9rem;
}

.info-grid {
  display: grid; gap: 18px; grid-template-columns: repeat(3, 1fr); margin-top: 34px;
}
@media (max-width: 920px){ .info-grid { grid-template-columns: 1fr; } }

.info-card {
  background: white; border: 1px solid var(--ecor-mint-150); border-radius: 14px;
  padding: 18px 16px; box-shadow: 0 10px 24px rgba(2,6,4,.04);
}
.info-card .icn {
  width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center;
  background: var(--ecor-mint-50); margin-bottom: 8px; font-size: 1.1rem; color: var(--ecor-mint-700);
}
.info-card h3 { margin: 6px 0 6px; font-size: 1.05rem; color: var(--ecor-ink-900); }
.info-card p  { color: var(--ecor-ink-600); }
</style>
