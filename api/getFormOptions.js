// Este é o ficheiro CORRIGIDO: /api/getFormOptions.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { unidadeId, tipo } = req.query; // tipo = 'Receita' ou 'Despesa'

  if (!unidadeId || !tipo) {
    return res.status(400).json({ message: 'unidadeId e tipo são obrigatórios' });
  }

  try {
    const client = await pool.connect();

    // Query 1: Buscar Categorias (da tabela 'dados')
    // Usamos o nome da categoria como 'id' e 'nome' para o dropdown
    const catQuery = 'SELECT categoria AS id, categoria AS nome FROM dados WHERE operacao = $1';
    const catResult = await client.query(catQuery, [tipo]);
    
    // --- INÍCIO DA CORREÇÃO ---
    // Query 2: Buscar Formas de Pagamento (só para Despesas)
    let fpResult = { rows: [] };
    if (tipo === 'Despesa') {
      // Usamos a sua nova regra de negócio para buscar apenas as formas
      // de pagamento permitidas para *esta* unidade específica.
      const fpQuery = `
        SELECT DISTINCT 
          t_fp.nome_da_forma AS id, 
          t_fp.nome_da_forma AS nome 
        FROM formas_de_pagamento AS t_fp
        JOIN regras_de_pagamento_por_unidade AS t_regras 
          ON t_fp.id_forma_de_pagamento = t_regras.forma_de_pagamento
        WHERE t_regras.unidade = $1
      `;
      // Passamos o ID da unidade para a query
      fpResult = await client.query(fpQuery, [unidadeId]); 
    }
    // --- FIM DA CORREÇÃO ---
    
    // Query 3: Buscar Colaboradores (só para Receitas)
    let colabResult = { rows: [] };
    if (tipo === 'Receita') {
      // Esta query já estava correta, usando o Dicionário Oficial.
      const colabQuery = 'SELECT id_do_colaborador AS id, nome FROM colaboradores WHERE empresa = $1 AND status = $2';
      colabResult = await client.query(colabQuery, [unidadeId, 'Ativo']);
    }

    client.release();

    res.status(200).json({
      categorias: catResult.rows,
      formasPagamento: fpResult.rows,
      colaboradores: colabResult.rows,
    });

  } catch (error) {
    console.error('Erro ao buscar opções do formulário:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
}