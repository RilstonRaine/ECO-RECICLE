<template>
  <div class="container-narrow card-metric">
    <h4 class="mb-3">Entrar</h4>

    <form @submit.prevent="login">
      <div class="mb-2">
        <label class="form-label">Email</label>
        <input v-model="state.email" type="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Senha</label>
        <input v-model="state.senha" type="password" class="form-control" required />
      </div>

      <button class="btn btn-eco w-100" :disabled="state.loading">
        {{ state.loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="mt-3 mb-0">
      Não tem conta?
      <RouterLink to="/cadastro">Cadastre-se</RouterLink>
    </p>
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
