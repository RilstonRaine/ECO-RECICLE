// src/reports/controller.js
const registry = require('./index');
const pdf  = require('./builders/pdf');
const xlsx = require('./builders/xlsx');

const SAFE = s => String(s || '').replace(/[^a-z0-9_\-]/gi, '').toLowerCase();

exports.handleExport = async (req, res) => {
  try {
    // Se sua rota for: /reports/:audience(pf|pj)/export/:report.:format
    let { audience, report, format } = req.params;

    // Fallback p/ rotas legadas, ex: /reports/pf/export.pdf?report=descartes
    if (!audience) audience = req.path.includes('/pf/') ? 'pf' : 'pj';
    if (!report)   report   = req.query.report;

    audience = SAFE(audience);
    report   = SAFE(report);
    format   = SAFE(format);

    if (!['pf', 'pj'].includes(audience)) {
      return res.status(400).json({ message: 'Audiência inválida (pf|pj)' });
    }
    if (!['pdf', 'xlsx'].includes(format)) {
      return res.status(400).json({ message: 'Formato inválido (pdf|xlsx)' });
    }

    const entry = registry.get(audience, report);
    if (!entry) {
      return res.status(400).json({ message: 'Relatório inválido' });
    }

    const { from, to, tipo, status } = req.query;

    // Executa a query registrada (PF/PJ × Descartes/Recompensas)
    const rows = await entry.query(req.usuario.id, { from, to, tipo, status });

    const baseName = `${audience}_${report}`;

    if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}.xlsx"`);
      await xlsx.render(res, entry.sheetName || entry.title || report, entry.columns, rows);
      return;
    }

    // PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.pdf"`);
    await pdf.render(res, entry.title || entry.sheetName || report, entry.columns, rows, { from, to, tipo, status });
  } catch (err) {
    console.error('[reports.handleExport]', err);
    res.status(500).json({ message: 'Falha ao gerar relatório', error: err.message });
  }
};
