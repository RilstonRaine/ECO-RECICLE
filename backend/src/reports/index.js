// src/reports/index.js
const {
  COLS_PF_DESCARTES, COLS_PF_RECOMPENSAS,
  COLS_PJ_DESCARTES, COLS_PJ_RECOMPENSAS
} = require('./builders/columns'); // <= caminho correto

const pfDescartes   = require('./queries/DescartesPF');
const pfRecompensas = require('./queries/recompensasPF');
const pjDescartes   = require('./queries/descartesPJ');
const pjRecompensas = require('./queries/recompensasPJ');

const map = {
  pf: {
    descartes:   { query: pfDescartes,   columns: COLS_PF_DESCARTES,   title: 'Descartes — PF',    sheetName: 'Descartes PF' },
    recompensas: { query: pfRecompensas, columns: COLS_PF_RECOMPENSAS, title: 'Recompensas — PF',  sheetName: 'Recompensas PF' },
  },
  pj: {
    descartes:   { query: pjDescartes,   columns: COLS_PJ_DESCARTES,   title: 'Entradas — PJ',     sheetName: 'Descartes PJ' },
    recompensas: { query: pjRecompensas, columns: COLS_PJ_RECOMPENSAS, title: 'Recompensas — PJ',  sheetName: 'Recompensas PJ' },
  }
};

exports.get = (aud, rep) => map[aud]?.[rep] || null;
