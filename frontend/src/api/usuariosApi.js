import api from './http';

export default {
  me(params) { return api.get('/usuarios/me', { params }); },// permite { fresh: 1 }
   
  resgatados() {
    return api.get('/usuarios/me/resgatados');
  },
};
