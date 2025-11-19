const { supabaseService } = require('../config/supabaseServiceClient');
const pjRecompensas = require('../reports/queries/RecompensasPJ');

function isPro(lic) {
  if (!lic) return false;
  if (lic.plano !== 'pro') return false;
  const ok = lic.pro_ativo || (lic.pro_ativo_ate && new Date(lic.pro_ativo_ate) > new Date());
  return !!ok;
}

// carrega licenca do usuário rapidamente
async function getLicenca(userId) {
  const { data, error } = await supabaseService
    .from('usuarios')
    .select('plano, pro_ativo, pro_ativo_ate')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return data || null;
}

function toDateOnly(v) {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0,10);
}

// soma pontos de um PF em um PJ, dentro de janela (opcional)
async function somaPontosPFnoPJ({ pfId, pjId, from, to }) {
  // soma ganhos (descartes)
  let q = supabaseService
    .from('descartes')
    .select('pontos_gerados, data_registro')
    .eq('usuario_id', pfId)
    .eq('ponto_coleta_id', pjId);

  if (from) q = q.gte('data_registro', from);
  if (to)   q = q.lte('data_registro', to);

  const { data: ganhos, error: e1 } = await q;
  if (e1) throw new Error(e1.message);

  let totalGanhos = 0;
  for (const r of (ganhos || [])) totalGanhos += Number(r.pontos_gerados) || 0;

  // subtrai consumos (resgates) na mesma janela
  let qc = supabaseService
    .from('recompensas_resgates')
    .select('pontos_consumidos, created_at')
    .eq('pf_id', pfId)
    .eq('pj_id', pjId);

  if (from) qc = qc.gte('created_at', from);
  if (to)   qc = qc.lte('created_at', to);

  const { data: consumos, error: e2 } = await qc;
  if (e2) throw new Error(e2.message);

  let totalConsumido = 0;
  for (const c of (consumos || [])) totalConsumido += Number(c.pontos_consumidos) || 0;

  return Math.max(0, totalGanhos - totalConsumido);
}

exports.listarResgates = async function listarResgates(req, res) {
  try {
    const pjId = req?.usuario?.ponto_coleta_id || req?.usuario?.id;
    if (!pjId) {
      return res.status(400).json({ error: 'Usuário não está vinculado a um ponto de coleta.' });
    }

    const { from, to, status } = req.query || {};
    const rows = await pjRecompensas(pjId, { from, to, status });

    // rows: [{ id, data, descartante, tipo, status, pontos }]
    return res.json(rows);
  } catch (err) {
    console.error('[listarResgates]', err);
    return res.status(500).json({ error: 'Falha ao listar resgates' });
  }
};

/* ================================
   PJ PRO – Leaderboard por período
   GET /recompensas/pj/leaderboard?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=10
   ================================ */
exports.pjLeaderboard = async (req, res) => {
  try {
    const me = req.usuario;
    if (!me?.id) return res.status(401).json({ message: 'Não autenticado' });

    const lic = await getLicenca(me.id);
    if (me.tipo_usuario !== 'ponto_coleta' || !isPro(lic)) {
      return res.status(403).json({ message: 'Apenas PJ PRO' });
    }

    const from = toDateOnly(req.query.from);
    const to = toDateOnly(req.query.to);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));

    // puxa descartes no período e agrega no Node
    let q = supabaseService
      .from('descartes')
      .select('usuario_id, pontos_gerados, data_registro')
      .eq('ponto_coleta_id', me.id);

    if (from) q = q.gte('data_registro', from);
    if (to)   q = q.lte('data_registro', to);

    const { data, error } = await q;
    if (error) throw new Error(error.message);

    const somaPorPF = new Map();
    for (const r of (data || [])) {
      const pf = r.usuario_id;
      const p  = Number(r.pontos_gerados) || 0;
      somaPorPF.set(pf, (somaPorPF.get(pf) || 0) + p);
    }

    // pega nomes
    const ids = Array.from(somaPorPF.keys());
    let nomes = {};
    if (ids.length) {
      const { data: users } = await supabaseService
        .from('usuarios')
        .select('id, nome, email')
        .in('id', ids);
      (users || []).forEach(u => nomes[u.id] = { nome: u.nome, email: u.email });
    }

    const ranking = ids
      .map(id => ({ usuario_id: id, pontos: somaPorPF.get(id), ...(nomes[id] || {}) }))
      .sort((a,b) => b.pontos - a.pontos)
      .slice(0, limit);

    return res.json({ from, to, ranking });
  } catch (e) {
    return res.status(500).json({ message: 'Erro no leaderboard', error: e.message });
  }
};

/* ================================
   PJ PRO – Criar recompensa
   POST /recompensas
   body: { tipo: 'fisica'|'digital', pontos_minimos, data_limite, max_resgates, descricao? }
   ================================ */
exports.criarRecompensa = async (req, res) => {
  try {
    const me = req.usuario;
    if (!me?.id) return res.status(401).json({ message: 'Não autenticado' });

    // valida licença PJ PRO (usa helpers já existentes no arquivo)
    const lic = await getLicenca(me.id);
    if (me.tipo_usuario !== 'ponto_coleta' || !isPro(lic)) {
      return res.status(403).json({ message: 'Apenas PJ PRO' });
    }

    // valida body
    const b = req.body || {};
    const tipo = String(b.tipo || '').toLowerCase();
    if (!['fisica', 'digital'].includes(tipo)) {
      return res.status(400).json({ message: 'tipo deve ser fisica|digital' });
    }

    const pontos_minimos = Number.parseInt(b.pontos_minimos, 10);
    if (!Number.isFinite(pontos_minimos) || pontos_minimos <= 0) {
      return res.status(400).json({ message: 'pontos_minimos inválido' });
    }

    const max_resgates = Number.parseInt(b.max_resgates, 10);
    if (!Number.isFinite(max_resgates) || max_resgates < 1) {
      return res.status(400).json({ message: 'max_resgates inválido' });
    }

    const data_limite = toDateOnly(b.data_limite);
    if (!data_limite) {
      return res.status(400).json({ message: 'data_limite inválida (use YYYY-MM-DD)' });
    }

    const descricao = (b.descricao || '').toString().trim() || null;

    // garante pj_id numérico
    const pj_id = Number(me.id);
    if (!Number.isFinite(pj_id)) {
      return res.status(400).json({ message: 'ID do PJ inválido (esperado integer)' });
    }

    // payload compatível com seu esquema atual (colunas legadas incluídas)
    const payload = {
      pj_id,                               // integer/bigint
      usuario_id: pj_id,                   // <- preenche para evitar NOT NULL
      tipo,                                // 'fisica' | 'digital'
      pontos_minimos,                      // integer
      pontos_necessarios: pontos_minimos,  // coluna legada
      data_limite,                         // date (YYYY-MM-DD)
      max_resgates,                        // integer
      descricao,                           // text | null
      status: 'ativa',                     // ativa/inativa/expirada
      resgatado: false,                    // coluna legada
      data_resgate: null                   // coluna legada
    };

    const { data, error } = await supabaseService
      .from('recompensas')
      .insert([payload])
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[criarRecompensa][supabase]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payload
      });
      const badRequest = new Set(['22P02', '23502', '23503', '23505']);
      return res.status(badRequest.has(error.code) ? 400 : 500).json({
        message: 'Erro ao criar recompensa',
        code: error.code,
        details: error.details,
        hint: error.hint,
        error: error.message
      });
    }

    return res.status(201).json(data);
  } catch (e) {
    console.error('[criarRecompensa][catch]', e);
    return res.status(500).json({ message: 'Erro ao criar recompensa', error: e.message });
  }
};

/* ================================
   PJ PRO – Minhas recompensas (ativas e vencidas)
   GET /recompensas/pj/minhas
   ================================ */
exports.minhasRecompensas = async (req, res) => {
  try {
    const me = req.usuario;
    if (!me?.id) return res.status(401).json({ message: 'Não autenticado' });

    const lic = await getLicenca(me.id);
    if (me.tipo_usuario !== 'ponto_coleta' || !isPro(lic)) {
      return res.status(403).json({ message: 'Apenas PJ PRO' });
    }

    const rawStatus = String(req.query.status || '').toLowerCase();
    const statusMap = {
      ativa: 'ativa', ativas: 'ativa',
      encerrada: 'encerrada', encerradas: 'encerrada',
      inativa: 'inativa', inativas: 'inativa',
      expirada: 'expirada', expiradas: 'expirada'
    };

    const from = toDateOnly(req.query.from);
    const to   = toDateOnly(req.query.to);

    let q = supabaseService
      .from('recompensas')
      .select('id, tipo, pontos_minimos, data_limite, max_resgates, descricao, status, created_at')
      .eq('pj_id', me.id);

    if (statusMap[rawStatus]) q = q.eq('status', statusMap[rawStatus]);
    if (from) q = q.gte('created_at', from + 'T00:00:00Z');
    if (to)   q = q.lte('created_at', to   + 'T23:59:59Z');

    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    // conta resgates por recompensa
    const ids = (data || []).map(r => r.id);
    const counts = {};
    if (ids.length) {
      const { data: reg, error: e2 } = await supabaseService
        .from('recompensas_resgates')
        .select('recompensa_id')
        .in('recompensa_id', ids);
      if (e2) throw new Error(e2.message);
      for (const r of reg || []) counts[r.recompensa_id] = (counts[r.recompensa_id] || 0) + 1;
    }

    // fecha automaticamente as vencidas/esgotadas
    const hoje = new Date().toISOString().slice(0,10);
    const toClose = [];
    const enriched = (data || []).map(r => {
      const usados = counts[r.id] || 0;
      const maxNum = Number(r.max_resgates);
      const hasMax = Number.isFinite(maxNum);
      const vagas_restantes = hasMax ? Math.max(0, maxNum - usados) : 0;

      const esgotou = hasMax && usados >= maxNum;
      const venceu  = r.data_limite && r.data_limite < hoje;
      if (r.status === 'ativa' && (esgotou || venceu)) toClose.push(r.id);

      return { ...r, resgates: usados, vagas_restantes };
    });

    if (toClose.length) {
      await supabaseService
        .from('recompensas')
        .update({ status: 'encerrada' })
        .in('id', toClose);
    }

    const out =
      statusMap[rawStatus] === 'ativa'
        ? enriched.filter(r => !toClose.includes(r.id))
        : enriched;

    return res.json(out);
  } catch (e) {
    console.error('[minhasRecompensas]', e);
    return res.status(500).json({ message: 'Erro ao listar recompensas', error: e.message });
  }
};

// ================================
// PJ PRO – Encerrar recompensa
// PATCH /recompensas/:id/encerrar
// ================================
exports.encerrar = async (req, res) => {
  try {
    const me = req.usuario;
    if (!me?.id) return res.status(401).json({ message: 'Não autenticado' });

    const lic = await getLicenca(me.id);
    if (me.tipo_usuario !== 'ponto_coleta' || !isPro(lic)) {
      return res.status(403).json({ message: 'Apenas PJ PRO' });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'ID inválido' });

    // Confirma que a recompensa é deste PJ
    const { data: rec, error: e1 } = await supabaseService
      .from('recompensas')
      .select('id, pj_id, status')
      .eq('id', id)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!rec) return res.status(404).json({ message: 'Recompensa não encontrada' });
    if (rec.pj_id !== me.id) return res.status(403).json({ message: 'Sem permissão' });
    if (rec.status !== 'ativa') return res.status(400).json({ message: 'Recompensa já não está ativa' });

    const { data: updated, error: e2 } = await supabaseService
      .from('recompensas')
      .update({ status: 'encerrada' })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (e2) throw new Error(e2.message);

    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao encerrar recompensa', error: e.message });
  }
};

/* ================================
   PF PRO – Listar recompensas ativas (todas PJs PRO)
   GET /recompensas/ativas
   ================================ */
exports.listarAtivas = async (req, res) => {
  try {
    const me = req.usuario;
    if (!me?.id) return res.status(401).json({ message: 'Não autenticado' });

    const lic = await getLicenca(me.id);
    if (me.tipo_usuario !== 'descartante' || !isPro(lic)) {
      return res.status(403).json({ message: 'Apenas PF PRO' });
    }

    const hoje = new Date().toISOString().slice(0,10);

    const { data, error } = await supabaseService
      .from('recompensas')
      .select('id, pj_id, tipo, pontos_minimos, data_limite, max_resgates, descricao, status, created_at')
      .eq('status', 'ativa')
      .gte('data_limite', hoje)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // anexa dados do PJ
    const pjIds = [...new Set((data || []).map(r => r.pj_id))];
    let pjs = {};
    if (pjIds.length) {
      const { data: u } = await supabaseService
        .from('usuarios')
        .select('id, nome, email, logradouro, numero, bairro, cidade, estado')
        .in('id', pjIds);
      (u || []).forEach(x => {
        pjs[x.id] = {
          id: x.id,
          nome: x.nome,
          email: x.email,
          endereco: [x.logradouro, x.numero, x.bairro, x.cidade, x.estado].filter(Boolean).join(', ')
        };
      });
    }

    // contar resgates (sem aggregate SQL)
    const recIds = (data || []).map(r => r.id);
    let usados = {};
    if (recIds.length) {
      const { data: rows, error: ecount } = await supabaseService
        .from('recompensas_resgates')
        .select('recompensa_id')
        .in('recompensa_id', recIds);

      if (ecount) throw new Error(ecount.message);

      for (const r of rows || []) {
        const k = r.recompensa_id;
        usados[k] = (usados[k] || 0) + 1;
      }
    }

    // resgates do PF atual para filtrar já resgatadas
    const ja = new Set();
    if (recIds.length) {
      const { data: meus, error: eJa } = await supabaseService
        .from('recompensas_resgates')
        .select('recompensa_id')
        .in('recompensa_id', recIds)
        .eq('pf_id', me.id);

      if (eJa) throw new Error(eJa.message);
      (meus || []).forEach(r => ja.add(r.recompensa_id));
    }

    // monta saída e FILTRA já resgatadas
    const out = [];
    for (const r of (data || [])) {
      if (ja.has(r.id)) continue; // <- PF já resgatou: não mostrar

      const pj = pjs[r.pj_id] || {};
      const from = r.created_at.slice(0,10) + 'T00:00:00Z';
      const to   = r.data_limite + 'T23:59:59Z';

      const total = await somaPontosPFnoPJ({ pfId: me.id, pjId: r.pj_id, from, to });
      const faltam = Math.max(0, (r.pontos_minimos - total));
      const resgatesFeitos = usados[r.id] || 0;
      const vagas = Math.max(0, r.max_resgates - resgatesFeitos);
      const pode = (faltam === 0) && (vagas > 0);

      out.push({
        ...r,
        pj,
        meus_pontos_no_pj: total,
        faltam_pontos: faltam,
        vagas_restantes: vagas,
        pode_resgatar: pode
      });
    }

    return res.json(out);
  } catch (e) {
    console.error('[listarAtivas][error]', e);
    return res.status(500).json({ message: 'Erro ao listar recompensas ativas', error: e.message });
  }
};

/* ================================
   PF PRO – Resgatar
   POST /recompensas/:id/resgatar
   ================================ */
exports.resgatar = async (req, res) => {
  try {
    const me = req.usuario;
    if (!me?.id) return res.status(401).json({ message: 'Não autenticado' });

    const lic = await getLicenca(me.id);
    if (me.tipo_usuario !== 'descartante' || !isPro(lic)) {
      return res.status(403).json({ message: 'Apenas PF PRO' });
    }

    const recompensaId = Number(req.params.id);
    const { data: r, error } = await supabaseService
      .from('recompensas')
      .select('*')
      .eq('id', recompensaId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!r) return res.status(404).json({ message: 'Recompensa não encontrada' });
    if (r.status !== 'ativa') return res.status(400).json({ message: 'Recompensa não está ativa' });

    const hoje = new Date().toISOString().slice(0, 10);
    if (r.data_limite < hoje) return res.status(400).json({ message: 'Recompensa expirada' });

    // vagas restantes (contagem correta usando count)
    const { count: usadosCount, error: eCount } = await supabaseService
      .from('recompensas_resgates')
      .select('id', { head: true, count: 'exact' })
      .eq('recompensa_id', recompensaId);
    if (eCount) throw new Error(eCount.message);

    const vagas = Math.max(0, r.max_resgates - (usadosCount || 0));
    if (vagas <= 0) return res.status(400).json({ message: 'Limite de resgates atingido' });

    // já resgatou?
    const { data: ja } = await supabaseService
      .from('recompensas_resgates')
      .select('id')
      .eq('recompensa_id', recompensaId)
      .eq('pf_id', me.id)
      .maybeSingle();
    if (ja) return res.status(400).json({ message: 'Você já resgatou esta recompensa' });

    // pontos do PF no PJ (janela da campanha) - já desconta consumos (somaPontosPFnoPJ atualizado)
    const from = r.created_at.slice(0, 10) + 'T00:00:00Z';
    const to   = r.data_limite + 'T23:59:59Z';
    const total = await somaPontosPFnoPJ({ pfId: me.id, pjId: r.pj_id, from, to });
    if (total < r.pontos_minimos) {
      return res.status(400).json({
        message: 'Pontos insuficientes neste ponto de coleta',
        faltam_pontos: r.pontos_minimos - total,
        data_limite: r.data_limite
      });
    }

    // cria resgate (já registra consumo e pj_id)
    const payload = {
      recompensa_id: recompensaId,
      pf_id: me.id,
      pj_id: r.pj_id,
      pontos_no_pj: total,
      pontos_consumidos: r.pontos_minimos
    };
    const { data: novo, error: ierr } = await supabaseService
      .from('recompensas_resgates')
      .insert([payload])
      .select('*')
      .maybeSingle();
    if (ierr) throw new Error(ierr.message);

    // (OPCIONAL) Abater do total global do usuário (usuarios.pontos_acumulados)
    try {
      const { data: userRow, error: eGet } = await supabaseService
        .from('usuarios')
        .select('pontos_acumulados')
        .eq('id', me.id)
        .maybeSingle();

      if (!eGet && userRow) {
        const atual = Number(userRow.pontos_acumulados) || 0;
        const abatimento = Number(r.pontos_minimos) || 0;
        const novoSaldo = Math.max(0, atual - abatimento);

        const { error: eUpd } = await supabaseService
          .from('usuarios')
          .update({ pontos_acumulados: novoSaldo })
          .eq('id', me.id);
        if (eUpd) console.error('[resgatar][wallet update]', eUpd.message || eUpd);
      } else if (eGet) {
        console.error('[resgatar][wallet select]', eGet.message || eGet);
      }
    } catch (ew) {
      console.error('[resgatar][wallet catch]', ew);
    }

    // resposta OK
    return res.status(201).json({
      message: 'Parabéns! Resgate realizado com sucesso. Verifique seu e-mail para mais informações.',
      resgate: novo
    });
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao resgatar', error: e.message });
  }
};
exports.ranking = (req, res) => exports.pjLeaderboard(req, res);