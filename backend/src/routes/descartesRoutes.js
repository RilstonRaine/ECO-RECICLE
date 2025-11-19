const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const upload = require('../middlewares/upload')
const descartesController = require('../controllers/descartesController')

router.use(authMiddleware)

router.post(
  '/',
  upload.fields([
    { name: 'foto_item',  maxCount: 1 },
    { name: 'foto_local', maxCount: 1 },
  ]),
  descartesController.cadastrarDescarte
)

router.get('/ultimos', descartesController.ultimos)
router.get('/:id', descartesController.obterDetalhe)
router.get('/', descartesController.listarDescartes)


module.exports = router