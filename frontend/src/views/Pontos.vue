<template>
  <div class="pontos-layout">
    <div class="map-container">
      <div id="map" class="h-100 w-100"></div>
    </div>

    <div class="sidebar-container">
      <h3 class="mb-3 px-3 pt-3">Pontos de coleta</h3>

      <div class="px-3 mb-3 position-relative">
        <form @submit.prevent="buscarSelecionado">
          <label class="form-label fw-semibold small text-muted text-uppercase">Buscar ponto</label>
          <div class="input-group">
            <input
              ref="inputBusca"
              v-model="q"
              type="text"
              class="form-control"
              placeholder="Nome, CNPJ ou endereço..."
              @focus="abrirSugestoes"
              @input="abrirSugestoes"
              @keydown.down.prevent="moverSugestao(1)"
              @keydown.up.prevent="moverSugestao(-1)"
              @keydown.enter.prevent="onEnterSugestao"
              @blur="fecharSugestoesComDelay"
            />
            <button type="submit" class="btn btn--primary">
              <i class="bi bi-search"></i>
            </button>
          </div>

          <ul
            v-if="showSugestoes && q && sugestoes.length"
            class="sugestoes list-group shadow-sm"
          >
            <li
              v-for="(s, i) in sugestoes"
              :key="s.id"
              class="list-group-item list-group-item-action"
              :class="{ active: i === sugIndex }"
              @mousedown.prevent="selecionar(s)"
              @mouseenter="sugIndex = i"
            >
              <div class="fw-semibold">{{ s.nome }}</div>
              <small class="text-muted">
                {{ s.cnpj ? `CNPJ: ${s.cnpj} • ` : '' }}{{ s.enderecoFull }}
              </small>
            </li>
          </ul>
        </form>
        
        <button 
          type="button" 
          class="btn btn-outline-success w-100 mt-3 d-flex align-items-center justify-content-center gap-2" 
          @click="buscarLocalizacao" 
          :disabled="loadingLoc"
        >
          <i class="bi" :class="loadingLoc ? 'bi-hourglass-split' : 'bi-geo-alt-fill'"></i>
          {{ loadingLoc ? 'Obtendo localização...' : 'Buscar minha localização' }}
        </button>
      </div>

      <div v-if="userCoords && !q && !modalPonto && pontosProximos.length" class="px-3 pb-3 overflow-auto flex-grow-1 anime-fade-in">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h6 class="text-muted fw-bold mb-0 small text-uppercase">Pontos Próximos</h6>
          <button type="button" class="btn-close" aria-label="Fechar" @click="userCoords = null"></button>
        </div>
        <ul class="list-group list-group-flush">
          <li 
            v-for="p in pontosProximos" 
            :key="p.id" 
            class="list-group-item list-group-item-action px-0 py-3 border-bottom" 
            @click="openModal(p)"
          >
            <div class="d-flex justify-content-between align-items-start mb-1">
              <span class="fw-bold text-dark">{{ p.nome }}</span>
              <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                ~{{ p.distancia.toFixed(1) }} km
              </span>
            </div>
            <small class="text-muted d-block mb-1">{{ p.enderecoFull }}</small>
            <small class="text-muted" v-if="p.cidade">{{ p.cidade }} - {{ p.estado }}</small>
          </li>
        </ul>
      </div>


      <Teleport to="body" :disabled="!isMobile">
        <div 
          v-if="!isMobile || modalPonto"
          class="flex-grow-1 overflow-auto px-3 pb-3"
          :class="{ 'details-active': !!modalPonto && isMobile }"
          :style="isMobile && modalPonto ? 'z-index: 99999;' : ''"
        >
          <div v-if="modalPonto" class="anime-fade-in">
            <div class="d-flex justify-content-between align-items-start mb-3 pt-3">
              <h5 class="fw-bold text-mint mb-0">{{ modalPonto.nome }}</h5>
              <button class="btn-close" @click="fecharModal" aria-label="Fechar detalhes"></button>
            </div>

            <div class="card border-0 bg-light mb-3">
              <div class="card-body p-3">
                <div class="d-flex align-items-center gap-2 mb-2 text-muted">
                  <i class="bi bi-geo-alt-fill text-danger"></i>
                  <span class="small fw-bold text-uppercase">Endereço</span>
                </div>
                <p class="mb-0 small">{{ modalPonto.enderecoFull }}</p>
                <p class="mb-0 small text-muted">{{ modalPonto.cidade }} / {{ modalPonto.estado }}</p>
                <p class="mb-0 small text-muted">CEP: {{ modalPonto.cep || '—' }}</p>
                <div v-if="modalPonto.distancia" class="mt-2 pt-2 border-top">
                  <span class="badge bg-success">~{{ modalPonto.distancia.toFixed(1) }} km ({{ modalPonto.tipoDistancia || 'linear' }}) de você</span>
                </div>
              </div>
            </div>

            <ul class="list-unstyled small d-grid gap-2 text-secondary mb-4">
              <li class="d-flex justify-content-between border-bottom pb-2">
                <span>CNPJ</span>
                <span class="fw-medium text-dark">{{ modalPonto.cnpj || '—' }}</span>
              </li>
              <li class="d-flex justify-content-between border-bottom pb-2">
                <span>Email</span>
                <span class="fw-medium text-dark text-truncate" style="max-width: 200px;">{{ modalPonto.email || '—' }}</span>
              </li>
              <li class="d-flex justify-content-between border-bottom pb-2">
                <span>Telefone</span>
                <span class="fw-medium text-dark">{{ modalPonto.telefone || '—' }}</span>
              </li>
              <li class="d-flex justify-content-between pt-1">
                <span>Coordenadas</span>
                <span class="fw-medium text-dark">
                  <code v-if="modalPonto.latitude">{{ modalPonto.latitude.toFixed(4) }}, {{ modalPonto.longitude.toFixed(4) }}</code>
                  <span v-else>—</span>
                </span>
              </li>
            </ul>

            <button class="btn btn--primary w-100 mb-2" @click="abrirRota(modalPonto)">
              <i class="bi bi-map-fill me-2"></i>Verificar rota
            </button>
          </div>

          <div v-else-if="!userCoords" class="text-center text-muted mt-5">
            <i class="bi bi-geo-alt display-4 opacity-25"></i>
            <p class="mt-3">Selecione um ponto no mapa ou busque para ver detalhes.</p>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import { usuariosApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

/* ---------- Estado ---------- */
const pontos = ref([])
const q = ref('')
const selecionado = ref(null)
const modalPonto = ref(null)

const showSugestoes = ref(false)
const inputBusca = ref(null)

const isMobile = ref(false)
let mediaQuery = null

const loadingLoc = ref(false)
const userCoords = ref(null)

function updateMobile() {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches
}

onMounted(() => {
  updateMobile()
  mediaQuery = window.matchMedia('(max-width: 768px)')
  mediaQuery.addEventListener('change', updateMobile)
})

onUnmounted(() => {
  if (mediaQuery) mediaQuery.removeEventListener('change', updateMobile)
})

function openModal(p) {
  modalPonto.value = p
  focusMarker(p)
}
function fecharModal() {
  modalPonto.value = null
}
function abrirRota(p) {
  if (!p || !p.latitude || !p.longitude) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`
  window.open(url, '_blank')
}


/* ---------- Leaflet ---------- */
let map, markersLayer
const markersById = Object.create(null)

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

let geocodeMap
try {
  geocodeMap = new Map(JSON.parse(localStorage.getItem('geocodeCache') || '[]'))
} catch { geocodeMap = new Map() }

function saveGeocodeCache() {
  try { localStorage.setItem('geocodeCache', JSON.stringify([...geocodeMap])) } catch {}
}

function norm(s) {
  return (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
function onlyDigits(s) { return (s || '').toString().replace(/\D/g, '') }

function clean(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*,/g, ', ')
    .trim()
}
function buildEndereco(p) {
  const partes = [p.logradouro || p.endereco, p.numero, p.bairro, p.cidade, p.estado].filter(Boolean)
  return partes.join(', ')
}
function buildCandidates(p) {
  const log = clean(p.logradouro || p.endereco)
  const num = clean(p.numero)
  const bai = clean(p.bairro)
  const cid = clean(p.cidade)
  const uf  = clean(p.estado)

  const full1 = clean(`${log} ${num}, ${bai}, ${cid} - ${uf}, Brasil`)
  const full2 = clean(`${log} ${num}, ${cid} - ${uf}, Brasil`)
  const full3 = clean(`${log}, ${cid} - ${uf}, Brasil`)
  const onlyC = clean(`${cid} - ${uf}, Brasil`)

  return [...new Set([full1, full2, full3, onlyC].filter(Boolean))]
}

async function geocode(query) {
  const key = (query || '').toLowerCase().trim()
  if (!key) return null
  if (geocodeMap.has(key)) return geocodeMap.get(key)

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
  const data = await res.json()

  const lat = parseFloat(data?.[0]?.lat)
  const lon = parseFloat(data?.[0]?.lon)
  const hit = (Number.isFinite(lat) && Number.isFinite(lon)) ? { lat, lon } : null

  if (hit) { geocodeMap.set(key, hit); saveGeocodeCache() }
  return hit
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

const SLEEP_MS = 900
async function resolveCoordsFor(p) {
  if (p.latitude && p.longitude) return { lat: p.latitude, lon: p.longitude }
  const candidates = buildCandidates(p)
  for (const q of candidates) {
    const hit = await geocode(q)
    if (hit) return hit
    await sleep(SLEEP_MS)
  }
  return null
}

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  updateMobile()
  mediaQuery = window.matchMedia('(max-width: 768px)')
  mediaQuery.addEventListener('change', updateMobile)

  await carregarPontos()
  initMap()
  renderMarkers()                        
  ensureCoordsThrottled().then(fitAll)   
  fitAll()                               
})

async function carregarPontos() {
  const { data } = await usuariosApi.listarPontos()
  const arr = (data || [])
    .filter(u => u.tipo_usuario === 'ponto_coleta')
    .map(u => ({
      ...u,
      enderecoFull: buildEndereco(u),
      latitude: (u.latitude ?? null) !== null ? Number(u.latitude) : null,
      longitude: (u.longitude ?? null) !== null ? Number(u.longitude) : null,
      distancia: null
    }))
  pontos.value = arr
}

function initMap() {
  if (map) return
  map = L.map('map', { zoomControl: false }).setView([-12.9714, -38.5014], 11)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)
  markersLayer = L.featureGroup().addTo(map)
  setTimeout(() => map.invalidateSize(), 100)
}

async function ensureCoordsThrottled() {
  const pendentes = pontos.value.filter(p => !p.latitude || !p.longitude)
  for (const p of pendentes) {
    const coords = await resolveCoordsFor(p)
    if (coords) {
      p.latitude = coords.lat
      p.longitude = coords.lon
      addOrUpdateMarker(p)
    }
    await sleep(SLEEP_MS + Math.floor(Math.random() * 300))
  }
}

function addOrUpdateMarker(p) {
  if (!p.latitude || !p.longitude) return
  const key = String(p.id)
  let m = markersById[key]
  if (!m) {
    m = L.marker([p.latitude, p.longitude], { icon: defaultIcon })
      .on('click', () => openModal(p))
      .addTo(markersLayer)
    markersById[key] = m
  } else {
    m.setLatLng([p.latitude, p.longitude])
  }
}

function renderMarkers() {
  markersLayer.clearLayers()
  Object.keys(markersById).forEach(k => delete markersById[k])
  for (const p of pontos.value) addOrUpdateMarker(p)
}

function ensureMarkerFor(p) {
  if (!p.latitude || !p.longitude) return null
  const key = String(p.id)
  if (markersById[key]) return markersById[key]
  const m = L.marker([p.latitude, p.longitude], { icon: defaultIcon })
    .on('click', () => openModal(p))
    .addTo(markersLayer)
  markersById[key] = m
  return m
}

function fitAll() {
  const layers = markersLayer.getLayers()
  if (layers.length) {
    const bounds = L.featureGroup(layers).getBounds()
    map.fitBounds(bounds.pad(0.2))
  }
}

function focusMarker(p) {
  const key = String(p.id)
  const m = markersById[key]
  if (!m) return
  const latlng = m.getLatLng()

  map.flyTo(latlng, 16, { duration: 0.45 })

  const pulse = L.circleMarker(latlng, {
    radius: 18,
    color: '#10b981',
    weight: 3,
    opacity: 0.85,
    fillOpacity: 0.15
  }).addTo(map)
  setTimeout(() => map.removeLayer(pulse), 1200)
}

const sugestoes = computed(() => {
  const nq = norm(q.value)
  const nd = onlyDigits(q.value)
  if (!nq && !nd) return []
  const res = pontos.value.filter(p => {
    const byName = norm(p.nome).includes(nq)
    const byAddr = norm(p.enderecoFull).includes(nq)
    const byCnpj = nd && onlyDigits(p.cnpj || '').includes(nd)
    return byName || byAddr || byCnpj
  })
  return res.slice(0, 8)
})

const sugIndex = ref(-1)
function moverSugestao(delta) {
  if (!sugestoes.value.length) return
  sugIndex.value = (sugIndex.value + delta + sugestoes.value.length) % sugestoes.value.length
}
function onEnterSugestao() {
  if (sugIndex.value >= 0 && sugestoes.value[sugIndex.value]) {
    selecionar(sugestoes.value[sugIndex.value])
    buscarSelecionado()
  } else {
    buscarSelecionado()
  }
}
function selecionar(p) {
  selecionado.value = p
  q.value = p.nome
  sugIndex.value = -1
  fecharSugestoes()
}
function abrirSugestoes() { showSugestoes.value = true }
function fecharSugestoes() { showSugestoes.value = false }
function fecharSugestoesComDelay() { setTimeout(() => (showSugestoes.value = false), 120) }

async function buscarSelecionado() {
  fecharSugestoes()

  let p = selecionado.value || sugestoes.value?.[0]
  if (!p) return

  let m = ensureMarkerFor(p)
  if (!m) {
    const coords = await resolveCoordsFor(p)
    if (coords) {
      p.latitude = coords.lat
      p.longitude = coords.lon
      m = ensureMarkerFor(p)
    }
  }

  if (m) {
    openModal(p)
  }
}

/* ---------- Geolocalização ---------- */
function deg2rad(deg) { return deg * (Math.PI/180) }
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = deg2rad(lat2-lat1)
  const dLon = deg2rad(lon2-lon1)
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

async function fetchRouteDistance(lat1, lon1, lat2, lon2) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].distance / 1000 // metros para km
    }
  } catch (e) {
    console.warn('Erro ao buscar rota OSRM', e)
  }
  return null
}

function buscarLocalizacao() {
  if (!navigator.geolocation) {
    toast.error('Geolocalização não suportada pelo seu navegador.')
    return
  }
  loadingLoc.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      userCoords.value = { lat: latitude, lon: longitude }
      
      // 1. Calcular distâncias lineares para pré-filtro
      pontos.value.forEach(p => {
        if (p.latitude && p.longitude) {
          p.distanciaLinear = getDistanceFromLatLonInKm(latitude, longitude, p.latitude, p.longitude)
          p.distancia = p.distanciaLinear // fallback inicial
          p.tipoDistancia = 'linear'
        } else {
          p.distancia = Infinity
        }
      })
      
      // Ordenar por linear para pegar os candidatos mais próximos
      pontos.value.sort((a, b) => (a.distancia || Infinity) - (b.distancia || Infinity))
      
      // 2. Buscar rota real para os top 10 mais próximos (para não abusar da API)
      const candidatos = pontos.value.slice(0, 10)
      
      // Paralelizar requests (com cuidado)
      await Promise.all(candidatos.map(async (p) => {
        if (p.distancia !== Infinity) {
          const routeDist = await fetchRouteDistance(latitude, longitude, p.latitude, p.longitude)
          if (routeDist !== null) {
            p.distancia = routeDist
            p.tipoDistancia = 'rota'
          }
        }
      }))
      
      // Reordenar final com as distâncias de rota
      pontos.value.sort((a, b) => (a.distancia || Infinity) - (b.distancia || Infinity))
      
      loadingLoc.value = false
      toast.success('Localização obtida! Pontos ordenados por rota de condução.')
      
      // Zoom no usuário
      if (map) {
        map.setView([latitude, longitude], 13)
        L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background:#0d6efd;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>',
            iconSize: [16, 16]
          })
        }).addTo(map).bindPopup('Você está aqui').openPopup()
      }
    },
    (err) => {
      console.error(err)
      toast.error('Não foi possível obter sua localização. Verifique as permissões.')
      loadingLoc.value = false
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

const pontosProximos = computed(() => {
  if (!userCoords.value) return []
  return pontos.value.filter(p => p.distancia !== null && p.distancia < 1000).slice(0, 10)
})

</script>

<style scoped>
.pontos-layout {
  display: flex;
  height: calc(100vh - 70px);
  overflow: hidden;
  position: relative;
}

.map-container {
  flex: 1;
  position: relative;
  z-index: 1;
}

.sidebar-container {
  width: 400px;
  max-width: 100%;
  background: #fff;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  z-index: 2;
  box-shadow: -4px 0 16px rgba(0,0,0,0.05);
}

/* Mobile Layout */
@media (max-width: 768px) {
  .pontos-layout {
    display: block;
  }
  
  .map-container {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }

  .sidebar-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    pointer-events: none; 
  }

  .sidebar-container > h3 {
    display: none;
  }

  .sidebar-container > .px-3.mb-3 {
    pointer-events: auto;
    background: transparent;
    padding-top: 1rem;
  }
  
  .sidebar-container form {
    background: #fff;
    padding: 10px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .sidebar-container > .px-3.mb-3 button.btn-outline-success {
    background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border: none;
    color: #198754;
    font-weight: 600;
    pointer-events: auto;
  }

  .sidebar-container > .flex-grow-1 {
    pointer-events: none;
    display: flex;
    flex-direction: column;
  }
  
  .sidebar-container > .flex-grow-1.anime-fade-in {
    background: #fff;
    pointer-events: auto;
    margin: 0 1rem 1rem 1rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-height: 40vh;
  }

  .sidebar-container > .flex-grow-1 > .text-center {
    display: none;
  }

  .details-active {
    background: #fff;
    position: fixed;
    inset: 0;
    z-index: 99999;
    width: 100%;
    height: 100%;
    margin: 0;
    border-radius: 0;
    overflow: auto;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  :deep(.leaflet-control-zoom) {
    display: none !important;
  }
}

.sugestoes{
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 260px;
  overflow: auto;
  border-radius: 0 0 8px 8px;
}
.sugestoes .list-group-item{
  cursor: pointer;
  font-size: .95rem;
  border-left: none; border-right: none;
}

.text-mint { color: var(--ecor-mint-600) !important; }
.anime-fade-in { animation: fadeIn .3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
