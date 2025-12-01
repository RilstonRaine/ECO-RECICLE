<template>
  <div class="container-fluid d-flex align-items-center justify-content-center bg-light" style="min-height: calc(100vh - 76px);">
    <div class="w-100 p-3" style="max-width: 550px;">
      <div class="card-metric p-5 shadow-sm border-0 bg-white rounded-4">
        <h2 class="mb-4 text-center fw-bold">Login</h2>
        <p class="text-center text-muted">Faça login para acessar sua conta</p>

        <form @submit.prevent="login">
          <div class="mb-3">
            <label class="form-label fw-semibold">Email</label>
            <input v-model="state.email" type="email" class="form-control form-control-lg bg-light border-0" required placeholder="seu@email.com" />
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Senha</label>
            <input v-model="state.senha" type="password" class="form-control form-control-lg bg-light border-0" required placeholder="Sua senha" />
          </div>

          <button class="btn btn-mint w-100 btn-lg mb-3 fw-bold py-3" :disabled="state.loading">
            {{ state.loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="mt-3 d-flex flex-column align-items-center gap-2">
          <button type="button" class="btn btn-link text-decoration-none p-0 fw-bold text-mint" @click="showForgot = true">
            Esqueci a senha
          </button>
          <span class="text-muted">
            Não tem conta?
            <RouterLink to="/register" class="fw-bold text-mint text-decoration-none ms-1">Cadastre-se</RouterLink>
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Esqueci a Senha -->
    <div v-if="showForgot" class="ecor-modal">
      <div class="ecor-backdrop" @click="showForgot = false"></div>
      <div class="ecor-panel">
        <button class="ecor-close" @click="showForgot = false">×</button>
        <h4 class="mb-3 fw-bold text-center">Redefinir Senha</h4>
        <p class="text-muted text-center mb-4">
          Informe seu e-mail cadastrado para receber as instruções de redefinição.
        </p>

        <form @submit.prevent="sendForgot">
          <div class="mb-3">
            <label class="form-label fw-semibold">E-mail</label>
            <input
              v-model="forgotEmail"
              type="email"
              class="form-control bg-light border-0"
              required
              placeholder="seu@email.com"
            />
          </div>

          <button class="btn btn-mint w-100 fw-bold py-2" :disabled="forgotLoading">
            {{ forgotLoading ? 'Enviando...' : 'Enviar instruções' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import store from '../store'
import { authApi } from '../services/api'
import api from '../services/api' // import genérico para chamada avulsa se precisar, ou usar authApi

const router = useRouter()
const toast = useToast()
const state = reactive({ email: '', senha: '', loading: false })

// Esqueci a senha
const showForgot = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)

async function login() {
  state.loading = true
  try {
    const { data } = await authApi.login(state.email, state.senha)
    store.setAuth({ token: data.token, usuario: data.usuario })
    router.push(data.usuario.tipo_usuario === 'ponto_coleta' ? '/dashboard-pj' : '/dashboard-pf')
  } catch (e) {
    toast.error(e?.response?.data?.message || e.message)
  } finally {
    state.loading = false
  }
}

async function sendForgot() {
  if (!forgotEmail.value) return
  forgotLoading.value = true
  try {
    // Chamada direta ao endpoint novo
    await api.post('/auth/verificar-email', { email: forgotEmail.value })
    toast.success('E-mail de redefinição enviado com sucesso!')
    showForgot.value = false
    forgotEmail.value = ''
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Erro ao verificar e-mail.')
  } finally {
    forgotLoading.value = false
  }
}
</script>
<style scoped>
.text-mint { color: #10b981 !important; }

.btn-mint {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
  transition: all 0.2s;
}
.btn-mint:hover {
  background-color: #059669;
  border-color: #059669;
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

/* Modal styles (reaproveitados ou inline) */
.ecor-modal { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; }
.ecor-backdrop { position: absolute; inset: 0; background: rgba(15,23,42,.35); backdrop-filter: blur(4px); }
.ecor-panel {
  position: relative; width: min(400px, calc(100vw - 32px));
  background: #fff; border-radius: 16px; box-shadow: 0 24px 48px rgba(16,24,40,.18);
  padding: 24px; animation: pop .14s ease-out;
}
.ecor-close { position: absolute; top: 12px; right: 12px; font-size: 24px; border: 0; background: transparent; cursor: pointer; color: #666; }
@keyframes pop { from{transform:scale(.95); opacity:0} to{transform:scale(1); opacity:1} }
</style>
