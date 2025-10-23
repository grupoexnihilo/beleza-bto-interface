// --- V.FINAL + GRUPO (Receitas) ---
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const {
    unidadeId, emailOperador, dataCompetencia, dataPagamento,
    colaborador, categoria, pagamentos,
  } = req.body;

  if (!unidadeId || !emailOperador || !dataCompetencia || !colaborador || !categoria) {
    return res.status(400).json({ message: 'Campos de cabeçalho obrigatórios.' });
  }

  let client;
  try {
    client = await pool.connect();

    // --- NOVO: Buscar o Grupo (antes do loop) ---
    const grupoQuery = 'SELECT grupo FROM dados WHERE categoria = $1 LIMIT 1';
    const grupoResult = await client.query(grupoQuery, [categoria]);
    const grupo = grupoResult.rows.length > 0 ? grupoResult.rows[0].grupo : null;
    // --- FIM NOVO ---

    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        profissional, tipo_de_operacao, forma_de_pagamento, grupo, categoria, -- Adicionado 'grupo'
        status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) -- Aumentou para $12
    `;

    let lancamentosCriados = 0;

    for (const forma in pagamentos) {
      const valor = parseFloat(pagamentos[forma]);
      if (valor > 0) {
        const formaPagamentoCapitalizada = forma.charAt(0).toUpperCase() + forma.slice(1);
        const valores = [
          uuidv4(), emailOperador, dataCompetencia, dataPagamento || dataCompetencia,
          valor, colaborador, 'Receita', formaPagamentoCapitalizada,
          grupo, // <-- Valor do grupo adicionado
          categoria, 'RECEBIDO', unidadeId
        ];
        await client.query(insertQuery, valores);
        lancamentosCriados++;
      }
    }

    await client.query('COMMIT');

    if (lancamentosCriados === 0) {
      return res.status(400).json({ message: 'Nenhum valor válido foi inserido.' });
    }

    res.status(201).json({ message: `${lancamentosCriados} lançamento(s) de receita salvo(s) com sucesso!` });

  } catch (error) {
    if (client) { await client.query('ROLLBACK'); }
    console.error('Erro ao salvar receitas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao salvar receitas.', error: error.message });
  } finally {
    if (client) { client.release(); }
  }
}