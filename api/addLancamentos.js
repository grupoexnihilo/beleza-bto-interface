// --- V.FINAL CORRIGIDO (SyntaxError: Identifier 'pkg') ---
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
    colaborador, // id_do_colaborador
    categoria,
    pagamentos, // { dinheiro: 50, pix: 100, ... }
  } = req.body;

  if (!unidadeId || !emailOperador || !dataCompetencia || !colaborador || !categoria) {
    return res.status(400).json({ message: 'Campos de cabeçalho obrigatórios.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const query = `
      INSERT INTO lancamentos (
        id_de_lancamento, lancado_por, data_competencia, data_pagamento, valor_r,
        profissional, tipo_de_operacao, forma_de_pagamento, categoria, status, unidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    let lancamentosCriados = 0;

    for (const forma in pagamentos) {
      const valor = parseFloat(pagamentos[forma]);
      if (valor > 0) {
        const formaPagamentoCapitalizada = forma.charAt(0).toUpperCase() + forma.slice(1);
        const valores = [
          uuidv4(),
          emailOperador,
          dataCompetencia,
          dataPagamento || dataCompetencia,
          valor,
          colaborador,
          'Receita',
          formaPagamentoCapitalizada,
          categoria,
          'RECEBIDO',
          unidadeId
        ];
        await client.query(query, valores);
        lancamentosCriados++;
      }
    }

    await client.query('COMMIT');

    if (lancamentosCriados === 0) {
      // Retorna 400 Bad Request se nenhum valor válido foi inserido
      return res.status(400).json({ message: 'Nenhum valor válido foi inserido.' });
    }

    res.status(201).json({ message: `${lancamentosCriados} lançamento(s) de receita salvo(s) com sucesso!` });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Erro ao salvar receitas:', error);
    // Retorna 500 Internal Server Error em caso de falha no banco
    res.status(500).json({ message: 'Erro interno do servidor ao salvar receitas.', error: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
}