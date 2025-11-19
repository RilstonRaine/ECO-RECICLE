// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import DashboardPF from '../views/DashboardPF.vue'
import DashboardPJ from '../views/DashboardPJ.vue'
import Recompensas from '../views/Recompensas.vue'
import Pontos from '../views/Pontos.vue'
import CadastroDispositivo from '../views/CadastroDispositivo.vue'
import store from '../store'
import { getLicencaCached } from '@/services/licenca'
import ui from '@/store/ui'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/cadastro', name: 'Register', component: Register },

  { path: '/dashboard-pf', name: 'DashboardPF', component: DashboardPF, meta: { auth: true, role: 'descartante' } },
  { path: '/dashboard-pj', name: 'DashboardPJ', component: DashboardPJ, meta: { auth: true, role: 'ponto_coleta' } },

  { path: '/relatorios/pf', name: 'RelatoriosPF', component: () => import('../views/RelatoriosPF.vue'),
    meta: { auth: true, role: 'descartante', requiresPro: 'pf' } },
  { path: '/relatorios/pj', name: 'RelatoriosPJ', component: () => import('../views/RelatoriosPJ.vue'),
    meta: { auth: true, role: 'ponto_coleta', requiresPro: 'pj' } },

  { path: '/recompensas', name: 'Recompensas', component: Recompensas, meta: { auth: true, requiresPro: 'both' } },

  { path: '/pontos', name: 'Pontos', component: Pontos },
  { path: '/cadastro-dispositivo', name: 'CadastroDispositivo', component: CadastroDispositivo, meta: { auth: true, role: 'descartante' } },

  { path: '/pro', name: 'assinar-pro', component: () => import('../views/AssinarPro.vue'), meta: { auth: true } },

  // Meu Perfil (visão geral + botão “Editar perfil” abre modal)
  { path: '/perfil', name: 'Perfil', component: () => import('@/views/Perfil.vue'), meta: { auth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, _from, next) => {
  // Sem auth? segue
  if (!(to.meta?.auth || to.meta?.requiresAuth)) return next()

  // Usuário logado?
  const authLS = JSON.parse(localStorage.getItem('auth') || '{}')
  const user = store?.state?.usuario ?? store?.usuario ?? authLS?.usuario
  if (!user) return next({ name: 'Login', query: { redirect: to.fullPath } })

  // Papel correto?
  if (to.meta.role && user.tipo_usuario !== to.meta.role) {
    return next({ name: user.tipo_usuario === 'ponto_coleta' ? 'DashboardPJ' : 'DashboardPF' })
  }

  // PRO gating (mais resiliente)
  if (to.meta.requiresPro) {
    const need = to.meta.requiresPro // 'pf' | 'pj' | 'both'
    const isPF = user.tipo_usuario === 'descartante'
    const isPJ = user.tipo_usuario === 'ponto_coleta'

    // fallback local rápido (se o backend falhar)
    const localActive =
      (user?.plano === 'pro') &&
      (!!user?.pro_ativo || (user?.pro_ativo_ate && new Date(user.pro_ativo_ate) > new Date()))

    let ativo = localActive
    try {
      const lic = await getLicencaCached()
      if (lic) {
        ativo = !!(lic?.plano === 'pro' && (lic?.pro_ativo || (lic?.pro_ativo_ate && new Date(lic.pro_ativo_ate) > new Date())))
      }
    } catch {/* ignora e usa localActive */}

    const permitido =
      (need === 'pf'   && ativo && isPF) ||
      (need === 'pj'   && ativo && isPJ) ||
      (need === 'both' && ativo)

    if (!permitido) {
      // Não trava silenciosamente: redireciona para /pro
      // Se tiver UI de modal, usa; senão, redireciona mesmo.
      try {
        if (ui?.openProModal) {
          next(false)
          const reason = to.name?.toString().toLowerCase().includes('relatorio') ? 'reports' : 'rewards'
          ui.openProModal({ reason, need, after: to.fullPath })
          return
        }
      } catch {}
      return next({ name: 'assinar-pro', query: { after: to.fullPath } })
    }
  }

  next()
})

export default router