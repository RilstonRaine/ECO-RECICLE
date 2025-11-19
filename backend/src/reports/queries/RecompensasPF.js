// src/reports/queries/pfRecompensas.js
const { supabaseService } = require('../../config/supabaseServiceClient');
const { normalizeRange, toIsoUTC } = require('./utils');

function dateOnly(d) {
  if (!d) return '';
  const x = new Date(d);
  return Number.isNaN(+x) ? String(d) : x.toISOString().slice(0, 10);
}

module.exports = async function pfRecompensas(userId, { from, to, status }) {
  const range = normalizeRange(from, to);

  // 1) Resgates do PF no período
  let q = supabaseService
    .from('recompensas_resgates')
    .select('id, recompensa_id, pj_id, pf_id, pontos_consumidos, created_at')
    .eq('pf_id', userId)
    .order('created_at', { ascending: false });

  if (range.from) q = q.gte('created_at', toIsoUTC(range.from));
  if (range.to)   q = q.lt('created_at', toIsoUTC(range.to));

  const { data: resgates, error } = await q;
  if (error) throw new Error(error.message);

  const recIds = [...new Set((resgates || []).map(r => r.recompensa_id).filter(Boolean))];
  const pjIds  = [...new Set((resgates || []).map(r => r.pj_id).filter(Boolean))];

  // 2) Busca recompensas e PJs
  const [recsRes, pjsRes] = await Promise.all([
    recIds.length
      ? supabaseService.from('recompensas')
          .select('id, tipo, pontos_minimos, status, pj_id, data_limite')
          .in('id', recIds)
      : Promise.resolve({ data: [] }),
    pjIds.length
      ? supabaseService.from('usuarios')
          .select('id, nome')
          .in('id', pjIds)
      : Promise.resolve({ data: [] }),
  ]);
  if (recsRes.error) throw new Error(recsRes.error.message);
  if (pjsRes.error)  throw new Error(pjsRes.error.message);

  const recMap = Object.fromEntries((recsRes.data || []).map(r => [r.id, r]));
  const pjMap  = Object.fromEntries((pjsRes.data  || []).map(u => [u.id, u]));

  // 3) Monta linhas no formato esperado pelas colunas
  let rows = (resgates || []).map(g => {
    const rec    = recMap[g.recompensa_id] || {};
    const pj     = pjMap[g.pj_id] || {};
    const pontos = Number(g.pontos_consumidos ?? rec.pontos_minimos) || 0;

    return {
      id: g.id,                        // Resgate ID
      data: dateOnly(g.created_at),    // Data (somente AAAA-MM-DD)
      tipo: rec.tipo || '',            // fisica|digital
      status: rec.status || null,      // ativa|encerrada
      ponto: pj.nome || `#${g.pj_id}`, // nome do ponto (fallback para #ID)
      pontos,                          // total de pontos consumidos
    };
  });

  if (status === 'ativas')        rows = rows.filter(r => r.status === 'ativa');
  else if (status === 'encerradas') rows = rows.filter(r => r.status && r.status !== 'ativa');

  return rows;
};
