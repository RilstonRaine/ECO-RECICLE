// src/routes/auditoriaRoutes.js
const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const auditoriaController = require('../controllers/auditoriaController')

// Rota para reportar um problema
router.post('/reportarProblema', authMiddleware, auditoriaController.reportarProblema)

// Rota para listar auditorias de um ponto de coleta
router.get('/listarAuditorias', authMiddleware, auditoriaController.listarAuditorias)

module.exports = router
