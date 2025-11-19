// src/reports/builders/pdf.js
const PDFDocument = require('pdfkit');

const MARGIN = 36;   // margem externa
const GAP    = 8;    // espaço horizontal entre colunas
const ROW_H  = 16;   // altura fixa de cada linha (um pouco maior)

function rule(doc, x1, x2, color = '#999') {
  doc.save();
  doc.strokeColor(color).lineWidth(0.7);
  doc.moveTo(x1, doc.y).lineTo(x2, doc.y).stroke();
  doc.restore();
}

function ensurePage(doc, nextHeight, onNewPage) {
  const bottom = doc.page.margins.bottom || MARGIN;
  const maxY   = doc.page.height - bottom;
  if (doc.y + nextHeight > maxY) {
    doc.addPage();
    if (typeof onNewPage === 'function') onNewPage();
  }
}

// deixa em UMA linha: se o texto não couber na largura, corta e põe "…"
function cellText(doc, text, x, y, w, align = 'left', bold = false) {
  const raw = String(text ?? '');
  const font = bold ? 'Helvetica-Bold' : 'Helvetica';
  const size = 10;

  // calcula o maior trecho que cabe e adiciona reticências
  const fitWithEllipsis = (t) => {
    doc.font(font).fontSize(size);
    if (doc.widthOfString(t) <= w) return t;
    const ell = '…';
    let lo = 0, hi = t.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const s = t.slice(0, mid) + ell;
      if (doc.widthOfString(s) <= w) lo = mid + 1;
      else hi = mid;
    }
    return (lo <= 1) ? ell : (t.slice(0, lo - 1) + ell);
  };

  const toPrint = fitWithEllipsis(raw);

  doc.save();
  doc.font(font).fontSize(size);
  // clip para garantir que nunca "vaze"
  doc.rect(x, y - 1, w, ROW_H + 2).clip();
  doc.text(toPrint, x, y, {
    width: w,
    align,
    lineBreak: false,
    continued: false
  });
  doc.restore();
}

function layoutColumns(columns, doc) {
  const cols = columns.map(c => ({
    key:     c.key,
    header:  c.header ?? '',
    _w:      (c.width ?? c.w ?? 80),
    _x:      (c.x ?? null),
    _align:  (c.align || 'left'),
  }));

  const anyHasX = cols.some(c => c._x !== null);
  if (!anyHasX) {
    // >>> ESCALA PROPORCIONAL (sempre) <<<
    const usable = doc.page.width - 2 * MARGIN - GAP * (cols.length - 1);
    const sumW   = cols.reduce((s, c) => s + c._w, 0) || 1;
    const scale  = usable / sumW; // pode ser > 1 (expande) ou < 1 (encolhe)

    let x = MARGIN;
    cols.forEach(c => {
      c._w = Math.max(40, Math.floor(c._w * scale)); // largura mínima
      c._x = x;
      x   += c._w + GAP;
    });
  } else {
    cols.forEach(c => {
      if (c._x == null) c._x = MARGIN;
      if (!Number.isFinite(c._w) || c._w <= 0) c._w = 80;
    });
  }
  const leftX  = cols[0]._x;
  const rightX = cols.at(-1)._x + cols.at(-1)._w;
  return { cols, leftX, rightX };
}

function drawHeader(doc, cols, leftX, rightX) {
  const y0 = doc.y;
  cols.forEach(c => cellText(doc, c.header, c._x, y0, c._w, c._align, true));
  doc.y = y0 + ROW_H;
  doc.moveDown(0.2);
  rule(doc, leftX, rightX);
  doc.moveDown(0.2);
}

function drawRow(doc, cols, row) {
  const y0 = doc.y;
  cols.forEach(c => cellText(doc, row?.[c.key], c._x, y0, c._w, c._align));
  doc.y = y0 + ROW_H;
}

exports.render = async (resStream, title, columns, rows, meta = {}) => {
  const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
  doc.pipe(resStream);

  doc.font('Helvetica-Bold').fontSize(16).text(String(title || ''), { align: 'left' });
  doc.moveDown(0.5);

  const bits = [];
  if (meta.from)   bits.push(`de ${meta.from}`);
  if (meta.to)     bits.push(`até ${meta.to}`);
  if (meta.tipo)   bits.push(`tipo: ${meta.tipo}`);
  if (meta.status) bits.push(`status: ${meta.status}`);
  doc.font('Helvetica').fontSize(10).fillColor('#555')
     .text(bits.length ? bits.join(' | ') : 'Sem filtros');
  doc.fillColor('#000');
  doc.moveDown();

  const { cols, leftX, rightX } = layoutColumns(columns, doc);
  const redrawHeader = () => drawHeader(doc, cols, leftX, rightX);

  redrawHeader();

  if (!rows || !rows.length) {
    doc.moveDown(1);
    doc.font('Helvetica-Oblique').fontSize(11).fillColor('#555')
       .text('Nenhum registro no período selecionado.');
    doc.end();
    return;
  }

  rows.forEach(r => {
    ensurePage(doc, ROW_H, redrawHeader);
    drawRow(doc, cols, r);
  });

  doc.end();
};
