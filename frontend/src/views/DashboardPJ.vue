<template>
  <div class="container-fluid px-4 py-4">
    <h3 class="mb-4 fw-bold">Ponto de Coleta</h3>

    <!-- ===== Cards ===== -->
    <!-- Filtro simples (estilo DashboardPF) -->
    <div class="row g-2 align-items-end mb-4">
      <div class="col-6 col-md-auto">
        <label class="form-label mb-1 fw-semibold">De</label>
        <input type="date" v-model="from" class="form-control" />
      </div>
      <div class="col-6 col-md-auto">
        <label class="form-label mb-1 fw-semibold">Até</label>
        <input type="date" v-model="to" class="form-control" />
      </div>
      <div class="col-12 col-md-auto d-flex gap-2">
        <button class="btn btn-primary w-100 w-md-auto" @click="aplicarFiltro" :disabled="loading">Aplicar</button>
        <button class="btn btn-outline-secondary w-100 w-md-auto" @click="limparFiltro" :disabled="(!from && !to) || loading">
          Limpar
        </button>
      </div>
    </div>

    <!-- ===== Cards ===== -->
    <div class="row g-3 align-items-stretch mb-4">
      <!-- 1) Descartes -->
      <div class="col-12 col-sm-6 col-xl-4">
        <Card titulo="Descartes" :valor="descartesCount" />
      </div>

      <!-- 2) Peso total (kg) -->
      <div class="col-12 col-sm-6 col-xl-4">
        <Card titulo="Peso total (kg)" :valor="pesoTotalFiltrado.toFixed(2)" />
      </div>

      <!-- 3) CO₂ evitado (kg) -->
      <div class="col-12 col-sm-6 col-xl-4">
        <Card titulo="CO₂ evitado (kg)" :valor="co2TotalFiltrado.toFixed(2)" />
      </div>
    </div>

    <div class="row g-4">
      <!-- Gráfico: Peso por tipo -->
      <div class="col-12 col-lg-6 col-xl-5">
        <div class="card-metric p-4 h-100">
          <h5 class="mb-3 fw-bold">Peso por tipo de resíduo</h5>
          <GraficoBarras :labels="barLabels" :data="barSeries" />
        </div>
      </div>

      <!-- Últimos 5 descartes -->
      <div class="col-12 col-lg-6 col-xl-7">
        <div class="card-metric p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0 fw-bold">Últimos descartes recebidos</h5>
          </div>

          <ul v-if="ultimos.length" class="list-unstyled m-0">
            <li
              v-for="d in ultimos"
              :key="d.id"
              class="py-3 border-bottom d-flex align-items-center justify-content-between gap-3"
            >
              <div class="min-w-0">
                <div class="fw-semibold text-truncate fs-5">
                  {{ nomeDescartante(d) }}
                </div>
                <div class="text-muted small text-truncate">
                  {{ formatDate(getDate(d)) }} • {{ d.tipo_residuo }}
                </div>
              </div>

              <button type="button" class="btn btn-details btn-sm text-nowrap" @click="abrirDetalhe(d.id)">
                Detalhes
              </button>
            </li>
          </ul>

          <div v-else class="text-muted py-5 text-center">Sem entradas no período.</div>
        </div>
      </div>
    </div>

      <!-- ===== Modal de detalhes ===== -->
      <div v-if="showModal" class="ecor-modal">
        <div class="ecor-backdrop" @click="closeModal"></div>
        <div class="ecor-panel">
          <button class="ecor-close" @click="closeModal">×</button>
          <h5 class="mb-3">Detalhes do descarte</h5>

          <div class="ecor-detail-grid">
            <dl v-if="detalhe" class="row g-2 m-0">
              <dt class="col-4">Descartante</dt><dd class="col-8">{{ detalhe.usuario?.nome || nomesPF[detalhe.usuario_id] }}</dd>
              <dt class="col-4">Data</dt><dd class="col-8">{{ formatDate(detalhe.data_registro, true) }}</dd>
              <dt class="col-4">Ponto de coleta</dt><dd class="col-8">{{ detalhe.ponto?.nome }}</dd>
              <dt class="col-4">Tipo</dt><dd class="col-8">{{ detalhe.tipo_residuo }}</dd>
              <dt class="col-4">Qtd. itens</dt><dd class="col-8">{{ detalhe.quantidade_itens }}</dd>
              <dt class="col-4">Peso por item</dt><dd class="col-8">{{ detalhe.peso_por_item_kg }} kg</dd>
              <dt class="col-4">Peso total</dt><dd class="col-8">{{ detalhe.peso_kg }} kg</dd>
              <dt class="col-4">Pontos (PF)</dt><dd class="col-8">{{ detalhe.pontos_gerados }}</dd>
              <dt class="col-4">CO₂ evitado</dt><dd class="col-8">{{ detalhe.co2_evitar_kg }} kg</dd>
            </dl>

           
            <!-- Coluna de ações à direita -->
            <div v-if="detalhe" class="ecor-actions">
              <button class="ecor-attach-btn" type="button" @click="openAnexos">
                Anexos
              </button>

              <button
                class="ecor-report-btn"
                type="button"
                @click="reportarProblemaDescarte"
                :disabled="reporting"
                title="Reportar problema neste descarte"
              >
                Reportar problema
              </button>
            </div>

            <div v-else>Carregando…</div>
          </div>
        </div>
      </div>



    <!-- ===== Modal de Anexos ===== -->
    <div v-if="showAnexos" class="ecor-modal">
      <div class="ecor-backdrop" @click="closeAnexos"></div>

      <div class="ecor-panel anx-cards">
        <button class="ecor-close" @click="closeAnexos">×</button>

        <h5 class="mb-3 d-flex align-items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 19V7a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" fill="currentColor" opacity=".12"/>
            <path d="M8 13l2.5 3.01 3.5-4.51L18 17H6l2-4Z" fill="currentColor"/>
          </svg>
          Anexos do descarte
        </h5>

        <div v-if="anexos.length" class="anx-gridCards">
          <figure v-for="(src, i) in anexos" :key="i" class="anx-card2">
            <img :src="src" :alt="`Anexo ${i+1}`" class="anx-img2" @click="openFull(src)" />
            <button
              type="button"
              class="btn btn-primary anx-btnDl"
              @click="baixar(src, `descarte_${detalhe?.id}_anexo_${i+1}.jpg`)"
            >
              Baixar
            </button>
          </figure>
        </div>

        <div v-else class="text-muted">Nenhum anexo disponível para este descarte.</div>
      </div>
    </div>

        <!-- ===== Modal de Auditorias ===== -->
        <div v-if="showAuditModal" class="ecor-modal">
          <div class="ecor-backdrop" @click="closeAuditModal"></div>
          <div class="ecor-panel">
            <button class="ecor-close" @click="closeAuditModal">×</button>
            <h5 class="mb-3">Auditorias - Descarte</h5>

            <ul v-if="auditorias.length" class="audit-list list-unstyled m-0">
      <li v-for="audit in auditorias" :key="audit.id" class="audit-item">
        <div class="audit-text">
          <div class="fw-semibold text-truncate">
            Descarte #{{ audit.descarte_id }}
            <span class="audit-status"
                  :class="'audit-status--' + (audit.status || 'pendente').toString().toLowerCase()">
              {{ audit.status }}
            </span>
          </div>
          <small class="text-muted d-block mt-1 text-truncate">
            {{ audit.descricao || '—' }}
          </small>
        </div>

        <div class="audit-actions">
          <button class="ecor-btn ecor-attach-btn ecor-btn--sm"
                  @click="visualizarFotos(audit)">
            Visualizar fotos
          </button>
          <button class="ecor-btn ecor-report-btn ecor-btn--sm"
                  @click="reportarProblema(audit)">
            Reportar problema
          </button>
        </div>
      </li>
    </ul>

        <div v-else>Sem auditorias encontradas.</div>
      </div>
    </div>
    
    <!-- ===== Modal de Reportar Problema ===== -->
    <div v-if="showReportModal" class="ecor-modal">
      <div class="ecor-backdrop" @click="closeReportModal"></div>
      <div class="ecor-panel">
        <button class="ecor-close" @click="closeReportModal">×</button>
        <h5 class="mb-3">Reportar Problema</h5>
        
        <p class="text-muted mb-3">
          Descreva o problema encontrado neste descarte. O descartante será notificado.
        </p>

        <textarea
          v-model="reportDescription"
          class="form-control mb-3"
          rows="4"
          placeholder="Ex: O material entregue não corresponde ao informado..."
        ></textarea>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="closeReportModal" :disabled="reporting">
            Cancelar
          </button>
          <button class="btn btn-danger" @click="submitReport" :disabled="reporting || !reportDescription.trim()">
            <span v-if="reporting">Enviando...</span>
            <span v-else>Enviar Reporte</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import Card from '@/components/Card.vue'
import GraficoBarras from '@/components/GraficoBarras.vue'
import store from '@/store'
import { descartesApi, usuariosApi, auditoriaApi } from '@/services/api'

const toast = useToast()
const router = useRouter()

// ==== Usuário / contexto ====
const authLS = JSON.parse(localStorage.getItem('auth') || '{}')
const usuario = store?.state?.usuario ?? store?.usuario ?? authLS?.usuario ?? null
const pontoId = computed(() =>
  usuario?.ponto_coleta_id ?? usuario?.ponto_id ?? usuario?.empresa?.ponto_id ?? null
)

// ==== Estado ====
const entradas = ref([])        
const nomesPF  = ref({})        
const showModal = ref(false)
const showAuditModal = ref(false)
const showReportModal = ref(false)
const reportDescription = ref('')
const detalhe = ref(null)
const auditorias = ref([])
const loading = ref(false)
const reporting = ref(false)
// Filtro
const from = ref('')
const to   = ref('')

  
// ==== Lifecycle ====
onMounted(async () => {
  if (!usuario) return router.push('/login')
  await Promise.all([aplicarFiltro(), carregarDescartantes(), carregarAuditorias()])
})

// ==== Backend fetchers ====
// Tenta pedir já filtrado por ponto + include de joins.
// Se a API não aceitar, cai no fallback sem params e filtra no client.
async function carregarEntradas(opts = {}) {
  try {
    loading.value = true
    const params = { include: 'usuario,ponto' }

    if (pontoId.value) params.ponto_id = pontoId.value
    if (opts.from) params.from = opts.from
    if (opts.to)   params.to   = opts.to

    try {
      const res = await descartesApi.listar({ params })
      entradas.value = res.data || []
      return
    } catch (e) {
      // fallback: sem params
      const res = await descartesApi.listar()
      entradas.value = res.data || []
      console.warn('[listar filtrado indisponível — client-side]', e)
    }
  } catch (e) {
    toast.error('Não foi possível carregar as entradas.')
  } finally {
    loading.value = false
  }
}

// nomes de descartantes (opcional)
async function carregarDescartantes () {
  try {
    const { data } = await usuariosApi.listar({ params: { tipo: 'descartante', limit: 1000 } })
    const map = {}
    ;(data || []).forEach(u => { map[u.id] = u.nome || `PF #${u.id}` })
    nomesPF.value = map
  } catch (e) {
    console.warn('[usuariosApi.listar descartante] falhou', e)
  }
}

// auditorias (opcional)
async function carregarAuditorias() {
  try {
    const { data } = await auditoriaApi.listarAuditorias()
    auditorias.value = data || []
  } catch (e) {
    console.warn('[auditoriaApi] falhou', e)
  }
}

// ==== Filtro ====
function parseLocalDate(dstr) {
  if (!dstr) return null
  const d = new Date(`${dstr}T00:00:00`)
  return isNaN(d) ? null : d
}
function endOfDay(d) { const e = new Date(d); e.setHours(23,59,59,999); return e }
function toIsoOrUndef(dt) { return dt ? dt.toISOString() : undefined }

async function aplicarFiltro() {
  const f = parseLocalDate(from.value)
  const t = to.value ? endOfDay(parseLocalDate(to.value)) : null
  if (f && t && t < f) {
    toast.error('Período inválido: "Até" é anterior a "De".')
    return
  }
  await carregarEntradas({ from: toIsoOrUndef(f), to: toIsoOrUndef(t) })
}

async function limparFiltro () {
  from.value = ''; to.value = ''
  await carregarEntradas()
}

// ==== Helpers de data/derivados ====
function getDate(d) { return d?.data_registro || d?.created_at || d?.data }
function formatDate (d, withTime = false) {
  if (!d) return '—'
  const dt = (d instanceof Date) ? d : new Date(d)
  return withTime ? dt.toLocaleString() : dt.toLocaleDateString()
}

function pesoLinha (d) {
  const direto = Number(d.peso_kg)
  if (!isNaN(direto) && direto > 0) return direto
  const q = Number(d.quantidade_itens || 0)
  const p = Number(d.peso_por_item_kg || 0)
  return Number((q * p).toFixed(3)) || 0
}

// coleção filtrada (client-side fallback)
const filtradas = computed(() => {
  const f = parseLocalDate(from.value)
  const t = to.value ? endOfDay(parseLocalDate(to.value)) : null
  return entradas.value.filter(d => {
    const dt = new Date(getDate(d))
    if (f && dt < f) return false
    if (t && dt > t) return false
    // se houver pontoId, garante que o registro é do ponto
    if (pontoId.value && (d.ponto_coleta_id ?? d.ponto_id) != pontoId.value) return false
    return true
  })
})

// métricas
const descartesCount = computed(() => filtradas.value.length)
const pesoTotalFiltrado = computed(() => filtradas.value.reduce((acc, d) => acc + pesoLinha(d), 0))
const co2TotalFiltrado = computed(() =>
  filtradas.value.reduce((acc, d) => acc + (Number(d.co2_evitar_kg) || pesoLinha(d) * 0.48), 0)
)

// gráfico de barras
const barLabels = computed(() => {
  const map = new Map()
  filtradas.value.forEach(d => {
    const tipo = d.tipo_residuo || 'Outros'
    map.set(tipo, (map.get(tipo) || 0) + pesoLinha(d))
  })
  return [...map.keys()]
})
const barSeries = computed(() =>
  barLabels.value.map(lbl =>
    Number(
      filtradas.value
        .filter(d => (d.tipo_residuo || 'Outros') === lbl)
        .reduce((acc, d) => acc + pesoLinha(d), 0)
        .toFixed(2)
    )
  )
)

// últimos 5
const ultimos = computed(() =>
  filtradas.value
    .slice()
    .sort((a, b) => new Date(getDate(b)) - new Date(getDate(a)))
    .slice(0, 5)
)

const descartantesCache = ref(new Map())
const fetchInFlight = new Set()

function nomeDescartante(d) {
  return d?.usuario?.nome
      || d?.usuario_nome
      || descartantesCache.value.get(d?.usuario_id)
      || nomesPF.value[d?.usuario_id]
      || `Descartante #${d?.usuario_id ?? ''}`
}

async function hydrateDescartantes(list) {
  const missing = (list || []).filter(d =>
    !d?.usuario?.nome &&
    !d?.usuario_nome &&
    d?.usuario_id &&
    !descartantesCache.value.get(d.usuario_id) &&
    !fetchInFlight.has(d.id)
  )
  for (const d of missing) {
    fetchInFlight.add(d.id)
    try {
      const { data } = await descartesApi.detalhe(d.id)
      const uid  = data?.usuario?.id ?? data?.usuario_id
      const nome = data?.usuario?.nome
      if (uid && nome) descartantesCache.value.set(uid, nome)
    } catch {}
    finally { fetchInFlight.delete(d.id) }
  }
}
watch(ultimos, (arr) => { hydrateDescartantes(arr) }, { immediate: true })

async function abrirDetalhe (id) {
  showModal.value = true
  detalhe.value = null
  try {
    const { data } = await descartesApi.detalhe(id)
    detalhe.value = data
    const uid  = data?.usuario?.id ?? data?.usuario_id
    const nome = data?.usuario?.nome
    if (uid && nome) descartantesCache.value.set(uid, nome)
  } catch {
    showModal.value = false
    toast.error('Falha ao obter detalhes do descarte.')
  }
}
function closeModal () { showModal.value = false }

async function visualizarFotos(audit){ console.log(audit) }
async function reportarProblema(audit){
  await auditoriaApi.reportarProblema(audit.descarte_id, 'Problema reportado no descarte.')
  toast.success('Problema reportado com sucesso.')
}

const showAnexos = ref(false)

const anexos = computed(() => {
  if (!detalhe.value) return []
  const arr = detalhe.value.anexos_signed || detalhe.value.anexos_urls
  if (Array.isArray(arr) && arr.length) return arr.filter(Boolean)

  const item  = detalhe.value.foto_item_signed  || detalhe.value.foto_item_url  || detalhe.value.foto_item
  const local = detalhe.value.foto_local_signed || detalhe.value.foto_local_url || detalhe.value.foto_local
  return [item, local].filter(Boolean)
})

function openAnexos () {
  if (!anexos.value.length) {
    toast.info('Este descarte não possui anexos.')
    return
  }
  showAnexos.value = true
}
function closeAnexos () { showAnexos.value = false }
function openFull (src) { window.open(src, '_blank', 'noopener') }

async function baixar (url, filename) {
  try {
    const resp = await fetch(url, { credentials: 'omit' })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const blob = await resp.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename || 'anexo'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (e) {
    console.error('[download anexo]', e)
    toast.error('Não foi possível baixar o arquivo.')
  }
}

async function reportarProblemaDescarte() {
  if (!detalhe.value?.id) return
  showReportModal.value = true
  reportDescription.value = ''
}

function closeReportModal() {
  showReportModal.value = false
  reportDescription.value = ''
}

async function submitReport() {
  if (!detalhe.value?.id || !reportDescription.value.trim()) return

  try {
    reporting.value = true
    await auditoriaApi.reportarProblema(detalhe.value.id, reportDescription.value)
    
    toast.success('Problema Registrado, o descartante foi notificado e em até 72 horas nossa equipe de suporte retornará o contato através do e-mail cadastrado', {
      timeout: 8000
    })
    
    closeReportModal()
  } catch (e) {
    // ... erro
  } finally {
    reporting.value = false
  }
}

</script>

<style scoped>
:root{
  --mint:#12b886; --mint-700:#0fae79;
  --amber:#f59e0b; --amber-700:#ea9405;
  --shadow-card:0 6px 16px rgba(16,24,40,.05);
  --shadow-panel:0 24px 48px rgba(16,24,40,.18);
}

.card-metric{
  border:1px solid rgba(16,24,40,.06);
  border-radius:12px;
  background:#fff;
  box-shadow:var(--shadow-card);
}
.link-like{ background:none; border:0; color:var(--mint); font-weight:600; cursor:pointer }

.btn-details{
  background:#12b886 !important;
  color:#fff !important;
  border:0; border-radius:12px;
  padding:.42rem .8rem;
  font-weight:600; line-height:1;
  display:inline-flex; align-items:center; justify-content:center; gap:.4rem;
  box-shadow:0 2px 10px rgba(0,0,0,.08);
  transition:transform .08s ease, box-shadow .2s ease, filter .2s ease, background-color .2s ease;
}
.btn-details:hover{ filter:brightness(.97); box-shadow:0 3px 12px rgba(0,0,0,.12) }
.btn-details:active{ transform:translateY(1px); background:#0fae79 !important }
.btn-details:disabled{ opacity:.6; cursor:not-allowed }

.ecor-detail-grid{
  display:grid;
  grid-template-columns:minmax(0,1fr) 240px;
  column-gap:20px;
  align-items:stretch;
}

.ecor-actions{
  justify-self:end;
  width:240px; min-width:240px;
  display:flex; flex-direction:column;
  align-items:stretch; justify-content:flex-end;
  gap:10px;
}

.ecor-actions > .ecor-attach-btn,
.ecor-actions > .ecor-report-btn{
  display:block;
  width:100%;
  text-align:center;
  border-radius:10px; border:0;
  padding:.36rem .66rem;
  font-size:.86rem; line-height:1;
  background-image:none !important;
  color:#fff !important;
  box-shadow:0 2px 10px rgba(0,0,0,.08);
  transition:transform .08s ease, box-shadow .2s ease, filter .2s ease, background-color .2s ease;
}

.ecor-attach-btn{ background:#12b886 !important; position:relative; }
.ecor-attach-btn:hover{ filter:brightness(.97); box-shadow:0 3px 12px rgba(0,0,0,.12) }
.ecor-attach-btn:active{ background:#0fae79 !important }

.ecor-attach-btn .badge{
  position:absolute; top:-4px; right:-4px;
  border-radius:9999px; padding:.14rem .34rem;
  background:#4b5563; color:#fff; font-weight:700; font-size:.72rem;
  box-shadow:0 2px 8px rgba(0,0,0,.2);
  pointer-events:none;
}

.ecor-report-btn{ background:#f59e0b !important; }
.ecor-report-btn:hover{ filter:brightness(.98); box-shadow:0 3px 12px rgba(0,0,0,.12) }
.ecor-report-btn:active{ background:#ea9405 !important }
.ecor-report-btn:disabled{ opacity:.65; cursor:not-allowed }

.anx-cards{ width:min(900px, calc(100vw - 32px)) }
.anx-gridCards{ display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:14px }
.anx-card2{ border:1px solid rgba(0,0,0,.06); border-radius:10px; padding:8px; background:#fafafa; display:flex; flex-direction:column; gap:8px }
.anx-img2{ width:100%; aspect-ratio:16/10; object-fit:cover; border-radius:6px; cursor:pointer }
.anx-btnDl{ width:100% }

@media (max-width:576px){
  .ecor-panel{ width:calc(100vw - 24px); padding:16px }
  .ecor-detail-grid{ grid-template-columns:1fr; row-gap:12px }
  .ecor-actions{
    width:auto; min-width:0; justify-self:stretch;
    flex-direction:row; justify-content:flex-end;
  }
  .ecor-actions > .ecor-attach-btn,
  .ecor-actions > .ecor-report-btn{ width:auto }
}

.audit-item{
  padding:.6rem 0;
  border-bottom:1px solid rgba(0,0,0,.06);
  display:flex; align-items:center; justify-content:space-between; gap:12px;
}
.audit-text{ min-width:0; }                 /* permite truncar sem quebrar layout */
.audit-text .fw-semibold{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.audit-actions{ display:flex; gap:8px; flex:0 0 auto; }

.ecor-btn--sm{ padding:.34rem .66rem; font-size:.84rem; border-radius:10px; }

.audit-status{
  margin-left:.5rem; padding:.14rem .5rem;
  border-radius:9999px; font-size:.75rem; font-weight:700; line-height:1;
  border:1px solid transparent; vertical-align:middle;
}
.audit-status--pendente,
.audit-status--aberto{
  background:#fff7ed; color:#c2410c; border-color:#fed7aa;   /* âmbar */
}
.audit-status--analise,
.audit-status--em_analise,
.audit-status--em-analise{
  background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe;   /* azul */
}
.audit-status--resolvido,
.audit-status--concluido{
  background:#ecfdf5; color:#047857; border-color:#a7f3d0;   /* verde */
}
.audit-status--rejeitado,
.audit-status--cancelado{
  background:#fef2f2; color:#b91c1c; border-color:#fecaca;   /* vermelho */
}

@media (max-width:576px){
  .audit-item{ align-items:flex-start; }
  .audit-actions{ width:100%; justify-content:flex-end; flex-wrap:wrap; }
  .audit-actions .ecor-btn{ width:auto; }
}

</style>
