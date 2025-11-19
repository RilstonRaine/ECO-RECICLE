const { supabaseService } = require('../config/supabaseServiceClient');

// Converte para número ou retorna null se não for um número válido
function toNum(n) {
  if (n === null || n === undefined || n === '') return null;
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}

// Valida o tipo de arquivo de imagem
function isValidImage(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  return allowedTypes.includes(file.mimetype);
}

// Valida o ponto de coleta
async function getPonto(id) {
  const { data, error } = await supabaseService
    .from('usuarios')
    .select('id, tipo_usuario')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// Envia as fotos para o Supabase Storage e retorna as URLs
async function uploadFoto(foto, usuario_id, tipo) {
  if (!isValidImage(foto)) {
    throw new Error('O arquivo enviado não é uma imagem válida.');
  }

  const { data, error } = await supabaseService
    .storage
    .from('descartes-fotos')
    .upload(`${usuario_id}/${tipo}/${Date.now()}.jpg`, foto, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw new Error(`Erro ao fazer upload da foto: ${error.message}`);
  return data.Key;  // Retorna o caminho ou URL da foto
}

// Retorna a regra de pontos por kg para o tipo de resíduo
async function getRegraPontos(ponto_coleta_id, tipo_residuo) {
  const { data, error } = await supabaseService
    .from('regras_pontuacao')
    .select('pontos_por_kg')
    .eq('ponto_coleta_id', ponto_coleta_id)
    .eq('tipo_residuo', tipo_residuo)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.pontos_por_kg ?? 4;
}

// Cria o descarte e retorna os dados do descarte
async function criarDescarte({ usuario_id, ponto_coleta_id, tipo_residuo, peso_kg, quantidade_itens, peso_por_item_kg, foto_item, foto_local }) {
  // Normaliza dados
  const _peso_kg = toNum(peso_kg);
  const _qtd = toNum(quantidade_itens);
  const _ppi = toNum(peso_por_item_kg);

  // Validação de entrada
  if (_peso_kg === null && (_qtd === null || _ppi === null)) {
    const e = new Error('Informe "peso_kg" OU "quantidade_itens" + "peso_por_item_kg".');
    e.status = 400;
    throw e;
  }

  // Valida ponto de coleta
  const ponto = await getPonto(ponto_coleta_id);
  if (!ponto) {
    const e = new Error('Ponto de coleta não encontrado.');
    e.status = 400;
    throw e;
  }
  if (ponto.tipo_usuario !== 'ponto_coleta') {
    const e = new Error('O ID informado não é de um ponto de coleta.');
    e.status = 400;
    throw e;
  }

  // Computa peso_kg se necessário
  const pesoFinal = _peso_kg ?? (_qtd * _ppi);

  // Regra de pontos
  const pontosPorKg = await getRegraPontos(ponto_coleta_id, tipo_residuo || 'geral');
  const pontosGerados = Math.max(0, Math.round(pesoFinal * pontosPorKg));

  // Enviar fotos para o Supabase Storage e obter links
  let fotoItemUrl = null;
  let fotoLocalUrl = null;

  const uploadPromises = [];
  
  if (foto_item) {
    uploadPromises.push(uploadFoto(foto_item, usuario_id, 'item'));
  }

  if (foto_local) {
    uploadPromises.push(uploadFoto(foto_local, usuario_id, 'local'));
  }

  const [fotoItemData, fotoLocalData] = await Promise.all(uploadPromises);
  
  if (fotoItemData) fotoItemUrl = fotoItemData;
  if (fotoLocalData) fotoLocalUrl = fotoLocalData;

  // Insert em descartes com links de fotos
  const insertDesc = {
    usuario_id,
    ponto_coleta_id,
    tipo_residuo: tipo_residuo || null,
    quantidade_itens: _qtd,
    peso_por_item_kg: _ppi,
    peso_kg: pesoFinal,
    pontos_gerados: pontosGerados,
    foto_item_url: fotoItemUrl,
    foto_local_url: fotoLocalUrl,
  };

  const { data: desc, error: errDesc } = await supabaseService
    .from('descartes')
    .insert([insertDesc])
    .select('*')
    .maybeSingle();

  if (errDesc) {
    const e = new Error(errDesc.message);
    e.status = 400;
    throw e;
  }

  // Cria o movimento de pontos (auditoria)
  const mov = {
    usuario_id,
    origem: 'descarte',
    descarte_id: desc.id,
    pontos: pontosGerados,
    observacao: `Descarte no ponto ${ponto_coleta_id}${tipo_residuo ? ' (' + tipo_residuo + ')' : ''}`,
  };

  const { error: errMov } = await supabaseService
    .from('pontos_movimentos')
    .insert([mov]);

  if (errMov) {
    console.error('[pontos_movimentos insert]', errMov);
  }

  return desc;
}

// Lista os descartes de um usuário
async function listarDescartes(usuario_id, { limit = 50 } = {}) {
  const { data, error } = await supabaseService
    .from('descartes')
    .select('*')
    .eq('usuario_id', usuario_id)
    .order('data_registro', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { criarDescarte, listarDescartes };
