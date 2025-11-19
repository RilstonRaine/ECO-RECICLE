<template>
  <div v-if="ui.proModal.visible" class="pro-modal">
    <div class="backdrop" @click="close"></div>

    <div class="panel">
      <button class="close" @click="close" aria-label="Fechar">×</button>

      <h3 class="title">Desbloqueie o <span>EcoRecicle PRO</span></h3>
      <p class="subtitle">
        Sua licença atual é <strong>FREE</strong>. Para acessar
        <strong>{{ labelRecurso }}</strong>, assine o PRO agora e ganhe:
      </p>

      <ul class="benefits">
        <li>Relatórios (PDF/Excel) com filtros</li>
        <li v-if="souPF">Resgate de recompensas</li>
        <li v-else>Geração de recompensas</li>
        <li>Suporte prioritário</li>
      </ul>

      <form @submit.prevent="assinar" class="form" novalidate>
        <!-- linha inteira -->
        <div class="field full">
          <label>Número do cartão</label>
          <input
            v-model.trim="card.number"
            inputmode="numeric"
            placeholder="0000 0000 0000 0000"
            required
          />
        </div>

        <!-- 3 colunas (Nome / Validade / CVV) -->
        <div class="field grid3">
          <div>
            <label>Nome impresso</label>
            <input v-model.trim="card.name" placeholder="NOME SOBRENOME" required />
          </div>
          <div>
            <label>Validade</label>
            <input v-model.trim="card.exp" placeholder="MM/AA" required />
          </div>
          <div>
            <label>CVV</label>
            <input v-model.trim="card.cvv" inputmode="numeric" placeholder="123" required />
          </div>
        </div>

        <button class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Ativando…' : 'Assinar PRO agora' }}
        </button>

        <div class="price">R$ <strong>12,90</strong> / mês • cancele quando quiser</div>
        <div class="disclaimer">Simulação de pagamento (teste). Nenhuma cobrança real será feita.</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ui from '@/store/ui'
import store from '@/store'
import { upgradePro, clearLicencaCache, getLicencaCached } from '@/services/licenca'

const router = useRouter()
const loading = ref(false)
const card = reactive({ number: '', name: '', exp: '', cvv: '' })

const usuario = computed(() => store?.state?.usuario ?? store?.usuario ?? JSON.parse(localStorage.getItem('auth')||'{}')?.usuario)
const souPF = computed(() => usuario.value?.tipo_usuario === 'descartante')
const labelRecurso = computed(() => ui.proModal.reason === 'rewards' ? 'Recompensas' : 'Relatórios')

function close() { ui.closeProModal() }

function validateCard() {
  if (!/^\d{13,19}$/.test(card.number.replace(/\s+/g, ''))) return 'Número do cartão inválido'
  if (!/^[A-Z][A-Z ]{2,}$/.test(card.name.toUpperCase())) return 'Nome inválido'
  if (!/^\d{2}\/\d{2}$/.test(card.exp)) return 'Validade inválida'
  if (!/^\d{3,4}$/.test(card.cvv)) return 'CVV inválido'
  return null
}

async function assinar() {
  const err = validateCard()
  if (err) { alert(err); return }
  try {
    loading.value = true
    await upgradePro(30)
    clearLicencaCache()
    await getLicencaCached({ force: true })
    close()
    if (ui.proModal.after) router.push(ui.proModal.after)
    else router.push('/')
    alert('PRO ativado! Aproveite os recursos avançados 😊')
  } catch (e) {
    console.error(e)
    alert('Não foi possível ativar o PRO.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* garante cálculos corretos e evita estouro */
*, *::before, *::after { box-sizing: border-box; }

.pro-modal { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; }

.backdrop {
  position: absolute;
  inset: 0;
  /* escurece um pouco e permite o blur */
  background: rgba(15, 23, 42, 0.35);          /* fallback se o blur não existir */
  backdrop-filter: blur(6px) saturate(0.9);     /* blur real */
  -webkit-backdrop-filter: blur(6px) saturate(0.9); /* Safari */
}

/* opcional: animação de entrada do painel */
.panel {
  /* ...seus estilos já existentes... */
  animation: proPop .14s ease-out;
}

@keyframes proPop {
  from { transform: scale(.98); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.panel {
  position: relative;
  width: min(720px, calc(100vw - 32px)); /* margens seguras */
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(16,24,40,.18);
  padding: 22px;
  overflow: hidden;
}

.close { position: absolute; top: 10px; right: 12px; border: 0; background: transparent; font-size: 24px; cursor: pointer; }

.title { margin: 0 0 6px; font-weight: 800; line-height: 1.2; }
.title span { color: var(--ecor-mint-600, #12b886); }
.subtitle { margin: 0 0 8px; color: #444; }
.benefits { margin: 6px 0 16px; padding-left: 18px; }

.form { display: grid; gap: 12px; }

/* ==== NOVAS CLASSES (evita conflito com Bootstrap .row) ==== */
.field { display: grid; gap: 6px; margin: 0; }
.field.full { width: 100%; }

.field.grid3 {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr; /* mobile-first */
}

@media (min-width: 640px) {
  .field.grid3 {
    grid-template-columns:
      minmax(0, 1fr)         /* Nome */
      minmax(110px, 160px)   /* Validade */
      minmax(84px, 120px);   /* CVV   */
  }
}

.field label { font-size: .92rem; font-weight: 600; }
.field input {
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 10px;
  padding: .55rem .7rem;
  display: block;
}

.btn-primary {
  background: var(--ecor-mint-600, #12b886);
  color: #fff; border: none; border-radius: 12px;
  padding: .7rem 1rem; font-weight: 700; width: 100%; cursor: pointer;
}
.btn-primary:disabled { opacity: .7; cursor: wait; }

.price { text-align: center; margin-top: 8px; font-size: .95rem; }
.disclaimer { text-align: center; color: #6b7280; font-size: .85rem; margin-top: 4px; }
</style>
