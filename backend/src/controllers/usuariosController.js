// src/controllers/usuariosController.js
const { supabaseService } = require('../config/supabaseServiceClient');
const { listarUsuarios: listarUsuariosModel } = require('../models/usuariosModel');

/**
 * GET /usuarios?tipo=descartante|ponto_coleta|admin (opcional)
 */
async function listarUsuarios(req, res) {
  try {
    const usuarios = await listarUsuariosModel({ tipo: req.query.tipo });
    return res.json(usuarios);
  } catch (err) {
    console.error('[GET /usuarios] erro:', err);
    return res.status(500).json({ message: 'Erro ao listar usuários', error: err.message });
  }
}

/**
 * GET /usuarios/pontos
 * Lista apenas usuários do tipo 'ponto_coleta'
 */
exports.listarPontos = async (req, res) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter(Number.isFinite);

    let q = supabaseService
      .from('usuarios')
      .select('id, nome')
      .eq('tipo_usuario', 'ponto_coleta');

    if (ids.length) q = q.in('id', ids);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (e) {
    res.status(500).json({ message: 'Erro ao listar pontos', error: e.message });
  }
};

/**
 * GET /usuarios/me
 * Retorna o perfil do usuário autenticado.
 * Se desejar, calcule e anexe pontos_resgatados quando vier ?fresh=1
 */
async function me(req, res) {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ message: 'Não autenticado' });

    const { data: usuario, error } = await supabaseService
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

    // Se quiser já trazer pontos_resgatados aqui quando ?fresh=1:
    if (String(req.query.fresh) === '1') {
      const { data: movs, error: mErr } = await supabaseService
        .from('pontos_movimentos')
        .select('pontos, origem')
        .eq('usuario_id', userId)
        .eq('origem', 'resgate');

      if (mErr) throw mErr;
      const pontos_resgatados = (movs || []).reduce((acc, r) => acc + (Number(r.pontos) || 0), 0);
      return res.json({ ...usuario, pontos_resgatados });
    }

    return res.json(usuario);
  } catch (err) {
    console.error('[GET /usuarios/me] erro:', err);
    return res.status(500).json({ message: 'Erro ao obter perfil', error: err.message });
  }
}

/**
 * GET /usuarios/me/resgatados
 * Soma os movimentos com origem 'resgate'
 */

function toDateOnly(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0,10);
}

async function meResgatados(req, res) {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ message: 'Não autenticado' });

    const { data, error } = await supabaseService
      .from('pontos_movimentos')
      .select('pontos')
      .eq('usuario_id', userId)
      .eq('origem', 'resgate');

    if (error) throw error;

    const total = (data || []).reduce((acc, r) => acc + (Number(r.pontos) || 0), 0);
    return res.json({ pontos_resgatados: total });
  } catch (e) {
    console.error('[GET /usuarios/me/resgatados] erro:', e);
    return res.status(500).json({ message: 'Erro ao calcular resgatados', error: e.message });
  }
}

module.exports = {
  listarUsuarios,
  listarPontos,
  me,
  meResgatados,
};
