<!-- src/components/MapaPontos.vue -->
<template>
  <div class="map-wrapper">
    <div ref="mapEl" class="map"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corrige os ícones do Leaflet em bundlers (Vite/Webpack)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
})

// Props: lista de pontos (id, nome, email, endereco…, latitude, longitude)
const props = defineProps({
  pontos: { type: Array, default: () => [] }
})

const mapEl = ref(null)
let map = null
let layerGroup = null

onMounted(async () => {
  map = L.map(mapEl.value, { zoomControl: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map)

  layerGroup = L.layerGroup().addTo(map)

  await nextTick()
  renderMarkers()
  // se o container mudar de tamanho, força um recálculo
  setTimeout(() => map.invalidateSize(), 300)
})

onBeforeUnmount(() => {
  if (map) map.remove()
})

watch(() => props.pontos, () => renderMarkers(), { deep: true })

function enderecoLinha(p) {
  const partes = [
    p.logradouro || p.endereco,
    p.numero,
    p.bairro,
    p.cidade,
    p.uf
  ].filter(Boolean)
  return partes.join(', ')
}

async function renderMarkers() {
  if (!map || !layerGroup) return
  layerGroup.clearLayers()

  const bounds = []

  // geocodifica sequencialmente os pontos sem lat/lng (respeita rate-limit)
  for (const p of props.pontos) {
    let lat = p.latitude, lng = p.longitude

    if (!(isFinite(lat) && isFinite(lng))) {
      const addr = enderecoLinha(p)
      if (addr) {
        const got = await geocodeCached(addr)
        if (got) { lat = got.lat; lng = got.lng }
        // pausa curtinha para não estourar rate-limit do Nominatim
        await delay(1100)
      }
    }

    if (isFinite(lat) && isFinite(lng)) {
      const marker = L.marker([lat, lng])
      const toGM = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      const popup = `
        <div style="min-width:220px">
          <strong>${p.nome || 'Ponto #' + p.id}</strong><br/>
          ${enderecoLinha(p) || ''}
          ${p.email ? `<br/><small>${p.email}</small>` : ''}
          <div style="margin-top:6px">
            <a href="${toGM}" target="_blank" rel="noopener">Traçar rota</a>
          </div>
        </div>`
      marker.bindPopup(popup)
      marker.addTo(layerGroup)
      bounds.push([lat, lng])
    }
  }

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [24, 24] })
  } else {
    // centro “fallback” (Brasil)
    map.setView([-14.235, -51.925], 4)
  }
}

// ===== geocoding simples usando Nominatim (com cache em localStorage) =====
function cacheKey(addr) { return `geocode:${addr.trim().toLowerCase()}` }

async function geocodeCached(addr) {
  try {
    const key = cacheKey(addr)
    const cached = localStorage.getItem(key)
    if (cached) return JSON.parse(cached)

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addr)}`
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
    const json = await res.json()
    if (Array.isArray(json) && json[0]) {
      const coords = { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) }
      localStorage.setItem(key, JSON.stringify(coords))
      return coords
    }
  } catch (e) {
    // silencia erros de geocoding
  }
  return null
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }
</script>

<style scoped>
.map-wrapper { border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(16,24,40,.06); border: var(--border-soft, 1px solid rgba(2,6,23,.06)); }
.map { width: 100%; height: 420px; }
</style>
