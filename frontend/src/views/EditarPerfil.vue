<!-- src/views/EditarPerfil.vue -->
<template>
  <div class="container narrow">
    <div class="card-metric p-4">
      <h3 class="mb-2">Meu perfil</h3>
      <p class="text-muted mb-3">Atualize seus dados da conta.</p>

      <!-- Erro de página -->
      <div v-if="pageError" class="alert alert-danger" role="alert">
        {{ pageError }}
      </div>

      <!-- Loading -->
      <div v-if="!ready && !pageError" class="d-flex align-items-center gap-2">
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span>Carregando…</span>
      </div>

      <!-- Formulário -->
      <form v-if="ready && !pageError" class="d-grid gap-3" @submit.prevent="salvar">
        <!-- Tipo (somente leitura) -->
        <div>
          <label class="form-label fw-semibold">Tipo de usuário</label>
          <input class="form-control" :value="tipoUsuarioLabel" disabled />
          <div class="form-text">Campo não editável.</div>
        </div>

        <!-- Nome / Email -->
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold">Nome</label>
            <input v-model.trim="form.nome" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Email</label>
            <input v-model.trim="form.email" type="email" class="form-control" required />
          </div>
        </div>

        <!-- Doc/Telefone -->
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label fw-semibold">CPF</label>
            <input v-model="cpfMask" @input="onMask('cpf')" inputmode="numeric" class="form-control" placeholder="000.000.000-00" />
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">CNPJ</label>
            <input v-model="cnpjMask" @input="onMask('cnpj')" inputmode="numeric" class="form-control" placeholder="00.000.000/0000-00" />
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Telefone</label>
            <input v-model="telefoneMask" @input="onMask('telefone')" inputmode="numeric" class="form-control" placeholder="(00) 00000-0000" />
          </div>
        </div>

        <!-- Endereço -->
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label fw-semibold">CEP</label>
            <input
              v-model="cepMask"
              @input="onMask('cep')"
              @blur="buscarCEP"
              inputmode="numeric"
              class="form-control"
              placeholder="00000-000"
            />
            <div class="form-text">Ao sair do campo, buscamos o endereço (ViaCEP).</div>
          </div>

          <div class="col-md-8">
            <label class="form-label fw-semibold">Logradouro</label>
            <input v-model.trim="form.logradouro" class="form-control" placeholder="Rua, Avenida..." />
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">Número</label>
            <input v-model.trim="form.numero" class="form-control" placeholder="nº" />
          </div>

          <div class="col-md-8">
            <label class="form-label fw-semibold">Bairro</label>
            <input v-model.trim="form.bairro" class="form-control" placeholder="Bairro" />
          </div>

          <div class="col-md-8">
            <label class="form-label fw-semibold">Cidade</label>
            <input v-model.trim="form.cidade" class="form-control" placeholder="Cidade" />
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">Estado (UF)</label>
            <input v-model.trim="form.estado" maxlength="2" class="form-control" placeholder="UF" />
          </div>
        </div>

        <div class="d-flex gap-2 mt-2">
          <button type="submit" class="btn btn--primary" :disabled="salvando">
            <span v-if="!salvando">Salvar alterações</span>
            <span v-else>Salvando…</span>
          </button>
          <router-link to="/" class="btn btn--ghost">Cancelar</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { usuariosApi } from '@/services/api'

/* -------- helpers máscaras -------- */
const onlyDigits = (v) => (v || '').replace(/\D+/g, '')
const maskCPF = (v) =>
  onlyDigits(v).slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
const maskCNPJ = (v) =>
  onlyDigits(v).slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
const maskCEP = (v) => onlyDigits(v).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
const maskPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

/* -------- estado -------- */
const toast = useToast()
const ready = ref(false)
const pageError = ref('')
const salvando = ref(false)

const form = reactive({
  id: null,
  tipo_usuario: '',
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  cnpj: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
})

const tipoUsuarioLabel = computed(() =>
  form.tipo_usuario === 'ponto_coleta' ? 'Ponto de Coleta (PJ)' : 'Descartante (PF)'
)

// models mascarados
const cpfMask = ref('')
const cnpjMask = ref('')
const cepMask = ref('')
const telefoneMask = ref('')

function onMask(kind) {
  if (kind === 'cpf') { cpfMask.value = maskCPF(cpfMask.value); form.cpf = onlyDigits(cpfMask.value) }
  if (kind === 'cnpj') { cnpjMask.value = maskCNPJ(cnpjMask.value); form.cnpj = onlyDigits(cnpjMask.value) }
  if (kind === 'cep') { cepMask.value = maskCEP(cepMask.value); form.cep = onlyDigits(cepMask.value) }
  if (kind === 'telefone') { telefoneMask.value = maskPhone(telefoneMask.value); form.telefone = onlyDigits(telefoneMask.value) }
}

/* -------- carregar perfil -------- */
async function carregar() {
  try {
    const { data } = await usuariosApi.me()
    if (!data) {
      pageError.value = 'Não foi possível carregar seu perfil.'
      return
    }
    Object.assign(form, data)
    // máscaras visuais
    cpfMask.value = form.cpf || ''
    cnpjMask.value = form.cnpj || ''
    cepMask.value = form.cep || ''
    telefoneMask.value = form.telefone || ''
    onMask('cpf'); onMask('cnpj'); onMask('cep'); onMask('telefone')
  } catch (e) {
    // Se vier 401, seu interceptor já deve redirecionar para login.
    const msg = e?.response?.data?.message || e.message
    pageError.value = `Erro ao carregar seu perfil: ${msg}`
    console.error('[EditarPerfil] carregar()', e)
  } finally {
    ready.value = true
  }
}
onMounted(carregar)

/* -------- ViaCEP -------- */
async function buscarCEP() {
  const cep = onlyDigits(cepMask.value)
  if (cep.length !== 8) return
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const j = await r.json()
    if (j?.erro) {
      toast.error('CEP não encontrado.')
      return
    }
    form.logradouro = j.logradouro || form.logradouro
    form.bairro     = j.bairro     || form.bairro
    form.cidade     = j.localidade || form.cidade
    form.estado     = (j.uf || form.estado || '').toUpperCase()
  } catch (e) {
    console.error('[EditarPerfil] ViaCEP', e)
  }
}

/* -------- salvar -------- */
async function salvar() {
  try {
    salvando.value = true
    const payload = {
      nome: form.nome?.trim() || null,
      email: form.email?.trim() || null,
      telefone: form.telefone || null,
      cpf: form.cpf || null,
      cnpj: form.cnpj || null,
      cep: form.cep || null,
      logradouro: form.logradouro?.trim() || null,
      numero: (form.numero ?? '').toString().trim() || null,
      bairro: form.bairro?.trim() || null,
      cidade: form.cidade?.trim() || null,
      estado: form.estado?.trim().toUpperCase() || null,
    }
    const { data } = await usuariosApi.updateMe(payload)
    Object.assign(form, data || {})
    toast.success('Perfil atualizado!')
  } catch (e) {
    const msg = e?.response?.data?.message || e.message
    toast.error(`Erro ao salvar: ${msg}`)
    console.error('[EditarPerfil] salvar()', e)
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.narrow{ max-width: 760px; margin: 24px auto; }
.text-muted{ color: var(--ecor-ink-500); }
.alert{ padding: 10px 12px; border-radius: 8px; }
.alert-danger{ background:#fde8e8; color:#b42318; border:1px solid #f9c6c6; }
.spinner-border{ width: 1rem; height: 1rem; }
</style>
