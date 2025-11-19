// src/routes/relatoriosRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const { requireProPF, requireProPJ } = require('../middlewares/requirePro');
const controller = require('../reports/controller');


router.use(auth);


router.get('/pf/export/:report.:format(pdf|xlsx)', requireProPF, controller.handleExport);
router.get('/pj/export/:report.:format(pdf|xlsx)', requireProPJ, controller.handleExport);


const compat = (audience, fmt) => (req, res, next) => {
  req.params = {
    audience,
    report: String(req.query.report || 'descartes').toLowerCase(),
    format: fmt,
  };
  next();
};

router.get('/pf/export.pdf',  requireProPF, compat('pf', 'pdf'),  controller.handleExport);
router.get('/pf/export.xlsx', requireProPF, compat('pf', 'xlsx'), controller.handleExport);
router.get('/pj/export.pdf',  requireProPJ, compat('pj', 'pdf'),  controller.handleExport);
router.get('/pj/export.xlsx', requireProPJ, compat('pj', 'xlsx'), controller.handleExport);

module.exports = router;
