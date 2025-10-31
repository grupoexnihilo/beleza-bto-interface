// --- API getHistorico V5 (COM JOINS PARA NOMES) ---
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  console.log(`[LOG API getHistorico V5] Função chamada. Query Params:`, req.query);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { email, unidadeId, dataInicio, dataFim, termoPesquisa } = req.query;

  if (!email || !unidadeId || !dataInicio || !dataFim) {
    return res.status(400).json({ message: 'Email, Unidade, Data Início e Data Fim são obrigatórios' });
  }

  try {
    const client = await pool.connect();

    // --- QUERY MODIFICADA COM LEFT JOINS ---
    let queryParams = [email, unidadeId, dataInicio, dataFim];
    let queryText = `
      SELECT
        l.id_de_lancamento, l.data_pagamento, l.categoria, l.tipo_de_operacao,
        l.valor_r, l.descricao,
        l.profissional, l.forma_de_pagamento,
        c.nome AS profissional_nome,
        fp.nome_da_forma AS forma_pagamento_nome
      FROM lancamentos AS l
      LEFT JOIN colaboradores AS c ON l.profissional = c.id_do_colaborador
      LEFT JOIN formas_de_pagamento AS fp ON l.forma_de_pagamento = fp.id_forma_de_pagamento
      WHERE
        l.lancado_por = $1
        AND l.unidade = $2
        AND l.data_pagamento BETWEEN $3 AND $4
    `;

    const searchTerm = termoPesquisa ? termoPesquisa.trim() : '';
    if (searchTerm !== '') {
      console.log(`[LOG API getHistorico V5] Aplicando termo de pesquisa: "${searchTerm}"`);
      // Pesquisa também nos nomes que acabámos de juntar (JOIN)
      queryText += `
        AND (
          l.descricao ILIKE $5 OR l.categoria ILIKE $5 OR
          c.nome ILIKE $5 OR fp.nome_da_forma ILIKE $5
        )
      `;
      queryParams.push(`%${searchTerm}%`);
    }

    queryText += ` ORDER BY l.data_pagamento DESC, l.id_de_lancamento DESC;`;
    // --- FIM QUERY MODIFICADA ---

    console.log(`[LOG API getHistorico V5] Executando query (Params: ${queryParams.length})`);
    const result = await client.query(queryText, queryParams);
    client.release();

    console.log(`[LOG API getHistorico V5] Query executada. ${result.rows.length} linhas encontradas.`);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('[ERROR API getHistorico V5]', error);
    if(client) client.release();
    res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico.', error: error.message });
  }
}