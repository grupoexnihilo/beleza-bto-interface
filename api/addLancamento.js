// --- V.FINAL CORRIGIDO (Garantindo Export e Sintaxe) ---
import pkg from 'pg'; // DECLARAÇÃO ÚNICA
import { v4 as uuidv4 } from 'uuid';
const { Pool } = pkg; // DECLARAÇÃO ÚNICA

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const {
    unidadeId,
    emailOperador,
    dataCompetencia,
    dataPagamento,
    categoria,
    formaPagamento,
    descricao,
    valor,
  } = req.body;

  if (!unidadeId || !emailOperador || !dataCompetencia || !categoria || !valor) {
    return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
  }

  let client;
  try {
    client = await pool.connect();

    const query = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        tipo_de_operacao, forma_de_pagamento, categoria, descricao, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    const valores = [
      uuidv4(),
      emailOperador,
      dataCompetencia,
      dataPagamento || dataCompetencia,
      parseFloat(valor),
      'Despesa',
      formaPagamento,
      categoria,
      descricao,
      'PAGO',
      unidadeId
    ];

    await client.query(query, valores);

    res.status(201).json({ message: 'Despesa salva com sucesso!' });

  } catch (error) {
    console.error('Erro ao salvar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao salvar despesa.', error: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
}