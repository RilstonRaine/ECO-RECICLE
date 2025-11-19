// src/middlewares/requirePro.js
const { supabaseService } = require('../config/supabaseServiceClient')

async function isProAtivo(userId) {
  const { data, error } = await supabaseService
    .from('usuarios')
    .select('plano, pro_ativo_ate, tipo_usuario')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  const ativo = data?.plano === 'pro' && data?.pro_ativo_ate && new Date(data.pro_ativo_ate) > new Date()
  return { ativo, tipo: data?.tipo_usuario || null }
}

async function requireProPF(req, res, next) {
  try {
    if (!req.usuario?.id) return res.status(401).json({ message: 'Não autenticado' })
    const { ativo, tipo } = await isProAtivo(req.usuario.id)
    if (tipo !== 'descartante') return res.status(403).json({ message: 'Apenas PF pode acessar este recurso.' })
    if (!ativo) return res.status(402).json({ message: 'Recurso disponível apenas para PRO PF.' })
    next()
  } catch (e) { res.status(500).json({ message: e.message }) }
}

async function requireProPJ(req, res, next) {
  try {
    if (!req.usuario?.id) return res.status(401).json({ message: 'Não autenticado' })
    const { ativo, tipo } = await isProAtivo(req.usuario.id)
    if (tipo !== 'ponto_coleta') return res.status(403).json({ message: 'Apenas PJ pode acessar este recurso.' })
    if (!ativo) return res.status(402).json({ message: 'Recurso disponível apenas para PRO PJ.' })
    next()
  } catch (e) { res.status(500).json({ message: e.message }) }
}

module.exports = async function requirePjPro(req, res, next) {
  try {
    const { id, tipo_usuario } = req.usuario || {}
    if (!id) return res.status(401).json({ message: 'Não autenticado' })
    if (tipo_usuario !== 'ponto_coleta') {
      return res.status(403).json({ message: 'Apenas contas de Ponto de Coleta (PJ).' })
    }

    // Leia o status do PRO no mesmo lugar que o /licencas/me usa.
    const { data: lic, error } = await supabaseService
      .from('usuarios')
      .select('plano, pro_ativo, pro_ativo_ate')
      .eq('id', id)
      .maybeSingle()

    if (error) return res.status(500).json({ message: 'Erro ao checar licença', error: error.message })

    const ativo = lic?.plano === 'pro' && (lic?.pro_ativo === true ||
      (lic?.pro_ativo_ate && new Date(lic.pro_ativo_ate) > new Date()))

    if (!ativo) return res.status(403).json({ message: 'Licença PRO não ativa.' })

    next()
  } catch (e) {
    res.status(500).json({ message: 'Falha ao validar PRO', error: e.message })
  }
}

module.exports = { requireProPF, requireProPJ }
