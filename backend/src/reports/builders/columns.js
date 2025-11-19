// src/reports/columns.js

const NUM_RIGHT = { align: 'right' };
const NOWRAP    = { nowrap: true };

/* ===================== PF – DESCARTES ===================== */
/* Mostra também o nome do usuário e a quantidade de itens */
exports.COLS_PF_DESCARTES = [
  { key: 'id',     header: 'ID',               width: 8,  nowrap: true },
  { key: 'data',   header: 'Data',             width: 22, nowrap: true },
  { key: 'ponto',  header: 'Ponto de coleta',  width: 26, nowrap: true },
  { key: 'tipo',   header: 'Tipo',             width: 24, nowrap: true },
  { key: 'qtd',    header: 'Qtd',              width: 8,  align: 'right' },
  { key: 'peso',   header: 'Peso (kg)',        width: 12, align: 'right' },
  { key: 'pontos', header: 'Pontos',           width: 12, align: 'right' },
];

/* ===================== PJ – DESCARTES ===================== */
// Mostra o nome do usuário (PF) + Quantidade de itens
exports.COLS_PJ_DESCARTES = [
  { key: 'id',      header: 'ID',        width: 8,  nowrap: true },
  { key: 'data',    header: 'Data',      width: 22, nowrap: true },
  { key: 'usuario', header: 'Usuário',   width: 26, nowrap: true },
  { key: 'tipo',    header: 'Tipo',      width: 24, nowrap: true },
  { key: 'qtd',     header: 'Qtd',       width: 8,  align: 'right' },
  { key: 'peso',    header: 'Peso (kg)', width: 12, align: 'right' },
  { key: 'pontos',  header: 'Pontos PF', width: 14, align: 'right' },
];

/* ===================== PF – RECOMPENSAS ===================== */
exports.COLS_PF_RECOMPENSAS = [
  { key: 'id',      header: 'Resgate ID', width: 12, ...NOWRAP },
  { key: 'data',    header: 'Data',       width: 18, ...NOWRAP },
  { key: 'tipo',    header: 'Tipo',       width: 14, ...NOWRAP },
  { key: 'status',  header: 'Status',     width: 14, ...NOWRAP },
  { key: 'ponto',   header: 'Ponto',      width: 28, ...NOWRAP },  // <— nome do ponto de coleta
  { key: 'pontos',  header: 'Pontos',     width: 12, ...NUM_RIGHT },
];

/* ===================== PJ – RECOMPENSAS ===================== */
exports.COLS_PJ_RECOMPENSAS = [
  { key: 'id',           header: 'Resgate ID',  width: 12, ...NOWRAP },
  { key: 'data',         header: 'Data',        width: 18, ...NOWRAP },
  { key: 'descartante',  header: 'Descartante', width: 28, ...NOWRAP },
  { key: 'tipo',         header: 'Tipo',        width: 14, ...NOWRAP },
  { key: 'status',       header: 'Status',      width: 14, ...NOWRAP },
  { key: 'pontos',       header: 'Pontos',      width: 12, ...NUM_RIGHT },
];