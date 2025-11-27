<<<<<<< HEAD
<!-- src/views/Pontos.vue -->
<template>
  <div class="container py-3">
    <h3 class="mb-3">Pontos de coleta</h3>

    <!-- Barra de busca -->
    <div class="card-metric p-3 mb-3">
      <form class="row g-2 align-items-end" @submit.prevent="buscarSelecionado">
        <div class="col-md-8 position-relative">
          <label class="form-label fw-semibold">Buscar por nome, CNPJ ou endereço</label>
          <input
            ref="inputBusca"
            v-model="q"
            type="text"
            class="form-control"
            placeholder="Ex.: 'SENAI', '12.345.678/0001-99' ou 'Lauro de Freitas'"
            @focus="abrirSugestoes"
            @input="abrirSugestoes"
            @keydown.down.prevent="moverSugestao(1)"
            @keydown.up.prevent="moverSugestao(-1)"
            @keydown.enter.prevent="onEnterSugestao"
            @blur="fecharSugestoesComDelay"
          />

          <!-- Sugestões -->
          <ul
            v-if="showSugestoes && q && sugestoes.length"
            class="sugestoes list-group"
=======
<template>
  <div class="container-fluid p-0 d-flex flex-column position-relative" style="height: calc(100vh - 70px);">
    <div class="row g-0 flex-fill overflow-hidden h-100">
      <!-- MAPA (Esquerda / Full Mobile) -->
      <div class="col-12 col-lg-9 position-relative h-100">
        <div id="map" class="h-100 w-100 z-0"></div>

        <!-- MOBILE: Barra de Busca Flutuante (Apenas quando NENHUM ponto está selecionado) -->
        <div v-if="!selecionado" class="d-lg-none position-absolute top-0 start-0 w-100 p-3 z-2">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-2">
              <form @submit.prevent="buscarSelecionado" class="position-relative">
                <div class="input-group">
                  <span class="input-group-text bg-white border-0 ps-2">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input
                    v-model="q"
                    type="text"
                    class="form-control border-0 shadow-none ps-1"
                    placeholder="Buscar ponto..."
                    @focus="abrirSugestoes"
                    @input="abrirSugestoes"
                    @keydown.down.prevent="moverSugestao(1)"
                    @keydown.up.prevent="moverSugestao(-1)"
                    @keydown.enter.prevent="onEnterSugestao"
                    @blur="fecharSugestoesComDelay"
                  />
                </div>
                <!-- Sugestões Mobile (Busca Flutuante) -->
                <ul
                  v-if="showSugestoes && q && sugestoes.length"
                  class="list-group position-absolute w-100 mt-2 shadow-sm start-0"
                  style="z-index: 1050; max-height: 200px; overflow-y: auto;"
                >
                  <li
                    v-for="(s, i) in sugestoes"
                    :key="s.id"
                    class="list-group-item list-group-item-action small"
                    :class="{ active: i === sugIndex }"
                    @mousedown.prevent="selecionar(s)"
                  >
                    <div class="fw-bold">{{ s.nome }}</div>
                    <div class="text-truncate text-muted small">{{ s.enderecoFull }}</div>
                  </li>
                </ul>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- SIDEBAR (Desktop Only) -->
      <div class="col-lg-3 d-none d-lg-flex flex-column bg-white border-start shadow-sm h-100 position-relative z-1">
        <!-- Cabeçalho / Busca -->
        <div class="p-3 border-bottom bg-light">
          <h5 class="mb-3 fw-bold text-mint">Pontos de Coleta</h5>
          <form @submit.prevent="buscarSelecionado" class="position-relative">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                ref="inputBusca"
                v-model="q"
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Buscar ponto, endereço..."
                @focus="abrirSugestoes"
                @input="abrirSugestoes"
                @keydown.down.prevent="moverSugestao(1)"
                @keydown.up.prevent="moverSugestao(-1)"
                @keydown.enter.prevent="onEnterSugestao"
                @blur="fecharSugestoesComDelay"
              />
            </div>

            <!-- Sugestões Desktop -->
            <ul
              v-if="showSugestoes && q && sugestoes.length"
              class="list-group position-absolute w-100 mt-1 shadow-sm"
              style="z-index: 1050; max-height: 200px; overflow-y: auto;"
            >
              <li
                v-for="(s, i) in sugestoes"
                :key="s.id"
                class="list-group-item list-group-item-action small"
                :class="{ active: i === sugIndex }"
                @mousedown.prevent="selecionar(s)"
                @mouseenter="sugIndex = i"
              >
                <div class="fw-bold">{{ s.nome }}</div>
                <div class="text-truncate text-muted small">{{ s.enderecoFull }}</div>
              </li>
            </ul>
          </form>
        </div>

        <!-- Conteúdo: Detalhes ou Lista Vazia -->
        <div class="flex-fill overflow-auto p-3">
          <div v-if="selecionado" class="anime-fade-in">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h4 class="fw-bold text-dark mb-0">{{ selecionado.nome }}</h4>
              <button class="btn btn-sm btn-outline-secondary" @click="limparSelecao" title="Fechar">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="card border-0 bg-light mb-3">
              <div class="card-body p-3">
                <div class="d-flex align-items-center gap-2 mb-2 text-muted">
                  <i class="bi bi-geo-alt-fill text-danger"></i>
                  <span class="small fw-bold text-uppercase">Endereço</span>
                </div>
                <p class="mb-0 small">{{ selecionado.enderecoFull }}</p>
                <p class="mb-0 small text-muted">{{ selecionado.cidade }} / {{ selecionado.estado }}</p>
                <p class="mb-0 small text-muted">CEP: {{ selecionado.cep || '—' }}</p>
              </div>
            </div>

            <ul class="list-unstyled small d-grid gap-2 text-secondary">
              <li class="d-flex justify-content-between border-bottom pb-2">
                <span>CNPJ</span>
                <span class="fw-medium text-dark">{{ selecionado.cnpj || '—' }}</span>
              </li>
              <li class="d-flex justify-content-between border-bottom pb-2">
                <span>Email</span>
                <span class="fw-medium text-dark text-truncate" style="max-width: 180px;">{{ selecionado.email || '—' }}</span>
              </li>
              <li class="d-flex justify-content-between border-bottom pb-2">
                <span>Telefone</span>
                <span class="fw-medium text-dark">{{ selecionado.telefone || '—' }}</span>
              </li>
              <li class="d-flex justify-content-between pt-1">
                <span>Coordenadas</span>
                <span class="fw-medium text-dark">
                  {{ selecionado.latitude?.toFixed(4) }}, {{ selecionado.longitude?.toFixed(4) }}
                </span>
              </li>
            </ul>

            <div class="d-grid gap-2 mt-4">
              <button class="btn btn-success fw-semibold" @click="abrirRota(selecionado)">
                <i class="bi bi-cursor-fill me-2"></i> Verificar Rota
              </button>
            </div>
          </div>

          <div v-else class="h-100 d-flex flex-column align-items-center justify-content-center text-center text-muted opacity-75">
            <i class="bi bi-geo-alt display-4 mb-3 text-secondary"></i>
            <p class="mb-0 fw-medium">Selecione um ponto no mapa<br>ou busque acima.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MOBILE: Modal Full Screen (Quando selecionado) -->
    <div v-if="selecionado" class="d-lg-none position-absolute top-0 start-0 w-100 h-100 bg-white z-3 d-flex flex-column anime-fade-in">
      <!-- Header Mobile -->
      <div class="p-3 border-bottom bg-light flex-shrink-0">
        <h5 class="mb-3 fw-bold text-mint">Pontos de Coleta</h5>
        <form @submit.prevent="buscarSelecionado" class="position-relative">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              v-model="q"
              type="text"
              class="form-control border-start-0 ps-0"
              placeholder="Buscar ponto..."
              @focus="abrirSugestoes"
              @input="abrirSugestoes"
              @keydown.down.prevent="moverSugestao(1)"
              @keydown.up.prevent="moverSugestao(-1)"
              @keydown.enter.prevent="onEnterSugestao"
              @blur="fecharSugestoesComDelay"
            />
          </div>
          <!-- Sugestões Mobile (Dentro do Modal) -->
          <ul
            v-if="showSugestoes && q && sugestoes.length"
            class="list-group position-absolute w-100 mt-1 shadow-sm"
            style="z-index: 1050; max-height: 200px; overflow-y: auto;"
>>>>>>> ecc2c48 (Alteração do frontend)
          >
            <li
              v-for="(s, i) in sugestoes"
              :key="s.id"
<<<<<<< HEAD
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
        </div>

        <div class="col-md-4">
          <button type="submit" class="btn btn--primary w-100">
            Buscar
          </button>
        </div>
      </form>
    </div>

    <!-- Mapa -->
    <div id="map" class="ecor-mapa card-metric"></div>

    <!-- Modal Detalhes -->
    <div v-if="showModal" class="ecor-modal">
      <div class="ecor-backdrop" @click="fecharModal"></div>
      <div class="ecor-panel">
        <button class="ecor-close" @click="fecharModal">×</button>
        <h5 class="mb-3">Ponto de coleta</h5>

        <dl v-if="modalPonto" class="row g-2">
          <dt class="col-4">Nome</dt><dd class="col-8">{{ modalPonto.nome }}</dd>
          <dt class="col-4">CNPJ</dt><dd class="col-8">{{ modalPonto.cnpj || '—' }}</dd>
          <dt class="col-4">Email</dt><dd class="col-8">{{ modalPonto.email || '—' }}</dd>
          <dt class="col-4">Telefone</dt><dd class="col-8">{{ modalPonto.telefone || '—' }}</dd>
          <dt class="col-4">Endereço</dt><dd class="col-8">{{ modalPonto.enderecoFull }}</dd>
          <dt class="col-4">Cidade/UF</dt><dd class="col-8">{{ modalPonto.cidade }} / {{ modalPonto.estado }}</dd>
          <dt class="col-4">CEP</dt><dd class="col-8">{{ modalPonto.cep || '—' }}</dd>
          <dt class="col-4">Coordenadas</dt>
          <dd class="col-8">
            <code v-if="modalPonto.latitude && modalPonto.longitude">
              {{ modalPonto.latitude.toFixed(6) }}, {{ modalPonto.longitude.toFixed(6) }}
            </code>
            <span v-else>—</span>
          </dd>
        </dl>

        <div class="mt-3 d-flex gap-2">
          <button class="btn btn--primary" @click="abrirRota(modalPonto)">Verificar rota</button>
          <button class="btn btn--ghost" @click="fecharModal">Fechar</button>
=======
              class="list-group-item list-group-item-action small"
              :class="{ active: i === sugIndex }"
              @mousedown.prevent="selecionar(s)"
            >
              <div class="fw-bold">{{ s.nome }}</div>
              <div class="text-truncate text-muted small">{{ s.enderecoFull }}</div>
            </li>
          </ul>
        </form>
      </div>

      <!-- Conteúdo Mobile -->
      <div class="flex-fill overflow-auto p-3">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h4 class="fw-bold text-dark mb-0">{{ selecionado.nome }}</h4>
          <button class="btn btn-sm btn-outline-secondary" @click="limparSelecao" title="Fechar">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="card border-0 bg-light mb-3">
          <div class="card-body p-3">
            <div class="d-flex align-items-center gap-2 mb-2 text-muted">
              <i class="bi bi-geo-alt-fill text-danger"></i>
              <span class="small fw-bold text-uppercase">Endereço</span>
            </div>
            <p class="mb-0 small">{{ selecionado.enderecoFull }}</p>
            <p class="mb-0 small text-muted">{{ selecionado.cidade }} / {{ selecionado.estado }}</p>
            <p class="mb-0 small text-muted">CEP: {{ selecionado.cep || '—' }}</p>
          </div>
        </div>

        <ul class="list-unstyled small d-grid gap-2 text-secondary">
          <li class="d-flex justify-content-between border-bottom pb-2">
            <span>CNPJ</span>
            <span class="fw-medium text-dark">{{ selecionado.cnpj || '—' }}</span>
          </li>
          <li class="d-flex justify-content-between border-bottom pb-2">
            <span>Email</span>
            <span class="fw-medium text-dark text-truncate" style="max-width: 200px;">{{ selecionado.email || '—' }}</span>
          </li>
          <li class="d-flex justify-content-between border-bottom pb-2">
            <span>Telefone</span>
            <span class="fw-medium text-dark">{{ selecionado.telefone || '—' }}</span>
          </li>
          <li class="d-flex justify-content-between pt-1">
            <span>Coordenadas</span>
            <span class="fw-medium text-dark">
              {{ selecionado.latitude?.toFixed(4) }}, {{ selecionado.longitude?.toFixed(4) }}
            </span>
          </li>
        </ul>

        <div class="d-grid gap-2 mt-4">
          <button class="btn btn-success fw-semibold" @click="abrirRota(selecionado)">
            <i class="bi bi-cursor-fill me-2"></i> Verificar Rota
          </button>
>>>>>>> ecc2c48 (Alteração do frontend)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { onMounted, ref, computed, nextTick } from 'vue'
import { usuariosApi } from '@/services/api'

/* ---------- Estado ---------- */
const pontos = ref([])
const q = ref('')
<<<<<<< HEAD
const selecionado = ref(null)
const showModal = ref(false)
const modalPonto = ref(null)

=======
const selecionado = ref(null) // O ponto atualmente exibido na sidebar
>>>>>>> ecc2c48 (Alteração do frontend)
const showSugestoes = ref(false)
const inputBusca = ref(null)

/* ---------- Leaflet ---------- */
let map, markersLayer
const markersById = Object.create(null)

/* Ícone padrão do Leaflet */
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

/* ---------- Cache de geocodificação ---------- */
let geocodeMap
try {
  geocodeMap = new Map(JSON.parse(localStorage.getItem('geocodeCache') || '[]'))
} catch { geocodeMap = new Map() }

function saveGeocodeCache() {
  try { localStorage.setItem('geocodeCache', JSON.stringify([...geocodeMap])) } catch {}
}

/* ---------- Helpers ---------- */
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

/* Resolvedor “teimoso” para um ponto */
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
  await carregarPontos()
  initMap()
  renderMarkers()                        // desenha quem já tem coords
  ensureCoordsThrottled().then(fitAll)   // resolve pendentes e depois enquadra
  fitAll()                               // enquadra o que já existe agora
})

async function carregarPontos() {
  const { data } = await usuariosApi.listarPontos()
  const arr = (data || [])
    .filter(u => u.tipo_usuario === 'ponto_coleta')
    .map(u => ({
      ...u,
      enderecoFull: buildEndereco(u),
      latitude: (u.latitude ?? null) !== null ? Number(u.latitude) : null,
      longitude: (u.longitude ?? null) !== null ? Number(u.longitude) : null
    }))
  pontos.value = arr
}

function initMap() {
  if (map) return
  map = L.map('map', { zoomControl: true }).setView([-12.9714, -38.5014], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)
  markersLayer = L.featureGroup().addTo(map)
  setTimeout(() => map.invalidateSize(), 100)
}

/* Completa coordenadas que faltam (com respiro p/ Nominatim) */
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

/* ---------- Markers & mapa ---------- */
function addOrUpdateMarker(p) {
  if (!p.latitude || !p.longitude) return
  const key = String(p.id)
  let m = markersById[key]
  if (!m) {
    m = L.marker([p.latitude, p.longitude], { icon: defaultIcon })
<<<<<<< HEAD
      .on('click', () => openModal(p))
=======
      .on('click', () => selecionarPonto(p))
>>>>>>> ecc2c48 (Alteração do frontend)
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
<<<<<<< HEAD
    .on('click', () => openModal(p))
=======
    .on('click', () => selecionarPonto(p))
>>>>>>> ecc2c48 (Alteração do frontend)
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
<<<<<<< HEAD
  m.bindPopup(`<b>${p.nome}</b><br/><small>${p.enderecoFull || ''}</small>`).openPopup()
=======
  // Não abrimos popup padrão, pois mostramos na sidebar
  // m.bindPopup(...).openPopup()
>>>>>>> ecc2c48 (Alteração do frontend)

  const pulse = L.circleMarker(latlng, {
    radius: 18,
    color: '#10b981',
    weight: 3,
    opacity: 0.85,
    fillOpacity: 0.15
  }).addTo(map)
  setTimeout(() => map.removeLayer(pulse), 1200)
}

/* ---------- Busca & sugestões ---------- */
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

/* Buscar: cria marcador se faltar, centraliza/zoom, popup e pulso */
async function buscarSelecionado() {
  fecharSugestoes()

  let p = selecionado.value || sugestoes.value?.[0]
  if (!p) return

<<<<<<< HEAD
  let m = ensureMarkerFor(p)
  if (!m) {
    const coords = await resolveCoordsFor(p)
    if (coords) {
      p.latitude = coords.lat
      p.longitude = coords.lon
      m = ensureMarkerFor(p)
    }
  }

  if (!m) {
    alert('Não foi possível localizar esse endereço no mapa.')
    return
  }

  map.invalidateSize()
  focusMarker(p)
  await nextTick()
  inputBusca.value?.blur()
}

/* ---------- Modal ---------- */
function openModal(p) { modalPonto.value = p; showModal.value = true }
function fecharModal() { showModal.value = false; modalPonto.value = null }
=======
  selecionarPonto(p)
}

function selecionarPonto(p) {
  selecionado.value = p
  q.value = p.nome // opcional: preencher busca com nome
  
  // Garantir marker
  let m = ensureMarkerFor(p)
  if (!m) {
    // Se não tem marker, tenta resolver coords on-the-fly (raro se já carregou)
    resolveCoordsFor(p).then(coords => {
      if (coords) {
        p.latitude = coords.lat
        p.longitude = coords.lon
        ensureMarkerFor(p)
        focusMarker(p)
      } else {
        alert('Não foi possível localizar esse endereço no mapa.')
      }
    })
  } else {
    focusMarker(p)
  }
}

function limparSelecao() {
  selecionado.value = null
  q.value = ''
  map.invalidateSize()
}

>>>>>>> ecc2c48 (Alteração do frontend)
function abrirRota(p) {
  if (!p?.latitude || !p?.longitude) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}&travelmode=driving`
  window.open(url, '_blank')
}
</script>

<style scoped>
<<<<<<< HEAD
.ecor-mapa { height: 480px; }

/* Sugestões (dropdown) */
.sugestoes{
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1000; /* acima do mapa */
  max-height: 260px;
  overflow: auto;
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(2,6,23,.12);
}
.sugestoes .list-group-item{
  cursor: pointer;
  font-size: .95rem;
}

/* Modal */
.ecor-modal{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; }
.ecor-backdrop{ position:absolute; inset:0; background:rgba(15,23,42,.35); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); }
.ecor-panel{
  position:relative; width:min(680px, calc(100vw - 32px));
  background:#fff; border-radius:12px; box-shadow:0 24px 48px rgba(16,24,40,.18);
  padding:18px; animation:pop .14s ease-out;
}
.ecor-close{ position:absolute; top:8px; right:10px; font-size:22px; border:0; background:transparent; cursor:pointer }
@keyframes pop{ from{transform:scale(.98); opacity:0} to{transform:scale(1); opacity:1} }
=======
.text-mint { color: #10b981 !important; }
.anime-fade-in { animation: fadeIn .3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* Ajustes de scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
>>>>>>> ecc2c48 (Alteração do frontend)
</style>
