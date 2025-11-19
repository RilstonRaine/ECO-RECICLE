<!-- src/components/Navbar.vue -->
<template>
  <header class="ecor-navbar">
    <div class="container d-flex align-items-center justify-content-between">
      <router-link to="/" class="brand d-flex align-items-center gap-2">
        <i class="bi bi-recycle brand-icon"></i>
        <span class="brand-text">EcoRecicle</span>
      </router-link>

      <nav class="nav-links d-flex align-items-center gap-3">
        <router-link class="nav-link" to="/">
          <i class="bi bi-house"></i> Início
        </router-link>

        <router-link class="nav-link" to="/pontos">
          <i class="bi bi-geo-alt"></i> Pontos
        </router-link>

        <!-- PF -->
        <router-link
          v-if="isAuth && isPF"
          class="nav-link"
          :to="{ name: 'CadastroDispositivo' }"
        >
          <i class="bi bi-recycle"></i> Realizar Descarte
        </router-link>
        <router-link
          v-if="isAuth && isPF"
          class="nav-link"
          to="/relatorios/pf"
        >
          <i class="bi bi-graph-up"></i> Relatórios
        </router-link>
        <router-link
          v-if="isAuth && isPF"
          class="nav-link"
          to="/dashboard-pf"
        >
          <i class="bi bi-speedometer2"></i> Dashboard
        </router-link>

        <!-- PJ -->
        <router-link
          v-if="isAuth && isPJ"
          class="nav-link"
          to="/relatorios/pj"
        >
          <i class="bi bi-graph-up"></i> Relatórios
        </router-link>
        <router-link
          v-if="isAuth && isPJ"
          class="nav-link"
          to="/dashboard-pj"
        >
          <i class="bi bi-speedometer2"></i> Dashboard
        </router-link>

        <!-- Auth -->
        <template v-if="!isAuth">
          <router-link class="nav-link" to="/login">
            <i class="bi bi-box-arrow-in-right"></i> Entrar
          </router-link>
          <router-link class="nav-link" to="/cadastro">
            <i class="bi bi-person-plus"></i> Cadastrar
          </router-link>
        </template>

        <div v-else class="dropdown">
          <button
            class="btn btn--ghost dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-person-circle"></i>
            {{ usuario?.nome || usuario?.email || 'Minha conta' }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <router-link class="dropdown-item" to="/recompensas">
                <i class="bi bi-trophy"></i> Recompensas
              </router-link>
            </li>

            <li>
              <router-link to="/perfil"  class="dropdown-item d-flex align-items-center gap-2"
>              <i class="bi bi-person-circle fs-5"></i>
  <span>Meu Perfil</span>
</router-link>
            </li>

            <li><hr class="dropdown-divider" /></li>
            <li>
              <button class="dropdown-item text-danger" @click="logout">
                <i class="bi bi-box-arrow-right"></i> Sair
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'

function getLSUser() {
  try {
    return JSON.parse(localStorage.getItem('auth') || '{}')?.usuario || null
  } catch { return null }
}

const usuario = computed(() => store?.state?.usuario ?? store?.usuario ?? getLSUser())
const isAuth  = computed(() => !!usuario.value)
const isPF    = computed(() => usuario.value?.tipo_usuario === 'descartante')
const isPJ    = computed(() => usuario.value?.tipo_usuario === 'ponto_coleta')

const router = useRouter()
function logout() {
  try {
    if (typeof store.clear === 'function') store.clear()
    else if (store?.state) { store.state.token = null; store.state.usuario = null }
    else { store.token = null; store.usuario = null }
  } catch {}
  localStorage.removeItem('auth')
  router.push('/')
}
</script>

<style scoped>
/* Sem cores aqui — elas vêm do style.css global. */
.ecor-navbar{
  padding: 10px 0;
  position: sticky;
  top: 0;
  z-index: 20;
}
.nav-links { gap: 0.75rem; }
.brand { gap: .5rem; }
</style>
