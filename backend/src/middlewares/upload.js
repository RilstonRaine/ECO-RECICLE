// src/middlewares/upload.js
const multer = require('multer')

const storage = multer.memoryStorage()

// Tipos permitidos (inclui variações comuns)
const ALLOWED = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

function fileFilter (req, file, cb) {
  const ok = file?.mimetype && ALLOWED.has(file.mimetype.toLowerCase())
  if (!ok) {
    // Passa erro para o handler global do Express
    return cb(new Error('Apenas imagens JPG/PNG/WEBP são permitidas'), false)
  }
  cb(null, true)
}

// 10 MB por arquivo
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

module.exports = upload
module.exports.ALLOWED = ALLOWED
