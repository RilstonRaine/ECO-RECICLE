// src/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const { supabaseService } = require('../config/supabaseServiceClient');
const auth = require('../middlewares/authMiddleware');

/* ----------------- helpers genéricos ----------------- */
const onlyDigits = (v) => (v ?? '').toString().replace(/\D+/g, '');
const normStr    = (v) => (v == null ? null : String(v).trim()) || null;
const normUF     = (v) => {
  const s = normStr(v);
  return s ? s.slice(0, 2).toUpperCase() : null;
};
const normNum    = (v) => (v == null ? null : String(v).trim());

/* fetch compatível (Node <18) */
const fetchCompat = global.fetch
  ? global.fetch.bind(global)
  : async (...args) => {
      const { default: f } = await import('node-fetch');
      return f(...args);
    };

/* ----------------- ViaCEP helper ----------------- */
async function fetchViaCep(cep) {
  try {
    const r = await fetchCompat(`https://viacep.com.br/ws/${cep}/json/`);
    const j = await r.json();
    if (j?.erro) return null;
    return {
      logradouro: j.logradouro || null,
      bairro:     j.bairro     || null,
      cidade:     j.localidade || null,
      estado:     (j.uf || '').toUpperCase() || null,
    };
  } catch {
    return null;
  }
}

/* datas YYYY-MM-DD -> ISO limites do dia */
function toIsoStart(s) {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return isNaN(d) ? null : d.toISOString();
}
function toIsoEnd(s) {
  if (!s) return null;
  const d = new Date(`${s}T23:59:59Z`);
  return isNaN(d) ? null : d.toISOString();
}

/* =========================================================
   ROTA PÚBLICA: GET /usuarios/pontos  -> lista PJs
   ========================================================= */
router.get('/pontos', async (req, res) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let q = supabaseService
      .from('usuarios')
      .select('id, nome, email, telefone, cnpj, logradouro, numero, bairro, cidade, estado, cep, latitude, longitude, tipo_usuario')
      .eq('tipo_usuario', 'ponto_coleta')
      .order('nome', { ascending: true });

    if (ids.length) q = q.in('id', ids);

    const { data, error } = await q;
    if (error) throw error;
    return res.json(data || []);
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao listar pontos', error: e.message });
  }
});

/* =========================================================
   A partir daqui: exige autenticação
   ========================================================= */
router.use(auth);

/* =========================================================
   GET /usuarios  -> lista usuários (filtros opcionais)
   ?tipo=descartante|ponto_coleta
   ?ids=1,2,3
   ?q=termo (nome/email)
   ========================================================= */
router.get('/', async (req, res) => {
  try {
    const tipo = (req.query.tipo || '').toLowerCase();
    const ids = String(req.query.ids || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const q = (req.query.q || '').trim();

    let query = supabaseService
      .from('usuarios')
      .select('id, nome, email, tipo_usuario')
      .order('nome', { ascending: true });

    if (tipo) query = query.eq('tipo_usuario', tipo);
    if (ids.length) query = query.in('id', ids);
    if (q) query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) throw error;
    return res.json(data || []);
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao listar usuários', error: e.message });
  }
});

/* =========================================================
   GET /usuarios/me  -> perfil do usuário autenticado
   fresh=1 (PF) recalcula saldo e retorna pontos_resgatados
   ========================================================= */
router.get('/me', async (req, res) => {
  try {
    const { id } = req.usuario;
    if (!id) return res.status(401).json({ message: 'Não autenticado' });

    const fresh = String(req.query.fresh || '') === '1';

    const { data: user, error } = await supabaseService
      .from('usuarios')
      .select(`
        id, nome, email, telefone, tipo_usuario,
        cpf, cnpj,
        cep, logradouro, numero, bairro, cidade, estado,
        latitude, longitude, plano, pro_ativo_ate, pontos_acumulados
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    if (user.tipo_usuario === 'descartante' && fresh) {
      const { data: drows, error: e1 } = await supabaseService
        .from('descartes')
        .select('pontos_gerados')
        .eq('usuario_id', id);
      if (e1) throw e1;

      const { data: rrows, error: e2 } = await supabaseService
        .from('recompensas_resgates')
        .select('pontos_consumidos')
        .eq('pf_id', id);
      if (e2) throw e2;

      const ganhos = (drows || []).reduce((s, r) => s + (Number(r.pontos_gerados) || 0), 0);
      const consumos = (rrows || []).reduce((s, r) => s + (Number(r.pontos_consumidos) || 0), 0);
      const saldo = Math.max(0, ganhos - consumos);

      await supabaseService
        .from('usuarios')
        .update({ pontos_acumulados: saldo })
        .eq('id', id);

      user.pontos_acumulados = saldo;
      user.pontos_resgatados = consumos;
    }

    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao carregar perfil', error: e.message });
  }
});

/* =========================================================
   PUT /usuarios/me  -> atualiza campos do perfil
   ========================================================= */
router.put('/me', async (req, res) => {
  try {
    const { id } = req.usuario;
    if (!id) return res.status(401).json({ message: 'Não autenticado' });

    const b = req.body || {};
    const payload = {};

    if (b.nome !== undefined)        payload.nome        = normStr(b.nome);
    if (b.email !== undefined)       payload.email       = normStr(b.email);
    if (b.telefone !== undefined)    payload.telefone    = onlyDigits(b.telefone) || null;

    if (b.cpf !== undefined)         payload.cpf         = onlyDigits(b.cpf)  || null;
    if (b.cnpj !== undefined)        payload.cnpj        = onlyDigits(b.cnpj) || null;

    if (b.cep !== undefined)         payload.cep         = onlyDigits(b.cep) || null;
    if (b.logradouro !== undefined)  payload.logradouro  = normStr(b.logradouro);
    if (b.numero !== undefined)      payload.numero      = normNum(b.numero);
    if (b.bairro !== undefined)      payload.bairro      = normStr(b.bairro);
    if (b.cidade !== undefined)      payload.cidade      = normStr(b.cidade);
    if (b.estado !== undefined)      payload.estado      = normUF(b.estado);

    if (b.latitude !== undefined) {
      const lat = Number(b.latitude);
      payload.latitude = Number.isFinite(lat) ? lat : null;
    }
    if (b.longitude !== undefined) {
      const lon = Number(b.longitude);
      payload.longitude = Number.isFinite(lon) ? lon : null;
    }

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
    }

    const needsViaCep =
      payload.cep &&
      (!payload.logradouro || !payload.bairro || !payload.cidade || !payload.estado);

    if (needsViaCep) {
      const via = await fetchViaCep(payload.cep);
      if (via) {
        if (!payload.logradouro) payload.logradouro = via.logradouro;
        if (!payload.bairro)     payload.bairro     = via.bairro;
        if (!payload.cidade)     payload.cidade     = via.cidade;
        if (!payload.estado)     payload.estado     = via.estado;
      }
    }

    const { data, error } = await supabaseService
      .from('usuarios')
      .update(payload)
      .eq('id', id)
      .select(`
        id, nome, email, telefone, tipo_usuario,
        cpf, cnpj,
        cep, logradouro, numero, bairro, cidade, estado,
        latitude, longitude, plano, pro_ativo_ate, pontos_acumulados
      `)
      .maybeSingle();

    if (error) throw error;
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao atualizar perfil', error: e.message });
  }
});

/* =========================================================
   GET /usuarios/me/resgatados  -> total (opcional/legado)
   ========================================================= */
router.get('/me/resgatados', async (req, res) => {
  try {
    const id = req.usuario?.id;
    if (!id) return res.status(401).json({ message: 'Não autenticado' });

    const { data, error } = await supabaseService
      .from('recompensas_resgates')
      .select('pontos_consumidos')
      .eq('pf_id', id);

    if (error) throw error;

    const total = (data ?? []).reduce((s, r) => s + (Number(r.pontos_consumidos) || 0), 0);
    return res.json({ pontos_resgatados: total });
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao calcular pontos resgatados', error: e.message });
  }
});

/* =========================================================
   NOVO: GET /usuarios/me/resgates -> lista de resgates do PF
   ?from=YYYY-MM-DD&to=YYYY-MM-DD
   ========================================================= */
router.get('/me/resgates', async (req, res) => {
  try {
    const me = req.usuario;
    if (!me?.id) return res.status(401).json({ message: 'Não autenticado' });

    const from = toIsoStart(req.query.from);
    const to   = toIsoEnd(req.query.to);

    let q = supabaseService
      .from('recompensas_resgates')
      .select('id, created_at, recompensa_id, pf_id, pj_id, pontos_consumidos')
      .eq('pf_id', me.id)
      .order('created_at', { ascending: false });

    if (from) q = q.gte('created_at', from);
    if (to)   q = q.lte('created_at', to);

    const { data: rows, error } = await q;
    if (error) throw error;

    const recIds = [...new Set((rows || []).map(r => r.recompensa_id).filter(Boolean))];
    const meta = {};
    if (recIds.length) {
      const { data: recs, error: e2 } = await supabaseService
        .from('recompensas')
        .select('id, tipo, pj_id')
        .in('id', recIds);
      if (e2) throw e2;
      (recs || []).forEach(r => { meta[r.id] = { tipo: r.tipo, pj_id: r.pj_id }; });
    }

    const out = (rows || []).map(r => ({
      id: r.id,
      created_at: r.created_at,
      recompensa_id: r.recompensa_id,
      pj_id: r.pj_id ?? meta[r.recompensa_id]?.pj_id ?? null,
      tipo: meta[r.recompensa_id]?.tipo ?? null,
      pontos: Number(r.pontos_consumidos || 0),
    }));

    return res.json(out);
  } catch (e) {
    console.error('[GET /usuarios/me/resgates]', e);
    return res.status(500).json({ message: 'Erro ao listar resgates', error: e.message });
  }
});

module.exports = router;
