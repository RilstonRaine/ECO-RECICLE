// src/models/auditoriaModel.js
const { supabaseService } = require('../config/supabaseServiceClient')

async function registrarAuditoria(descarteId, pontoColetaId, descricao) {
  const { data, error } = await supabaseService
    .from('auditoria_descartes')
    .insert([
      {
        descarte_id: descarteId,
        ponto_coleta_id: pontoColetaId,
        descricao: descricao,
        status: 'pendente', // 'pendente', 'resolvido'
      }
    ])
    .select('*')
    .maybeSingle()

  if (error) throw new Error(`Erro ao registrar auditoria: ${error.message}`)
  return data
}

async function listarAuditorias(pontoColetaId) {
  const { data, error } = await supabaseService
    .from('auditoria_descartes')
    .select('*')
    .eq('ponto_coleta_id', pontoColetaId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao listar auditorias: ${error.message}`)
  return data
}

module.exports = {
  registrarAuditoria,
  listarAuditorias
}
