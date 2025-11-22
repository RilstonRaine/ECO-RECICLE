<template>
  <div class="container">
    <h3 class="mb-3">Dashboard — Descartante</h3>

    <!-- Filtro simples -->
    <div class="row g-2 align-items-end mb-3">
      <div class="col-auto">
        <label class="form-label mb-1">De</label>
        <input type="date" v-model="from" class="form-control" />
      </div>
      <div class="col-auto">
        <label class="form-label mb-1">Até</label>
        <input type="date" v-model="to" class="form-control" />
      </div>
      <div class="col-auto d-flex gap-2">
        <button class="btn btn-primary" @click="aplicarPeriodo" :disabled="loadingFilter">Aplicar</button>
        <button class="btn btn-outline-secondary" @click="limparPeriodo" :disabled="!periodoAtivo || loadingFilter">
          Limpar
        </button>
      </div>
    </div>

    <!-- Cards (totais por padrão; com período, mostram apenas o período) -->
    <div class="row g-3">
      <div class="col-md-3">
        <Card titulo="Meus descartes" :valor="meusDescartesAtivos.length" />
      </div>
      <div class="col-md-3">
        <Card titulo="Meus pontos" :valor="pontosCard" />
      </div>
      <div class="col-md-3">
        <Card titulo="Pontos resgatados" :valor="pontosResgatadosCard" />
      </div>
      <div class="col-md-3">
        <Card titulo="CO₂ evitado (kg)" :valor="co2Ativo.toFixed(2)" />
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-md-6">
        <div class="card-metric p-3">
          <GraficoPizza :labels="labelsAtivo" :data="seriesAtivo" title="Tipos de resíduo" />
        </div>
      </div>

      <div class="col-md-6">
        <div class="card-metric p-3">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-2">Últimos descartes</h6>
          </div>

          <ul v-if="ultimosAtivos.length" class="list-unstyled m-0">
            <li
              v-for="d in ultimosAtivos"
              :key="d.id"
              class="py-2 border-bottom d-flex align-items-center justify-content-between gap-3"
            >
              <div class="min-w-0">
                <div class="fw-semibold text-truncate">
                  {{ nomePontoByDescarte(d) }}
                  <span class="text-muted">• {{ formatDate(getDateFromDescarte(d)) }}</span>
                </div>
              </div>

              <button
                type="button"
                class="btn btn-details"
                @click="abrirDetalhe(d.id)"
                aria-label="Obter detalhes do descarte"
              >
                Obter detalhes
              </button>
            </li>
          </ul>
          <div v-else class="text-muted">Sem descartes {{ periodoAtivo ? 'no período' : 'registrados' }}.</div>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div v-if="showModal" class="ecor-modal">
      <div class="ecor-backdrop" @click="closeModal"></div>
      <div class="ecor-panel">
        <button class="ecor-close" @click="closeModal" aria-label="Fechar">×</button>
        <h5 class="mb-2">Detalhes do descarte</h5>

        <dl v-if="detalhe" class="row g-2">
          <dt class="col-4">Data</dt><dd class="col-8">{{ formatDate(detalhe.data_registro, true) }}</dd>
          <dt class="col-4">Descartante</dt><dd class="col-8">{{ detalhe.usuario?.nome || '—' }}</dd>
          <dt class="col-4">Ponto de coleta</dt><dd class="col-8">{{ detalhe.ponto?.nome || '—' }}</dd>
          <dt class="col-4">Tipo</dt><dd class="col-8">{{ detalhe.tipo_residuo }}</dd>
          <dt class="col-4">Qtd. itens</dt><dd class="col-8">{{ detalhe.quantidade_itens }}</dd>
          <dt class="col-4">Peso por item</dt><dd class="col-8">{{ detalhe.peso_por_item_kg }} kg</dd>
          <dt class="col-4">Peso total</dt><dd class="col-8">{{ detalhe.peso_kg }} kg</dd>
          <dt class="col-4">Pontos obtidos</dt><dd class="col-8">{{ detalhe.pontos_gerados }}</dd>
          <dt class="col-4">CO₂ evitado</dt><dd class="col-8">{{ detalhe.co2_evitar_kg }} kg</dd>
        </dl>

        <div v-else>Carregando…</div>

        <!-- Botão de anexos -->
        <div class="mt-3 d-flex align-items-center gap-2" v-if="anexos.length">
          <button class="btn btn-details" @click="showAnexos = true">
            Anexos ({{ anexos.length }})
          </button>
          <small class="text-muted">Clique para visualizar as fotos do item/local.</small>
        </div>
        <div class="mt-3 text-muted" v-else-if="detalhe">
          Sem anexos para este descarte.
        </div>
      </div>
    </div>

    <!-- Modal Galeria de Anexos -->
    <div v-if="showAnexos" class="ecor-modal">
      <div class="ecor-backdrop" @click="showAnexos = false"></div>
      <div class="ecor-panel ecor-panel-lg">
        <button class="ecor-close" @click="showAnexos = false" aria-label="Fechar">×</button>
        <h5 class="mb-3">Anexos do descarte</h5>

        <div class="anexos-grid">
          <a
            v-for="(url, i) in anexos"
            :key="i"
            class="anexo-thumb"
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            :title="'Abrir anexo ' + (i+1)"
          >
            <img :src="url" loading="lazy" alt="Anexo do descarte" />
            <span class="anexo-acao">Abrir</span>
          </a>
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
import GraficoPizza from '@/components/GraficoPizza.vue'
import store from '@/store'
import { usuariosApi, descartesApi } from '@/services/api'

const toast = useToast()
const router = useRouter()

// Usuário
const authLS = JSON.parse(localStorage.getItem('auth') || '{}')
const usuario = ref(store?.state?.usuario ?? store?.usuario ?? authLS?.usuario ?? null)

// Dados base
const descartes = ref([])
const showModal = ref(false)
const detalhe = ref(null)

// ======= NOVO: Anexos
const anexos = ref([])        // urls resolvidas
const showAnexos = ref(false) // modal da galeria

function resolveAnexoUrl(val){
  if (!val) return null

  // já é URL completa?
  if (typeof val === 'string') {
    const s = val.trim()
    if (/^https?:\/\//i.test(s)) return s

    // caminho público do supabase já com /storage
    if (s.startsWith('/storage/v1/object/public/')) {
      const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/,'')
      return base ? `${base}${s}` : null
    }

    // chave do bucket, ex: "descartes-fotos/arquivo.jpg"
    if (s.includes('descartes-fotos/')) {
      const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/,'')
      return base ? `${base}/storage/v1/object/public/${s.replace(/^\/+/,'')}` : null
    }

    return null
  }

  // objetos com { url } ou { path }
  if (val?.url)  return resolveAnexoUrl(String(val.url))
  if (val?.path) return resolveAnexoUrl(String(val.path))
  return null
}

function extractAnexos(d){
  const out = []
  const candidates = [
    d?.foto_item_signed,
    d?.foto_local_signed,
    d?.foto_item,
    d?.foto_local,
    d?.fotos,
    d?.anexos,
  ]

  for (const c of candidates){
    if (!c) continue
    if (Array.isArray(c)){
      c.forEach(v => {
        const url = resolveAnexoUrl(v)
        if (url) out.push(url)
      })
    } else {
      const url = resolveAnexoUrl(c)
      if (url) out.push(url)
    }
  }

  // de-dup
  return Array.from(new Set(out))
}

// Filtro
const from = ref('')
const to   = ref('')
const loadingFilter = ref(false)
const periodoAtivo = computed(() => !!from.value || !!to.value)

// ===== Datas
function parseLocalDate(dstr) {
  if (!dstr) return null
  const d = new Date(`${dstr}T00:00:00`)
  return isNaN(d) ? null : d
}
function endOfDay(d) {
  const e = new Date(d)
  e.setHours(23,59,59,999)
  return e
}
function getDateFromDescarte(d) {
  return d?.data_registro ?? d?.created_at ?? d?.data ?? null
}
function toTimeSafe(d) {
  const raw = getDateFromDescarte(d)
  const t = raw ? new Date(raw).getTime() : NaN
  return Number.isNaN(t) ? 0 : t
}

// ===== Carga
onMounted(async () => {
  if (!usuario.value) { router.push('/login'); return }
  await refreshPerfilUsuario()
  await carregarDescartes()
})

async function refreshPerfilUsuario() {
  const { data } = await usuariosApi.me({ fresh: 1, include: 'resgates' })
  usuario.value = data
  const ls = JSON.parse(localStorage.getItem('auth') || '{}')
  localStorage.setItem('auth', JSON.stringify({ ...ls, usuario: data }))
}

async function carregarDescartes(periodo) {
  try {
    // tenta pedir ao backend join com ponto (se suportar)
    const params = { include: 'ponto' }
    if (periodo?.from) params.from = periodo.from
    if (periodo?.to)   params.to   = periodo.to

    try {
      const r = await descartesApi.listar({ params })
      descartes.value = r.data || []
      return
    } catch (e) {
      // fallback sem include/from/to
      const r = await descartesApi.listar()
      descartes.value = r.data || []
    }
  } catch (e) {
    toast.error('Não foi possível carregar seus descartes.')
  }
}

async function aplicarPeriodo() {
  const start = from.value ? parseLocalDate(from.value) : null
  const end   = to.value   ? endOfDay(parseLocalDate(to.value)) : null
  if (start && end && end < start) {
    toast.error('Período inválido: "Até" é anterior a "De".')
    return
  }
  loadingFilter.value = true
  try {
    await carregarDescartes({
      from: start ? start.toISOString() : undefined,
      to:   end   ? end.toISOString()   : undefined
    })
  } finally { loadingFilter.value = false }
}
async function limparPeriodo() {
  from.value = ''
  to.value   = ''
  loadingFilter.value = true
  try { await carregarDescartes() } finally { loadingFilter.value = false }
}

// ===== Derivados (TOTAL vs PERÍODO automaticamente)
const descartesFiltrados = computed(() => {
  if (!periodoAtivo.value) return descartes.value
  const start = from.value ? parseLocalDate(from.value) : null
  const end   = to.value   ? endOfDay(parseLocalDate(to.value)) : null
  return descartes.value.filter(d => {
    const t = toTimeSafe(d)
    if (!t) return false
    if (start && t < start.getTime()) return false
    if (end && t > end.getTime()) return false
    return true
  })
})

const meusDescartes = computed(() =>
  descartes.value.filter(d => d.usuario_id === usuario.value?.id)
)
const meusDescartesAtivos = computed(() =>
  descartesFiltrados.value.filter(d => d.usuario_id === usuario.value?.id)
)

function pesoTotal (d) {
  const p = Number(d.peso_kg ?? ((d.quantidade_itens ?? 0) * (d.peso_por_item_kg ?? 0)))
  return isNaN(p) ? 0 : p
}
function calcPontos (d) { return Math.round(pesoTotal(d) * 4) }
function calcCO2 (d) {
  const co2 = Number(d.co2_evitar_kg ?? (pesoTotal(d) * 0.48))
  return isNaN(co2) ? 0 : co2
}

// pontos/CO2
const pontosGeradosPeriodo = computed(() =>
  meusDescartesAtivos.value.reduce((acc, d) => acc + (d.pontos_gerados ?? calcPontos(d)), 0)
)
const pontosResgatadosTotal = computed(() => Number(usuario.value?.pontos_resgatados) || 0)
const saldoPontos = computed(() => {
  const backendSaldo = Number(usuario.value?.pontos_acumulados)
  if (!Number.isNaN(backendSaldo)) return backendSaldo
  const totalGerado = meusDescartes.value.reduce((a,d)=>a+(d.pontos_gerados ?? calcPontos(d)),0)
  return Math.max(0, totalGerado - pontosResgatadosTotal.value)
})
const pontosResgatadosPeriodo = computed(() => {
  const lista = Array.isArray(usuario.value?.resgates) ? usuario.value.resgates : []
  if (!periodoAtivo.value || !lista.length) return 0
  const start = from.value ? parseLocalDate(from.value) : null
  const end   = to.value   ? endOfDay(parseLocalDate(to.value)) : null
  return lista
    .filter(r => {
      const t = r?.created_at ? new Date(r.created_at).getTime() : NaN
      if (Number.isNaN(t)) return false
      if (start && t < start.getTime()) return false
      if (end && t > end.getTime()) return false
      return true
    })
    .reduce((acc, r) => acc + Number(r?.pontos ?? r?.valor ?? 0), 0)
})

const pontosCard = computed(() =>
  periodoAtivo.value ? pontosGeradosPeriodo.value : saldoPontos.value
)
const pontosResgatadosCard = computed(() =>
  periodoAtivo.value ? pontosResgatadosPeriodo.value : pontosResgatadosTotal.value
)
const co2Total = computed(() =>
  meusDescartes.value.reduce((acc, d) => acc + calcCO2(d), 0)
)
const co2Ativo = computed(() =>
  periodoAtivo.value ? meusDescartesAtivos.value.reduce((acc, d) => acc + calcCO2(d), 0) : co2Total.value
)

// gráfico e últimos
const labelsAtivo = computed(() => {
  const map = new Map()
  meusDescartesAtivos.value.forEach(d => map.set(d.tipo_residuo, (map.get(d.tipo_residuo) || 0) + 1))
  return [...map.keys()]
})
const seriesAtivo = computed(() => {
  const map = new Map()
  meusDescartesAtivos.value.forEach(d => map.set(d.tipo_residuo, (map.get(d.tipo_residuo) || 0) + 1))
  return [...map.values()]
})
const ultimosAtivos = computed(() => {
  const arr = [...meusDescartesAtivos.value]
  arr.sort((a,b) => toTimeSafe(b) - toTimeSafe(a))
  return arr.slice(0,5)
})

/* ===== Nome do ponto no "Últimos descartes" ===== */
const pontosMap = ref(new Map())           // ponto_id -> nome
const detalhesEmAndamento = new Set()      // evita chamadas duplicadas

function nomePontoByDescarte(d) {
  return d?.ponto?.nome
    || pontosMap.value.get(d?.ponto_coleta_id)
    || `Ponto #${d?.ponto_coleta_id ?? ''}`
}

async function hydratePontoNames(list) {
  const missing = (list || []).filter(d =>
    !d?.ponto?.nome &&
    d?.ponto_coleta_id &&
    !pontosMap.value.get(d.ponto_coleta_id) &&
    !detalhesEmAndamento.has(d.id)
  )

  for (const d of missing) {
    detalhesEmAndamento.add(d.id)
    try {
      const { data } = await descartesApi.detalhe(d.id)
      const pid = data?.ponto?.id ?? data?.ponto_coleta_id
      const nome = data?.ponto?.nome ?? data?.ponto_nome
      if (pid && nome) pontosMap.value.set(pid, nome)
    } catch (_) {
      // silencioso
    } finally {
      detalhesEmAndamento.delete(d.id)
    }
  }
}

// Busca nomes para os 5 visíveis (barato e suficiente)
watch(ultimosAtivos, (arr) => { hydratePontoNames(arr) }, { immediate: true })

// detalhes
async function abrirDetalhe (id) {
  showModal.value = true
  detalhe.value = null
  anexos.value = []
  try {
    const { data } = await descartesApi.detalhe(id)
    detalhe.value = data

    // cache de nome do ponto
    const pid = data?.ponto?.id ?? data?.ponto_coleta_id
    const nome = data?.ponto?.nome ?? data?.ponto_nome
    if (pid && nome) pontosMap.value.set(pid, nome)

    // ===== NOVO: preparar anexos
    anexos.value = extractAnexos(data)
  } catch (e) {
    showModal.value = false
    toast.error('Falha ao obter detalhes do descarte.')
  }
}
function closeModal () { showModal.value = false }

function formatDate (d, withTime = false) {
  if (!d) return '—'
  const dt = (d instanceof Date) ? d : new Date(d)
  return withTime ? dt.toLocaleString() : dt.toLocaleDateString()
}
</script>

<style scoped>
.card-metric{
  border: 1px solid rgba(16,24,40,.06);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(16,24,40,.05);
}
.link-like{ background:none; border:0; color:#12b886; font-weight:600; cursor:pointer; }

.ecor-modal{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; }
.ecor-backdrop{ position:absolute; inset:0; background:rgba(15,23,42,.35); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); }
.ecor-panel{
  position:relative; width:min(680px, calc(100vw - 32px));
  background:#fff; border-radius:12px; box-shadow:0 24px 48px rgba(16,24,40,.18);
  padding:18px; animation:pop .14s ease-out;
}
.ecor-close{ position:absolute; top:8px; right:10px; font-size:22px; border:0; background:transparent; cursor:pointer }
@keyframes pop{ from{transform:scale(.98); opacity:0} to{transform:scale(1); opacity:1} }
.btn-details{
  background:#12b886;
  color:#fff;
  border:none;
  border-radius:12px;       /* menos arredondado */
  padding:.42rem .8rem;     /* um pouco mais compacto */
  font-weight:600;
  box-shadow:0 6px 16px rgba(18,184,134,.20);
  transition:transform .08s ease, box-shadow .2s ease, filter .2s ease;
}

.btn-details:hover{
  filter:brightness(.95);
  box-shadow:0 8px 20px rgba(18,184,134,.28);
}
.btn-details:active{
  transform:translateY(1px);
}

/* painel maior para a galeria */
.ecor-panel.ecor-panel-lg{
  width:min(980px, calc(100vw - 32px));
}

/* grid de anexos */
.anexos-grid{
  display:grid;
  grid-template-columns: repeat(2, 1fr);
  gap:12px;
}
@media (min-width: 768px){
  .anexos-grid{ grid-template-columns: repeat(3, 1fr); }
}

.anexo-thumb{
  position:relative;
  display:block;
  border-radius:10px;
  overflow:hidden;
  border:1px solid rgba(16,24,40,.08);
  box-shadow:0 8px 16px rgba(16,24,40,.06);
}
.anexo-thumb img{
  width:100%;
  height:180px;
  object-fit:cover;
  display:block;
}
.anexo-acao{
  position:absolute;
  right:8px; bottom:8px;
  background:#12b886;
  color:#fff;
  padding:.28rem .5rem;
  border-radius:8px;
  font-weight:600;
  font-size:.85rem;
  box-shadow:0 4px 12px rgba(18,184,134,.25);
}
.anexo-thumb:hover .anexo-acao{ filter:brightness(.95); }

</style>
