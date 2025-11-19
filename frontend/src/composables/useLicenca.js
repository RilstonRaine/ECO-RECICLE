// src/services/licenca.js
import api from './api'

// -----------------------------
// Endpoints brutos
// -----------------------------
export const licencasApi = {
  status: () => api.get('/licencas/me'),
  upgrade: (dias = 30) => api.post('/licencas/upgrade', { dias }),
}

// -----------------------------
// Helpers / Cache + LocalStorage
// -----------------------------
const TTL = 60_000; // 1 minuto de cache em memória
const LS_KEY = '__licenca_cache__';

let _cache = null;
let _cacheAt = 0;

function saveToLS(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}
function loadFromLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
}
function clearLS() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export function clearLicencaCache() {
  _cache = null;
  _cacheAt = 0;
  clearLS();
}

export function proAtivo(lic) {
  return !!(lic?.plano === 'pro' && (lic?.pro_ativo || (lic?.pro_ativo_ate && new Date(lic.pro_ativo_ate) > new Date())));
}

// -----------------------------
// Funções de alto nível
// -----------------------------
export async function getMinhaLicenca() {
  const { data } = await licencasApi.status();
  saveToLS(data);         // <- persiste para o tema inicial sem flicker
  _cache = data;
  _cacheAt = Date.now();
  return data;
}

/**
 * Retorna a licença com cache em memória.
 * Na primeira chamada (ou se a página acabou de abrir), o tema pode usar o LS.
 */
export async function getLicencaCached({ force = false } = {}) {
  const now = Date.now();

  if (!force && _cache && (now - _cacheAt < TTL)) {
    return _cache;
  }

  // Se não tem cache em memória, tenta o LS (serve para composição imediata do tema)
  const fromLS = loadFromLS();
  if (!force && fromLS && !_cache) {
    _cache = fromLS;
    _cacheAt = now; // evita refetch imediato; se quiser forçar, passe { force: true }
    return _cache;
  }

  // Busca fresca do backend
  return await getMinhaLicenca();
}

/**
 * Faz o upgrade para PRO e atualiza tudo (memória + LS).
 * Retorna a licença atualizada.
 */
export async function upgradePro(dias = 30) {
  const res = await licencasApi.upgrade(dias);

  // Alguns backends retornam a licença já atualizada; se vier, usa.
  // Caso contrário, consulta /licencas/me logo em seguida.
  let lic = res?.data?.licenca ?? null;
  if (!lic) {
    lic = await getMinhaLicenca();
  } else {
    saveToLS(lic);
    _cache = lic;
    _cacheAt = Date.now();
  }

  try { window.dispatchEvent(new CustomEvent('licenca:changed', { detail: lic })); } catch {}

  return lic;
}

// Boolean helper conveniente (com cache)
export async function isProAtivoCached(opts) {
  const lic = await getLicencaCached(opts);
  return proAtivo(lic);
}
