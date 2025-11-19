const { supabaseService, BUCKET_DESCARTES } = require('../config/supabaseServiceClient')

/* -------------------- utils -------------------- */
function badReq(res, msg) { return res.status(400).json({ message: msg }) }
const toNum = (v) => (v === '' || v === null || v === undefined) ? null : Number(v)

const ALLOWED = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

function assertImage(file, name) {
  if (!file) throw new Error(`Campo ${name} é obrigatório.`)
  if (!ALLOWED.includes(file.mimetype)) {
    throw new Error(`Tipo de arquivo inválido para ${name}. Use JPG/PNG/WEBP.`)
  }
}

async function uploadToSupabase(file, usuarioId, tipo) {
  const ts = Date.now()
  const safeName = (file.originalname || 'foto').replace(/[^\w.\-]/g, '_')
  const path = `local/${usuarioId}/${tipo}/${ts}_${safeName}`

  const { error: upErr } = await supabaseService
    .storage.from(BUCKET_DESCARTES)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false })
  if (upErr) throw new Error(`Falha no upload de ${tipo}: ${upErr.message}`)

  const { data: pub } = supabaseService.storage.from(BUCKET_DESCARTES).getPublicUrl(path)
  return { path, publicUrl: pub?.publicUrl || null }
}

/** Tenta assinar; se falhar, cai para URL pública; se nada der, devolve fallbackUrl */
async function resolveFileUrl(path, fallbackUrl, expiresIn = 600) {
  try {
    if (path) {
      const { data: signed, error: sErr } =
        await supabaseService.storage.from(BUCKET_DESCARTES).createSignedUrl(path, expiresIn)
      if (!sErr && signed?.signedUrl) return signed.signedUrl

      const { data: pub } = supabaseService.storage.from(BUCKET_DESCARTES).getPublicUrl(path)
      if (pub?.publicUrl) return pub.publicUrl
    }
  } catch {}
  return fallbackUrl || null
}

/** extrai o path relativo do bucket a partir de uma URL salva */
function urlToPath(url) {
  const m = (url || '').match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/([^?]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

const SELECT_FULL = `
  id, usuario_id, ponto_coleta_id, data_registro,
  tipo_residuo, quantidade_itens, peso_por_item_kg, peso_kg,
  pontos_gerados, co2_evitar_kg,
  foto_item_path,  foto_item_url,
  foto_local_path, foto_local_url,
  usuario:usuarios!descartes_usuario_id_fkey ( id, nome, email ),
  ponto:usuarios!descartes_ponto_coleta_id_fkey ( id, nome, email )
`

/* -------------------- POST /descartes -------------------- */
async function cadastrarDescarte(req, res) {
  try {
    const user = req.usuario || {}
    if (!user.id) return res.status(401).json({ message: 'Não autenticado' })
    if (user.tipo_usuario !== 'descartante') {
      return res.status(403).json({ message: 'Apenas descartantes podem registrar descartes.' })
    }

    const { ponto_coleta_id, tipo_residuo, quantidade_itens, peso_por_item_kg, peso_kg } = req.body
    if (!ponto_coleta_id) return badReq(res, 'ponto_coleta_id é obrigatório.')

    const qtd = toNum(quantidade_itens)
    const ppi = toNum(peso_por_item_kg)
    const pesoDireto = toNum(peso_kg)

    const pesoFinal = (Number.isFinite(pesoDireto) && pesoDireto > 0)
      ? pesoDireto
      : (Number.isFinite(qtd) && Number.isFinite(ppi) && qtd >= 1 && ppi > 0)
        ? Number((qtd * ppi).toFixed(3))
        : null

    if (!Number.isFinite(pesoFinal) || pesoFinal <= 0) {
      return badReq(res, 'Informe "peso_kg" válido OU "quantidade_itens" (≥1) + "peso_por_item_kg" (>0).')
    }

    // valida PJ
    const { data: ponto, error: perr } = await supabaseService
      .from('usuarios').select('id, tipo_usuario')
      .eq('id', Number(ponto_coleta_id)).maybeSingle()
    if (perr) return res.status(500).json({ message: 'Erro ao validar ponto', error: perr.message })
    if (!ponto || ponto.tipo_usuario !== 'ponto_coleta') return badReq(res, 'Ponto de coleta inválido.')

    // arquivos
    const fotoItemFile  = req.files?.foto_item?.[0]
    const fotoLocalFile = req.files?.foto_local?.[0]
    try {
      assertImage(fotoItemFile, 'foto_item')
      assertImage(fotoLocalFile, 'foto_local')
    } catch (e) { return badReq(res, e.message) }

    const upItem  = await uploadToSupabase(fotoItemFile,  user.id, 'item')
    const upLocal = await uploadToSupabase(fotoLocalFile, user.id, 'local')

    const pontosPorKg = 4
    const co2_evitar_kg = Number((pesoFinal * 0.48).toFixed(3))

    const { data: usuario, error: uerr } = await supabaseService
      .from('usuarios').select('id, cpf, pontos_acumulados')
      .eq('id', user.id).maybeSingle()
    if (uerr) return res.status(500).json({ message: 'Erro ao buscar usuário', error: uerr.message })
    if (!usuario) return badReq(res, 'Usuário não encontrado.')

    const pontos_gerados = usuario.cpf ? Math.max(0, Math.round(pesoFinal * pontosPorKg)) : 0

    const payload = {
      usuario_id: user.id,
      ponto_coleta_id: Number(ponto_coleta_id),
      tipo_residuo: tipo_residuo || 'eletronico_misto',
      quantidade_itens: Number.isFinite(qtd) ? qtd : null,
      peso_por_item_kg: Number.isFinite(ppi) ? ppi : null,
      peso_kg: pesoFinal,
      pontos_gerados,
      co2_evitar_kg,
      foto_item_path:  upItem.path,  foto_item_url:  upItem.publicUrl,
      foto_local_path: upLocal.path, foto_local_url: upLocal.publicUrl,
    }

    const { data: inserted, error: derr } = await supabaseService
      .from('descartes').insert([payload]).select('*').maybeSingle()
    if (derr) return res.status(400).json({ message: 'Erro ao cadastrar descarte', error: derr.message })

    // atualiza pontos (best-effort)
    if (pontos_gerados > 0) {
      await supabaseService.from('usuarios')
        .update({ pontos_acumulados: (usuario.pontos_acumulados || 0) + pontos_gerados })
        .eq('id', user.id)
      await supabaseService.from('pontos_movimentos').insert([{
        usuario_id: user.id,
        origem: 'descarte',
        descarte_id: inserted.id,
        pontos: pontos_gerados,
        observacao: `Descarte no ponto ${ponto_coleta_id}`,
      }])
    }

    return res.status(201).json(inserted)
  } catch (err) {
    console.error('[POST /descartes]', err)
    return res.status(400).json({ message: 'Erro ao cadastrar descarte', error: err.message })
  }
}

/* helpers de período (local -> ISO) */
function parseDateParam(dstr) {
  if (!dstr) return null
  const [y, m, d] = dstr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}
function endOfDayLocal(d) {
  const e = new Date(d)
  e.setHours(23, 59, 59, 999)
  return e
}

/* -------------------- GET /descartes -------------------- */
async function listarDescartes(req, res) {
  try {
    const userId = req.usuario?.id
    const role   = req.usuario?.tipo_usuario
    if (!userId) return res.status(401).json({ message: 'Não autenticado' })

    const { from, to } = req.query
    const fromDate = parseDateParam(from)
    const toDate   = parseDateParam(to)

    let q = supabaseService.from('descartes').select('*')
    if (role === 'descartante') q = q.eq('usuario_id', userId)
    else if (role === 'ponto_coleta') q = q.eq('ponto_coleta_id', userId)

    if (fromDate) q = q.gte('data_registro', fromDate.toISOString())
    if (toDate)   q = q.lte('data_registro', endOfDayLocal(toDate).toISOString())

    const { data, error } = await q.order('data_registro', { ascending: false })
    if (error) throw error

    res.json(data || [])
  } catch (err) {
    res.status(400).json({ message: 'Erro ao listar descartes', error: err.message })
  }
}

/* -------------------- GET /descartes/ultimos -------------------- */
async function ultimos(req, res) {
  try {
    const userId = req.usuario?.id
    const role   = req.usuario?.tipo_usuario
    const limit  = Math.max(1, Math.min(10, Number(req.query.limit) || 5))

    if (!userId) return res.status(401).json({ message: 'Não autenticado' })
    if (!['descartante', 'ponto_coleta', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Perfil não autorizado' })
    }

    const { from, to } = req.query
    const fromDate = parseDateParam(from)
    const toDate   = parseDateParam(to)

    let q = supabaseService
      .from('descartes')
      .select('id, usuario_id, ponto_coleta_id, data_registro, tipo_residuo, quantidade_itens, peso_por_item_kg, peso_kg')
      .order('data_registro', { ascending: false })
      .limit(limit)

    if (role === 'descartante') q = q.eq('usuario_id', userId)
    else if (role === 'ponto_coleta') q = q.eq('ponto_coleta_id', userId)

    if (fromDate) q = q.gte('data_registro', fromDate.toISOString())
    if (toDate)   q = q.lte('data_registro', endOfDayLocal(toDate).toISOString())

    const { data, error } = await q
    if (error) throw error

    const ids = [...new Set((data || []).map(d => d.usuario_id).filter(Boolean))]
    let nomesById = {}
    if (ids.length) {
      const { data: usuarios, error: uerr } = await supabaseService
        .from('usuarios').select('id, nome').in('id', ids)
      if (uerr) throw uerr
      for (const u of (usuarios || [])) nomesById[u.id] = u.nome
    }

    const out = (data || []).map(d => ({
      ...d,
      usuario_nome: d.usuario_id ? (nomesById[d.usuario_id] || null) : null,
      usuario: d.usuario_id ? { id: d.usuario_id, nome: nomesById[d.usuario_id] || null } : null
    }))

    return res.json(out)
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao buscar últimos descartes', error: e.message })
  }
}

/* -------------------- GET /descartes/:id -------------------- */
async function obterDetalhe(req, res) {
  try {
    const userId = req.usuario?.id
    const role   = req.usuario?.tipo_usuario
    const id     = Number(req.params.id)

    const { data: row, error } = await supabaseService
      .from('descartes')
      .select(SELECT_FULL)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!row) return res.status(404).json({ message: 'Descarte não encontrado' })

    if (role !== 'admin') {
      if (role === 'descartante' && row.usuario_id !== userId) {
        return res.status(403).json({ message: 'Acesso negado (PF)' })
      }
      if (role === 'ponto_coleta' && row.ponto_coleta_id !== userId) {
        return res.status(403).json({ message: 'Acesso negado (PJ)' })
      }
    }

    // Fallback de path a partir da URL salva
    const itemPath  = row.foto_item_path  || urlToPath(row.foto_item_url)
    const localPath = row.foto_local_path || urlToPath(row.foto_local_url)

    const foto_item_signed  = await resolveFileUrl(itemPath,  row.foto_item_url)
    const foto_local_signed = await resolveFileUrl(localPath, row.foto_local_url)

    return res.json({ ...row, foto_item_signed, foto_local_signed })
  } catch (e) {
    console.error('[obterDetalhe]', e)
    return res.status(500).json({ message: 'Erro ao obter descarte', error: e.message })
  }
}

module.exports = { cadastrarDescarte, listarDescartes, ultimos, obterDetalhe }
