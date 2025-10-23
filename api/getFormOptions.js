// Este é o ficheiro CORRIGIDO E FINAL: /api/getFormOptions.js
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

    // --- ESTA É A CORREÇÃO ---
    // Query 1: Buscar Categorias (da tabela 'dados')
    // A coluna correta é 'tipo', não 'operacao'.
    const catQuery = 'SELECT categoria AS id, categoria AS nome FROM dados WHERE UPPER(tipo) = UPPER($1)';
    const catResult = await client.query(catQuery, [tipo]);
    // --- FIM DA CORREÇÃO ---
    
    // Query 2: Formas de Pagamento (Esta já estava correta e a funcionar)
    let fpResult = { rows: [] };
    if (tipo === 'Despesa') {
      const fpQuery = `
        SELECT DISTINCT 
          t_fp.nome_da_forma AS id, 
          t_fp.nome_da_forma AS nome 
        FROM formas_de_pagamento AS t_fp
        JOIN regras_de_pagamento_por_unidade AS t_regras 
          ON t_fp.id_forma_de_pagamento = t_regras.forma_de_pagamento
        WHERE t_regras.unidade = $1
      `;
      fpResult = await client.query(fpQuery, [unidadeId]); 
    }
    
    // Query 3: Buscar Colaboradores (Corrigido para case-insensitive)
    let colabResult = { rows: [] };
    if (tipo === 'Receita') {
      const colabQuery = 'SELECT id_do_colaborador AS id, nome FROM colaboradores WHERE empresa = $1 AND UPPER(status) = UPPER($2)';
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