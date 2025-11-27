<template>
<<<<<<< HEAD
  <div class="container" style="max-width: 720px;">
    <div class="card-metric" style="padding: 22px;">
      <h3 class="mb-3">Cadastrar Descarte</h3>

      <form @submit.prevent="salvar" class="d-grid gap-3" novalidate>
        <!-- Ponto de coleta -->
        <div>
          <label class="form-label fw-semibold">Ponto de Coleta</label>
          <select v-model.number="form.ponto_coleta_id" class="form-select" required>
            <option :value="null" disabled>Selecione</option>
            <option
              v-for="p in pontosColeta"
              :key="p.id"
              :value="p.id"
            >
              {{ p.nome || ('Ponto #' + p.id) }} — {{ resumoEndereco(p) }}
            </option>
          </select>
          <div class="form-text" v-if="!pontosColeta.length">
            Nenhum ponto encontrado. Verifique se há pontos de coleta cadastrados.
          </div>
        </div>

        <!-- Tipo de resíduo -->
        <div>
          <label class="form-label fw-semibold">Tipo de resíduo</label>
          <select v-model="form.tipo_residuo" class="form-select" required>
            <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <!-- Quantidade e Peso por item -->
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold">Quantidade de itens</label>
            <input
              v-model.number="form.quantidade"
              type="number"
              min="1"
              step="1"
              class="form-control"
              required
            />
            <div class="invalid-feedback d-block" v-if="!qtdValida">
              Informe uma quantidade.
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Peso por item (kg)</label>
            <div class="input-group">
              <input
                v-model.number="form.peso_por_item"
                type="number"
                min="0.01"
                step="0.01"
                class="form-control"
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
        </div>

        <div class="small text-muted">
          Peso total: <strong>{{ pesoTotal.toFixed(2) }} kg</strong>
          <span v-if="naoSeiPeso" class="badge bg-info text-dark ms-2">Estimado</span>
        </div>

        <!-- Campos para upload das fotos -->
        <div>
          <label class="form-label fw-semibold">Foto do Item</label>
          <input type="file" @change="handleFileChange('foto_item', $event)" class="form-control" accept="image/*" required />
        </div>
        <div>
          <label class="form-label fw-semibold">Foto do Local</label>
          <input type="file" @change="handleFileChange('foto_local', $event)" class="form-control" accept="image/*" required />
        </div>

        <button
          type="submit"
          class="btn btn--primary w-100"
          :disabled="loading || !podeSalvar"
        >
          <span v-if="!loading">Registrar descarte</span>
          <span v-else>Registrando…</span>
        </button>
      </form>
=======
  <div class="container-fluid p-0" style="min-height: calc(100vh - 76px);">
    <div class="row g-0" style="min-height: calc(100vh - 76px);">
      <div class="col-lg-7 col-xl-8 overflow-auto" style="max-height: calc(100vh - 76px);">
        <div class="p-4 h-100 d-flex flex-column justify-content-center">
          <div class="w-100">
            <h3 class="mb-4 fw-bold text-mint">Cadastrar Descarte</h3>

            <form @submit.prevent="salvar" class="row g-3" novalidate>
              <div class="col-md-12">
                <label class="form-label fw-semibold">Ponto de Coleta</label>
                <select v-model.number="form.ponto_coleta_id" class="form-select form-select-lg" required>
                  <option :value="null" disabled>Selecione um ponto de entrega</option>
                  <option
                    v-for="p in pontosColeta"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.nome || ('Ponto #' + p.id) }} — {{ resumoEndereco(p) }}
                  </option>
                </select>
                <div class="form-text" v-if="!pontosColeta.length">
                  Nenhum ponto encontrado. Verifique se há pontos de coleta cadastrados.
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Tipo de resíduo</label>
                <select v-model="form.tipo_residuo" class="form-select" required>
                  <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Qtd. Itens</label>
                <input
                  v-model.number="form.quantidade"
                  type="number"
                  min="1"
                  step="1"
                  class="form-control"
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
                    class="form-control"
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
                <input type="file" @change="handleFileChange('foto_item', $event)" class="form-control" accept="image/*" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Foto do Local</label>
                <input type="file" @change="handleFileChange('foto_local', $event)" class="form-control" accept="image/*" required />
              </div>

              <div class="col-12 mt-4">
                <button
                  type="submit"
                  class="btn btn--primary w-100"
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

      <div class="col-lg-5 col-xl-4 h-100">
        <div class="p-5 h-100 bg-mint text-white position-relative overflow-hidden d-flex flex-column justify-content-center">
          <div class="position-absolute top-0 end-0 opacity-10 p-3">
             <i class="bi bi-recycle display-1"></i>
          </div>

          <div class="position-relative z-1 d-flex flex-column h-100 justify-content-center">
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
>>>>>>> ecc2c48 (Alteração do frontend)
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import store from '@/store'
import { usuariosApi, descartesApi } from '@/services/api'

const router = useRouter()
const toast = useToast()

<<<<<<< HEAD
// Usuário precisa estar logado e ser PF
=======
>>>>>>> ecc2c48 (Alteração do frontend)
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

<<<<<<< HEAD
// Mapa de pesos médios (em kg)
=======
>>>>>>> ecc2c48 (Alteração do frontend)
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
  tipo_residuo: tipos[0],
  quantidade: 1,
  peso_por_item: 1.00,
  foto_item: null,
  foto_local: null
})

const naoSeiPeso = ref(false)

<<<<<<< HEAD
// Atualiza peso quando muda o tipo ou marca o checkbox
=======
>>>>>>> ecc2c48 (Alteração do frontend)
watch([() => form.value.tipo_residuo, naoSeiPeso], ([novoTipo, isEstimado]) => {
  if (isEstimado) {
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
  form.value.foto_item && // Verificando se a foto do item foi selecionada
  form.value.foto_local    // Verificando se a foto do local foi selecionada
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
    fd.append('foto_item', form.value.foto_item);   // arquivos
    fd.append('foto_local', form.value.foto_local); // arquivos

    await descartesApi.criar(fd); // agora manda multipart
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

<style scoped>
<<<<<<< HEAD
/* só para manter o visual consistente caso falte o style global */
.card-metric {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(16,24,40,.06);
=======
/* Cores do tema (Verde/Mint) */
.text-mint { color: #10b981 !important; }
.bg-mint { background-color: #10b981 !important; }

.btn-mint {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}
.btn-mint:hover {
  background-color: #059669;
  border-color: #059669;
  color: white;
}
.btn-mint:disabled {
  background-color: #10b981;
  border-color: #10b981;
  opacity: 0.65;
>>>>>>> ecc2c48 (Alteração do frontend)
}
</style>
