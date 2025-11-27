<template>
<<<<<<< HEAD
  <div class="container">
    <h3 class="mb-3">Relatórios — Ponto de Coleta (PRO)</h3>

    <!-- Filtros -->
    <div class="card-metric p-3 mb-3 filters">
      <div class="row g-2 align-items-end">
        <div class="col-md-3">
          <label class="form-label mb-1">Tipo de relatório</label>
          <select v-model="tipoRelatorio" class="form-select">
=======
  <div class="container-fluid px-4 py-4 h-100 d-flex flex-column">
    <h3 class="mb-3 fw-bold">Relatórios — Ponto de Coleta (PRO)</h3>

    <!-- Filtros -->
    <div class="card-metric p-3 mb-3 filters flex-shrink-0">
      <div class="row g-2 align-items-end">
        <div class="col-md-3">
          <label class="form-label mb-1 fw-semibold small">Tipo de relatório</label>
          <select v-model="tipoRelatorio" class="form-select form-select-sm">
>>>>>>> ecc2c48 (Alteração do frontend)
            <option value="descartes">Descartes</option>
            <option value="recompensas">Recompensas</option>
          </select>
        </div>

        <!-- Filtro específico por tipo -->
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
        <div class="col-md-3" v-else>
<<<<<<< HEAD
          <label class="form-label mb-1">Status</label>
          <select v-model="statusRec" class="form-select">
=======
          <label class="form-label mb-1 fw-semibold small">Status</label>
          <select v-model="statusRec" class="form-select form-select-sm">
>>>>>>> ecc2c48 (Alteração do frontend)
            <option value="todas">Todas</option>
            <option value="ativas">Ativas</option>
            <option value="encerradas">Encerradas</option>
          </select>
        </div>

<<<<<<< HEAD
        <div class="col-md-3">
          <label class="form-label mb-1">De</label>
          <input v-model="from" type="date" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label mb-1">Até</label>
          <input v-model="to" type="date" class="form-control" />
        </div>

        <!-- Ações -->
        <div class="col-md-3 d-flex gap-2">
          <button class="btn btn-primary btn-std flex-fill" @click="gerar" :disabled="gerando">
            <span v-if="gerando" class="spinner-border spinner-border-sm me-1"></span>
            Gerar relatório
          </button>
          <button class="btn btn-ghost btn-std flex-fill" @click="limpar" :disabled="gerando">Limpar filtro</button>
=======
        <div class="col-md-2">
          <label class="form-label mb-1 fw-semibold small">De</label>
          <input v-model="from" type="date" class="form-control form-control-sm" />
        </div>
        <div class="col-md-2">
          <label class="form-label mb-1 fw-semibold small">Até</label>
          <input v-model="to" type="date" class="form-control form-control-sm" />
        </div>

        <!-- Ações -->
        <div class="col-md-2 d-flex gap-2">
          <button class="btn btn-primary btn-sm flex-fill fw-semibold" @click="gerar" :disabled="gerando">
            <span v-if="gerando" class="spinner-border spinner-border-sm me-1"></span>
            Gerar
          </button>
          <button class="btn btn-outline-secondary btn-sm flex-fill" @click="limpar" :disabled="gerando">Limpar</button>
>>>>>>> ecc2c48 (Alteração do frontend)
        </div>
      </div>
    </div>

    <!-- PREVIEW -->
<<<<<<< HEAD
    <div class="report-preview">
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
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th style="min-width:110px">Data</th>
              <th>Descartante</th>
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
              <td>{{ nomePF(r.usuario_id) }}</td>
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
        <div v-if="!linhasDesc.length" class="p-4 text-muted">Nenhum dado encontrado com os filtros.</div>
      </div>

      <!-- RECOMPENSAS (RESGATES DO PJ) -->
      <div v-else-if="gerado && tipoRelatorio === 'recompensas'" class="table-responsive p-2">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Descartante</th>
              <th style="min-width:110px">Data</th>
              <th>Tipo</th>
              <th class="text-end">Pontos necessários</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in linhasRec" :key="r.id">
              <td>{{ r.descartante || '—' }}</td>
              <td>{{ fmtData(r.data) }}</td>
              <td>{{ capitalize(r.tipo) }}</td>
              <td class="text-end">{{ Number(r.pontos || 0) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!linhasRec.length" class="p-4 text-muted">Nenhum dado encontrado com os filtros.</div>
      </div>

      <div v-else class="p-4 text-secondary">Defina os filtros e clique em <b>Gerar relatório</b>.</div>
=======
    <div class="report-preview flex-fill d-flex flex-column overflow-hidden">
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
          <table class="table table-sm table-hover align-middle mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th class="ps-3" style="min-width:110px">Data</th>
                <th>Descartante</th>
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
                <td>{{ nomePF(r.usuario_id) }}</td>
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
          <div v-if="!linhasDesc.length" class="h-100 d-flex align-items-center justify-content-center text-muted">
            Nenhum dado encontrado com os filtros.
          </div>
        </div>

        <!-- RECOMPENSAS (RESGATES DO PJ) -->
        <div v-else-if="gerado && tipoRelatorio === 'recompensas'" class="table-responsive h-100">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th class="ps-3">Descartante</th>
                <th style="min-width:110px">Data</th>
                <th>Tipo</th>
                <th class="text-end pe-3">Pontos necessários</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in linhasRec" :key="r.id">
                <td class="ps-3">{{ r.descartante || '—' }}</td>
                <td>{{ fmtData(r.data) }}</td>
                <td>{{ capitalize(r.tipo) }}</td>
                <td class="text-end pe-3">{{ Number(r.pontos || 0) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!linhasRec.length" class="h-100 d-flex align-items-center justify-content-center text-muted">
            Nenhum dado encontrado com os filtros.
          </div>
        </div>

        <div v-else class="h-100 d-flex flex-column align-items-center justify-content-center text-secondary opacity-75">
          <i class="bi bi-file-earmark-text display-4 mb-3 text-muted"></i>
          <p class="mb-0">Defina os filtros acima e clique em <b>Gerar</b>.</p>
        </div>
      </div>
>>>>>>> ecc2c48 (Alteração do frontend)
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { relatoriosApi, baixarBlob, descartesApi, usuariosApi, recompensasApi } from '@/services/api'

const toast = useToast()

/* filtros */
const tipoRelatorio = ref('recompensas') // pode iniciar em 'recompensas' se preferir
const tipoResiduo   = ref('todos')
const statusRec     = ref('todas')
const from          = ref('')
const to            = ref('')

/* estados */
const gerando    = ref(false)
const gerado     = ref(false)
const exportando = ref(false)

/* dados */
const todosDesc  = ref([])
const linhasDesc = ref([])
const linhasRec  = ref([])

/* auxiliares */
const pfMap = ref(new Map())
const tiposDisponiveis = ref([])

/* helpers */
function fmtData(d){ const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString() }
function peso(r){
  const direto = Number(r.peso_kg)
  if (Number.isFinite(direto) && direto > 0) return direto
  return Number((Number(r.quantidade_itens||0) * Number(r.peso_por_item_kg||0)) || 0)
}
function nomePF(id){ return pfMap.value.get(id) || ('#'+id) }
function capitalize(s){ return (s||'').toString().charAt(0).toUpperCase() + (s||'').toString().slice(1) }

/* carga (descartes) */
async function carregarDescartes(){
  const { data } = await descartesApi.listar()
  todosDesc.value = data || []

  // nomes PF
  const ids = [...new Set((todosDesc.value||[]).map(r => r.usuario_id).filter(Boolean))]
  if (ids.length){
    const { data: users } = await usuariosApi.listar({ ids: ids.join(',') })
    pfMap.value = new Map((users||[]).map(u => [u.id, u.nome]))
  } else {
    pfMap.value = new Map()
  }
  tiposDisponiveis.value = Array.from(new Set((todosDesc.value||[]).map(r => r.tipo_residuo))).filter(Boolean)
}

/* carga (resgates PJ) – usa a sua rota nova */
async function carregarResgates(){
  const params = {
    status: (statusRec.value || 'todas'),
    from:   from.value || undefined,
    to:     to.value   || undefined,
  }
  const { data } = await recompensasApi.resgates(params)
  // data: [{ id, data, descartante, tipo, status, pontos }]
  linhasRec.value = Array.isArray(data) ? data : []
}

/* aplicar filtros client-side para descartes */
function rangeOk(dateStr){
  const d = new Date(dateStr)
  const start = from.value ? new Date(from.value + 'T00:00:00') : null
  const end   = to.value   ? new Date(to.value   + 'T23:59:59') : null
  if (start && d < start) return false
  if (end   && d > end)   return false
  return true
}
function aplicarFiltroDescartes(){
  linhasDesc.value = (todosDesc.value||[])
    .filter(r => (tipoResiduo.value === 'todos' || r.tipo_residuo === tipoResiduo.value))
    .filter(r => rangeOk(r.data_registro))
}

async function gerar(){
  try{
    gerando.value = true
    gerado.value  = false

    if (tipoRelatorio.value === 'descartes'){
      await carregarDescartes()
      aplicarFiltroDescartes()
    } else {
      await carregarResgates()
    }
    gerado.value = true
  } catch (e){
    console.error(e)
    toast.error('Falha ao gerar relatório.')
  } finally {
    gerando.value = false
  }
}

function limpar(){
  from.value = ''; to.value = ''
  if (tipoRelatorio.value === 'descartes'){
    tipoResiduo.value = 'todos'
    linhasDesc.value = []
  } else {
    statusRec.value = 'todas'
    linhasRec.value = []
  }
  gerado.value = false
}

/* totais (descartes) */
const totalPeso   = computed(() => linhasDesc.value.reduce((s,r)=> s + peso(r), 0))
const totalPontos = computed(() => linhasDesc.value.reduce((s,r)=> s + Number(r.pontos_gerados||0), 0))
const totalCO2    = computed(() => linhasDesc.value.reduce((s,r)=> s + Number(r.co2_evitar_kg||0), 0))

/* export – mantém como está no seu backend */
function paramsExport(){
  if (tipoRelatorio.value === 'descartes'){
    return {
      tipo: (tipoResiduo.value === 'todos' ? undefined : tipoResiduo.value),
      from: from.value || undefined,
      to:   to.value   || undefined,
    }
  }
  return {
    status: statusRec.value || 'todas',
    from: from.value || undefined,
    to:   to.value   || undefined,
  }
}
async function exportPdf(){
  try{
    exportando.value = true
    const { data } = await relatoriosApi.exportPJPdf(tipoRelatorio.value, paramsExport())
    baixarBlob(data, `relatorio_pj_${tipoRelatorio.value}.pdf`)
  } finally { exportando.value = false }
}
async function exportXlsx(){
  try{
    exportando.value = true
    const { data } = await relatoriosApi.exportPJXlsx(tipoRelatorio.value, paramsExport())
    baixarBlob(data, `relatorio_pj_${tipoRelatorio.value}.xlsx`)
  } finally { exportando.value = false }
}
</script>

<style scoped>
<<<<<<< HEAD
:root{ --mint-600:#12b886; --mint-200:#b7f3d6; --mint-glow:rgba(18,184,134,.12); }
.btn-std{ height:42px; padding:.45rem 1rem; border-radius:14px; font-weight:600; }
.btn-ghost{
  background:#fff; color:var(--mint-600);
  border:1px solid var(--mint-200); border-radius:14px;
  box-shadow:0 0 0 3px var(--mint-glow);
}
.filters .form-control, .filters .form-select, .filters .btn{ height:42px; }
.report-preview{
  min-height:360px; background:#fff; border:1px solid var(--mint-200); border-radius:16px;
  box-shadow:0 0 0 3px var(--mint-glow) inset, 0 8px 24px rgba(16,24,40,.06); padding:8px; position:relative;
}
.report-toolbar{
  position:sticky; top:0; z-index:2; display:flex; align-items:center; gap:10px;
  padding:12px; background:linear-gradient(#ffffff,#ffffffcc);
  border-bottom:1px solid #e9ecef; border-radius:12px 12px 0 0;
}
.report-title{ font-weight:700; color:#0f172a; }
.toolbar-actions{ margin-left:auto; display:flex; gap:10px; }
.table thead th{ white-space:nowrap; }
.text-end{ text-align:end; }
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
