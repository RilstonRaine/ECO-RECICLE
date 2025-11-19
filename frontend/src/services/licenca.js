// src/services/licenca.js
import api from './api'

// Endpoints brutos (usados pelo router e por telas)
export const licencasApi = {
  status: () => api.get('/licencas/me'),
  upgrade: (dias = 30) => api.post('/licencas/upgrade', { dias }),
}

// Helpers convenientes
let _cache = null
let _cacheAt = 0
const TTL = 60_000 // 1 minuto

export async function getMinhaLicenca() {
  const { data } = await licencasApi.status()
  return data
}


export async function upgradePro(dias = 30) {
  const { data } = await api.post('/licencas/upgrade', { dias })
  // invalida cache local se você usa
  try { window.dispatchEvent(new CustomEvent('licenca:changed')) } catch {}
  return data
}

export async function getLicencaCached({ force = false } = {}) {
  const now = Date.now()
  if (!force && _cache && now - _cacheAt < TTL) return _cache
  const data = await getMinhaLicenca()
  _cache = data
  _cacheAt = now
  return data
}

export function clearLicencaCache() {
  _cache = null
  _cacheAt = 0
}

export function isProAtivo(lic) {
  if (!lic) return false
  const planoOk = lic.plano === 'pro'
  const ate = lic.pro_ativo_ate ? Date.parse(lic.pro_ativo_ate) : 0
  const agora = Date.now()
  return planoOk && (lic.pro_ativo === true || (ate && ate > agora))
}

// boolean helper
export async function isProAtivoCached(opts) {
  const lic = await getLicencaCached(opts)
  return !!(lic?.plano === 'pro' && (lic?.pro_ativo || (lic?.pro_ativo_ate && new Date(lic.pro_ativo_ate) > new Date())))

  
}
