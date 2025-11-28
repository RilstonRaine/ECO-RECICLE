<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import store from '@/store'
import { usuariosApi, descartesApi } from '@/services/api'

const router = useRouter()
const toast = useToast()

const usuario = computed(() => store?.state?.usuario ?? store?.usuario ?? null)

onMounted(async () => {
  if (!usuario.value) {
    router.push('/login')
    return
  }
  if (usuario.value?.tipo_usuario !== 'descartante') {
    toast.error('Apenas descartantes podem registrar descartes.')
    router.push('/dashboard-pj')
    return
  }
  await carregarPontos()
})

const pontosColeta = ref([])
async function carregarPontos() {
  try {
    const { data } = await usuariosApi.listarPontos()
    pontosColeta.value = (data || []).filter(u => u.tipo_usuario === 'ponto_coleta')
  } catch (e) {
    toast.error('Não foi possível carregar pontos de coleta.')
  }
}

function resumoEndereco(p) {
  const partes = [
    p.logradouro || p.endereco,
    p.numero,
    p.bairro,
    p.cidade,
    p.uf
  ].filter(Boolean)
  return partes.length ? partes.join(', ') : 'Endereço não informado'
}

const tipos = [
  'Smartphone', 'Computador', 'Notebooks', 'Televisor', 'Monitores',
  'Tablet','Kindle', 'Consoles', 'Mouses', 'Teclados', 'Webcam', 'Headset',  'Microfone',
  'Impressora','Roteador',  'ONT', 'Switch de Rede',
  'Cabos', 'Adaptadores', 'Carregadores',
  'Pilha', 'Bateria', 'Caixa de Som', 'Câmera Digital',
  'HD', 'SSD', 'Pen Drive', 'Cartão de Memória', 'Unidade Óptica (CD/DVD)',
  'Placa Eletrônica', 'Placa-mãe', 'Placa de Vídeo (GPU)', 'Memória RAM', 'Processador', 'Fonte ATX',
  'Nobreak', 'Estabilizador', 'Filtro de Linha',
  'Smartwatch', 'Set-top Box ', 'TV Box', 'Decoder',
  'Antenas', 'Receptores',
  'Componentes Eletrônicos'
]

const pesoMedio = {
  'Smartphone': 0.20,
  'Computador': 7.00,
  'Notebooks': 1.70,
  'Televisor': 7.00,
  'Monitores': 4.00,
  'Tablet': 0.50,
  'Kindle': 0.25,
  'Consoles': 3.00,
  'Mouses': 0.10,
  'Teclados': 0.70,
  'Webcam': 0.15,
  'Headset': 0.30,
  'Microfone': 0.30,
  'Impressora': 7.00,
  'Roteador': 0.40,
  'ONT': 0.30,
  'Switch de Rede': 1.00,
  'Cabos': 0.20,
  'Adaptadores': 0.10,
  'Carregadores': 0.20,
  'Pilha': 0.03,
  'Bateria': 0.30,
  'Caixa de Som': 1.50,
  'Câmera Digital': 0.40,
  'HD': 0.40,
  'SSD': 0.05,
  'Pen Drive': 0.02,
  'Cartão de Memória': 0.01,
  'Unidade Óptica (CD/DVD)': 0.70,
  'Placa Eletrônica': 0.20,
  'Placa-mãe': 0.80,
  'Placa de Vídeo (GPU)': 1.00,
  'Memória RAM': 0.05,
  'Processador': 0.05,
  'Fonte ATX': 1.80,
  'Nobreak': 6.00,
  'Estabilizador': 4.00,
  'Filtro de Linha': 0.40,
  'Smartwatch': 0.05,
  'Set-top Box ': 0.60,
  'TV Box': 0.20,
  'Decoder': 0.80,
  'Antenas': 0.50,
  'Receptores': 1.00,
  'Componentes Eletrônicos': 0.05
}

const form = ref({
  ponto_coleta_id: null,
  tipo_residuo: null,
  quantidade: 1,
  peso_por_item: 1.00,
  foto_item: null,
  foto_local: null
})

/* ---------- Autocomplete Ponto ---------- */
const buscaPonto = ref('')
const showPontos = ref(false)

const pontosFiltrados = computed(() => {
  if (!buscaPonto.value) return pontosColeta.value
  const term = buscaPonto.value.toLowerCase()
  return pontosColeta.value.filter(p => {
    const nome = (p.nome || '').toLowerCase()
    const end = resumoEndereco(p).toLowerCase()
    return nome.includes(term) || end.includes(term)
  })
})

function selecionarPonto(p) {
  form.value.ponto_coleta_id = p.id
  buscaPonto.value = p.nome || `Ponto #${p.id}`
  showPontos.value = false
}

/* ---------- Autocomplete Tipo ---------- */
const buscaTipo = ref('')
const showTipos = ref(false)

const tiposFiltrados = computed(() => {
  if (!buscaTipo.value) return tipos
  const term = buscaTipo.value.toLowerCase()
  return tipos.filter(t => t.toLowerCase().includes(term))
})

function selecionarTipo(t) {
  form.value.tipo_residuo = t
  buscaTipo.value = t
  showTipos.value = false
}

function delayHide(cb) {
  setTimeout(cb, 200)
}

watch(() => form.value.ponto_coleta_id, (newId) => {
  if (!newId) {
    buscaPonto.value = ''
    return
  }
  const p = pontosColeta.value.find(x => x.id === newId)
  if (p && buscaPonto.value !== p.nome) {
    buscaPonto.value = p.nome || `Ponto #${p.id}`
  }
})

const naoSeiPeso = ref(false)

watch([() => form.value.tipo_residuo, naoSeiPeso], ([novoTipo, isEstimado]) => {
  if (isEstimado && novoTipo) {
    const peso = pesoMedio[novoTipo]
    if (peso) {
      form.value.peso_por_item = peso
    }
  }
})

const qtdValida = computed(() =>
  Number.isInteger(Number(form.value.quantidade)) && Number(form.value.quantidade) >= 1
)
const ppiValido = computed(() => Number(form.value.peso_por_item) > 0)

const pesoTotal = computed(() => {
  const q = Number(form.value.quantidade || 0)
  const p = Number(form.value.peso_por_item || 0)
  return Number((q * p).toFixed(2))
})

const podeSalvar = computed(() =>
  !!form.value.ponto_coleta_id &&
  !!form.value.tipo_residuo &&
  qtdValida.value &&
  ppiValido.value &&
  form.value.foto_item &&
  form.value.foto_local
)

const loading = ref(false)

function handleFileChange(field, event) {
  const file = event.target.files?.[0] || null;
  form.value[field] = file;
}

async function salvar() {
  if (!podeSalvar.value) {
    toast.error('Preencha todos os campos obrigatórios corretamente.');
    return;
  }

  try {
    loading.value = true;

    const fd = new FormData();
    fd.append('ponto_coleta_id', String(form.value.ponto_coleta_id));
    fd.append('tipo_residuo', form.value.tipo_residuo);
    fd.append('quantidade_itens', String(form.value.quantidade));
    fd.append('peso_por_item_kg', String(form.value.peso_por_item));
    fd.append('peso_kg', String(pesoTotal.value));
    fd.append('status_peso', naoSeiPeso.value ? 'estimado' : 'medido');
    fd.append('foto_item', form.value.foto_item);
    fd.append('foto_local', form.value.foto_local);

    await descartesApi.criar(fd);
    toast.success('Descarte registrado com sucesso!');
    router.push('/dashboard-pf');
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.data?.error || e.message;
    toast.error(`Falha ao registrar descarte: ${msg}`);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container-fluid p-0 layout-container">
    <div class="row g-0 layout-row">
      <div class="col-lg-7 col-xl-8 scrollable-col bg-light">
        <div class="p-3 p-md-5 h-100 d-flex flex-column justify-content-center align-items-center anime-fade-in">
          <div class="w-100" style="max-width: 800px;">
            <div class="card-metric p-4 p-md-5 shadow-sm border-0 bg-white rounded-4">
              <h3 class="mb-4 fw-bold text-mint text-center">Cadastrar Descarte</h3>

              <form @submit.prevent="salvar" class="row g-3" novalidate>
                
                <!-- Autocomplete Ponto de Coleta -->
                <div class="col-md-12 position-relative">
                  <label class="form-label fw-semibold">Ponto de Coleta</label>
                  <input
                    type="text"
                    class="form-control form-control-lg bg-light border-0"
                    placeholder="Busque por nome ou endereço..."
                    v-model="buscaPonto"
                    @focus="showPontos = true"
                    @blur="delayHide(() => showPontos = false)"
                    required
                  />
                  <ul v-if="showPontos && pontosFiltrados.length" class="list-group position-absolute w-100 shadow-sm" style="z-index: 1000; top: 85px; max-height: 200px; overflow-y: auto;">
                    <li
                      v-for="p in pontosFiltrados"
                      :key="p.id"
                      class="list-group-item list-group-item-action cursor-pointer"
                      @mousedown.prevent="selecionarPonto(p)"
                    >
                      <strong>{{ p.nome || ('Ponto #' + p.id) }}</strong><br>
                      <small class="text-muted">{{ resumoEndereco(p) }}</small>
                    </li>
                  </ul>
                  <div class="form-text text-danger" v-if="buscaPonto && !pontosFiltrados.length">
                    Nenhum ponto encontrado.
                  </div>
                  <div class="form-text text-danger" v-if="!form.ponto_coleta_id && buscaPonto && !showPontos">
                    Selecione um ponto da lista.
                  </div>
                </div>

                <!-- Autocomplete Tipo de Resíduo -->
                <div class="col-md-6 position-relative">
                  <label class="form-label fw-semibold">Tipo de resíduo</label>
                  <input
                    type="text"
                    class="form-control bg-light border-0"
                    placeholder="Ex: Smartphone..."
                    v-model="buscaTipo"
                    @focus="showTipos = true"
                    @blur="delayHide(() => showTipos = false)"
                    required
                  />
                  <ul v-if="showTipos && tiposFiltrados.length" class="list-group position-absolute w-100 shadow-sm" style="z-index: 1000; top: 75px; max-height: 200px; overflow-y: auto;">
                    <li
                      v-for="t in tiposFiltrados"
                      :key="t"
                      class="list-group-item list-group-item-action cursor-pointer"
                      @mousedown.prevent="selecionarTipo(t)"
                    >
                      {{ t }}
                    </li>
                  </ul>
                  <div class="form-text text-danger" v-if="!form.tipo_residuo && buscaTipo && !showTipos">
                    Selecione um tipo válido.
                  </div>
                </div>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Qtd. Itens</label>
                  <input
                    v-model.number="form.quantidade"
                    type="number"
                    min="1"
                    step="1"
                    class="form-control bg-light border-0"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Peso por item (kg)</label>
                  <div class="input-group">
                    <input
                      v-model.number="form.peso_por_item"
                      type="number"
                      min="0.01"
                      step="0.01"
                      class="form-control bg-light border-0"
                      :readonly="naoSeiPeso"
                      required
                    />
                  </div>
                  <div class="form-check mt-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="naoSeiPesoCheck"
                      v-model="naoSeiPeso"
                    />
                    <label class="form-check-label small text-muted" for="naoSeiPesoCheck">
                      Não sei o peso (usar média estimada)
                    </label>
                  </div>
                  <div class="invalid-feedback d-block" v-if="!ppiValido && !naoSeiPeso">
                    O peso por item deve ser maior que 0.
                  </div>
                </div>

                <div class="col-12 small text-muted">
                  Peso total: <strong>{{ pesoTotal.toFixed(2) }} kg</strong>
                  <span v-if="naoSeiPeso" class="badge bg-info text-dark ms-2">Estimado</span>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Foto do Item</label>
                  <input type="file" @change="handleFileChange('foto_item', $event)" class="form-control bg-light border-0" accept="image/*" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Foto do Local</label>
                  <input type="file" @change="handleFileChange('foto_local', $event)" class="form-control bg-light border-0" accept="image/*" required />
                </div>

                <div class="col-12 mt-4">
                  <button
                    type="submit"
                    class="btn btn-mint w-100 btn-lg fw-bold py-3"
                    :disabled="loading || !podeSalvar"
                  >
                    <span v-if="!loading">Registrar descarte</span>
                    <span v-else>Registrando…</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5 col-xl-4 info-col">
        <div class="p-4 p-md-5 h-100 flex-grow-1 bg-mint text-white position-relative overflow-hidden d-flex flex-column justify-content-between anime-fade-in-right">
          
          <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
            <h3 class="fw-bold mb-5 display-6">Por que reciclar com a EcoRecicle?</h3>

            <div class="d-flex flex-column gap-5 flex-fill justify-content-center">
              <div class="d-flex gap-4">
                <div class="rounded-circle bg-white bg-opacity-25 p-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width:64px; height:64px;">
                  <i class="bi bi-tree-fill fs-3"></i>
                </div>
                <div>
                  <h4 class="fw-bold mb-2">Impacto Ambiental</h4>
                  <p class="mb-0 opacity-75 lead">Cada kg reciclado evita a emissão de CO₂ e preserva recursos naturais.</p>
                </div>
              </div>

              <div class="d-flex gap-4">
                <div class="rounded-circle bg-white bg-opacity-25 p-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width:64px; height:64px;">
                  <i class="bi bi-gift-fill fs-3"></i>
                </div>
                <div>
                  <h4 class="fw-bold mb-2">Ganhe Pontos</h4>
                  <p class="mb-0 opacity-75 lead">Seus descartes valem pontos que podem ser trocados por recompensas incríveis.</p>
                </div>
              </div>

              <div class="d-flex gap-4">
                <div class="rounded-circle bg-white bg-opacity-25 p-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width:64px; height:64px;">
                  <i class="bi bi-shield-fill-check fs-3"></i>
                </div>
                <div>
                  <h4 class="fw-bold mb-2">Descarte Seguro</h4>
                  <p class="mb-0 opacity-75 lead">Garantimos a destinação correta de resíduos eletrônicos perigosos.</p>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-5 border-top border-white border-opacity-25">
              <p class="opacity-75 mb-3 lead">Dúvidas sobre o que descartar?</p>
              <router-link to="/guia-reciclagem" class="btn btn-light btn-lg w-100 fw-bold text-mint py-3">
                <i class="bi bi-question-circle me-2"></i>Ver Guia de Reciclagem
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-mint { color: #10b981 !important; }
.bg-mint { background-color: #10b981 !important; }

.btn-mint {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
  transition: all 0.2s;
}
.btn-mint:hover {
  background-color: #059669;
  border-color: #059669;
  color: white;
  transform: translateY(-1px);
}
.btn-mint:disabled {
  background-color: #10b981;
  border-color: #10b981;
  opacity: 0.7;
}

.card-metric {
  box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
}

.layout-container {
  min-height: auto;
  background-color: #10b981;
}
.layout-row {
  min-height: auto;
}
.scrollable-col {
  max-height: none;
  overflow: visible;
  background-color: #f8f9fa;
}
.info-col {
  height: auto;
  min-height: 500px;
  background-color: #10b981;
}

@media (min-width: 992px) {
  .layout-container {
    min-height: calc(100vh - 60px);
    height: calc(100vh - 60px);
    overflow: hidden;
  }
  .layout-row {
    height: 100%;
  }
  .scrollable-col {
    height: 100%;
    overflow-y: auto;
  }
  .info-col {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

@media (min-width: 1200px) and (max-width: 1366px) {
  .p-md-5 {
    padding: 2rem !important;
  }
  .display-6 {
    font-size: 1.75rem;
  }
  .lead {
    font-size: 1rem;
  }
  .fs-3 {
    font-size: 1.25rem !important;
  }
  .card-metric {
    padding: 2rem !important;
  }
}

/* .anime-fade-in {
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
.anime-fade-in-right {
  animation: fadeInRight 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
} */
</style>