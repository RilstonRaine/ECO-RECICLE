// src/controllers/authController.js
const bcrypt = require('bcryptjs'); // bcryptjs evita build nativo
const jwt = require('jsonwebtoken');
const { supabaseService } = require('../config/supabaseServiceClient');
const { buscarUsuarioPorEmail } = require('../models/usuariosModel');

// --- Helper: normaliza UF (BA, SP...) a partir de "BA" ou nome do estado ---
const UF_BY_NAME = {
  'acre':'AC','alagoas':'AL','amapa':'AP','amazonas':'AM','bahia':'BA','ceara':'CE',
  'distrito federal':'DF','espirito santo':'ES','goias':'GO','maranhao':'MA',
  'mato grosso':'MT','mato grosso do sul':'MS','minas gerais':'MG','para':'PA',
  'paraiba':'PB','parana':'PR','pernambuco':'PE','piaui':'PI','rio de janeiro':'RJ',
  'rio grande do norte':'RN','rio grande do sul':'RS','rondonia':'RO','roraima':'RR',
  'santa catarina':'SC','sao paulo':'SP','sergipe':'SE','tocantins':'TO'
};
function normalizeUF(v) {
  if (!v) return null;
  let s = String(v).trim();
  if (!s) return null;
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (s.length === 2) return s.toUpperCase();
  const uf = UF_BY_NAME[s.toLowerCase()];
  return uf || null;
}

const onlyDigits = (v) => (v ?? '').toString().replace(/\D+/g, '');
const norm = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

// --- Helper: ViaCEP (retorna {logradouro,bairro,cidade,estado} ou null) ---
async function fetchViaCep(cep) {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  const url = `https://viacep.com.br/ws/${digits}/json/`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.erro) return null;
  return {
    logradouro: data.logradouro || null,
    bairro: data.bairro || null,
    cidade: data.localidade || null,
    estado: normalizeUF(data.uf || null)
  };
}

// --- Helper: Geocodificação (Nominatim / OpenStreetMap) ---
async function geocodeAddress(addr) {
  // Monta uma query amigável: "Rua X, 123, Bairro, Cidade - UF, Brasil"
  const partes = [
    [addr.logradouro, addr.numero].filter(Boolean).join(' '),
    addr.bairro,
    addr.cidade && addr.estado ? `${addr.cidade} - ${addr.estado}` : addr.cidade || addr.estado,
    'Brasil'
  ].filter(Boolean);
  const q = partes.join(', ');

  if (!q) return { latitude: null, longitude: null };

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'pt-BR',
      'User-Agent': 'EcoRecicle/1.0 (contato@example.com)' // coloque seu contato se quiser
    }
  });
  if (!res.ok) return { latitude: null, longitude: null };

  const data = await res.json();
  const lat = parseFloat(data?.[0]?.lat);
  const lon = parseFloat(data?.[0]?.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return { latitude: lat, longitude: lon };
  }
  return { latitude: null, longitude: null };
}

/* ===================== CADASTRO ===================== */
exports.cadastro = async (req, res) => {
  try {
    const {
      nome, email, senha, tipo_usuario,
      telefone, cpf, cnpj, cep,
      logradouro, numero, bairro, cidade, estado
    } = req.body;

    if (!nome || !email || !senha || !tipo_usuario) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
    }

    // evita e-mail duplicado
    const jaExiste = await buscarUsuarioPorEmail(email);
    if (jaExiste) {
      return res.status(409).json({ message: 'Já existe um usuário com este e-mail.' });
    }

    const senha_hash = await bcrypt.hash(String(senha), 10);

    // Endereço base vindo do front
    let addr = {
      cep: norm(cep),
      logradouro: norm(logradouro),
      numero: norm(numero),
      bairro: norm(bairro),
      cidade: norm(cidade),
      estado: normalizeUF(estado)
    };

    // Para PJ: completar endereço com ViaCEP (quando tiver CEP)
    if (tipo_usuario === 'ponto_coleta' && addr.cep) {
      const via = await fetchViaCep(addr.cep);
      if (via) {
        addr.logradouro = addr.logradouro || via.logradouro;
        addr.bairro     = addr.bairro     || via.bairro;
        addr.cidade     = addr.cidade     || via.cidade;
        addr.estado     = addr.estado     || via.estado; // já vem normalizado
      }
    }

    // Geocodificar (apenas PJ) se houver dados mínimos
    let coords = { latitude: null, longitude: null };
    if (tipo_usuario === 'ponto_coleta' && (addr.logradouro || addr.cidade) && addr.estado) {
      coords = await geocodeAddress(addr);
    }

    const payload = {
      nome: norm(nome),
      email: norm(email)?.toLowerCase(),
      senha_hash,
      tipo_usuario,
      telefone: norm(telefone),
      cpf: norm(cpf),
      cnpj: tipo_usuario === 'ponto_coleta' ? norm(cnpj) : null,

      cep: addr.cep,
      logradouro: addr.logradouro,
      numero: addr.numero,
      bairro: addr.bairro,
      cidade: addr.cidade,
      estado: addr.estado, // EX.: "BA"

      latitude: coords.latitude,
      longitude: coords.longitude,

      // default de plano para novos usuários
      plano: 'free'
    };

    const { data, error } = await supabaseService
      .from('usuarios')
      .insert([payload])
      .select('id, nome, email, tipo_usuario')
      .maybeSingle();

    if (error) {
      return res.status(400).json({ message: 'Erro ao cadastrar', error: error.message });
    }

    return res.status(201).json(data);
  } catch (e) {
    console.error('[auth.cadastro]', e);
    return res.status(500).json({ message: 'Erro no cadastro', error: e.message });
  }
};

/* ===================== LOGIN ===================== */
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    }

    const usuario = await buscarUsuarioPorEmail(email);
    if (!usuario) return res.status(401).json({ message: 'Credenciais inválidas' });
    if (!usuario.senha_hash) return res.status(400).json({ message: 'Usuário sem senha definida' });

    const ok = await bcrypt.compare(senha, usuario.senha_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const usuarioPublico = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario,
      pontos_acumulados: usuario.pontos_acumulados || 0,
      cpf: usuario.cpf || null,
      cpf_verificado: usuario.cpf_verificado || false,
      cnpj: usuario.cnpj || null,
      telefone: usuario.telefone || null,

      // endereço (sua coluna é 'estado'); se o front espera 'uf', você pode mapear depois
      cep: usuario.cep || null,
      logradouro: usuario.logradouro || null,
      numero: usuario.numero || null,
      bairro: usuario.bairro || null,
      cidade: usuario.cidade || null,
      uf: usuario.estado || null, // alias para o front
      latitude: usuario.latitude || null,
      longitude: usuario.longitude || null,

      plano: usuario.plano || 'free',
      pro_ativo_ate: usuario.pro_ativo_ate || null
    };

    return res.json({ message: 'Login realizado com sucesso', token, usuario: usuarioPublico });
  } catch (err) {
    console.error('[POST /auth/login]', err);
    return res.status(500).json({ message: 'Erro no login', error: err.message });
  }
};
