<!-- src/views/Perfil.vue -->
<template>
  <div class="container py-3">
    <div class="card-metric p-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h3 class="mb-1">Meu perfil</h3>
          <p class="text-muted mb-0">Veja seus dados e atualize quando precisar.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn--ghost" @click="carregar" :disabled="loading">
            Recarregar
          </button>
          <button class="btn btn--primary" @click="abrirEditar" :disabled="loading || !perfil">
            Editar perfil
          </button>
        </div>
      </div>

      <!-- Estado de erro -->
      <div v-if="erro" class="alert alert-danger my-3">
        {{ erro }}
      </div>

      <!-- Skeleton / carregando -->
      <div v-if="loading && !perfil" class="text-muted py-4">Carregando…</div>

      <!-- Dados -->
      <div v-if="perfil" class="row mt-3 g-3">
        <div class="col-md-6">
          <div class="card p-3 h-100">
            <h6 class="fw-semibold mb-3">Informações básicas</h6>
            <dl class="row mb-0">
              <dt class="col-5">Nome</dt><dd class="col-7">{{ perfil.nome }}</dd>
              <dt class="col-5">E-mail</dt><dd class="col-7">{{ perfil.email }}</dd>
              <dt class="col-5">Telefone</dt><dd class="col-7">{{ perfil.telefone || '—' }}</dd>
              <dt class="col-5">Tipo de usuário</dt>
              <dd class="col-7">
                {{ perfil.tipo_usuario === 'ponto_coleta' ? 'Ponto de Coleta (PJ)' : 'Descartante (PF)' }}
              </dd>
              <dt class="col-5" v-if="perfil.cpf">CPF</dt><dd class="col-7" v-if="perfil.cpf">{{ perfil.cpf }}</dd>
              <dt class="col-5" v-if="perfil.cnpj">CNPJ</dt><dd class="col-7" v-if="perfil.cnpj">{{ perfil.cnpj }}</dd>
            </dl>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card p-3 h-100">
            <h6 class="fw-semibold mb-3">Plano</h6>
            <div class="d-flex align-items-center gap-2">
              <span class="badge" :class="perfil.plano === 'pro' ? 'bg-success' : 'bg-secondary'">
                {{ perfil.plano?.toUpperCase() || 'FREE' }}
              </span>
              <span v-if="perfil.pro_ativo_ate" class="small text-muted">
                Ativo até {{ formatarData(perfil.pro_ativo_ate) }}
              </span>
            </div>

            <hr>

            <h6 class="fw-semibold mb-2">Endereço</h6>
            <p class="mb-0">
              <span v-if="perfil.logradouro">{{ perfil.logradouro }}</span>
              <span v-if="perfil.numero">, {{ perfil.numero }}</span>
              <span v-if="perfil.bairro"> - {{ perfil.bairro }}</span>
              <br v-if="perfil.logradouro || perfil.bairro || perfil.numero">
              <span v-if="perfil.cidade">{{ perfil.cidade }}</span>
              <span v-if="perfil.estado"> / {{ perfil.estado }}</span>
              <span v-if="perfil.cep"> • CEP {{ perfil.cep }}</span>
              <span v-if="!perfil.logradouro && !perfil.cidade && !perfil.estado && !perfil.cep">—</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de edição -->
    <div v-if="showEdit" class="ecor-modal">
      <div class="ecor-backdrop" @click="fecharEditar"></div>
      <div class="ecor-panel">
        <button class="ecor-close" @click="fecharEditar">×</button>
        <h5 class="mb-3">Editar perfil</h5>

        <form class="d-grid gap-3" @submit.prevent="salvar">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Nome</label>
              <input v-model.trim="form.nome" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">E-mail</label>
              <input v-model.trim="form.email" type="email" class="form-control" required />
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Telefone</label>
              <input v-model.trim="form.telefone" class="form-control" placeholder="(00) 00000-0000" />
            </div>

            <div class="col-md-6" v-if="isPF">
              <label class="form-label fw-semibold">CPF</label>
              <input v-model.trim="form.cpf" class="form-control" placeholder="000.000.000-00" />
            </div>
            <div class="col-md-6" v-if="isPJ">
              <label class="form-label fw-semibold">CNPJ</label>
              <input v-model.trim="form.cnpj" class="form-control" placeholder="00.000.000/0000-00" />
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold">CEP</label>
              <input v-model.trim="form.cep" @blur="buscarCEP" class="form-control" placeholder="00000-000" />
              <div class="form-text">Ao sair do campo, preenche via ViaCEP.</div>
            </div>
            <div class="col-md-8">
              <label class="form-label fw-semibold">Logradouro</label>
              <input v-model.trim="form.logradouro" class="form-control" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Número</label>
              <input v-model.trim="form.numero" class="form-control" />
            </div>
            <div class="col-md-8">
              <label class="form-label fw-semibold">Bairro</label>
              <input v-model.trim="form.bairro" class="form-control" />
            </div>
            <div class="col-md-8">
              <label class="form-label fw-semibold">Cidade</label>
              <input v-model.trim="form.cidade" class="form-control" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Estado (UF)</label>
              <input v-model.trim="form.estado" maxlength="2" class="form-control" placeholder="UF" />
            </div>
          </div>

          <div class="d-flex gap-2 mt-2">
            <button type="submit" class="btn btn--primary" :disabled="saving">
              <span v-if="!saving">Salvar</span>
              <span v-else>Salvando…</span>
            </button>
            <button type="button" class="btn btn--ghost" @click="fecharEditar" :disabled="saving">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { usuariosApi } from '@/services/api'

const toast = useToast()

const perfil = ref(null)
const loading = ref(false)
const saving  = ref(false)
const erro    = ref('')
const showEdit = ref(false)

const form = reactive({
  nome: '', email: '', telefone: '',
  cpf: '', cnpj: '',
  cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: ''
})

const isPJ = computed(() => perfil.value?.tipo_usuario === 'ponto_coleta')
const isPF = computed(() => perfil.value?.tipo_usuario === 'descartante')

function seedForm() {
  if (!perfil.value) return
  const p = perfil.value
  form.nome = p.nome || ''
  form.email = p.email || ''
  form.telefone = p.telefone || ''
  form.cpf = p.cpf || ''
  form.cnpj = p.cnpj || ''
  form.cep = p.cep || ''
  form.logradouro = p.logradouro || ''
  form.numero = p.numero || ''
  form.bairro = p.bairro || ''
  form.cidade = p.cidade || ''
  form.estado = p.estado || ''
}

async function carregar() {
  try {
    erro.value = ''
    loading.value = true
    const { data } = await usuariosApi.me()
    perfil.value = data
  } catch (e) {
    erro.value = `Erro ao carregar seu perfil: ${e?.response?.data?.message || e.message}`
    toast.error(erro.value)
  } finally {
    loading.value = false
  }
}

function abrirEditar() {
  seedForm()
  showEdit.value = true
}
function fecharEditar() {
  showEdit.value = false
}

async function buscarCEP() {
  const cep = (form.cep || '').replace(/\D+/g, '')
  if (cep.length !== 8) return
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const j = await r.json()
    if (j?.erro) return
    form.logradouro = form.logradouro || j.logradouro || ''
    form.bairro     = form.bairro     || j.bairro     || ''
    form.cidade     = form.cidade     || j.localidade || ''
    form.estado     = form.estado     || (j.uf || '').toUpperCase()
  } catch {}
}

function compactPayload(obj) {
  const out = {}
  for (const k of Object.keys(obj)) {
    if (obj[k] !== undefined) out[k] = obj[k]
  }
  return out
}

async function salvar() {
  try {
    saving.value = true
    erro.value = ''

    const payload = compactPayload({
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      cpf: isPF.value ? form.cpf : null,
      cnpj: isPJ.value ? form.cnpj : null,
      cep: form.cep,
      logradouro: form.logradouro,
      numero: form.numero,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.estado
      // latitude/longitude NÃO são enviadas; o back já aceita sem elas
    })

    const { data } = await usuariosApi.updateMe(payload)
    perfil.value = data
    toast.success('Perfil atualizado!')
    fecharEditar()
  } catch (e) {
    const msg = e?.response?.data?.message || e.message
    erro.value = `Erro ao salvar: ${msg}`
    toast.error(erro.value)
  } finally {
    saving.value = false
  }
}

function formatarData(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString()
  } catch { return iso }
}

onMounted(carregar)
</script>

<style scoped>
.card-metric { background: #fff; border-radius: 12px; box-shadow: 0 10px 28px rgba(2,6,23,.06); }
.text-muted { color: var(--ecor-ink-500); }

/* Modal (mesmo padrão usado em Pontos.vue) */
.ecor-modal{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; }
.ecor-backdrop{ position:absolute; inset:0; background:rgba(15,23,42,.35); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); }
.ecor-panel{
  position:relative; width:min(820px, calc(100vw - 32px));
  background:#fff; border-radius:12px; box-shadow:0 24px 48px rgba(16,24,40,.18);
  padding:18px; animation:pop .14s ease-out;
}
.ecor-close{ position:absolute; top:8px; right:10px; font-size:22px; border:0; background:transparent; cursor:pointer }
@keyframes pop{ from{transform:scale(.98); opacity:0} to{transform:scale(1); opacity:1} }
</style>
