// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken')
const { supabaseService } = require('../config/supabaseServiceClient')

function isProActive(u) {
  const plano = (u?.plano || '').toString().toUpperCase()
  if (plano !== 'PRO') return false
  // se existir validade, respeita
  if (u?.pro_ativo_ate) {
    return new Date(u.pro_ativo_ate) >= new Date()
  }
  return true
}

// Autenticação + “hydrate” do usuário
async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Token ausente' })

    const payload = jwt.verify(token, process.env.JWT_SECRET) || {}
    // Começa com o que veio no token
    req.usuario = {
      id: payload.id,
      tipo_usuario: payload.tipo_usuario,
      plano: payload.plano,
      pro_ativo_ate: payload.pro_ativo_ate,
    }

    // Fallback: se faltarem campos importantes, busca no banco (fonte da verdade)
    if (!req.usuario.tipo_usuario || !req.usuario.plano) {
      const { data: u, error } = await supabaseService
        .from('usuarios')
        .select('id, tipo_usuario, plano, pro_ativo_ate')
        .eq('id', payload.id)
        .maybeSingle()
      if (error) throw error
      if (!u) return res.status(401).json({ message: 'Usuário não encontrado' })

      req.usuario.tipo_usuario = u.tipo_usuario
      req.usuario.plano = u.plano
      req.usuario.pro_ativo_ate = u.pro_ativo_ate
    }

    req.usuario._isProActive = isProActive(req.usuario)
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido', error: err.message })
  }
}

// Somente PJ
function requirePjPro(req, res, next) {
  if (req.usuario?.tipo_usuario !== 'ponto_coleta') {
    return res.status(403).json({ message: 'Apenas PJ' })
  }
  if (!req.usuario?._isProActive) {
    return res.status(403).json({ message: 'Plano PRO inativo/ausente' })
  }
  return next()
}

// Somente PF
function requirePfPro(req, res, next) {
  if (req.usuario?.tipo_usuario !== 'descartante') {
    return res.status(403).json({ message: 'Apenas descartantes (PF)' })
  }
  if (!req.usuario?._isProActive) {
    return res.status(403).json({ message: 'Plano PRO inativo/ausente' })
  }
  return next()
}

// Qualquer usuário PRO (PF ou PJ)
function requireProPlano(req, res, next) {
  if (!req.usuario?._isProActive) {
    return res.status(403).json({ message: 'Apenas usuários com plano PRO' })
  }
  return next()
}

module.exports = authMiddleware
module.exports.requireAuth = authMiddleware
module.exports.requirePjPro = requirePjPro
module.exports.requirePfPro = requirePfPro
module.exports.requireProPlano = requireProPlano
