// src/routes/recompensasRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const recompensasController = require('../controllers/recompensasController');

// tudo abaixo exige auth
router.use(auth);

/* ===== Rotas PJ (criação/gestão) ===== */
router.post('/', recompensasController.criarRecompensa);
router.get('/pj/leaderboard', recompensasController.pjLeaderboard);
router.get('/pj/minhas', recompensasController.minhasRecompensas);
// encerrar por ID (apenas PJ dono / admin) — força ID numérico
router.patch('/:id(\\d+)/encerrar', recompensasController.encerrar);

/* ===== Rotas PF (consumo) ===== */
router.get('/ativas', recompensasController.listarAtivas);
// resgatar por ID — força ID numérico
router.post('/:id(\\d+)/resgatar', recompensasController.resgatar);

router.get('/resgates',       auth, recompensasController.listarResgates);
module.exports = router;
