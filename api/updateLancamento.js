// Este é o ficheiro: /api/updateLancamento.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper para garantir que a data seja tratada como UTC
const ensureUTCDateString = (dateString) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
    return `${dateString}T00:00:00Z`;
};

export default async function handler(req, res) {
  // 1. Usar método PATCH (padrão para atualizações parciais)
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // 2. Obter ID e campos a atualizar
  const { 
    id_de_lancamento,
    dataCompetencia, // Espera YYYY-MM-DD
    dataPagamento,   // Espera YYYY-MM-DD
    categoria,
    descricao,
    valor_r,
    profissional, // Pode ser null
    formaPagamento // Pode ser null
  } = req.body;

  if (!id_de_lancamento || !categoria || !valor_r || !dataCompetencia) {
    return res.status(400).json({ message: 'ID, Categoria, Valor e Data Competência são obrigatórios.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN'); // Inicia transação

    // 3. Re-buscar o 'grupo' com base na (nova) categoria
    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    if (grupoResult.rows.length === 0) {
        throw new Error(`Categoria "${categoria}" não encontrada na tabela 'dados'.`);
    }
    const grupo = grupoResult.rows[0].grupo;

    // 4. Converter datas para o formato UTC correto
    const dataCompetenciaUTC = ensureUTCDateString(dataCompetencia);
    const dataPagamentoUTC = ensureUTCDateString(dataPagamento || dataCompetencia);

    // 5. Executar a query UPDATE
    const updateQuery = `
      UPDATE lancamentos
      SET 
        data_competencia = $1,
        data_pagamento = $2,
        categoria = $3,
        descricao = $4,
        valor_r = $5,
        profissional = $6,
        forma_de_pagamento = $7,
        grupo = $8
      WHERE 
        id_de_lancamento = $9
      RETURNING *; -- Retorna a linha atualizada
    `;
    
    const valores = [
      dataCompetenciaUTC,
      dataPagamentoUTC,
      categoria,
      descricao,
      parseFloat(valor_r),
      profissional, // ID do colaborador
      formaPagamento, // ID da forma de pagamento
      grupo,
      id_de_lancamento
    ];

    const result = await client.query(updateQuery, valores);

    if (result.rowCount === 0) {
      throw new Error("Lançamento não encontrado ou não pôde ser atualizado.");
    }

    await client.query('COMMIT'); // Finaliza a transação
    
    console.log(`[API updateLancamento] Lançamento ${id_de_lancamento} atualizado.`);
    // 6. Retornar a linha atualizada para o frontend
    res.status(200).json(result.rows[0]); 

  } catch (error) {
    if (client) { await client.query('ROLLBACK'); } // Desfaz em caso de erro
    console.error('[ERROR API updateLancamento]', error);
    res.status(500).json({ message: `Erro interno do servidor: ${error.message}` });
  } finally {
    if (client) { client.release(); }
  }
}