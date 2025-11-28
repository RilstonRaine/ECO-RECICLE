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

        <p class="mt-3 mb-0 text-center text-muted">
          Não tem conta?
          <RouterLink to="/register" class="fw-bold text-mint text-decoration-none">Cadastre-se</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import store from '../store'
import { authApi } from '../services/api'

const router = useRouter()
const state = reactive({ email: '', senha: '', loading: false })

async function login() {
  state.loading = true
  try {
    const { data } = await authApi.login(state.email, state.senha)
    store.setAuth({ token: data.token, usuario: data.usuario })
    router.push(data.usuario.tipo_usuario === 'ponto_coleta' ? '/dashboard-pj' : '/dashboard-pf')
  } catch (e) {
    alert(e?.response?.data?.message || e.message)
  } finally {
    state.loading = false
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
</style>
