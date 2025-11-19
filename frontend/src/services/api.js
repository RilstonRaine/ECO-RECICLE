// src/services/api.js
import axios from 'axios'
import router from '../router'
import store from '../store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  // withCredentials: true, // habilite se usar cookies/sessions
})

/* ---------------------------
   Helpers
--------------------------- */
// aceita { params: {...} } ou diretamente { ... }
const pickParams = (obj) =>  Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''));

// Helper para limpar auth com fallback seguro
function clearAuthSafely() {
  try {
    if (typeof store?.clear === 'function') store.clear()
    else if (store?.state) {
      store.state.token = null
      store.state.usuario = null
    } else {
      store.token = null
      store.usuario = null
    }
  } catch {}
  localStorage.removeItem('auth')
}

/* ---------------------------
   Interceptors
--------------------------- */
api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {}

  // Injeta token
  const auth = localStorage.getItem('auth')
  if (auth) {
    const { token } = JSON.parse(auth)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }

  // Não force Content-Type em FormData
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData

  if (isFormData) {
    delete config.headers['Content-Type']
  } else {
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
  }

  return config
})

api.interceptors.response.use(
  (resp) => resp,
  async (err) => {
    if (!err?.response) return Promise.reject(err)

    const status = err.response.status
    if (status === 401) {
      const path = err?.config?.url || ''
      const isAuthPath =
        path.startsWith('/auth/login') || path.startsWith('/auth/cadastro')

      clearAuthSafely()

      if (!isAuthPath) {
        const current = router.currentRoute?.value
        if (!current || current.name !== 'Login') {
          try { await router.push({ name: 'Login' }) } catch {}
        }
      }
    }
    return Promise.reject(err)
  }
)

/* ======================
   Endpoints
   ====================== */
export const authApi = {
  login:    (email, senha) => api.post('/auth/login', { email, senha }),
  cadastro: (payload)      => api.post('/auth/cadastro', payload),
}


export const usuariosApi = {
  listar:       (params)   => api.get('/usuarios', { params: pickParams(params) }),
  listarPontos: (params)   => api.get('/usuarios/pontos', { params: pickParams(params) }),
  me:           (params)   => api.get('/usuarios/me', { params: pickParams(params) }),
  updateMe:     (payload)  => api.put('/usuarios/me', payload),
  resgatados:   (params)   => api.get('/usuarios/me/resgates', { params: pickParams(params) }),
}

export const descartesApi = {
  listar:  (params = {})         => api.get('/descartes', { params: pickParams(params) }),
  criar:   (payload)             => api.post('/descartes', payload),
  ultimos: (limit = 5, params={})=> api.get('/descartes/ultimos', { params: { ...pickParams(params), limit } }),
  detalhe: (id)                  => api.get(`/descartes/${id}`),
}

/* ------------- NOVO: RESGATES (recompensas resgatadas por usuários) ------------- */
export const resgatesApi = {
  // Ex.: resgatesApi.listar({ params: { include:'usuario,recompensa', from, to, status, ponto_id } })
  listar: ({ params } = {}) => api.get('/resgates', { params }),
}

export const licencasApi = {
  status:  ()           => api.get('/licencas/me'),
  upgrade: (dias = 30)  => api.post('/licencas/upgrade', { dias }),
}

export const relatoriosApi = {
  exportPF(format, report, params = {}) {
    return api.get(`/relatorios/pf/export/${report}.${format}`, {
      params: pickParams(params),
      responseType: 'blob',
    })
  },
  exportPJ(format, report, params = {}) {
    return api.get(`/relatorios/pj/export/${report}.${format}`, {
      params: pickParams(params),
      responseType: 'blob',
    })
  },
  exportPFPdf(reportOrParams, maybeParams) {
    const [report, params] =
      typeof reportOrParams === 'string'
        ? [reportOrParams, maybeParams]
        : ['descartes', reportOrParams]
    return api.get(`/relatorios/pf/export/${report}.pdf`, {
      params: pickParams(params),
      responseType: 'blob',
    })
  },
  exportPFXlsx(reportOrParams, maybeParams) {
    const [report, params] =
      typeof reportOrParams === 'string'
        ? [reportOrParams, maybeParams]
        : ['descartes', reportOrParams]
    return api.get(`/relatorios/pf/export/${report}.xlsx`, {
      params: pickParams(params),
      responseType: 'blob',
    })
  },
  exportPJPdf(reportOrParams, maybeParams) {
    const [report, params] =
      typeof reportOrParams === 'string'
        ? [reportOrParams, maybeParams]
        : ['descartes', reportOrParams]
    return api.get(`/relatorios/pj/export/${report}.pdf`, {
      params: pickParams(params),
      responseType: 'blob',
    })
  },
  exportPJXlsx(reportOrParams, maybeParams) {
    const [report, params] =
      typeof reportOrParams === 'string'
        ? [reportOrParams, maybeParams]
        : ['descartes', reportOrParams]
    return api.get(`/relatorios/pj/export/${report}.xlsx`, {
      params: pickParams(params),
      responseType: 'blob',
    })
  },
}

export const recompensasApi = {
  // Ranking de pontuadores em um ponto (PJ)
  leaderboardPJ: (params = {}) =>
    api.get('/recompensas/pj/leaderboard', { params: pickParams(params) }),

  // Criar recompensa (PJ)
  criar: (payload) =>
    api.post('/recompensas', payload),

  // Minhas recompensas criadas (PJ), com filtros de período/status
  minhasPJ: (params = {}) =>
    api.get('/recompensas/pj/minhas', { params: pickParams(params) }),

  // Listar recompensas ativas para PF
  listarAtivas: () =>
    api.get('/recompensas/ativas'),

  // Encerrar recompensa (PJ)
  encerrar: (id) =>
    api.post(`/recompensas/${id}/encerrar`),

  // Resgatar recompensa (PF)
  resgatar: (id) =>
    api.post(`/recompensas/${id}/resgatar`),

  // Relatório de resgates (caso use em outro lugar)
  resgates: (params = {}) =>
    api.get('/recompensas/resgates', { params: pickParams(params) }),
}

export const auditoriaApi = {
  reportarProblema: (descarteId, descricao) =>
    api.post('/auditoria/reportarProblema', { descricao, descarte_id: descarteId }),
  listarAuditorias: () => api.get('/auditoria/listarAuditorias'),
}

/* Utils */
export function baixarBlob(blob, nome) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default api
