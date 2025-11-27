import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import DashboardPF from '../views/DashboardPF.vue'
import DashboardPJ from '../views/DashboardPJ.vue'
import Recompensas from '../views/Recompensas.vue'
import Pontos from '../views/Pontos.vue'
import CadastroDispositivo from '../views/CadastroDispositivo.vue'
import RelatoriosPF from '../views/RelatoriosPF.vue'
import RelatoriosPJ from '../views/RelatoriosPJ.vue'
import Perfil from '../views/Perfil.vue'
import EditarPerfil from '../views/EditarPerfil.vue'
import store from '../store'
import GuiaReciclagem from '../views/GuiaReciclagem.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard-pf', name: 'DashboardPF', component: DashboardPF, meta: { requiresAuth: true, role: 'descartante' } },
  { path: '/dashboard-pj', name: 'DashboardPJ', component: DashboardPJ, meta: { requiresAuth: true, role: 'ponto_coleta' } },
  { path: '/relatorios/pf', name: 'RelatoriosPF', component: RelatoriosPF, meta: { requiresAuth: true, role: 'descartante' } },
  { path: '/relatorios/pj', name: 'RelatoriosPJ', component: RelatoriosPJ, meta: { requiresAuth: true, role: 'ponto_coleta' } },
  { path: '/recompensas', name: 'Recompensas', component: Recompensas, meta: { requiresAuth: true } },
  { path: '/pontos', name: 'Pontos', component: Pontos },
  { path: '/cadastro-dispositivo', name: 'CadastroDispositivo', component: CadastroDispositivo, meta: { requiresAuth: true, role: 'descartante' } },
  { path: '/perfil', name: 'Perfil', component: Perfil, meta: { requiresAuth: true } },
  { path: '/perfil/editar', name: 'EditarPerfil', component: EditarPerfil, meta: { requiresAuth: true } },
  { path: '/guia-reciclagem', name: 'GuiaReciclagem', component: GuiaReciclagem },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = !!store.usuario
  const userRole = store.usuario?.tipo_usuario

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.role && userRole && to.meta.role !== userRole) {
    // Redirecionar se o papel não corresponder
    if (userRole === 'descartante') next({ name: 'DashboardPF' })
    else if (userRole === 'ponto_coleta') next({ name: 'DashboardPJ' })
    else next({ name: 'Home' })
  } else {
    next()
  }
})

export default router