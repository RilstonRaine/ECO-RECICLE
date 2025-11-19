// src/api/recompensasApi.js
import api from './http';

const recompensasApi = {
  // --- PJ PRO ---
  criar(payload) {
    // { tipo: 'fisica'|'digital', pontos_minimos, data_limite, max_resgates, descricao? }
    return api.post('/recompensas', payload);
  },
  leaderboard(params) {
    // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', limit?: number }
    return api.get('/recompensas/pj/leaderboard', { params });
  },
  minhas() {
    return api.get('/recompensas/pj/minhas');
  },

  // --- PF PRO / autenticado ---
  ativas() {
    return api.get('/recompensas/ativas');
  },
  resgatar(id) {
    return api.post(`/recompensas/${id}/resgatar`);
  },

  encerrar(id) { 
    return api.patch(`/recompensas/${id}/encerrar`); 
  },
  minhas(params) { 
    return api.get('/recompensas/pj/minhas', { params }); 
  },
};

export default recompensasApi;
