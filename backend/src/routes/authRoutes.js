const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/cadastro', authController.cadastro);
router.post('/login', authController.login);
router.post('/verificar-email', authController.verificarEmail);

module.exports = router;
