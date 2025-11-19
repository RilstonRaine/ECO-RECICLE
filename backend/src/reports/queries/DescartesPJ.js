// src/reports/queries/pjDescartes.js
const { supabaseService } = require('../../config/supabaseServiceClient');
const { normalizeRange, toIsoUTC } = require('./utils');

function dateOnlyLocal(v) {
  const d = new Date(v);
  if (Number.isNaN(+d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

module.exports = async function pjDescartes(pontoId, { from, to, tipo }) {
  const range = normalizeRange(from, to);

  let q = supabaseService
    .from('descartes')
    .select('id, data_registro, tipo_residuo, quantidade_itens, peso_kg, pontos_gerados, usuario_id')
    .eq('ponto_coleta_id', pontoId)
    .order('data_registro', { ascending: false });

  if (range.from) q = q.gte('data_registro', toIsoUTC(range.from));
  if (range.to)   q = q.lt('data_registro', toIsoUTC(range.to));
  if (tipo)       q = q.eq('tipo_residuo', tipo);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  // nomes dos usuários (PF)
  const pfIds = [...new Set((data || []).map(r => r.usuario_id).filter(Boolean))];
  let pfMap = {};
  if (pfIds.length) {
    const { data: pfs, error: e2 } = await supabaseService
      .from('usuarios')
      .select('id, nome')
      .in('id', pfIds);
    if (e2) throw new Error(e2.message);
    pfMap = Object.fromEntries((pfs || []).map(u => [u.id, u.nome || `Usuário #${u.id}`]));
  }

  return (data || []).map(r => ({
    id:      r.id,
    data:    dateOnlyLocal(r.data_registro),           // <<< só a data
    usuario: pfMap[r.usuario_id] || `Usuário #${r.usuario_id ?? ''}`,
    tipo:    r.tipo_residuo || '',
    qtd:     r.quantidade_itens ?? '',
    peso:    r.peso_kg ?? '',
    pontos:  r.pontos_gerados ?? 0,
  }));
};
