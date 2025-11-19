// src/app.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ROTAS
const authRoutes        = require('./routes/authRoutes');
const usuariosRoutes    = require('./routes/usuariosRoutes');
const descartesRoutes   = require('./routes/descartesRoutes');
const recompensasRoutes = require('./routes/recompensasRoutes');
const licencasRoutes    = require('./routes/licencasRoutes');
const relatoriosRoutes  = require('./routes/relatoriosRoutes');
const diagRoutes = require('./routes/_diagRoutes')

app.use('/auth',        authRoutes);
app.use('/usuarios',    usuariosRoutes);
app.use('/descartes',   descartesRoutes);
app.use('/recompensas', recompensasRoutes);
app.use('/licencas',    licencasRoutes);
app.use('/relatorios',  relatoriosRoutes);

app.use('/_diag', diagRoutes)
app.use((req, res) => res.status(404).json({ message: 'Endpoint não encontrado' }));


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
});


module.exports = app;
