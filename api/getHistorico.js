// --- API getHistorico COM Filtro de Data e SEM LIMIT ---
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  console.log(`[LOG API getHistorico V2] Função chamada. Query Params:`, req.query); // Log V2

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { email, unidadeId, dataInicio, dataFim } = req.query;

  if (!email || !unidadeId || !dataInicio || !dataFim) {
    console.warn("[WARN API getHistorico] Parâmetros em falta:", req.query);
    return res.status(400).json({ message: 'Email, Unidade, Data Início e Data Fim são obrigatórios' });
  }

  try {
    const client = await pool.connect();

    // --- QUERY SEM LIMIT ---
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
        lancado_por = $1
        AND unidade = $2
        AND data_pagamento BETWEEN $3 AND $4
      ORDER BY
        data_pagamento DESC, id_de_lancamento DESC;
      -- LIMIT 50; -- GARANTIR QUE ESTÁ COMENTADO OU REMOVIDO
    `;
    // --- FIM QUERY ---

    console.log(`[LOG API getHistorico V2] Executando query com datas: ${dataInicio} a ${dataFim}`);
    const result = await client.query(query, [email, unidadeId, dataInicio, dataFim]);
    client.release();

    console.log(`[LOG API getHistorico V2] Query executada. ${result.rows.length} linhas encontradas.`);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('[ERROR API getHistorico V2]', error);
    // Libera o cliente em caso de erro também
    if(client) client.release();
    res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico.', error: error.message });
  }
}