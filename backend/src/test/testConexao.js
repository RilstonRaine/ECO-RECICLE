require('dotenv').config();
const supabase = require('../config/supabaseClient');

(async () => {
  try {
    const { data, error } = await supabase.from('usuarios').select('id').limit(1);
    if (error) throw error;
    console.log('Conexão OK, exemplo:', data);
  } catch (e) {
    console.error('Erro:', e);
  }
})();
