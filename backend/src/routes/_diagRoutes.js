// src/routes/_diagRoutes.js
const router = require('express').Router()
const { supabaseService } = require('../config/supabaseServiceClient')

/**
 * GET /_diag/storage
 * Mostra o projectRef e os buckets existentes
 */
router.get('/storage', async (req, res) => {
  const url = process.env.SUPABASE_URL || ''
  const projectRef = (url.match(/^https?:\/\/([^.]+)\.supabase\.co/i) || [])[1] || 'desconhecido'

  const { data, error } = await supabaseService.storage.listBuckets()
  res.json({
    projectRef,
    supabaseUrl: url,
    buckets: data?.map(b => b.name) || [],
    error: error?.message || null
  })
})

/**
 * GET /_diag/storage/url?path=<path>
 * Devolve a publicUrl (se o bucket for público)
 */
router.get('/storage/url', async (req, res) => {
  const bucket = req.query.bucket || 'descartes-fotos'
  const path = String(req.query.path || '')
  const { data } = supabaseService.storage.from(bucket).getPublicUrl(path)
  res.json({ bucket, path, publicUrl: data?.publicUrl || null })
})

/**
 * GET /_diag/storage/signed?path=<path>&expiresIn=600
 * Cria uma URL assinada (funciona com bucket privado)
 */
router.get('/storage/signed', async (req, res) => {
  try {
    const bucket = req.query.bucket || 'descartes-fotos'
    const path = String(req.query.path || '')
    const expiresIn = Math.max(60, Math.min(60 * 60 * 24, Number(req.query.expiresIn) || 600))

    if (!path) return res.status(400).json({ message: 'Informe ?path=...' })

    const { data, error } = await supabaseService
      .storage.from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) return res.status(400).json({ message: error.message, bucket, path })
    return res.json({ bucket, path, signedUrl: data?.signedUrl || null, expiresIn })
  } catch (e) {
    return res.status(500).json({ message: e.message })
  }
})

/**
 * GET /_diag/storage/list?prefix=local/25/item
 * Lista arquivos dentro de um "diretório" (prefix)
 */
router.get('/storage/list', async (req, res) => {
  try {
    const bucket = req.query.bucket || 'descartes-fotos'
    const prefix = String(req.query.prefix || '').replace(/^\/+/, '') // sem barra inicial

    const { data, error } = await supabaseService
      .storage.from(bucket)
      .list(prefix, { limit: 100, sortBy: { column: 'name', order: 'asc' } })

    if (error) return res.status(400).json({ message: error.message, bucket, prefix })

    const files = (data || []).map(f => ({
      name: f.name,
      path: prefix ? `${prefix}/${f.name}` : f.name,
      size: f.metadata?.size ?? f.size ?? null,
      updated_at: f.updated_at || null
    }))
    return res.json({ bucket, prefix, files })
  } catch (e) {
    return res.status(500).json({ message: e.message })
  }
})

module.exports = router