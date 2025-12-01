<!-- src/components/Navbar.vue -->
<template>
  <header class="ecor-navbar navbar navbar-expand-lg">
    <div class="container-fluid px-4">
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2" @click="closeMenu">
        <i class="bi bi-recycle brand-icon"></i>
        <span class="brand-text">EcoRecicle</span>
      </router-link>

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
            <router-link class="nav-link" to="/" @click="closeMenu">
              <i class="bi bi-house"></i> Início
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/pontos" @click="closeMenu">
              <i class="bi bi-geo-alt"></i> Pontos
            </router-link>
          </li>

          <!-- PF -->
          <template v-if="isAuth && isPF">
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'CadastroDispositivo' }" @click="closeMenu">
                <i class="bi bi-recycle"></i> Realizar Descarte
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/relatorios/pf" @click="closeMenu">
                <i class="bi bi-graph-up"></i> Relatórios
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/dashboard-pf" @click="closeMenu">
                <i class="bi bi-speedometer2"></i> Dashboard
              </router-link>
            </li>
          </template>

          <!-- PJ -->
          <template v-if="isAuth && isPJ">
            <li class="nav-item">
              <router-link class="nav-link" to="/relatorios/pj" @click="closeMenu">
                <i class="bi bi-graph-up"></i> Relatórios
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/dashboard-pj" @click="closeMenu">
                <i class="bi bi-speedometer2"></i> Dashboard
              </router-link>
            </li>
          </template>

          <!-- Auth -->
          <template v-if="!isAuth">
            <li class="nav-item">
              <router-link class="nav-link" to="/login" @click="closeMenu">
                <i class="bi bi-box-arrow-in-right"></i> Entrar
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register" @click="closeMenu">
                <i class="bi bi-person-plus"></i> Cadastrar
              </router-link>
            </li>
          </template>

          <li v-else class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle d-flex align-items-center gap-2"
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
                <router-link class="dropdown-item" to="/recompensas" @click="closeMenu">
                  <i class="bi bi-trophy"></i> Recompensas
                </router-link>
              </li>
              <li>
                <router-link to="/perfil" class="dropdown-item d-flex align-items-center gap-2" @click="closeMenu">
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
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import { Collapse } from 'bootstrap'

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
  closeMenu()
}

function closeMenu() {
  const navbarContent = document.getElementById('navbarContent')
  if (navbarContent && navbarContent.classList.contains('show')) {
    const bsCollapse = Collapse.getInstance(navbarContent) || new Collapse(navbarContent, { toggle: false })
    bsCollapse.hide()
  }
}
</script>

<style scoped>
/* Sem cores aqui — elas vêm do style.css global. */
.ecor-navbar{
  padding: 10px 0;
  position: sticky;
  top: 0;
  z-index: 1030;
  background-color: var(--ecor-mint-600);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.nav-links { gap: 0.75rem; }
.brand { gap: .5rem; }

/* Links e Brand com cor clara */
.ecor-navbar .nav-link,
.ecor-navbar .navbar-brand {
  color: var(--ecor-ink-50) !important;
  transition: opacity 0.2s;
}
.ecor-navbar .nav-link:hover {
  opacity: 0.9;
}
.ecor-navbar .navbar-toggler-icon {
  filter: invert(1); /* Garante ícone branco */
}

/* Dropdown (mantém fundo branco, texto escuro) */
.dropdown-menu {
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  border-radius: 12px;
  margin-top: 10px;
}
.dropdown-item {
  color: var(--ecor-ink-700);
  padding: 8px 16px;
}
.dropdown-item:hover {
  background-color: var(--ecor-mint-50);
  color: var(--ecor-mint-700);
}
.dropdown-item.text-danger {
  color: #dc3545 !important;
}
.dropdown-item.text-danger:hover {
  background-color: #fee2e2;
}

/* Mobile Overlay Menu */
@media (max-width: 991px) {
  .navbar-collapse {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--ecor-mint-600); /* Fundo verde no mobile também */
    padding: 1rem;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    z-index: 1000;
    border-radius: 0 0 12px 12px;
  }
}
</style>
