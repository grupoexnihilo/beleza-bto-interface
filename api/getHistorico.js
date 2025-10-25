// --- API getHistorico COM PESQUISA CORRIGIDA ---
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  console.log(`[LOG API getHistorico V4] Função chamada. Query Params:`, req.query);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { email, unidadeId, dataInicio, dataFim, termoPesquisa } = req.query;

  if (!email || !unidadeId || !dataInicio || !dataFim) {
    console.warn("[WARN API getHistorico V4] Parâmetros de data/user/unidade em falta:", req.query);
    return res.status(400).json({ message: 'Email, Unidade, Data Início e Data Fim são obrigatórios' });
  }

  try {
    const client = await pool.connect();

    // --- LÓGICA DE CONSTRUÇÃO DA QUERY CORRIGIDA ---
    let queryParams = [email, unidadeId, dataInicio, dataFim];
    // Começa a query base
    let queryText = `
      SELECT
        id_de_lancamento, data_pagamento, categoria, tipo_de_operacao,
        valor_r, forma_de_pagamento, descricao
      FROM lancamentos
      WHERE
        lancado_por = $1
        AND unidade = $2
        AND data_pagamento BETWEEN $3 AND $4
    `;

    const searchTerm = termoPesquisa ? termoPesquisa.trim() : ''; // Garante que temos uma string

    // Adiciona a cláusula de pesquisa SE o termo não for vazio
    if (searchTerm !== '') {
      console.log(`[LOG API getHistorico V4] TERMO DE PESQUISA DETETADO: "${searchTerm}"`); // LOG NOVO
      queryText += `
        AND (descricao ILIKE $5 OR categoria ILIKE $5)
      `;
      queryParams.push(`%${searchTerm}%`); // Adiciona o parâmetro extra
      console.log(`[LOG API getHistorico V4] Cláusula ILIKE adicionada. Total de parâmetros: ${queryParams.length}`); // LOG NOVO
    } else {
      console.log(`[LOG API getHistorico V4] Sem termo de pesquisa válido. Não aplicando filtro ILIKE.`); // LOG NOVO
    }

    // Adiciona a ordenação sempre
    queryText += `
      ORDER BY data_pagamento DESC, id_de_lancamento DESC;
    `;
    // --- FIM DA LÓGICA DE CONSTRUÇÃO ---

    console.log(`[LOG API getHistorico V4] Final Query Params:`, queryParams); // LOG NOVO
    console.log(`[LOG API getHistorico V4] Final Query Text: ${queryText.replace(/\s+/g, ' ').trim()}`); // LOG NOVO (Mostra a query final)

    const result = await client.query(queryText, queryParams);
    client.release();

    console.log(`[LOG API getHistorico V4] Query executada. ${result.rows.length} linhas encontradas.`); // Log antigo, mas importante
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('[ERROR API getHistorico V4]', error);
    if(client) client.release();
    res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico.', error: error.message });
  }
}