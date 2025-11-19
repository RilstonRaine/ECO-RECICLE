// /server/models/usuariosModel.js
const { supabase } = require('../config/supabaseClient');             
const { supabaseService } = require('../config/supabaseServiceClient');

async function buscarUsuarioPorEmail(email) {
  const { data, error } = await supabaseService
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data // pode ser null se não existir
}

async function criarUsuario(payload) {
  const {
    nome, email, senha_hash, tipo_usuario, cpf, cnpj, telefone,
    cep, logradouro, numero, bairro, cidade, uf // vem 'uf' do front
  } = payload

  // normaliza tipo e UF
  const tipo = (tipo_usuario || '').toLowerCase() // 'descartante' | 'ponto_coleta' | 'admin'
  const estado = (uf || '').toString().trim().toUpperCase().slice(0, 2) || null

  const insert = {
    nome,
    email,
    senha_hash,         // já deve vir hash
    tipo_usuario: tipo, // precisa casar com o CHECK da tabela (lowercase)
    cpf,
    cnpj,
    telefone,
    cep,
    logradouro,
    numero,
    bairro,
    cidade,
    estado              // coluna correta na tabela (não existe 'uf')
    // plano tem DEFAULT 'free'; pro_ativo_ate permanece null
  }

  const { data, error } = await supabaseService
    .from('usuarios')
    .insert([insert])
    .select('*')
    .maybeSingle()

  if (error) {
    // conflito de e-mail único
    if (error.code === '23505') {
      const err = new Error('E-mail já cadastrado')
      err.status = 409
      throw err
    }
    throw new Error(error.message)
  }
  return data
}

async function listarUsuarios(filtro = {}) {
  let q = supabaseService
    .from('usuarios')
    .select(
      'id, nome, email, tipo_usuario, latitude, longitude, cidade, estado, horario_funcionamento, tipos_residuos, criado_em'
    )

  if (filtro.tipo) q = q.eq('tipo_usuario', filtro.tipo) // 'ponto_coleta' | 'descartante'

  // ordenação por coluna existente
  q = q.order('criado_em', { ascending: false })

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data
}

module.exports = { buscarUsuarioPorEmail, criarUsuario, listarUsuarios }
