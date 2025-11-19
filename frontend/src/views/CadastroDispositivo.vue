<template>
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
            <input
              v-model.number="form.peso_por_item"
              type="number"
              min="0.01"
              step="0.01"
              class="form-control"
              required
            />
            <div class="invalid-feedback d-block" v-if="!ppiValido">
              O peso por item deve ser maior que 0.
            </div>
          </div>
        </div>

        <div class="small text-muted">
          Peso total: <strong>{{ pesoTotal.toFixed(2) }} kg</strong>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import store from '@/store'
import { usuariosApi, descartesApi } from '@/services/api'

const router = useRouter()
const toast = useToast()

// Usuário precisa estar logado e ser PF
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

const form = ref({
  ponto_coleta_id: null,
  tipo_residuo: tipos[0],
  quantidade: 1,
  peso_por_item: 1.00,
  foto_item: null,
  foto_local: null
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
/* só para manter o visual consistente caso falte o style global */
.card-metric {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(16,24,40,.06);
}
</style>
