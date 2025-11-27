<!-- src/components/Navbar.vue -->
<template>
<<<<<<< HEAD
  <header class="ecor-navbar">
    <div class="container d-flex align-items-center justify-content-between">
      <router-link to="/" class="brand d-flex align-items-center gap-2">
=======
  <header class="ecor-navbar navbar navbar-expand-lg">
    <div class="container-fluid px-4">
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
>>>>>>> ecc2c48 (Alteração do frontend)
        <i class="bi bi-recycle brand-icon"></i>
        <span class="brand-text">EcoRecicle</span>
      </router-link>

<<<<<<< HEAD
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
=======
      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon" style="filter: invert(1);"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-3">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="bi bi-house"></i> Início
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/pontos">
              <i class="bi bi-geo-alt"></i> Pontos
            </router-link>
          </li>

          <!-- PF -->
          <template v-if="isAuth && isPF">
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'CadastroDispositivo' }">
                <i class="bi bi-recycle"></i> Realizar Descarte
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/relatorios/pf">
                <i class="bi bi-graph-up"></i> Relatórios
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/dashboard-pf">
                <i class="bi bi-speedometer2"></i> Dashboard
              </router-link>
            </li>
          </template>

          <!-- PJ -->
          <template v-if="isAuth && isPJ">
            <li class="nav-item">
              <router-link class="nav-link" to="/relatorios/pj">
                <i class="bi bi-graph-up"></i> Relatórios
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/dashboard-pj">
                <i class="bi bi-speedometer2"></i> Dashboard
              </router-link>
            </li>
          </template>

          <!-- Auth -->
          <template v-if="!isAuth">
            <li class="nav-item">
              <router-link class="nav-link" to="/login">
                <i class="bi bi-box-arrow-in-right"></i> Entrar
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/cadastro">
                <i class="bi bi-person-plus"></i> Cadastrar
              </router-link>
            </li>
          </template>

          <li v-else class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle btn btn--ghost d-flex align-items-center gap-2"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-person-circle"></i>
              {{ usuario?.nome || usuario?.email || 'Minha conta' }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/recompensas">
                  <i class="bi bi-trophy"></i> Recompensas
                </router-link>
              </li>
              <li>
                <router-link to="/perfil" class="dropdown-item d-flex align-items-center gap-2">
                  <i class="bi bi-person-circle"></i>
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
          </li>
        </ul>
      </div>
>>>>>>> ecc2c48 (Alteração do frontend)
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
<<<<<<< HEAD
=======

/* Mobile Overlay Menu */
@media (max-width: 991px) {
  .navbar-collapse {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--nav-bg); /* Use the navbar background variable */
    padding: 1rem;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    z-index: 1000;
    border-radius: 0 0 12px 12px;
  }
}
>>>>>>> ecc2c48 (Alteração do frontend)
</style>
