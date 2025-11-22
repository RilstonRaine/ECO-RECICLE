<!-- src/views/Register.vue -->
<template>
  <div class="container narrow">
    <div class="card-metric p-4">
      <h3 class="mb-2">Crie sua conta</h3>
      <p class="text-muted mb-3">
        Cadastre-se para ter acesso completo à plataforma e monitorar o descarte responsável.
      </p>

      <form class="d-grid gap-3" @submit.prevent="cadastrar">
        <!-- Tipo de usuário -->
        <div>
          <label class="form-label fw-semibold">Tipo de usuário</label>
          <select v-model="form.tipo_usuario" class="form-select" required>
            <option value="descartante">Descartante (PF)</option>
            <option value="ponto_coleta">Ponto de Coleta (PJ)</option>
          </select>
        </div>

        <!-- Nome -->
        <div>
          <label class="form-label fw-semibold">
            {{ isPJ ? 'Nome do ponto de coleta' : 'Nome completo' }}
          </label>
          <input v-model.trim="form.nome" class="form-control" required placeholder="Seu nome ou nome fantasia" />
        </div>

        <!-- Email / Senha -->
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold">Email</label>
            <input v-model.trim="form.email" type="email" class="form-control" required placeholder="seu@email.com"/>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Senha</label>
            <input v-model="form.senha" type="password" minlength="6" class="form-control" required placeholder="Mínimo 6 caracteres"/>
          </div>
        </div>

        <!-- Documento e telefone -->
        <div class="row g-3">
          <div class="col-md-6" v-if="!isPJ">
            <label class="form-label fw-semibold">CPF (opcional)</label>
            <input
              v-model="cpfMask"
              @input="onMask('cpf')"
              inputmode="numeric"
              class="form-control"
              placeholder="000.000.000-00"
            />
          </div>

          <div class="col-md-6" v-if="isPJ">
            <label class="form-label fw-semibold">CNPJ <span class="text-danger">*</span></label>
            <input
              v-model="cnpjMask"
              @input="onMask('cnpj')"
              inputmode="numeric"
              class="form-control"
              :required="isPJ"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Telefone</label>
            <input
              v-model="telefoneMask"
              @input="onMask('telefone')"
              inputmode="numeric"
              class="form-control"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <!-- Endereço (obrigatório para PJ) -->
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label fw-semibold">
              CEP <span v-if="isPJ" class="text-danger">*</span>
            </label>
            <input
              v-model="cepMask"
              @input="onMask('cep')"
              @blur="buscarCEP"
              inputmode="numeric"
              class="form-control"
              placeholder="00000-000"
              :required="isPJ"
            />
            <div class="form-text">Ao sair do campo, buscamos o endereço (ViaCEP).</div>
          </div>

          <div class="col-md-8">
            <label class="form-label fw-semibold">
              Logradouro <span v-if="isPJ" class="text-danger">*</span>
            </label>
            <input v-model.trim="form.logradouro" class="form-control" :required="isPJ" placeholder="Rua, Avenida, etc." />
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">
              Número <span v-if="isPJ" class="text-danger">*</span>
            </label>
            <input v-model.trim="form.numero" class="form-control" :required="isPJ" placeholder="nº" />
          </div>

          <div class="col-md-8">
            <label class="form-label fw-semibold">
              Bairro <span v-if="isPJ" class="text-danger">*</span>
            </label>
            <input v-model.trim="form.bairro" class="form-control" :required="isPJ" placeholder="Bairro" />
          </div>

          <div class="col-md-8">
            <label class="form-label fw-semibold">
              Cidade <span v-if="isPJ" class="text-danger">*</span>
            </label>
            <input v-model.trim="form.cidade" class="form-control" :required="isPJ" placeholder="Cidade" />
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">
              Estado (UF) <span v-if="isPJ" class="text-danger">*</span>
            </label>
            <input
              v-model.trim="form.estado"
              maxlength="2"
              class="form-control"
              :required="isPJ"
              placeholder="UF"
              @blur="form.estado = normalizeUF(form.estado)"
            />
          </div>
        </div>
        
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="aceiteTermos" id="termosCheck" required>
          <label class="form-check-label" for="termosCheck">
            Li e aceito os <a href="#" @click.prevent="showTerms = true">termos de uso</a>...
          </label>
        </div>

        <button type="submit" class="btn btn--primary mt-2" :disabled="loading">
          <span v-if="!loading">Criar conta</span>
          <span v-else>Criando conta…</span>
        </button>

        <div class="small mt-1">
          Já tem uma conta?
          <router-link to="/login">Faça login</router-link>
        </div>
      </form>
    </div>
  </div>
<TermsModal 
  v-if="showTerms" 
  @close="showTerms = false" 
  @accept="aceitarTermos" 
/>
  
</template>

<script setup>
import TermsModal from '@/components/TermsModal.vue'
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { authApi } from '@/services/api'

// ----------------- helpers de máscara -----------------
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
const maskCEP = (v) =>
  onlyDigits(v).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
const maskPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return d
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}
const normalizeUF = (uf) => (uf || '').replace(/[^A-Za-z]/g, '').slice(0,2).toUpperCase()

// ----------------- estado do formulário -----------------
const form = reactive({
  tipo_usuario: 'descartante',
  nome: '',
  email: '',
  senha: '',
  cpf: '',
  cnpj: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: ''
})

const isPJ = computed(() => form.tipo_usuario === 'ponto_coleta')

// models mascarados p/ inputs
const cpfMask = ref('')
const cnpjMask = ref('')
const cepMask = ref('')
const telefoneMask = ref('')

function onMask(kind) {
  if (kind === 'cpf') {
    cpfMask.value = maskCPF(cpfMask.value)
    form.cpf = onlyDigits(cpfMask.value)
  }
  if (kind === 'cnpj') {
    cnpjMask.value = maskCNPJ(cnpjMask.value)
    form.cnpj = onlyDigits(cnpjMask.value)
  }
  if (kind === 'cep') {
    cepMask.value = maskCEP(cepMask.value)
    form.cep = onlyDigits(cepMask.value)
  }
  if (kind === 'telefone') {
    telefoneMask.value = maskPhone(telefoneMask.value)
    form.telefone = onlyDigits(telefoneMask.value)
  }
}

// ----------------- busca CEP (ViaCEP) -----------------
const loading = ref(false)
const toast = useToast()
const router = useRouter()

async function buscarCEP() {
  const cep = onlyDigits(cepMask.value)
  if (cep.length !== 8) return
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await resp.json()
    if (data?.erro) {
      toast.error('CEP não encontrado.')
      return
    }
    form.logradouro = data.logradouro || form.logradouro
    form.bairro     = data.bairro     || form.bairro
    form.cidade     = data.localidade || form.cidade
    form.estado     = normalizeUF(data.uf || form.estado)
  } catch (e) {
    // silencioso; usuário pode digitar manualmente
  }
}

// ----------------- envio -----------------
function validarPJObrigatorios() {
  if (!isPJ.value) return true
  const faltando = []
  if (!form.cnpj || form.cnpj.length !== 14) faltando.push('CNPJ')
  if (!form.cep || form.cep.length !== 8)    faltando.push('CEP')
  if (!form.logradouro) faltando.push('Logradouro')
  if (!form.numero)     faltando.push('Número')
  if (!form.bairro)     faltando.push('Bairro')
  if (!form.cidade)     faltando.push('Cidade')
  if (!normalizeUF(form.estado)) faltando.push('Estado (UF)')
  if (faltando.length) {
    toast.error(`Preencha: ${faltando.join(', ')}`)
    return false
  }
  return true
}

async function cadastrar() {
  if (!aceiteTermos.value) {
    toast.error('Você deve aceitar os termos de uso para continuar.')
    return
  }
  if (!validarPJObrigatorios()) return
  try {
    loading.value = true
    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      senha: form.senha,
      tipo_usuario: form.tipo_usuario,
      telefone: form.telefone || null,
      cpf: form.cpf || null,
      cnpj: isPJ.value ? form.cnpj : null,
      cep: isPJ.value ? form.cep : null,
      logradouro: isPJ.value ? form.logradouro.trim() : null,
      numero: isPJ.value ? String(form.numero).trim() : null,
      bairro: isPJ.value ? form.bairro.trim() : null,
      cidade: isPJ.value ? form.cidade.trim() : null,
      estado: isPJ.value ? normalizeUF(form.estado) : null
    }

    await authApi.cadastro(payload)
    toast.success('Cadastro realizado! Faça login.')
    router.push('/login')
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.data?.error || e.message
    toast.error(`Erro no cadastro: ${msg}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.narrow{ max-width: 760px; margin: 24px auto; }

.text-muted{ color: var(--ecor-ink-600); }
</style>
