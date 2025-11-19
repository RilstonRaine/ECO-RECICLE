// src/controllers/auditoriaController.js
const auditoriaModel = require('../models/auditoriaModel')

async function reportarProblema(req, res) {
  try {
    const { descricao, descarte_id } = req.body
    const pontoColetaId = req.usuario.id

    if (!descricao) {
      return res.status(400).json({ message: 'Descrição do problema é obrigatória.' })
    }

    // Registra a auditoria
    const auditoria = await auditoriaModel.registrarAuditoria(descarte_id, pontoColetaId, descricao)

    res.status(201).json(auditoria)
  } catch (err) {
    console.error('[POST /auditoria/reportarProblema]', err)
    res.status(400).json({ message: 'Erro ao reportar problema', error: err.message })
  }
}

async function listarAuditorias(req, res) {
  try {
    const pontoColetaId = req.usuario.id
    const auditorias = await auditoriaModel.listarAuditorias(pontoColetaId)

    res.json(auditorias)
  } catch (err) {
    console.error('[GET /auditoria/listarAuditorias]', err)
    res.status(400).json({ message: 'Erro ao listar auditorias', error: err.message })
  }
}

module.exports = {
  reportarProblema,
  listarAuditorias
}
