<!-- src/views/RelatoriosPF.vue -->
<template>
<<<<<<< HEAD
  <div class="container">
    <h3 class="mb-3">Relatórios — Pessoa Física (PRO)</h3>

    <!-- Filtros -->
    <div class="card-metric p-3 mb-3 filters">
      <div class="row g-2 align-items-end">
        <!-- Tipo -->
        <div class="col-md-3">
          <label class="form-label mb-1">Tipo de relatório</label>
          <select v-model="tipoRelatorio" class="form-select">
=======
  <div class="container-fluid px-4 py-4 h-100 d-flex flex-column">
    <h3 class="mb-3 fw-bold">Relatórios — Pessoa Física (PRO)</h3>

    <!-- Filtros -->
    <div class="card-metric p-3 mb-3 filters flex-shrink-0">
      <div class="row g-2 align-items-end">
        <!-- Tipo -->
        <div class="col-md-3">
          <label class="form-label mb-1 fw-semibold small">Tipo de relatório</label>
          <select v-model="tipoRelatorio" class="form-select form-select-sm">
>>>>>>> ecc2c48 (Alteração do frontend)
            <option value="descartes">Descartes</option>
            <option value="recompensas">Recompensas</option>
          </select>
        </div>

        <!-- Filtro extra (apenas para descartes) -->
        <div class="col-md-3" v-if="tipoRelatorio === 'descartes'">
<<<<<<< HEAD
          <label class="form-label mb-1">Tipo de resíduo</label>
          <select v-model="tipoResiduo" class="form-select">
=======
          <label class="form-label mb-1 fw-semibold small">Tipo de resíduo</label>
          <select v-model="tipoResiduo" class="form-select form-select-sm">
>>>>>>> ecc2c48 (Alteração do frontend)
            <option value="todos">Todos</option>
            <option v-for="t in tiposDisponiveis" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

<<<<<<< HEAD
        <div class="col-md-3">
          <label class="form-label mb-1">De</label>
          <input v-model="de" type="date" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label mb-1">Até</label>
          <input v-model="ate" type="date" class="form-control" />
        </div>

        <div class="col-md-3 d-flex gap-2">
          <button class="btn btn-primary btn-std flex-fill" @click="gerar" :disabled="gerando">
            <span v-if="gerando" class="spinner-border spinner-border-sm me-1"></span>
            Gerar relatório
          </button>
          <button class="btn btn-ghost btn-std flex-fill" @click="limpar" :disabled="gerando">
            Limpar filtro
=======
        <div class="col-md-2">
          <label class="form-label mb-1 fw-semibold small">De</label>
          <input v-model="de" type="date" class="form-control form-control-sm" />
        </div>
        <div class="col-md-2">
          <label class="form-label mb-1 fw-semibold small">Até</label>
          <input v-model="ate" type="date" class="form-control form-control-sm" />
        </div>

        <div class="col-md-2 d-flex gap-2">
          <button class="btn btn-primary btn-sm flex-fill fw-semibold" @click="gerar" :disabled="gerando">
            <span v-if="gerando" class="spinner-border spinner-border-sm me-1"></span>
            Gerar
          </button>
          <button class="btn btn-outline-secondary btn-sm flex-fill" @click="limpar" :disabled="gerando">
            Limpar
>>>>>>> ecc2c48 (Alteração do frontend)
          </button>
        </div>
      </div>
    </div>

    <!-- Preview -->
<<<<<<< HEAD
    <div class="report-preview">
      <!-- toolbar -->
      <div v-if="gerado" class="report-toolbar">
        <div class="report-title">Relatório de {{ tipoRelatorio }}</div>
        <div class="toolbar-actions">
          <button class="btn btn-primary btn-std" @click="exportPdf" :disabled="exportando">Exportar PDF</button>
          <button class="btn btn-ghost btn-std" @click="exportXlsx" :disabled="exportando">Exportar Excel</button>
        </div>
      </div>

      <div v-if="gerando" class="p-4 text-muted">Gerando…</div>

      <!-- DESCARTES -->
      <div v-else-if="gerado && tipoRelatorio === 'descartes'" class="table-responsive p-2">
        <table class="table table-sm align-middle" v-if="linhasDesc.length">
          <thead>
            <tr>
              <th style="min-width:110px">Data</th>
              <th>Ponto</th>
              <th>Tipo</th>
              <th class="text-end">Qtd</th>
              <th class="text-end">Peso (kg)</th>
              <th class="text-end">Pontos</th>
              <th class="text-end">CO₂ (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in linhasDesc" :key="r.id">
              <td>{{ fmtData(r.data_registro) }}</td>
              <td>{{ nomePonto(r) }}</td>
              <td>{{ r.tipo_residuo }}</td>
              <td class="text-end">{{ r.quantidade_itens ?? '-' }}</td>
              <td class="text-end">{{ peso(r).toFixed(2) }}</td>
              <td class="text-end">{{ Number(r.pontos_gerados||0) }}</td>
              <td class="text-end">{{ Number(r.co2_evitar_kg||0).toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th colspan="4" class="text-end">Totais</th>
              <th class="text-end">{{ totalPeso.toFixed(2) }}</th>
              <th class="text-end">{{ totalPontos }}</th>
              <th class="text-end">{{ totalCO2.toFixed(2) }}</th>
            </tr>
          </tfoot>
        </table>
        <div v-else class="p-4 text-muted">Nenhum descarte encontrado com os filtros.</div>
      </div>

      <!-- RECOMPENSAS -->
      <div v-else-if="gerado && tipoRelatorio === 'recompensas'" class="table-responsive p-2">
        <table class="table table-sm align-middle" v-if="linhasRec.length">
          <thead>
            <tr>
              <th>Ponto</th>
              <th style="min-width:110px">Data</th>
              <th>Tipo</th>
              <th class="text-end">Pontos consumidos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in linhasRec" :key="r.id">
              <td>{{ nomePJ(r.pj_id) }}</td>
              <td>{{ fmtData(r.data) }}</td>
              <td>{{ tipoLabel(r.tipo) }}</td>
              <td class="text-end">{{ r.pontos }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-4 text-muted">Nenhum resgate encontrado com os filtros.</div>
      </div>

      <!-- Estado inicial -->
      <div v-else class="p-4 text-secondary">
        Defina os filtros e clique em <b>Gerar relatório</b>.
=======
    <div class="report-preview flex-fill d-flex flex-column overflow-hidden">
      <!-- toolbar -->
      <div v-if="gerado" class="report-toolbar flex-shrink-0">
        <div class="report-title">Relatório de {{ tipoRelatorio }}</div>
        <div class="toolbar-actions">
          <button class="btn btn-primary btn-sm" @click="exportPdf" :disabled="exportando">
            <i class="bi bi-file-earmark-pdf me-1"></i> PDF
          </button>
          <button class="btn btn-outline-success btn-sm" @click="exportXlsx" :disabled="exportando">
            <i class="bi bi-file-earmark-excel me-1"></i> Excel
          </button>
        </div>
      </div>

      <div class="flex-fill overflow-auto p-0 position-relative bg-white">
        <div v-if="gerando" class="p-4 text-muted text-center">
          <div class="spinner-border text-primary mb-2" role="status"></div>
          <div>Gerando relatório...</div>
        </div>

        <!-- DESCARTES -->
        <div v-else-if="gerado && tipoRelatorio === 'descartes'" class="table-responsive h-100">
          <table class="table table-sm table-hover align-middle mb-0" v-if="linhasDesc.length">
            <thead class="table-light sticky-top">
              <tr>
                <th class="ps-3" style="min-width:110px">Data</th>
                <th>Ponto</th>
                <th>Tipo</th>
                <th class="text-end">Qtd</th>
                <th class="text-end">Peso (kg)</th>
                <th class="text-end">Pontos</th>
                <th class="text-end pe-3">CO₂ (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in linhasDesc" :key="r.id">
                <td class="ps-3">{{ fmtData(r.data_registro) }}</td>
                <td>{{ nomePonto(r) }}</td>
                <td>{{ r.tipo_residuo }}</td>
                <td class="text-end">{{ r.quantidade_itens ?? '-' }}</td>
                <td class="text-end">{{ peso(r).toFixed(2) }}</td>
                <td class="text-end">{{ Number(r.pontos_gerados||0) }}</td>
                <td class="text-end pe-3">{{ Number(r.co2_evitar_kg||0).toFixed(2) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light sticky-bottom">
              <tr>
                <th colspan="4" class="text-end">Totais</th>
                <th class="text-end">{{ totalPeso.toFixed(2) }}</th>
                <th class="text-end">{{ totalPontos }}</th>
                <th class="text-end pe-3">{{ totalCO2.toFixed(2) }}</th>
              </tr>
            </tfoot>
          </table>
          <div v-else class="h-100 d-flex align-items-center justify-content-center text-muted">
            Nenhum descarte encontrado com os filtros.
          </div>
        </div>

        <!-- RECOMPENSAS -->
        <div v-else-if="gerado && tipoRelatorio === 'recompensas'" class="table-responsive h-100">
          <table class="table table-sm table-hover align-middle mb-0" v-if="linhasRec.length">
            <thead class="table-light sticky-top">
              <tr>
                <th class="ps-3">Ponto</th>
                <th style="min-width:110px">Data</th>
                <th>Tipo</th>
                <th class="text-end pe-3">Pontos consumidos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in linhasRec" :key="r.id">
                <td class="ps-3">{{ nomePJ(r.pj_id) }}</td>
                <td>{{ fmtData(r.data) }}</td>
                <td>{{ tipoLabel(r.tipo) }}</td>
                <td class="text-end pe-3">{{ r.pontos }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="h-100 d-flex align-items-center justify-content-center text-muted">
            Nenhum resgate encontrado com os filtros.
          </div>
        </div>

        <!-- Estado inicial -->
        <div v-else class="h-100 d-flex flex-column align-items-center justify-content-center text-secondary opacity-75">
          <i class="bi bi-file-earmark-text display-4 mb-3 text-muted"></i>
          <p class="mb-0">Defina os filtros acima e clique em <b>Gerar</b>.</p>
        </div>
>>>>>>> ecc2c48 (Alteração do frontend)
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { descartesApi, usuariosApi, relatoriosApi, baixarBlob, usuariosApi as U } from '@/services/api'

const toast = useToast()

/* filtros/estado */
const tipoRelatorio = ref('descartes')
const tipoResiduo   = ref('todos')
const de = ref('')
const ate = ref('')
const gerando = ref(false)
const exportando = ref(false)
const gerado = ref(false)

/* dados */
const todosDesc  = ref([])
const linhasDesc = ref([])
const tiposDisponiveis = ref([])

const linhasRec  = ref([])
const pontosMap  = ref(new Map()) // pj_id -> nome

/* helpers */
function asArray(x){
  if (Array.isArray(x)) return x
  if (!x || typeof x !== 'object') return []
  for (const k of ['rows','items','data','resgates','result']) {
    if (Array.isArray(x[k])) return x[k]
  }
  return []
}
function fmtData(d){ if (!d) return '—'; const dt = new Date(d); return dt.toLocaleDateString() }
function tipoLabel(v){ const s = String(v || '').toLowerCase(); if (s==='digital') return 'Digital'; if (s==='fisica') return 'Física'; return '—' }
function nomePJ(id){ return pontosMap.value.get(id) || (id ? `Ponto #${id}` : '—') }

/* descartes */
function peso(r){
  const direto = Number(r.peso_kg)
  if (Number.isFinite(direto) && direto > 0) return direto
  return Number((Number(r.quantidade_itens||0) * Number(r.peso_por_item_kg||0)) || 0)
}
function nomePonto(r){
  return r?.ponto?.nome || pontosMap.value.get(r?.ponto_coleta_id) || ('#' + r?.ponto_coleta_id)
}
const totalPontos = computed(() => linhasDesc.value.reduce((s, r) => s + Number(r.pontos_gerados || 0), 0))
const totalPeso   = computed(() => linhasDesc.value.reduce((s, r) => s + peso(r), 0))
const totalCO2    = computed(() => linhasDesc.value.reduce((s, r) => s + Number(r.co2_evitar_kg || 0), 0))

function aplicarFiltroDescartes(){
  const start = de.value ? new Date(de.value + 'T00:00:00') : null
  const end   = ate.value ? new Date(ate.value + 'T23:59:59') : null
  linhasDesc.value = (todosDesc.value || []).filter(r => {
    if (tipoResiduo.value !== 'todos' && r.tipo_residuo !== tipoResiduo.value) return false
    const dt = new Date(r.data_registro)
    if (start && dt < start) return false
    if (end && dt > end)     return false
    return true
  })
}

/* recompensas (PF) */
async function carregarResgatesPF(){
  const params = {}
  if (de.value)  params.from = de.value
  if (ate.value) params.to   = ate.value

  let payload = null
  try {
    // rota utilitária (total por usuário) – pode devolver objeto
    const { data } = await U.resgatados(params)
    payload = data
  } catch {
    // fallback: /usuarios/me?include=resgates – devolve lista
    const { data: me } = await U.me({ include: 'resgates', ...params })
    payload = me?.resgates ?? []
  }

  const base = asArray(payload)
  const arr = base.map((r, i) => ({
    id:     r.id ?? r.resgate_id ?? r.recompensa_id ?? i,
    pj_id:  r.pj_id ?? r.ponto_id ?? r.ponto_coleta_id ?? r.recompensa?.pj_id,
    data:   r.created_at ?? r.data_resgate ?? r.data ?? r.resgate_data,
    tipo:   String(r.tipo ?? r.recompensa_tipo ?? r.recompensa?.tipo ?? '').toLowerCase(),
    pontos: Number(r.pontos_consumidos ?? r.pontos ?? r.pontos_necessarios ?? r.valor ?? 0),
  }))
  linhasRec.value = arr

  // nomes dos PJs
  const missing = [...new Set(arr.map(r => r.pj_id).filter(id => !!id && !pontosMap.value.get(id)))]
  if (missing.length){
    try{
      const { data: pontos } = await U.listarPontos({ ids: missing.join(',') })
      const map = new Map(pontosMap.value)
      asArray(pontos).forEach(p => map.set(p.id, p.nome))
      pontosMap.value = map
    }catch{}
  }
}

async function gerar(){
  try{
    gerando.value = true
    gerado.value  = false

    if (tipoRelatorio.value === 'descartes'){
      const [{ data: descs }, { data: pontos }] = await Promise.all([
        descartesApi.listar(),
        U.listarPontos()
      ])
      todosDesc.value   = descs || []
      pontosMap.value   = new Map(asArray(pontos).map(p => [p.id, p.nome]))
      tiposDisponiveis.value = Array.from(new Set((todosDesc.value||[]).map(r => r.tipo_residuo))).filter(Boolean)
      aplicarFiltroDescartes()
    } else {
      await carregarResgatesPF()
    }

    gerado.value = true
  } catch (e){
    console.error('[RelatoriosPF][gerar]', e)
    toast.error('Falha ao gerar relatório.')
  } finally {
    gerando.value = false
  }
}

function limpar(){
  tipoResiduo.value = 'todos'
  de.value = ''
  ate.value = ''
  gerado.value = false
  linhasDesc.value = []
  linhasRec.value  = []
}

/* exportações */
function paramsExport(){
  if (tipoRelatorio.value === 'descartes'){
    return {
      tipo_residuo: (tipoResiduo.value === 'todos') ? undefined : tipoResiduo.value,
      de: de.value || undefined,
      ate: ate.value || undefined,
    }
  }
  return { de: de.value || undefined, ate: ate.value || undefined }
}
async function exportPdf(){
  try{
    exportando.value = true
    const resp = await relatoriosApi.exportPFPdf(tipoRelatorio.value, paramsExport())
    baixarBlob(resp.data, `relatorio_pf_${tipoRelatorio.value}.pdf`)
  } finally { exportando.value = false }
}
async function exportXlsx(){
  try{
    exportando.value = true
    const resp = await relatoriosApi.exportPFXlsx(tipoRelatorio.value, paramsExport())
    baixarBlob(resp.data, `relatorio_pf_${tipoRelatorio.value}.xlsx`)
  } finally { exportando.value = false }
}

/* pré-carga leve */
onMounted(async () => {
  try{
    const [{ data: descs }, { data: pontos }] = await Promise.all([
      descartesApi.listar(),
      U.listarPontos()
    ])
    todosDesc.value = descs || []
    pontosMap.value = new Map(asArray(pontos).map(p => [p.id, p.nome]))
    tiposDisponiveis.value = Array.from(new Set((todosDesc.value||[]).map(r => r.tipo_residuo))).filter(Boolean)
  }catch{}
})
</script>

<style scoped>
<<<<<<< HEAD
:root{
  --mint-600:#12b886;
  --mint-200:#b7f3d6;
  --mint-glow:rgba(18,184,134,.12);
}

/* mesma altura dos botões */
.btn-std{
  height:42px;
  padding:.45rem 1rem;
  border-radius:14px;
  font-weight:600;
}

/* ghost com borda/halo visíveis */
.btn-ghost{
  background:#fff;
  color:var(--mint-600);
  border:1px solid var(--mint-200);
  border-radius:14px;
  box-shadow:0 0 0 3px var(--mint-glow);
  transition: box-shadow .18s ease, background .18s ease, transform .06s ease;
}
.btn-ghost:hover{ background:#f6fffa; box-shadow:0 0 0 4px rgba(18,184,134,.18); }
.btn-ghost:active{ transform: translateY(1px); }

/* cartão/preview */
.card-metric {
  background:#fff;
  border-radius:16px;
  border:1px solid rgba(2,6,23,.06);
  box-shadow:0 8px 24px rgba(16,24,40,.06);
  padding:16px;
}
.report-preview{
  min-height:360px;
  background:#fff;
  border:1px solid var(--mint-200);
  border-radius:16px;
  box-shadow:0 0 0 3px var(--mint-glow) inset, 0 8px 24px rgba(16,24,40,.06);
  padding:8px;
  position:relative;
}
.report-toolbar{
  position:sticky; top:0; z-index:2;
  display:flex; align-items:center; gap:10px;
  padding:12px;
  background:linear-gradient(#ffffff,#ffffffcc);
  border-bottom:1px solid #e9ecef;
  border-radius:12px 12px 0 0;
}
.report-title{ font-weight:700; color:#0f172a; }
.toolbar-actions{ margin-left:auto; display:flex; gap:10px; }

.table thead th{ white-space:nowrap; }
.text-end{ text-align:end; }

/* altura dos controles nos filtros */
.filters .form-control,
.filters .form-select,
.filters .btn{ height:42px; }
=======
/* cartão/preview */
.card-metric {
  background:#fff;
  border-radius:12px;
  border:1px solid rgba(2,6,23,.08);
  box-shadow:0 4px 12px rgba(16,24,40,.03);
}
.report-preview{
  background:#fff;
  border:1px solid rgba(2,6,23,.08);
  border-radius:12px;
  box-shadow:0 4px 12px rgba(16,24,40,.03);
}
.report-toolbar{
  display:flex; align-items:center; gap:10px;
  padding:12px 16px;
  background:#f8fafc;
  border-bottom:1px solid #e2e8f0;
}
.report-title{ font-weight:700; color:#0f172a; font-size: 0.95rem; }
.toolbar-actions{ margin-left:auto; display:flex; gap:8px; }

/* Sticky headers */
.sticky-top { top: 0; z-index: 10; }
.sticky-bottom { bottom: 0; z-index: 10; }
>>>>>>> ecc2c48 (Alteração do frontend)
</style>
