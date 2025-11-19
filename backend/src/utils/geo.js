// src/utils/geo.js
const VIA_CEP = (cep) => `https://viacep.com.br/ws/${cep}/json/`;
const NOMINATIM = (q) =>
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=br`;

function onlyDigits(v = '') { return String(v).replace(/\D+/g, ''); }
function normalizeUF(uf = '') { return uf.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase(); }

async function fetchViaCep(cep) {
  const c = onlyDigits(cep);
  if (c.length !== 8) return null;
  const r = await fetch(VIA_CEP(c));
  const data = await r.json();
  if (!data || data.erro) return null;
  return {
    logradouro: data.logradouro || null,
    bairro:     data.bairro     || null,
    cidade:     data.localidade || null,
    estado:     normalizeUF(data.uf || ''),
    cep:        c,
  };
}

async function geocodeAddress({ logradouro, numero, bairro, cidade, estado, cep }) {
  const parts = [logradouro, numero, bairro, cidade, estado, cep, 'Brasil'].filter(Boolean);
  const q = parts.join(', ');
  const r = await fetch(NOMINATIM(q), {
    headers: { 'User-Agent': 'EcoRecicle/1.0 (contato@seudominio.com)' }
  });
  const arr = await r.json();
  const lat = parseFloat(arr?.[0]?.lat), lon = parseFloat(arr?.[0]?.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { latitude: lat, longitude: lon };
  return { latitude: null, longitude: null };
}

module.exports = { fetchViaCep, geocodeAddress, normalizeUF, onlyDigits };
