<!-- src/views/Recompensas.vue -->
<template>
  <div class="container py-3">
    <!-- Título + botão -->
      <div class="d-flex align-items-center gap-2 mb-3">
        <h3 class="m-0">Recompensas</h3>

        <!-- só aparece para PJ PRO -->
        <button
          v-if="isPJ && isPro"
          class="btn btn--primary btn-sm"
          :disabled="!podeGerar"
          @click="abrirModalCriar"
        >
          Gerar recompensa
        </button>
      </div>

    <!-- Estado inicial/erro -->
    <div v-if="loadingUser" class="text-muted">Carregando...</div>
    <div v-else-if="!usuario" class="text-danger">Sessão não encontrada. Faça login novamente.</div>
    <div v-else>
      <div v-if="!isPro" class="alert alert-warning">
        Esta funcionalidade é exclusiva para assinantes <b>PRO</b>.
      </div>

      <!-- ================= PJ PRO ================= -->
      <template v-if="isPJ && isPro">
        <div class="row g-3">
          <!-- COL ESQUERDA -->
          <div class="col-lg-7">
            <!-- Filtro de período -->
            <div class="card-metric p-3">
              <div class="row g-2 align-items-end">
                <div class="col-sm-6">
                  <label class="form-label mb-1">De</label>
                  <input type="date" v-model="from" class="form-control" />
                </div>
                <div class="col-sm-6">
                  <label class="form-label mb-1">Até</label>
                  <input type="date" v-model="to" class="form-control" />
                </div>
              </div>
            </div>

            <!-- Ranking (Top 5) -->
            <div class="card-metric p-3 mt-3">
              <h6 class="mb-2">Ranking de pontuadores no período</h6>
              <div v-if="rankLoading" class="text-muted">Calculando ranking...</div>
              <div v-else-if="!ranking.length" class="text-muted">Sem descartes no período.</div>
              <div v-else class="table-responsive">
                <table class="table align-middle">
                  <thead>
                    <tr>
                      <th>Posição</th>
                      <th>Descartante</th>
                      <th class="text-end">Pontos no seu ponto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in ranking" :key="row.usuario_id">
                      <td>{{ i + 1 }}</td>
                      <td>{{ row.nome || ('Descartante #' + row.usuario_id) }}</td>
                      <td class="text-end">{{ row.pontos }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- COL DIREITA -->
          <div class="col-lg-5">
            <div class="card-metric p-3">
              <div class="d-flex align-items-center gap-2 mb-2">
                <h6 class="mb-0 flex-grow-1">Recompensas no período</h6>
                <select v-model="statusFiltro" class="form-select form-select-sm w-auto">
                  <option value="ativa">Ativas</option>
                  <option value="encerrada">Encerradas</option>
                  <option value="">Todas</option>
                </select>
              </div>

              <div v-if="minhasLoading" class="text-muted">Carregando...</div>
              <div v-else-if="!minhas.length" class="text-muted">Nenhuma recompensa criada.</div>

              <ul class="list-unstyled m-0" v-else>
                <li v-for="r in minhas" :key="r.id" class="p-2 border-bottom">
                  <div class="d-flex align-items-start justify-content-between">
                    <div>
                      <div class="fw-semibold">
                        {{ r.tipo === 'fisica' ? 'Física' : 'Digital' }}
                        <span class="badge ms-2" :class="r.status === 'ativa' ? 'bg-success' : 'bg-secondary'">
                          {{ r.status }}
                        </span>
                      </div>
                      <small class="text-muted d-block">
                        Pontos mínimos: {{ r.pontos_minimos }}<br>
                        Data limite: {{ formatDate(r.data_limite) }}<br>
                        Resgates: {{ r.resgates || 0 }} / {{ r.max_resgates }}<br>
                        <b>Disponíveis:</b> {{ r.vagas_restantes }}
                      </small>
                    </div>

                    <div class="ms-3">
                      <button
                        v-if="r.status === 'ativa'"
                        class="btn btn-sm btn-outline-danger"
                        :disabled="encerrando.has(r.id)"
                        @click="encerrarRecompensa(r)"
                        title="Encerrar esta recompensa"
                      >
                        {{ encerrando.has(r.id) ? 'Encerrando...' : 'Encerrar' }}
                      </button>
                    </div>
                  </div>

                  <div v-if="r.descricao" class="small mt-1 preline">{{ r.descricao }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Modal criar recompensa -->
        <div v-if="showModal" class="ecor-modal">
          <div class="ecor-backdrop" @click="fecharModal"></div>
          <div class="ecor-panel">
            <button class="ecor-close" @click="fecharModal">×</button>
            <h5 class="mb-3">Criar recompensa</h5>

            <div class="row g-2">
              <div class="col-12">
                <label class="form-label">Tipo</label>
                <div class="d-flex gap-3">
                  <label class="d-flex align-items-center gap-2">
                    <input type="radio" value="fisica" v-model="form.tipo"> Física
                  </label>
                  <label class="d-flex align-items-center gap-2">
                    <input type="radio" value="digital" v-model="form.tipo"> Digital
                  </label>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Pontos necessários</label>
                <input type="number" min="1" class="form-control" v-model.number="form.pontos_minimos">
              </div>

              <div class="col-md-6">
                <label class="form-label">Data limite</label>
                <input type="date" class="form-control" v-model="form.data_limite">
              </div>

              <div class="col-md-6">
                <label class="form-label">Qtde de usuários (máx. resgates)</label>
                <input type="number" min="1" class="form-control" v-model.number="form.max_resgates">
              </div>

              <div class="col-12">
                <label class="form-label">Descrição (opcional)</label>
                <textarea class="form-control" rows="2" v-model="form.descricao" placeholder="Ex.: Vale-brinde, cupom, etc."></textarea>
              </div>
            </div>

            <div class="mt-3 d-flex gap-2">
              <button class="btn btn--primary" :disabled="saving" @click="criarRecompensa">
                {{ saving ? 'Salvando...' : 'Salvar' }}
              </button>
              <button class="btn btn--ghost" @click="fecharModal">Cancelar</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ================= PF PRO (inalterado) ================= -->
      <template v-else-if="isPF && isPro">
        <div class="card-metric p-3">
          <h6 class="mb-3">Recompensas disponíveis</h6>
          <div v-if="ativasLoading" class="text-muted">Carregando...</div>
          <div v-else-if="!ativas.length" class="text-muted">Nenhuma recompensa ativa no momento.</div>

          <div class="row g-3">
            <div class="col-md-6 col-lg-4" v-for="r in ativas" :key="r.id">
              <div class="reward-card">
                <div class="reward-card__head">
                  <div class="fw-semibold">{{ r.pj?.nome || ('Ponto #' + r.pj_id) }}</div>
                  <small class="text-muted d-block">
                    {{ r.pj?.endereco || r.pj?.cidade || '—' }}
                  </small>
                </div>

                <div class="reward-card__hover">
                  <div class="mb-2">
                    <div><b>Recompensa disponível</b></div>
                    <div>Tipo: {{ r.tipo === 'fisica' ? 'Física' : 'Digital' }}</div>
                    <div>Pontos mínimos: {{ r.pontos_minimos }}</div>
                    <div>Data limite: {{ formatDate(r.data_limite) }}</div>
                    <div v-if="r.descricao" class="preline">Descrição: {{ r.descricao }}</div>
                  </div>
                  <button class="btn btn--primary btn-sm" @click="resgatar(r)" :disabled="resgatando.has(r.id)">
                    Resgatar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="msg" class="alert mt-3" :class="msgType === 'ok' ? 'alert-success' : 'alert-warning'">
            {{ msg }}
          </div>
        </div>
      </template>

      <!-- Quem não é PRO -->
      <template v-else>
        <div class="alert alert-info">Faça o upgrade para o plano PRO para acessar recompensas.</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import store from '@/store'
import { recompensasApi, usuariosApi } from '@/services/api'
import { getLicencaCached } from '@/services/licenca'

/* ================= helpers ================= */
function isProAtivo(lic) {
  if (!lic) return false
  const planoOk = lic.plano === 'pro'
  const ate = lic.pro_ativo_ate ? Date.parse(lic.pro_ativo_ate) : 0
  return planoOk && (lic.pro_ativo === true || (ate && ate > Date.now()))
}
function formatDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  return Number.isNaN(+dt) ? String(d) : dt.toLocaleDateString()
}

/* ================= estado usuário ================= */
const loadingUser = ref(true)
const usuario = ref(null)
const licenca = ref(null)

const isPF = computed(() => usuario.value?.tipo_usuario === 'descartante')
const isPJ = computed(() => usuario.value?.tipo_usuario === 'ponto_coleta')
const isPro = computed(() => isProAtivo(licenca.value))
const podeGerar = computed(() => isPJ.value && isPro.value)

/* ================= filtros período (PJ) ================= */
const today = new Date()
const defaultFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30).toISOString().slice(0,10)
const defaultTo   = today.toISOString().slice(0,10)
const from = ref(defaultFrom)
const to   = ref(defaultTo)
const statusFiltro = ref('ativa') // ativas | encerrada | ''(todas)

/* ==================== PJ: ranking + minhas recompensas ==================== */
const rankLoading = ref(false)
const ranking = ref([])

async function montarRanking() {
  if (!isPJ.value) return
  rankLoading.value = true
  ranking.value = []
  try {
    const { data } = await recompensasApi.leaderboardPJ({
      from: from.value,
      to: to.value,
      limit: 5
    })
    ranking.value = data?.ranking || []
  } catch (e) {
    console.error('[ranking]', e)
  } finally {
    rankLoading.value = false
  }
}

const minhas = ref([])
const minhasLoading = ref(false)
async function carregarMinhas() {
  if (!isPJ.value) return
  minhasLoading.value = true
  try {
    const params = { from: from.value, to: to.value }
    if (statusFiltro.value) params.status = statusFiltro.value
    const { data } = await recompensasApi.minhasPJ(params)
    minhas.value = data || []
  } catch (e) {
    console.error('[minhas recompensas]', e)
    minhas.value = []
  } finally {
    minhasLoading.value = false
  }
}
watch([from, to, statusFiltro], () => { montarRanking(); carregarMinhas() })

/* Encerrar */
const encerrando = ref(new Set())
async function encerrarRecompensa(r) {
  if (!confirm('Encerrar esta recompensa? Ela deixará de aparecer para os descartantes.')) return;
  try {
    encerrando.value.add(r.id)
    await recompensasApi.encerrar(r.id)
    await carregarMinhas()
  } catch (e) {
    console.error('[encerrar recompensa]', e)
    alert(e?.response?.data?.message || 'Falha ao encerrar recompensa')
  } finally {
    encerrando.value.delete(r.id)
  }
}

/* Modal criar recompensa */
const showModal = ref(false)
const saving = ref(false)
const form = ref({
  tipo: 'digital',
  pontos_minimos: null,
  data_limite: '',
  max_resgates: 1,
  descricao: ''
})
function abrirModalCriar() {
  if (!podeGerar.value) {
    const msg = !isPJ.value
      ? 'Disponível apenas para contas de Ponto de Coleta (PJ).'
      : 'Sua licença PRO não está ativa. Verifique seu plano.'
    alert(msg)
    return
  }
  form.value = { tipo: 'digital', pontos_minimos: null, data_limite: '', max_resgates: 1, descricao: '' }
  showModal.value = true
}
function fecharModal() { showModal.value = false }
async function criarRecompensa() {
  try {
    if (!form.value.pontos_minimos || form.value.pontos_minimos < 1) {
      return alert('Informe os pontos mínimos (>= 1).')
    }
    if (!form.value.data_limite) {
      return alert('Informe a data limite.')
    }
    saving.value = true
    await recompensasApi.criar({
      tipo: form.value.tipo,
      pontos_minimos: form.value.pontos_minimos,
      data_limite: form.value.data_limite,
      max_resgates: form.value.max_resgates,
      descricao: form.value.descricao || null
    })
    showModal.value = false
    await carregarMinhas()
  } catch (e) {
    console.error('[criar recompensa]', e)
    alert(e?.response?.data?.message || e.message || 'Erro ao criar recompensa')
  } finally {
    saving.value = false
  }
}

/* ==================== PF: recompensas ativas ==================== */
const ativas = ref([])
const ativasLoading = ref(false)
const msg = ref('')
const msgType = ref('ok')
const resgatando = ref(new Set())

async function refreshPerfilUsuario() {
  try {
    const { data } = await usuariosApi.me()
    usuario.value = data
    try {
      const authLS = JSON.parse(localStorage.getItem('auth') || '{}')
      localStorage.setItem('auth', JSON.stringify({ ...authLS, usuario: data }))
    } catch {}
  } catch (e) {
    console.error('[refresh perfil]', e)
  }
}

async function carregarAtivas(preserveMsg = false) {
  if (!isPF.value) return
  ativasLoading.value = true
  if (!preserveMsg) msg.value = ''
  try {
    const { data } = await recompensasApi.listarAtivas()
    ativas.value = data || []
  } catch (e) {
    console.error('[recompensas ativas]', e)
    ativas.value = []
  } finally {
    ativasLoading.value = false
  }
}
async function resgatar(r) {
  try {
    resgatando.value.add(r.id)
    await recompensasApi.resgatar(r.id)
    ativas.value = ativas.value.filter(item => item.id !== r.id)
    msgType.value = 'ok'
    msg.value =
      r.tipo === 'digital'
        ? 'Parabéns, enviamos os detalhes da sua recompensa para seu e-mail cadastrado.'
        : 'Parabéns, desloque-se até o ponto de coleta para receber a recompensa. Os detalhes desse resgate foram enviados para seu e-mail cadastrado.'
    await refreshPerfilUsuario()
  } catch (e) {
    msgType.value = 'warn'
    const serverMsg = e?.response?.data?.message
    msg.value = serverMsg || 'Não foi possível resgatar. Verifique seus pontos nesse ponto de coleta e a data limite.'
  } finally {
    resgatando.value.delete(r.id)
  }
}

/* ==================== Mount ==================== */
onMounted(async () => {
  try {
    const authLS = JSON.parse(localStorage.getItem('auth') || '{}')
    usuario.value = store?.state?.usuario ?? store?.usuario ?? authLS?.usuario ?? null
  } catch { usuario.value = null }

  try {
    licenca.value = await getLicencaCached()
  } catch { licenca.value = null }

  loadingUser.value = false

  if (isPJ.value && isPro.value) {
    await Promise.all([montarRanking(), carregarMinhas()])
  }
  if (isPF.value && isPro.value) {
    await carregarAtivas()
  }
})
</script>

<style scoped>
.reward-card{
  position: relative;
  border: var(--border-soft, 1px solid rgba(2,6,23,.06));
  border-radius: 14px;
  background: #fff;
  padding: 12px;
  overflow: hidden;
  transition: transform .15s ease, box-shadow .15s ease;
}
.reward-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(16,24,40,.12);
}
.reward-card__head{ min-height: 68px; }
.reward-card__hover{
  margin-top: 8px;
  border-top: 1px dashed rgba(2,6,23,.12);
  padding-top: 8px;
}
.preline { white-space: pre-line; }

/* pequenos ajustes visuais */
.card-metric { background:#fff; border-radius:14px; box-shadow:0 2px 16px rgba(16,24,40,.06); }
</style>
