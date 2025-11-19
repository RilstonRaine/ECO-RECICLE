// src/routes/licencasRoutes.js
const express = require('express')
const router = express.Router()
const { supabaseService } = require('../config/supabaseServiceClient')

// atenção ao case do arquivo:
const authMiddleware = require('../middlewares/authMiddleware')

// GET /licencas/me — status da licença do usuário autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseService
      .from('usuarios')
      .select('id, plano, pro_ativo_ate, tipo_usuario')
      .eq('id', req.usuario.id)
      .maybeSingle()

    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Usuário não encontrado' })

    const pro_ativo = data.plano === 'pro' && data.pro_ativo_ate && new Date(data.pro_ativo_ate) > new Date()
    res.json({ ...data, pro_ativo })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

// POST /licencas/upgrade — concede/estende PRO por X dias (default 30)
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const dias = Number(req.body?.dias ?? 30)
    const { data, error } = await supabaseService.rpc('licenca_pro_conceder', {
      p_usuario_id: req.usuario.id,
      p_dias: dias
    })
    if (error) throw error
    res.json({ ok: true, licenca: data?.[0] })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

module.exports = router
