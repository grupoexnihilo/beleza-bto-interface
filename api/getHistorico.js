// Este é o NOVO ficheiro: /api/getHistorico.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  console.log(`[LOG API getHistorico] Função chamada. Query Params:`, req.query);
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // O frontend vai enviar o email do operador e a unidade selecionada
  const { email, unidadeId } = req.query;

  if (!email || !unidadeId) {
    return res.status(400).json({ message: 'Email e Unidade são obrigatórios' });
  }

  try {
    const client = await pool.connect();

    // Busca os 50 lançamentos mais recentes feitos por este operador nesta unidade
    // Esta query assume que o seu utilizador (grupoexnihilo@gmail.com)
    // está na coluna 'lancado_por' (que a sua query de teste vai preencher)
    const query = `
      SELECT 
        id_de_lancamento, 
        data_pagamento, 
        categoria, 
        tipo_de_operacao, 
        valor_r, 
        forma_de_pagamento,
        descricao
      FROM 
        lancamentos 
      WHERE 
        lancado_por = $1 AND unidade = $2
      ORDER BY 
        data_pagamento DESC
      LIMIT 50;
    `;
    
    const result = await client.query(query, [email, unidadeId]);
    client.release();

    res.status(200).json(result.rows); // Retorna a lista de lançamentos

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
}