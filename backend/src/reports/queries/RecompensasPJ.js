// src/reports/queries/pjRecompensas.js
const { supabaseService } = require('../../config/supabaseServiceClient');
const { normalizeRange, toIsoUTC } = require('./utils');

function dateOnly(d) {
  if (!d) return '';
  const x = new Date(d);
  return Number.isNaN(+x) ? String(d) : x.toISOString().slice(0, 10);
}

module.exports = async function pjRecompensas(pjId, { from, to, status }) {
  const range = normalizeRange(from, to);

  // 1) Resgates no seu ponto
  let q = supabaseService
    .from('recompensas_resgates')
    .select('id, recompensa_id, pj_id, pf_id, pontos_consumidos, created_at')
    .eq('pj_id', pjId)
    .order('created_at', { ascending: false });

  if (range.from) q = q.gte('created_at', toIsoUTC(range.from));
  if (range.to)   q = q.lt('created_at', toIsoUTC(range.to));

  const { data: resgates, error } = await q;
  if (error) throw new Error(error.message);

  const recIds = [...new Set((resgates || []).map(r => r.recompensa_id).filter(Boolean))];
  const pfIds  = [...new Set((resgates || []).map(r => r.pf_id).filter(Boolean))];

  // 2) Recompensas & PFs
  const [recsRes, pfsRes] = await Promise.all([
    recIds.length
      ? supabaseService.from('recompensas')
          .select('id, tipo, pontos_minimos, status, pj_id, data_limite')
          .in('id', recIds)
      : Promise.resolve({ data: [] }),
    pfIds.length
      ? supabaseService.from('usuarios')
          .select('id, nome')
          .in('id', pfIds)
      : Promise.resolve({ data: [] }),
  ]);
  if (recsRes.error) throw new Error(recsRes.error.message);
  if (pfsRes.error)  throw new Error(pfsRes.error.message);

  const recMap = Object.fromEntries((recsRes.data || []).map(r => [r.id, r]));
  const pfMap  = Object.fromEntries((pfsRes.data  || []).map(u => [u.id, u]));

  // 3) Linhas no formato esperado pelo columns.js
  let rows = (resgates || []).map(g => {
    const rec    = recMap[g.recompensa_id] || {};
    const pf     = pfMap[g.pf_id] || {};
    const pontos = Number(g.pontos_consumidos ?? rec.pontos_minimos) || 0;

    return {
      id: g.id,                                  // Resgate ID
      data: dateOnly(g.created_at),              // AAAA-MM-DD
      descartante: pf.nome || `#${g.pf_id}`,     // nome do PF
      tipo: rec.tipo || '',
      status: rec.status || null,
      pontos,
    };
  });

  if (status === 'ativas')          rows = rows.filter(r => r.status === 'ativa');
  else if (status === 'encerradas') rows = rows.filter(r => r.status && r.status !== 'ativa');

  return rows;
};
