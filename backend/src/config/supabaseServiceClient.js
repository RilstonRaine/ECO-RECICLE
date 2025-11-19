// src/config/supabaseServiceClient.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BUCKET_DESCARTES = 'descartes-fotos'

async function ensureStorageBuckets() {
  const { data, error } = await supabaseService.storage.listBuckets()
  if (error) throw error
  if (!data?.some(b => b.name === BUCKET_DESCARTES)) {
    await supabaseService.storage.createBucket(BUCKET_DESCARTES, {
      public: true,              // pode deixar público; com URL assinada funciona nos dois casos
      fileSizeLimit: 10 * 1024 * 1024,
    })
    console.log('[storage] bucket criado:', BUCKET_DESCARTES)
  }
}

module.exports = { supabaseService, BUCKET_DESCARTES, ensureStorageBuckets }